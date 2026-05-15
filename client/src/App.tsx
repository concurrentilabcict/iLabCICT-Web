import GenerateReports from "./components/LandingPage/GenerateReports/GenerateReports"
import HowItWorks from "./components/LandingPage/HowItWorks/HowItWorks"
import ResolveEfficiently from "./components/LandingPage/ResolveEfficiently/ResolveEfficiently"
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
      <ResolveEfficiently />
      <GenerateReports />
    </>
  )
}

export default App
