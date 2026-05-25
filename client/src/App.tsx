import LandingPage from "./pages/LandingPage"
import SmoothScrolling from "./components/LandingPage/SmoothScrolling/SmoothScrolling"
import LoginPage from "./pages/LoginPage"
import ManageTicketPage from "./pages/Technician/ManageTicketPage"
import { Route, Routes } from "react-router-dom"
import { ProtectedRoute, PublicRoute } from "./routes/ProtectedRoute"
import ProfilePage from "./pages/Technician/ProfilePage"
import NotificationPage from "./pages/Technician/NotificationPage"
import LaboratoryPage from "./pages/Technician/LaboratoryPage"
import ComputerListPage from "./pages/Technician/ComputerListPage"
import ComputerInformationPage from "./pages/Technician/ComputerInformationPage"

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
          <Route path="/laboratory" element={<ProtectedRoute allowedRole="technician">
            <LaboratoryPage /></ProtectedRoute>}/>  
          <Route path="/laboratory/:room" element={<ProtectedRoute allowedRole="technician">
            <ComputerListPage/></ProtectedRoute>}/>
          <Route path="/laboratory/:room/:code" element={<ProtectedRoute allowedRole="technician">
            <ComputerInformationPage/></ProtectedRoute>}/>
      </Routes>
    </>
  )
}

export default App
