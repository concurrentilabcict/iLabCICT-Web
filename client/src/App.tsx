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
import FacultyPage from "./pages/Faculty/FacultyPage"
import FacultyQrScannerPage from "./pages/Faculty/QrScannerPage"
import FacultyManageTicket from "./pages/Faculty/ManageTicketPage"

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
      <Toaster position="top-center" toastOptions={{ duration: 3000, }} />
      <Routes>
        <Route path="/" element={<PublicRoute><SmoothScrolling>
          <LandingPage /></SmoothScrolling></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

        {/* Technician, Admin, Faculty */}
        <Route path="/manage-ticket" element={
          <ProtectedRoute allowedRoles={allRoles}>
            {role === "admin" ? <AdminManageTicket /> : role === "faculty" ? <FacultyManageTicket /> : <TechnicianManageTicket />}
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
          {role === "faculty" ? <FacultyPage title="Notifications" /> : <NotificationPage />}</ProtectedRoute>} />
        <Route path="/qr-scanner" element={<ProtectedRoute allowedRoles={technicianAndFaculty}>
          {role === "faculty" ? <FacultyQrScannerPage /> : <QrScannerPage />}</ProtectedRoute>} />
        <Route path="/manage-laboratory" element={<ProtectedRoute allowedRoles={technicianAndFaculty}>
          {role === "faculty" ? <FacultyPage title="Laboratory" /> : <LaboratoryPage />}</ProtectedRoute>} />

        {/* Technician */}
        <Route path="/manage-ticket/:id" element={<ProtectedRoute allowedRoles={technicianOnly}>
          <ProcessTicket /></ProtectedRoute>} />
        <Route path="/chatbot" element={<ProtectedRoute allowedRoles={technicianOnly}>
          <ChatbotPage /></ProtectedRoute>} />
        <Route path="/manage-laboratory/:room" element={<ProtectedRoute allowedRoles={technicianOnly}>
          <ComputerListPage /></ProtectedRoute>} />
        <Route path="/manage-laboratory/:room/:code" element={<ProtectedRoute allowedRoles={technicianOnly}>
          <ComputerInformationPage /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/manage-user" element={<ProtectedRoute allowedRoles={adminOnly}>
          <ManageUserPage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={adminOnly}>
          <DashboardPage /></ProtectedRoute>} />

        {/* Faculty */}
        <Route path="/faq" element={<ProtectedRoute allowedRoles={facultyOnly}>
          <FacultyPage title="FAQ" /></ProtectedRoute>} />

        <Route path="/unauthorized" element={<UnauthorizedPage />} />

      </Routes>
    </>
  )
}

export default App;
