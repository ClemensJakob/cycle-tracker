import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTracking } from '@/useTracking'

export function EvaluatePage() {
  const { entries, isLoading } = useTracking()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const entriesArray = Object.values(entries)
  const entriesWithMood = entriesArray.filter((e) => e.getMood() !== undefined)
  const entriesWithLibido = entriesArray.filter((e) => e.getLibido() !== undefined)

  const avgMood =
    entriesWithMood.length > 0
      ? (
          entriesWithMood.reduce((sum, e) => sum + (e.getMood() ?? 0), 0) / entriesWithMood.length
        ).toFixed(1)
      : '-'

  const avgLibido =
    entriesWithLibido.length > 0
      ? (
          entriesWithLibido.reduce((sum, e) => sum + (e.getLibido() ?? 0), 0) /
          entriesWithLibido.length
        ).toFixed(1)
      : '-'

  return (
    <div className="flex flex-col h-full p-4 space-y-4">
      <h1 className="text-2xl font-bold">Evaluate</h1>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Mood</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{avgMood}</p>
            <p className="text-xs text-muted-foreground">from {entriesWithMood.length} entries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Libido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{avgLibido}</p>
            <p className="text-xs text-muted-foreground">from {entriesWithLibido.length} entries</p>
          </CardContent>
        </Card>
      </div>

      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Chart visualization coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
