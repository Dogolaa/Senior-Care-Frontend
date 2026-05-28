import { useState, useRef, useCallback } from 'react'
import RecordRTC from 'recordrtc'
import { Mic, Loader2, CheckCircle, XCircle, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { transcribeVitals } from '@/api/speech'
import type { VitalsTranscriptionResponse } from '@/api/speech'

type State = 'idle' | 'recording' | 'processing' | 'result' | 'error'

interface VoiceVitalsButtonProps {
  onFill: (fields: Partial<Omit<VitalsTranscriptionResponse, 'rawTranscription'>>) => void
}

const FIELD_LABELS: Record<string, string> = {
  bloodPressure: 'Pressão Arterial',
  temperature: 'Temperatura',
  saturation: 'Saturação',
  heartRate: 'Freq. Cardíaca',
  weight: 'Peso',
  height: 'Altura',
}

export function VoiceVitalsButton({ onFill }: VoiceVitalsButtonProps) {
  const [state, setState] = useState<State>('idle')
  const [result, setResult] = useState<VitalsTranscriptionResponse | null>(null)
  const [errorMsg, setErrorMsg] = useState<string>('')

  const recorderRef = useRef<RecordRTC | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const startTimeRef = useRef<number>(0)
  const isRecordingRef = useRef(false)

  const stopAndCleanStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }

  const startRecording = useCallback(async (e: React.PointerEvent) => {
    e.preventDefault()
    if (isRecordingRef.current) return
    isRecordingRef.current = true

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const recorder = new RecordRTC(stream, {
        type: 'audio',
        mimeType: 'audio/wav',
        recorderType: RecordRTC.StereoAudioRecorder,
        sampleRate: 16000,
        desiredSampRate: 16000,
        numberOfAudioChannels: 1,
      })

      recorder.startRecording()
      recorderRef.current = recorder
      startTimeRef.current = Date.now()
      setState('recording')
    } catch {
      isRecordingRef.current = false
      setErrorMsg('Permissão de microfone negada. Permita o acesso nas configurações do navegador.')
      setState('error')
    }
  }, [])

  const stopRecording = useCallback(async (e: React.PointerEvent) => {
    e.preventDefault()
    if (!isRecordingRef.current || !recorderRef.current) return
    isRecordingRef.current = false

    const elapsed = Date.now() - startTimeRef.current
    if (elapsed < 400) {
      recorderRef.current.stopRecording(() => {
        stopAndCleanStream()
        recorderRef.current = null
        setState('idle')
      })
      return
    }

    setState('processing')

    recorderRef.current.stopRecording(async () => {
      const blob = recorderRef.current!.getBlob()
      stopAndCleanStream()
      recorderRef.current = null

      try {
        const data = await transcribeVitals(blob)
        setResult(data)
        setState('result')
      } catch {
        setErrorMsg('Não foi possível processar o áudio. Tente novamente.')
        setState('error')
      }
    })
  }, [])

  const applyResult = () => {
    if (!result) return
    const { rawTranscription: _, ...fields } = result
    onFill(fields)
    setResult(null)
    setState('idle')
  }

  const discardResult = () => {
    setResult(null)
    setState('idle')
  }

  const filledFields = result
    ? Object.entries(result).filter(([k, v]) => k !== 'rawTranscription' && v !== null)
    : []

  return (
    <div className="space-y-3">
      {/* Recording button */}
      <button
        type="button"
        onPointerDown={startRecording}
        onPointerUp={stopRecording}
        onPointerLeave={stopRecording}
        disabled={state === 'processing'}
        className={cn(
          'flex w-full select-none items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all duration-150',
          state === 'idle' && 'border-primary/40 bg-primary/5 text-primary hover:bg-primary/10 active:scale-95',
          state === 'recording' && 'animate-pulse border-red-500 bg-red-50 text-red-600 cursor-grabbing',
          state === 'processing' && 'border-amber-400 bg-amber-50 text-amber-700 cursor-wait',
          state === 'result' && 'border-green-400 bg-green-50 text-green-700',
          state === 'error' && 'border-red-300 bg-red-50 text-red-600',
        )}
        aria-label={
          state === 'idle' ? 'Pressione e segure para gravar sinais vitais por voz'
          : state === 'recording' ? 'Gravando… solte para enviar'
          : 'Processando áudio'
        }
      >
        {state === 'idle' && <><Mic className="h-4 w-4 shrink-0" /> Pressione e segure para ditar sinais vitais</>}
        {state === 'recording' && <><Mic className="h-4 w-4 shrink-0" /> Gravando… solte para enviar</>}
        {state === 'processing' && <><Loader2 className="h-4 w-4 shrink-0 animate-spin" /> Processando áudio…</>}
        {state === 'result' && <><Volume2 className="h-4 w-4 shrink-0" /> Gravação processada</>}
        {state === 'error' && <><XCircle className="h-4 w-4 shrink-0" /> {errorMsg}</>}
      </button>

      {/* Error retry */}
      {state === 'error' && (
        <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => setState('idle')}>
          Tentar novamente
        </Button>
      )}

      {/* Result confirmation */}
      {state === 'result' && result && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 space-y-3">
          {/* Raw transcription */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-green-800 uppercase tracking-wide">O que foi entendido</p>
            <p className="text-sm text-green-900 italic">"{result.rawTranscription}"</p>
          </div>

          {/* Filled fields preview */}
          {filledFields.length > 0 ? (
            <div className="space-y-1">
              <p className="text-xs font-medium text-green-800 uppercase tracking-wide">Campos a preencher</p>
              <div className="flex flex-wrap gap-1.5">
                {filledFields.map(([key, value]) => (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"
                  >
                    <CheckCircle className="h-3 w-3" />
                    {FIELD_LABELS[key] ?? key}: <strong>{String(value)}</strong>
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-amber-700">Nenhum campo reconhecido na fala. Verifique o que foi dito e tente novamente.</p>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-1">
            {filledFields.length > 0 && (
              <Button type="button" size="sm" className="flex-1" onClick={applyResult}>
                Aplicar ao formulário
              </Button>
            )}
            <Button type="button" variant="outline" size="sm" className="flex-1" onClick={discardResult}>
              {filledFields.length > 0 ? 'Descartar' : 'Fechar'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
