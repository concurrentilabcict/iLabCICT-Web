import LandingPage from "./pages/LandingPage"
import SmoothScrolling from "./components/LandingPage/SmoothScrolling/SmoothScrolling"
import LoginPage from "./pages/LoginPage"
import TechnicianManageTicket from "./pages/Technician/ManageTicketPage"
import { Route, Routes } from "react-router-dom"
import { ProtectedRoute, PublicRoute } from "./routes/ProtectedRoute"
import ProfilePage from "./pages/Technician/ProfilePage"
import NotificationPage from "./pages/Technician/NotificationPage"
import TechnicianWeeklyReport from "./pages/Technician/WeeklyReportPage"
import AdminWeeklyReport from "./pages/Admin/WeeklyReportPage"
import { Toaster } from "react-hot-toast";
import QrScannerPage from "./pages/Technician/QrScannerPage"
import ProcessTicket from "./components/Technician/ManageTicket/ProcessTicket"
import ChatbotPage from "./pages/Technician/ChatBotPage"
import TechnicianRepairLog from "./pages/Technician/RepairLogPage"
import LaboratoryPage from "./pages/Technician/LaboratoryPage"
import ComputerListPage from "./pages/Technician/ComputerListPage"
import ComputerInformationPage from "./pages/Technician/ComputerInformationPage"
import AdminManageTicket from "./pages/Admin/ManageTicketPage"
import AdminRepairLog from "./pages/Admin/RepairLogPage"
import UnauthorizedPage from "./pages/UnauthorizedPage"
import { useAuth } from "./auth/useAuth"
import ManageUserPage from "./pages/Admin/ManageUserPage"
import DashboardPage from "./pages/Admin/DashboardPage"

function App() {

  const { role } = useAuth();

  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 3000, }} />
      <Routes>
        <Route path="/" element={<PublicRoute><SmoothScrolling>
          <LandingPage /></SmoothScrolling></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

        <Route path="/manage-ticket" element={
          <ProtectedRoute allowedRoles={["technician", "admin"]}>
            {role === "technician" ? <TechnicianManageTicket /> : <AdminManageTicket />}
          </ProtectedRoute>
        } />

        <Route path="/manage-ticket/:id" element={<ProtectedRoute allowedRoles={["technician"]}>
          <ProcessTicket /></ProtectedRoute>} />

        <Route path="/manage-user" element={<ProtectedRoute allowedRoles={["admin"]}>
          <ManageUserPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["admin"]}>
          <DashboardPage /></ProtectedRoute>} />

        <Route path="/profile" element={<ProtectedRoute allowedRoles={["technician", "admin"]}>
          <ProfilePage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute allowedRoles={["technician"]}>
          <NotificationPage /></ProtectedRoute>} />

        <Route path="/repair-logs" element={<ProtectedRoute allowedRoles={["technician", "admin"]}>
          {role === "technician" ? <TechnicianRepairLog /> : <AdminRepairLog />}
        </ProtectedRoute>} />
         <Route path="/weekly-reports" element={<ProtectedRoute allowedRoles={["technician", "admin"]}>
          {role === "technician" ? <TechnicianWeeklyReport /> : <AdminWeeklyReport />}
        </ProtectedRoute>} />

        <Route path="/qr-scanner" element={<ProtectedRoute allowedRoles={["technician"]}>
          <QrScannerPage /></ProtectedRoute>} />
        <Route path="/chatbot" element={<ProtectedRoute allowedRoles={["technician"]}>
          <ChatbotPage /></ProtectedRoute>} />

        <Route path="/manage-laboratory" element={<ProtectedRoute allowedRoles={["technician"]}>
          <LaboratoryPage /></ProtectedRoute>} />
        <Route path="/manage-laboratory/:room" element={<ProtectedRoute allowedRoles={["technician"]}>
          <ComputerListPage /></ProtectedRoute>} />
        <Route path="/manage-laboratory/:room/:code" element={<ProtectedRoute allowedRoles={["technician"]}>
          <ComputerInformationPage /></ProtectedRoute>} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

      </Routes>
    </>
  )
}

export default App;
