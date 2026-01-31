import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { formatDateKey, getDateDaysAgo, getDayLabel, type TrackingEntryObject } from '@/tracking'
import { useTracking } from '@/useTracking'
import { useEffect, useRef, useState } from 'react'
import { Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const VISIBLE_DAYS = 10 // Number of days we can scroll back (not including today)

export function TrackPage() {
  const { getEntry, updateEntry, isLoading } = useTracking()
  const todayKey = formatDateKey(new Date())
  const [selectedDateKey, setSelectedDateKey] = useState<string>(todayKey)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Scroll to the right on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth
    }
  }, [isLoading])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  // Generate day cards for past days (not including today)
  const pastDayCards = Array.from({ length: VISIBLE_DAYS }, (_, i) => {
    const daysAgo = VISIBLE_DAYS - i
    const date = getDateDaysAgo(daysAgo)
    const dateKey = formatDateKey(date)
    const { dayName, dayOfMonth } = getDayLabel(date)
    const entry = getEntry(dateKey)
    const hasData = entry.getMood() !== undefined || entry.getLibido() !== undefined

    const isYesterday = daysAgo === 1
    const label = isYesterday ? 'Yesterday' : dayName

    return {
      dateKey,
      label,
      dayOfMonth,
      hasData,
    }
  })

  // Today's card data
  const todayEntry = getEntry(todayKey)
  const todayHasData = todayEntry.getMood() !== undefined || todayEntry.getLibido() !== undefined

  const selectedEntry = getEntry(selectedDateKey)
  const isFormOpen = selectedDateKey !== ''

  // Prepare chart data - last 10 days including today
  const chartData = Array.from({ length: VISIBLE_DAYS + 1 }, (_, i) => {
    const daysAgo = VISIBLE_DAYS - i
    const date = getDateDaysAgo(daysAgo)
    const dateKey = formatDateKey(date)
    const { dayOfMonth } = getDayLabel(date)
    const entry = getEntry(dateKey)

    return {
      day: dayOfMonth.toString(),
      mood: entry.getMood(),
      libido: entry.getLibido(),
    }
  })

  const closeForm = () => setSelectedDateKey('')

  return (
    <div className="flex flex-col h-full relative">
      {/* Day cards section */}
      <div className="flex-shrink-0 px-5 pt-4 pb-3">
        <div className="flex gap-3">
          {/* Scrollable past days */}
          <div
            ref={scrollContainerRef}
            className="flex gap-3 overflow-x-auto flex-1 scrollbar-hide py-1 -my-1 px-1 -mx-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {pastDayCards.map((day) => (
              <DayCard
                key={day.dateKey}
                label={day.label}
                dayOfMonth={day.dayOfMonth}
                isSelected={selectedDateKey === day.dateKey}
                hasData={day.hasData}
                onClick={() => setSelectedDateKey(day.dateKey)}
              />
            ))}
          </div>

          {/* Sticky Today card */}
          <DayCard
            label="Today"
            dayOfMonth={getDayLabel(new Date()).dayOfMonth}
            isSelected={selectedDateKey === todayKey}
            hasData={todayHasData}
            isToday
            onClick={() => setSelectedDateKey(todayKey)}
          />
        </div>
      </div>

      {/* Content area with evaluation and form overlay */}
      <div className="flex-1 relative overflow-hidden">
        {/* Evaluation section (background) - clickable to close form */}
        <div className="px-5 py-6 pb-4 space-y-4 h-full overflow-y-auto" onClick={closeForm}>
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Cycle Phase</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <svg width="160" height="160" viewBox="0 0 160 160" className="w-40 h-40">
                  {/* Menstrual (red) - top right quadrant */}
                  <path d="M80 80 L80 20 A60 60 0 0 1 140 80 Z" fill="#dc2626" opacity="0.8" />
                  {/* Follicular (yellow) - bottom right quadrant */}
                  <path d="M80 80 L140 80 A60 60 0 0 1 80 140 Z" fill="#eab308" opacity="0.8" />
                  {/* Ovulation (pink) - bottom left quadrant */}
                  <path d="M80 80 L80 140 A60 60 0 0 1 20 80 Z" fill="#ec4899" opacity="0.8" />
                  {/* Luteal (purple) - top left quadrant */}
                  <path d="M80 80 L20 80 A60 60 0 0 1 80 20 Z" fill="#a855f7" opacity="0.8" />
                </svg>
                <p className="text-xs text-center text-muted-foreground">
                  Track more data to see your current cycle phase
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      domain={[1, 5]}
                      ticks={[1, 2, 3, 4, 5]}
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      width={20}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px' }} iconSize={8} />
                    <Line
                      type="monotone"
                      dataKey="mood"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      dot={{ fill: '#8b5cf6', strokeWidth: 0, r: 3 }}
                      connectNulls
                      name="Mood"
                    />
                    <Line
                      type="monotone"
                      dataKey="libido"
                      stroke="#f97316"
                      strokeWidth={2}
                      dot={{ fill: '#f97316', strokeWidth: 0, r: 3 }}
                      connectNulls
                      name="Libido"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form overlay with slide-in animation */}
        <div
          className={cn(
            'absolute inset-x-0 top-0 bg-white/95 backdrop-blur-sm px-4 pt-2 pb-4 shadow-lg',
            'transition-transform duration-300 ease-out',
            isFormOpen ? 'translate-y-0' : '-translate-y-full'
          )}
        >
          <TrackingForm
            entry={selectedEntry}
            onUpdate={updateEntry}
            onClose={() => setSelectedDateKey('')}
          />
        </div>
      </div>
    </div>
  )
}

type DayCardProps = {
  label: string
  dayOfMonth: number
  isSelected: boolean
  hasData: boolean
  isToday?: boolean
  onClick: () => void
}

function DayCard({ label, dayOfMonth, isSelected, hasData, isToday, onClick }: DayCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg p-0.5"
    >
      <Card
        className={cn(
          'w-[5.4rem] transition-all duration-200 cursor-pointer bg-white/90 backdrop-blur-sm',
          isSelected && 'ring-2 ring-primary bg-white scale-105 shadow-md',
          isToday && !isSelected && 'border-primary border-2',
          !isSelected && 'hover:bg-white'
        )}
      >
        <CardContent className="p-2 pt-2 text-center">
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
            {label}
          </p>
          <p className="text-2xl font-bold">{dayOfMonth}</p>
          {/* Status icon below day of month */}
          <div className="mt-1">
            {hasData ? (
              <CheckIcon className="w-4 h-4 text-green-500 mx-auto" />
            ) : (
              <QuestionIcon className="w-4 h-4 text-muted-foreground/40 mx-auto" />
            )}
          </div>
        </CardContent>
      </Card>
    </button>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function QuestionIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z"
        clipRule="evenodd"
      />
    </svg>
  )
}

type TrackingFormProps = {
  entry: TrackingEntryObject
  onUpdate: (entry: TrackingEntryObject) => void
  onClose: () => void
}

function TrackingForm({ entry, onUpdate }: TrackingFormProps) {
  const mood = entry.getMood()
  const libido = entry.getLibido()

  return (
    <Card>
      <CardContent className="space-y-5 p-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="mood-slider" className="text-sm">
              Mood
            </Label>
            <span className="text-sm font-semibold tabular-nums w-6 text-center">
              {mood ?? '-'}
            </span>
          </div>
          <Slider
            id="mood-slider"
            min={1}
            max={5}
            step={1}
            value={[mood ?? 3]}
            onValueChange={([value]) => {
              onUpdate(entry.setMood(value))
            }}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>😔</span>
            <span>😐</span>
            <span>😊</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="libido-slider" className="text-sm">
              Libido
            </Label>
            <span className="text-sm font-semibold tabular-nums w-6 text-center">
              {libido ?? '-'}
            </span>
          </div>
          <Slider
            id="libido-slider"
            min={1}
            max={5}
            step={1}
            value={[libido ?? 3]}
            onValueChange={([value]) => {
              onUpdate(entry.setLibido(value))
            }}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>🔥</span>
            <span>🔥🔥</span>
            <span>🔥🔥🔥</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
