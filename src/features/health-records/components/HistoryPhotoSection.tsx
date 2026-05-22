import { useAddHistoryPhoto } from '@/features/health-records/hooks/useHealthRecord'
import { PhotoUploader, PhotoGallery } from '@/components/shared/PhotoUploader'

export function HistoryPhotoSection({
  historyId,
  photoUrls,
  readOnly,
}: {
  historyId: string
  photoUrls: string[]
  readOnly: boolean
}) {
  const { mutate: addPhoto } = useAddHistoryPhoto()
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
