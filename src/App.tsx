import { TrackPage } from '@/pages/TrackPage'
import { TrackingProvider } from '@/TrackingContext'

function App() {
  return (
    <TrackingProvider>
      <div className="min-h-dvh bg-gradient-to-br from-blue-500 to-purple-600">
        <main className="h-dvh">
          <TrackPage />
        </main>
      </div>
    </TrackingProvider>
  )
}

export default App
