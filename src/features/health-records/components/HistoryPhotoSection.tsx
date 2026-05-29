import { useAddHistoryPhoto } from '@/features/health-records/hooks/useHealthRecord'
import { PhotoUploader, PhotoGallery } from '@/components/shared/PhotoUploader'

export function HistoryPhotoSection({
  historyId,
  photoUrls,
  readOnly,
  residentId,
}: {
  historyId: string
  photoUrls: string[]
  readOnly: boolean
  residentId: string
}) {
  const { mutate: addPhoto } = useAddHistoryPhoto(residentId)
  if (photoUrls.length === 0 && readOnly) return null
  return (
    <div className="mt-3 space-y-2">
      <PhotoGallery urls={photoUrls} />
      {!readOnly && (
        <PhotoUploader
          label="Adicionar foto"
          onUploaded={(url) => addPhoto({ historyId, photoUrl: url })}
        />
      )}
    </div>
  )
}
