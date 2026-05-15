import HowItWorks from "./components/LandingPage/HowItWorks/HowItWorks"
import SubmitRequest from "./components/LandingPage/SubmitRequest/SubmitRequest"
import LandingPage from "./pages/LandingPage"

function App() {

  return (
    <>
      <div className="mb-30">
        <LandingPage />
      </div>
      <HowItWorks />
      <SubmitRequest />
      <SubmitRequest />
      <SubmitRequest />
    </>
  )
}

export default App
