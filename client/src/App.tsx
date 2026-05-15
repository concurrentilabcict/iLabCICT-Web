import LandingPage from "./pages/LandingPage"
import SmoothScrolling from "./components/LandingPage/SmoothScrolling/SmoothScrolling"

function App() {

  return (
    <>
      <div>
        <SmoothScrolling>
          <LandingPage />
        </SmoothScrolling>
      </div>
    </>
  )
}

export default App
