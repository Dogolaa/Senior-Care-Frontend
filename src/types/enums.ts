export type Gender = 'MALE' | 'FEMALE' | 'OTHER'

export type BloodType =
  | 'A_POSITIVE'
  | 'A_NEGATIVE'
  | 'B_POSITIVE'
  | 'B_NEGATIVE'
  | 'AB_POSITIVE'
  | 'AB_NEGATIVE'
  | 'O_POSITIVE'
  | 'O_NEGATIVE'

export type VitalSignsSource = 'MANUAL' | 'WEARABLE' | 'DEVICE'

export type Shift = 'MORNING' | 'AFTERNOON' | 'NIGHT'

export type UserRole =
  | 'ADMIN'
  | 'MANAGER'
  | 'DOCTOR'
  | 'NURSE'
  | 'FAMILY_MEMBER'
  | 'DEFAULT_USER'

export type EmployeeRole = 'NURSE' | 'DOCTOR' | 'MANAGER'
