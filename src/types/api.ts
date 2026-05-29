export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  userId: string
  name: string
  email: string
  role: string
  mustChangePassword: boolean
}

export interface RegisterRequest {
  name: string
  email: string
  phone: string
  addressId?: string | null
  password: string
}

export interface UserDTO {
  id: string
  name: string
  email: string
  phone: string | null
  isActive: boolean
  role: string | null
  photoUrl?: string | null
  createdAt: string
  updatedAt: string
}

export interface UpdateUserRequest {
  name: string
  email: string
  phone: string
  addressId?: string | null
  roleId?: string | null
}

export interface AddressDTO {
  id: string
  cep: string
  country: string
  state: string
  city: string
  district: string
  street: string
  number: number
  complement?: string
}

export interface AddressRequest {
  cep: string
  country: string
  state: string
  city: string
  district: string
  street: string
  number: number
  complement?: string
}

export interface RoleDTO {
  id: string
  name: string
}

export interface EmployeeDetailsDTO {
  userId: string
  employeeId: string
  name: string
  email: string
  phone: string
  admissionDate: string
  isActive: boolean
  createdAt: string
  role: 'NURSE' | 'DOCTOR' | 'MANAGER'
  coren?: string | null
  crm?: string | null
  department?: string | null
  specialization?: string | null
  shift?: string | null
}

export interface PromoteNurseRequest {
  userId: string
  admissionDate: string
  coren: string
  specialization: string
  shift: string
}

export interface PromoteDoctorRequest {
  userId: string
  admissionDate: string
  crm: string
  specialization: string
  shift: string
}

export interface PromoteManagerRequest {
  userId: string
  admissionDate: string
  department: string
  shift: string
}

export interface FamilyLinkDTO {
  id: string
  familyMemberId: string
  relationship: string
  createdAt: string
  updatedAt: string
  primaryContact: boolean
}

export interface ResidentDTO {
  id: string
  name: string
  cpf: string
  rg: string
  dateOfBirth: string
  gender: string
  bloodType: string
  room: string
  admissionDate?: string
  isActive: boolean
  allergies?: string[]
  familyLinks?: FamilyLinkDTO[]
}

export interface UpdateResidentRequest {
  name?: string
  rg?: string
  dateOfBirth?: string
  gender?: string
  bloodType?: string
  room?: string
}

export interface AdmitResidentRequest {
  name: string
  cpf: string
  rg: string
  dateOfBirth: string
  gender: string
  bloodType: string
  initialAllergies?: string[]
  room: string
}

export interface FamilyLinkRequest {
  familyMemberId: string
  relationship: string
  isPrimaryContact: boolean
}

export interface HealthRecordDTO {
  id: string
  residentId: string
  updatedById: string
  height: number
  weight: number
  bloodPressure: string
  heartRate: number
  temperature: number
  saturation: number
  imc: number
  lastUpdated: string
  conditions: string[]
  history: HealthRecordHistoryDTO[]
}

export interface HealthRecordHistoryDTO {
  id: string
  height: number
  weight: number
  bloodPressure: string
  heartRate: number
  temperature: number
  saturation: number
  imc: number | null
  updateDate: string
  source: string
  photoUrls: string[]
}

export interface CreateHealthRecordRequest {
  residentId: string
  updatedById: string
  height: number
  weight: number
  bloodPressure: string
  heartRate: number
  temperature: number
  saturation: number
}

export interface PrescriptionDTO {
  id: string
  healthRecordId: string
  medicationId: string
  medicationCommercialName: string
  dosage: string
  startDate: string
  endDate: string
}

export interface CreatePrescriptionRequest {
  medicalRecordId: string
  medicationId: string
  dosage: string
  startDate: string
  endDate: string
}

export interface MedicationDTO {
  id: string
  commercialName: string
  activeIngredient: string
  pharmaceuticalForm: string
  concentration: string
  manufacturer: string
  registrationNumber: string
  therapeuticClass: string
  controlledSubstance: boolean
}

export interface MedicationRecordDTO {
  id: string
  residentId: string
  medicationId: string
  medicationCommercialName: string
  administrationDate: string
  administeredById: string
  dose: string
  photoUrls?: string[]
}

export interface ActivityRecordDTO {
  id: string
  residentId: string
  conductedById: string
  lastActivityDate: string
  history: ActivityHistoryDTO[]
}

export interface ActivityHistoryDTO {
  id: string
  activityName: string
  description: string
  startDateTime: string
  endDateTime: string
  conductedById: string
  notes: string
  recordedAt: string
  photoUrls: string[]
}

export interface PaginatedResponse<T> {
  _embedded?: Record<string, T[]>
  _links?: Record<string, { href: string }>
  page?: {
    size: number
    totalElements: number
    totalPages: number
    number: number
  }
}

export interface PaginationParams {
  page?: number
  size?: number
  sort?: string
}

export interface RecentHealthUpdateDTO {
  residentId: string
  residentName: string
  room: string
  lastUpdated: string
}

export interface RecentActivityDTO {
  residentId: string
  residentName: string
  room: string
  activityName: string
  conductedAt: string
}

export interface DashboardStatsDTO {
  totalActiveResidents: number
  totalEmployees: number
  medicationsAdministeredToday: number
  activitiesLoggedToday: number
  recentHealthUpdates: RecentHealthUpdateDTO[]
  recentActivities: RecentActivityDTO[]
}

export type CarePlanStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED'

export interface CarePlanDTO {
  id: string
  residentId: string
  responsibleId: string
  title: string
  description: string | null
  goals: string[]
  interventions: string[]
  startDate: string
  endDate: string | null
  status: CarePlanStatus
  createdAt: string
  updatedAt: string
}

export interface CreateCarePlanRequest {
  residentId: string
  responsibleId: string
  title: string
  description?: string | null
  goals?: string[]
  interventions?: string[]
  startDate: string
  endDate?: string | null
}

export interface UpdateCarePlanRequest {
  title: string
  description?: string | null
  goals?: string[]
  interventions?: string[]
  startDate: string
  endDate?: string | null
  status: CarePlanStatus
}

export type IncidentType =
  | 'FALL'
  | 'AGITATION'
  | 'MEDICATION_REFUSAL'
  | 'BEHAVIORAL_CHANGE'
  | 'ACCIDENT'
  | 'OTHER'

export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface IncidentDTO {
  id: string
  residentId: string
  reportedById: string
  incidentType: IncidentType
  severity: IncidentSeverity
  description: string
  actionTaken: string | null
  occurredAt: string
  room: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateIncidentRequest {
  residentId: string
  reportedById: string
  incidentType: IncidentType
  severity: IncidentSeverity
  description: string
  actionTaken?: string | null
  occurredAt: string
  room?: string | null
}

export interface UpdateIncidentRequest {
  incidentType: IncidentType
  severity: IncidentSeverity
  description: string
  actionTaken?: string | null
  occurredAt: string
  room?: string | null
}
