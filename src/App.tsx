import LandingPage from "./pages/LandingPage"
import SmoothScrolling from "./components/LandingPage/SmoothScrolling/SmoothScrolling"
import LoginPage from "./pages/LoginPage"
import ManageTicketPage from "./pages/Technician/ManageTicketPage"
import { Route, Routes } from "react-router-dom"
import { ProtectedRoute, PublicRoute } from "./routes/ProtectedRoute"
import ProfilePage from "./pages/Technician/ProfilePage"
import NotificationPage from "./pages/Technician/NotificationPage"
import LaboratoryPage from "./pages/Technician/LaboratoryPage"
<<<<<<< HEAD
import ComputerListPage from "./pages/Technician/ComputerListPage"
import ComputerInformationPage from "./pages/Technician/ComputerInformationPage"
=======
>>>>>>> e4e1475169f57dbaeacb52c997dfd4a3b70455fe

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
<<<<<<< HEAD
            <LaboratoryPage /></ProtectedRoute>}/>  
          <Route path="/laboratory/:room" element={<ProtectedRoute allowedRole="technician">
            <ComputerListPage/></ProtectedRoute>}/>
          <Route path="/laboratory/:room/:code" element={<ProtectedRoute allowedRole="technician">
            <ComputerInformationPage/></ProtectedRoute>}/>
=======
            <LaboratoryPage /></ProtectedRoute>}/>
>>>>>>> e4e1475169f57dbaeacb52c997dfd4a3b70455fe
      </Routes>
    </>
  )
}

export default App
