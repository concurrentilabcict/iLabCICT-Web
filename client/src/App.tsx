import HowItWorks from "./components/LandingPage/HowItWorks/HowItWorks"
import SubmitRequest from "./components/LandingPage/SubmitRequest/SubmitRequest"
import TrackAndManage from "./components/LandingPage/TrackAndManage/TrackAndManage"
import LandingPage from "./pages/LandingPage"

function App() {

  return (
    <>
      <div className="mb-30">
        <LandingPage />
      </div>
      <HowItWorks />
      <SubmitRequest />
      <TrackAndManage />
      
    </>
  )
}

export default App
