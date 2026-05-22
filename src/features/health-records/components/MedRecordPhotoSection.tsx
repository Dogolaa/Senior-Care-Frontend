import { useAddMedicationRecordPhoto } from '@/features/medications/hooks/useMedications'
import { PhotoUploader, PhotoGallery } from '@/components/shared/PhotoUploader'

export function MedRecordPhotoSection({
  recordId,
  photoUrls,
  canAdd,
}: {
  recordId: string
  photoUrls: string[]
  canAdd: boolean
}) {
  const { mutate: addPhoto } = useAddMedicationRecordPhoto()
  if (photoUrls.length === 0 && !canAdd) return null
  return (
    <div className="mt-3 space-y-2">
      <PhotoGallery urls={photoUrls} />
      {canAdd && (
        <PhotoUploader
          label="Adicionar foto"
          onUploaded={(url) => addPhoto({ recordId, photoUrl: url })}
        />
      )}
    </div>
  )
}
