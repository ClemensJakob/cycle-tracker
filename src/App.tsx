import { TrackPage } from '@/pages/TrackPage'
import { TrackingProvider } from '@/TrackingContext'

function App() {
  return (
    <TrackingProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
        <main className="h-screen">
          <TrackPage />
        </main>
      </div>
    </TrackingProvider>
  )
}

export default App
