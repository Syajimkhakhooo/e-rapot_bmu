import { Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import MainLayout from '@/layouts/MainLayout'
import Dashboard from '@/pages/Dashboard'
import Login from '@/pages/Login'
import Users from '@/pages/Users'
import Classes from '@/pages/Classes'
import Students from '@/pages/Students'
import Signatories from '@/pages/Signatories'
import Reports from '@/pages/Reports'
import CreateReport from '@/pages/CreateReport'
import PrintReport from '@/pages/PrintReport'
import EditReport from '@/pages/EditReport'
import VerifyReport from '@/pages/VerifyReport'
import History from '@/pages/History'
import ClassReports from '@/pages/ClassReports'
import ClassReportDetail from '@/pages/ClassReportDetail'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/useAuthStore'

function App() {
  const { initialize, isLoading } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  if (isLoading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-background"><p>Loading...</p></div>
  }

  return (
    <>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/verify/:token" element={<VerifyReport />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<ProtectedRoute allowedRoles={['super_admin']}><Users /></ProtectedRoute>} />
          <Route path="/classes" element={<ProtectedRoute allowedRoles={['super_admin', 'admin']}><Classes /></ProtectedRoute>} />
          <Route path="/students" element={<ProtectedRoute allowedRoles={['super_admin', 'admin']}><Students /></ProtectedRoute>} />
          <Route path="/signatories" element={<ProtectedRoute allowedRoles={['super_admin', 'admin']}><Signatories /></ProtectedRoute>} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/create" element={<CreateReport />} />
          <Route path="/reports/:id/edit" element={<EditReport />} />
          <Route path="/reports/:id/print" element={<PrintReport />} />
          <Route path="/class-reports" element={<ClassReports />} />
          <Route path="/class-reports/:classId" element={<ClassReportDetail />} />
          <Route path="/history" element={<History />} />
          {/* Add more routes here later */}
        </Route>
      </Routes>
    </>
  )
}

export default App
