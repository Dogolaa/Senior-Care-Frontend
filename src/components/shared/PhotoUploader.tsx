import { useRef, useState } from 'react'
import { Camera, X, ImagePlus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { uploadFile } from '@/api/upload'
import { cn } from '@/lib/utils'

interface PhotoUploaderProps {
  onUploaded: (url: string) => void
  className?: string
  label?: string
  disabled?: boolean
}

export function PhotoUploader({ onUploaded, className, label = 'Adicionar foto', disabled }: PhotoUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Selecione um arquivo de imagem válido.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 10 MB.')
      return
    }
    setUploading(true)
    try {
      const url = await uploadFile(file)
      onUploaded(url)
    } catch {
      toast.error('Falha ao enviar a imagem. Tente novamente.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />
      <button
        type="button"
        disabled={disabled || uploading}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex items-center gap-2 rounded-md border border-dashed border-input px-3 py-2 text-sm text-muted-foreground',
          'hover:border-primary hover:text-primary transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed',
        )}
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ImagePlus className="h-4 w-4" />
        )}
        {uploading ? 'Enviando...' : label}
      </button>
    </div>
  )
}

interface PhotoGalleryProps {
  urls: string[]
  onRemove?: (url: string) => void
  className?: string
}

export function PhotoGallery({ urls, onRemove, className }: PhotoGalleryProps) {
  if (urls.length === 0) return null
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {urls.map((url) => (
        <div key={url} className="relative group">
          <a href={url} target="_blank" rel="noreferrer">
            <img
              src={url}
              alt="Foto"
              className="h-20 w-20 object-cover rounded-lg border border-border"
            />
          </a>
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(url)}
              className="absolute -top-1.5 -right-1.5 hidden group-hover:flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
              aria-label="Remover foto"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

interface AvatarUploaderProps {
  currentUrl?: string | null
  name: string
  onUploaded: (url: string) => void
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

export function AvatarUploader({ currentUrl, name, onUploaded, size = 'md', disabled }: AvatarUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')

  const sizeClass = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-16 w-16 text-lg' }[size]

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('Selecione uma imagem válida.'); return }
    setUploading(true)
    try {
      const url = await uploadFile(file)
      onUploaded(url)
    } catch {
      toast.error('Falha ao enviar a foto. Tente novamente.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="relative inline-block">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />
      <div className={cn('rounded-full overflow-hidden bg-slate-600 flex items-center justify-center text-white font-semibold', sizeClass)}>
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : currentUrl ? (
          <img src={currentUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          initials
        )}
      </div>
      {!disabled && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow"
          aria-label="Alterar foto"
        >
          <Camera className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}
