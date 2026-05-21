import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { ResidentsPage } from '@/pages/ResidentsPage'
import { EmployeesPage } from '@/pages/EmployeesPage'
import { HealthRecordsPage } from '@/pages/HealthRecordsPage'
import { MedicationsPage } from '@/pages/MedicationsPage'
import { ActivitiesPage } from '@/pages/ActivitiesPage'
import { UsersPage } from '@/pages/UsersPage'
import { FamilyMembersPage } from '@/pages/FamilyMembersPage'
import { ChangePasswordPage } from '@/pages/ChangePasswordPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      { path: 'change-password', element: <ChangePasswordPage /> },
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'residents', element: <ResidentsPage /> },
          { path: 'employees', element: <EmployeesPage /> },
          { path: 'health-records', element: <HealthRecordsPage /> },
          { path: 'medications', element: <MedicationsPage /> },
          { path: 'activities', element: <ActivitiesPage /> },
          { path: 'users', element: <UsersPage /> },
          { path: 'family-members', element: <FamilyMembersPage /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
