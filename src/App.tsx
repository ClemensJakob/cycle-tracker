import { TrackPage } from '@/pages/TrackPage'
import { TrackingProvider } from '@/TrackingContext'

function App() {
  return (
    <TrackingProvider>
      <div className="h-dvh bg-linear-to-br from-blue-500 to-purple-600 overflow-hidden overscroll-none">
        <main className="h-full overflow-hidden">
          <TrackPage />
        </main>
      </div>
    </TrackingProvider>
  )
}

export default App
