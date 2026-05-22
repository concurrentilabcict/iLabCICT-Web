import LandingPage from "./pages/LandingPage"
import SmoothScrolling from "./components/LandingPage/SmoothScrolling/SmoothScrolling"
import LoginPage from "./pages/LoginPage"
import ManageTicketPage from "./pages/Technician/ManageTicketPage"
import { Route, Routes } from "react-router-dom"
import { ProtectedRoute, PublicRoute } from "./routes/ProtectedRoute"
import ProfilePage from "./pages/Technician/ProfilePage"
import NotificationPage from "./pages/Technician/NotificationPage"
import WeeklyReportPage from "./pages/Technician/WeeklyReportPage"

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<PublicRoute><SmoothScrolling>
          <LandingPage /></SmoothScrolling></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

        <Route path="/manage-ticket" element={<ProtectedRoute allowedRole="technician">
          <ManageTicketPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute allowedRole="technician">
          <ProfilePage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute allowedRole="technician">
          <NotificationPage /></ProtectedRoute>} />
          <Route path="/weekly-reports" element={<ProtectedRoute allowedRole="technician">
          <WeeklyReportPage /></ProtectedRoute>} />
      </Routes>
    </>
  )
}

export default App
