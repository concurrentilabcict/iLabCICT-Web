import { lazy, Suspense } from "react"
import { Route, Routes } from "react-router-dom"
import { ProtectedRoute, PublicRoute } from "./routes/ProtectedRoute"
import { Toaster } from "react-hot-toast";
import { useAuth } from "./auth/useAuth"

const LandingPage = lazy(() => import("./pages/LandingPage"));
const SmoothScrolling = lazy(() => import("./components/LandingPage/SmoothScrolling/SmoothScrolling"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const TechnicianManageTicket = lazy(() => import("./pages/Technician/ManageTicketPage"));
const ProfilePage = lazy(() => import("./pages/Technician/ProfilePage"));
const NotificationPage = lazy(() => import("./pages/Technician/NotificationPage"));
const TechnicianWeeklyReport = lazy(() => import("./pages/Technician/WeeklyReportPage"));
const AdminWeeklyReport = lazy(() => import("./pages/Admin/WeeklyReportPage"));
const AdminAuditLogs = lazy(() => import("./pages/Admin/AuditLogsPage"));
const QrScannerPage = lazy(() => import("./pages/Technician/QrScannerPage"));
const ProcessTicket = lazy(() => import("./components/Technician/ManageTicket/ProcessTicket"));
const ChatbotPage = lazy(() => import("./pages/Technician/ChatBotPage"));
const TechnicianRepairLog = lazy(() => import("./pages/Technician/RepairLogPage"));
const LaboratoryPage = lazy(() => import("./pages/Technician/LaboratoryPage"));
const ComputerListPage = lazy(() => import("./pages/Technician/ComputerListPage"));
const ComputerInformationPage = lazy(() => import("./pages/Technician/ComputerInformationPage"));
const AdminManageTicket = lazy(() => import("./pages/Admin/ManageTicketPage"));
const AdminRepairLog = lazy(() => import("./pages/Admin/RepairLogPage"));
const UnauthorizedPage = lazy(() => import("./pages/UnauthorizedPage"));
const ManageUserPage = lazy(() => import("./pages/Admin/ManageUserPage"));
const DashboardPage = lazy(() => import("./pages/Admin/DashboardPage"));
const FacultyNotificationPage = lazy(() => import("./pages/Faculty/NotificationPage"));
const FacultyQrScannerPage = lazy(() => import("./pages/Faculty/QrScannerPage"));
const FacultyManageTicket = lazy(() => import("./pages/Faculty/ManageTicketPage"));
const FacultyFaqPage = lazy(() => import("./pages/Faculty/FaqPage"));
const CreateTicketPage = lazy(() => import("./pages/Faculty/CreateTicketPage"));
const FacultyManageLaboratoryPage = lazy(() => import("./pages/Faculty/ManageLaboratoryPage"));
const FacultyComputerListPage = lazy(() => import("./pages/Faculty/ComputerListPage"));
const FacultyComputerInformationPage = lazy(() => import("./pages/Faculty/ComputerInformationPage"));
const AdminManageLaboratoryPage = lazy(() => import("./pages/Admin/ManageLaboratoryPage"));
const AdminComputerInformationPage = lazy(() => import("./pages/Admin/ComputerInformationPage"));
const AdminComputerListPage = lazy(() => import("./pages/Admin/ComputerListPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const NotFound = lazy(() => import("./components/NotFound/NotFound"));

const allRoles = ["technician", "admin", "faculty"] as const;
const adminOnly = ["admin"] as const;
const technicianOnly = ["technician"] as const;
const facultyOnly = ["faculty"] as const;
const technicianAndAdmin = ["technician", "admin"] as const;
const technicianAndFaculty = ["technician", "faculty"] as const;

function App() {

  const { role } = useAuth();

  return (
    <>
      <Toaster position="top-center" gutter={10} />
      <Suspense fallback={<div id="initial-loading" role="status"><span><i aria-hidden="true" />Loading iLabCICT...</span></div>}>
      <Routes>
        <Route path="/" element={<PublicRoute><SmoothScrolling>
          <LandingPage /></SmoothScrolling></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />

        {/* Technician, Admin, Faculty */}
        <Route path="/manage-ticket" element={
          <ProtectedRoute allowedRoles={allRoles}>
            {role === "admin" ? <AdminManageTicket /> : role === "faculty" ? <FacultyManageTicket /> : <TechnicianManageTicket />}
          </ProtectedRoute>
        } />
        
        <Route path="/manage-laboratory" element={
          <ProtectedRoute allowedRoles={allRoles}>
            {role === "admin" ?  <AdminManageLaboratoryPage/> : role === "faculty" ? <FacultyManageLaboratoryPage/> : <LaboratoryPage />}
          </ProtectedRoute>
        } />
        <Route path="/manage-laboratory/:room" element={
          <ProtectedRoute allowedRoles={allRoles}>
            {role === "admin" ? <AdminComputerListPage/> : role === "faculty" ? <FacultyComputerListPage/> : <ComputerListPage />}
          </ProtectedRoute>
        } />
        <Route path="/manage-laboratory/:room/:code" element={
          <ProtectedRoute allowedRoles={allRoles}>
            {role === "admin" ? <AdminComputerInformationPage/> : role === "faculty" ? <FacultyComputerInformationPage/> : <ComputerInformationPage /> }
          </ProtectedRoute>
        } />
        <Route path="/profile" element={<ProtectedRoute allowedRoles={allRoles}>
          <ProfilePage /></ProtectedRoute>} />

        {/* Technician, Admin */}
        <Route path="/repair-logs" element={<ProtectedRoute allowedRoles={technicianAndAdmin}>
          {role === "technician" ? <TechnicianRepairLog /> : <AdminRepairLog />}
        </ProtectedRoute>} />
        <Route path="/weekly-reports" element={<ProtectedRoute allowedRoles={technicianAndAdmin}>
          {role === "technician" ? <TechnicianWeeklyReport /> : <AdminWeeklyReport />}
        </ProtectedRoute>} />

        {/* Technician, Faculty */}
        <Route path="/notifications" element={<ProtectedRoute allowedRoles={technicianAndFaculty}>
          {role === "faculty" ? <FacultyNotificationPage /> : <NotificationPage />}</ProtectedRoute>} />
        <Route path="/qr-scanner" element={<ProtectedRoute allowedRoles={technicianAndFaculty}>
          {role === "faculty" ? <FacultyQrScannerPage /> : <QrScannerPage />}</ProtectedRoute>} />
       

        {/* Technician */}
        <Route path="/manage-ticket/:id" element={<ProtectedRoute allowedRoles={technicianOnly}>
          <ProcessTicket /></ProtectedRoute>} />
        <Route path="/chatbot" element={<ProtectedRoute allowedRoles={technicianOnly}>
          <ChatbotPage /></ProtectedRoute>} />
        

        {/* Admin */}
        <Route path="/manage-user" element={<ProtectedRoute allowedRoles={adminOnly}>
          <ManageUserPage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={adminOnly}>
          <DashboardPage /></ProtectedRoute>} />
        <Route path="/audit-logs" element={<ProtectedRoute allowedRoles={adminOnly}>
          <AdminAuditLogs /></ProtectedRoute>} />

        {/* Faculty */}
        <Route path="/create-ticket" element={<ProtectedRoute allowedRoles={facultyOnly}>
          <CreateTicketPage /></ProtectedRoute>} />
        <Route path="/faq" element={<ProtectedRoute allowedRoles={facultyOnly}>
          <FacultyFaqPage /></ProtectedRoute>} />

        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFound />} />

      </Routes>
      </Suspense>
    </>
  )
}

export default App;
