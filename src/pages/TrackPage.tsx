import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import {
  formatDateKey,
  getDateDaysAgo,
  getDayLabel,
  type Symptom,
  type TrackingEntryObject,
} from '@/tracking'
import { useTracking } from '@/useTracking'
import { useEffect, useRef, useState } from 'react'
import { Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const VISIBLE_DAYS = 10 // Number of days we can scroll back (not including today)

export function TrackPage() {
  const { getEntry, updateEntry, isLoading } = useTracking()
  const todayKey = formatDateKey(new Date())
  const [selectedDateKey, setSelectedDateKey] = useState<string>('')
  const [hiddenLines, setHiddenLines] = useState<string[]>([])
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const handleLegendClick = (dataKey: string) => {
    setHiddenLines((prev) =>
      prev.includes(dataKey) ? prev.filter((key) => key !== dataKey) : [...prev, dataKey]
    )
  }

  // Scroll to the right on mount and open today's form with animation
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth
    }
    // Trigger slide-in animation after mount
    const timer = setTimeout(() => setSelectedDateKey(todayKey), 50)
    return () => clearTimeout(timer)
  }, [isLoading, todayKey])

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
    const notes = entry.getNotes()

    return {
      day: dayOfMonth.toString(),
      mood: entry.getMood(),
      selfPerception: entry.getSelfPerception(),
      energy: entry.getEnergy(),
      motivation: entry.getMotivation(),
      libido: entry.getLibido(),
      dischargeConsistency: entry.getDischargeConsistency(),
      dischargeAmount: entry.getDischargeAmount(),
      symptoms: entry.getSymptoms(),
      notes,
    }
  })

  const closeForm = () => setSelectedDateKey('')

  return (
    <div className="flex flex-col h-full relative" onClick={closeForm}>
      {/* Upper section: Data Entry */}
      <div className="shrink-0 bg-white/10 backdrop-blur-sm pt-3 pb-2">
        {/* Day cards section */}
        <div className="px-3 pb-3">
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            {/* Scrollable past days */}
            <div
              ref={scrollContainerRef}
              className="flex gap-2 p-1 overflow-x-auto overflow-y-visible flex-1 scrollbar-hide pb-5 -mb-5 px-1 -mx-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {pastDayCards.map((day) => (
                <DayCard
                  key={day.dateKey}
                  label={day.label}
                  dayOfMonth={day.dayOfMonth}
                  isSelected={selectedDateKey === day.dateKey}
                  hasData={day.hasData}
                  onClick={() =>
                    setSelectedDateKey((prev) => (prev === day.dateKey ? '' : day.dateKey))
                  }
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
              onClick={() => setSelectedDateKey((prev) => (prev === todayKey ? '' : todayKey))}
            />
          </div>
        </div>

        {/* Tracking form */}
        <div
          className={cn(
            'px-3 pt-4 transition-all duration-300 ease-out overflow-hidden',
            isFormOpen ? 'max-h-128 opacity-100 pb-2' : 'max-h-0 opacity-0 pb-0'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <TrackingForm entry={selectedEntry} onUpdate={updateEntry} />
        </div>
      </div>

      {/* Visual divider */}
      <div className="h-px bg-linear-to-r from-transparent via-white/30 to-transparent mx-6" />

      {/* Lower section: Graph/Insights */}
      <div className="h-[60vh] px-3 py-3">
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 h-full">
          <CardContent className="p-3 h-full flex flex-col">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium mb-1">
              Last 10 days
            </p>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis
                    dataKey="day"
                    tick={({ x, y, payload, index }) => {
                      const item = chartData[index]
                      const hasNotes = item?.notes
                      return (
                        <g transform={`translate(${x},${y})`}>
                          <text x={0} y={0} dy={10} textAnchor="middle" fontSize={10} fill="#666">
                            {payload.value}
                          </text>
                          {hasNotes && (
                            <text x={0} y={0} dy={20} textAnchor="middle" fontSize={7} fill="#999">
                              📝
                            </text>
                          )}
                        </g>
                      )
                    }}
                    tickLine={false}
                    axisLine={false}
                    height={30}
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
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null
                      const data = payload[0]?.payload
                      return (
                        <div className="bg-white border border-gray-200 rounded-lg p-2 text-xs shadow-sm">
                          <p className="font-medium mb-1">Tag {label}</p>
                          {data?.mood && <p className="text-violet-500">Stimmung: {data.mood}</p>}
                          {data?.selfPerception && (
                            <p className="text-pink-500">Selbstwahrn.: {data.selfPerception}</p>
                          )}
                          {data?.energy && <p className="text-green-500">Energie: {data.energy}</p>}
                          {data?.motivation && (
                            <p className="text-amber-500">Motivation: {data.motivation}</p>
                          )}
                          {data?.libido && <p className="text-orange-500">Libido: {data.libido}</p>}
                          {data?.dischargeConsistency && (
                            <p className="text-cyan-500">Konsistenz: {data.dischargeConsistency}</p>
                          )}
                          {data?.dischargeAmount && (
                            <p className="text-blue-500">Menge: {data.dischargeAmount}</p>
                          )}
                          {data?.symptoms?.length > 0 && (
                            <p className="text-rose-500">
                              Symptome:{' '}
                              {data.symptoms
                                .map((s: string) =>
                                  s === 'breastTension'
                                    ? 'Brust'
                                    : s === 'bloating'
                                      ? 'Blähung'
                                      : s === 'headache'
                                        ? 'Kopf'
                                        : s
                                )
                                .join(', ')}
                            </p>
                          )}
                          {data?.notes && (
                            <p className="text-gray-500 mt-1 max-w-32 wrap-break-word">
                              {data.notes}
                            </p>
                          )}
                        </div>
                      )
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '10px' }}
                    iconSize={8}
                    onClick={(e) => handleLegendClick(e.dataKey as string)}
                    formatter={(value, entry) => (
                      <span
                        style={{
                          color: hiddenLines.includes(entry.dataKey as string)
                            ? '#ccc'
                            : entry.color,
                          cursor: 'pointer',
                        }}
                      >
                        {value}
                      </span>
                    )}
                  />
                  <Line
                    type="monotone"
                    dataKey="mood"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ fill: '#8b5cf6', strokeWidth: 0, r: 3 }}
                    connectNulls
                    name="Stimmung"
                    hide={hiddenLines.includes('mood')}
                  />
                  <Line
                    type="monotone"
                    dataKey="selfPerception"
                    stroke="#ec4899"
                    strokeWidth={2}
                    dot={{ fill: '#ec4899', strokeWidth: 0, r: 3 }}
                    connectNulls
                    name="Selbstwahrn."
                    hide={hiddenLines.includes('selfPerception')}
                  />
                  <Line
                    type="monotone"
                    dataKey="energy"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ fill: '#22c55e', strokeWidth: 0, r: 3 }}
                    connectNulls
                    name="Energie"
                    hide={hiddenLines.includes('energy')}
                  />
                  <Line
                    type="monotone"
                    dataKey="libido"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={{ fill: '#f97316', strokeWidth: 0, r: 3 }}
                    connectNulls
                    name="Libido"
                    hide={hiddenLines.includes('libido')}
                  />
                  <Line
                    type="monotone"
                    dataKey="dischargeConsistency"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={{ fill: '#06b6d4', strokeWidth: 0, r: 3 }}
                    connectNulls
                    name="Konsistenz"
                    hide={hiddenLines.includes('dischargeConsistency')}
                  />
                  <Line
                    type="monotone"
                    dataKey="dischargeAmount"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 0, r: 3 }}
                    connectNulls
                    name="Menge"
                    hide={hiddenLines.includes('dischargeAmount')}
                  />
                  <Line
                    type="monotone"
                    dataKey="motivation"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ fill: '#f59e0b', strokeWidth: 0, r: 3 }}
                    connectNulls
                    name="Motivation"
                    hide={hiddenLines.includes('motivation')}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {/* Symptom tags row */}
            <div className="flex gap-1 mt-2 flex-wrap">
              <span className="text-[9px] text-muted-foreground mr-1">Symptome:</span>
              {chartData.some((d) => d.symptoms?.includes('breastTension')) && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-600">
                  Brustspannen
                </span>
              )}
              {chartData.some((d) => d.symptoms?.includes('bloating')) && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-600">
                  Blähungen
                </span>
              )}
              {chartData.some((d) => d.symptoms?.includes('headache')) && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-600">
                  Kopfschmerzen
                </span>
              )}
              {!chartData.some((d) => d.symptoms?.length) && (
                <span className="text-[9px] text-muted-foreground/50">keine</span>
              )}
            </div>
          </CardContent>
        </Card>
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
    <div className="relative shrink-0">
      <button
        onClick={onClick}
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg p-0.5"
      >
        <Card
          className={cn(
            'w-18 transition-all duration-200 cursor-pointer bg-white/90 backdrop-blur-sm',
            isSelected && 'ring-2 ring-primary bg-white scale-105 shadow-md',
            isToday && !isSelected && 'border-primary border-2',
            !isSelected && 'hover:bg-white'
          )}
        >
          <CardContent className="p-1.5 pt-1.5 text-center">
            <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-wide">
              {label}
            </p>
            <p className="text-xl font-bold">{dayOfMonth}</p>
            {/* Status icon below day of month */}
            <div className="mt-0.5">
              {hasData ? (
                <CheckIcon className="w-3.5 h-3.5 text-green-500 mx-auto" />
              ) : (
                <QuestionIcon className="w-3.5 h-3.5 text-muted-foreground/40 mx-auto" />
              )}
            </div>
          </CardContent>
        </Card>
      </button>
      {/* Connector triangle pointing down */}
      {isSelected && (
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-4 z-10">
          <div className="w-0 h-0 border-l-10 border-l-transparent border-r-10 border-r-transparent border-t-10 border-t-white" />
        </div>
      )}
    </div>
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
}

function TrackingForm({ entry, onUpdate }: TrackingFormProps) {
  const mood = entry.getMood()
  const libido = entry.getLibido()
  const selfPerception = entry.getSelfPerception()
  const energy = entry.getEnergy()
  const motivation = entry.getMotivation()
  const dischargeConsistency = entry.getDischargeConsistency()
  const dischargeAmount = entry.getDischargeAmount()
  const symptoms = entry.getSymptoms()
  const notes = entry.getNotes()

  const symptomOptions: { value: Symptom; label: string }[] = [
    { value: 'breastTension', label: 'Brustspannen' },
    { value: 'bloating', label: 'Blähungen' },
    { value: 'headache', label: 'Kopfschmerzen' },
  ]

  const toggleSymptom = (symptom: Symptom) => {
    if (symptoms.includes(symptom)) {
      onUpdate(entry.removeSymptom(symptom))
    } else {
      onUpdate(entry.addSymptom(symptom))
    }
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm">
      <CardContent className="p-2 px-3 space-y-3">
        <div className="grid grid-cols-[7rem_1fr_1.5rem] gap-x-3 gap-y-2 items-center">
          {/* Mood row */}
          <Label htmlFor="mood-slider" className="text-sm truncate">
            Stimmung
          </Label>
          <Slider
            id="mood-slider"
            min={1}
            max={5}
            step={1}
            value={[mood ?? 3]}
            onValueChange={([value]) => onUpdate(entry.setMood(value))}
          />
          <span className="text-sm font-semibold tabular-nums text-center">{mood ?? '-'}</span>

          {/* Self Perception row */}
          <Label htmlFor="self-perception-slider" className="text-sm truncate">
            Selbstwahrn.
          </Label>
          <Slider
            id="self-perception-slider"
            min={1}
            max={5}
            step={1}
            value={[selfPerception ?? 3]}
            onValueChange={([value]) => onUpdate(entry.setSelfPerception(value))}
          />
          <span className="text-sm font-semibold tabular-nums text-center">
            {selfPerception ?? '-'}
          </span>

          {/* Energy row */}
          <Label htmlFor="energy-slider" className="text-sm truncate">
            Energie
          </Label>
          <Slider
            id="energy-slider"
            min={1}
            max={5}
            step={1}
            value={[energy ?? 3]}
            onValueChange={([value]) => onUpdate(entry.setEnergy(value))}
          />
          <span className="text-sm font-semibold tabular-nums text-center">{energy ?? '-'}</span>

          {/* Motivation row */}
          <Label htmlFor="motivation-slider" className="text-sm truncate">
            Motivation
          </Label>
          <Slider
            id="motivation-slider"
            min={1}
            max={5}
            step={1}
            value={[motivation ?? 3]}
            onValueChange={([value]) => onUpdate(entry.setMotivation(value))}
          />
          <span className="text-sm font-semibold tabular-nums text-center">
            {motivation ?? '-'}
          </span>

          {/* Libido row */}
          <Label htmlFor="libido-slider" className="text-sm truncate">
            Libido
          </Label>
          <Slider
            id="libido-slider"
            min={1}
            max={5}
            step={1}
            value={[libido ?? 3]}
            onValueChange={([value]) => onUpdate(entry.setLibido(value))}
          />
          <span className="text-sm font-semibold tabular-nums text-center">{libido ?? '-'}</span>

          {/* Discharge section header - spans all columns */}
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide col-span-3 mt-1">
            Ausfluss
          </p>

          {/* Discharge consistency row */}
          <Label htmlFor="discharge-consistency-slider" className="text-sm truncate">
            Glasig→Cremig
          </Label>
          <Slider
            id="discharge-consistency-slider"
            min={1}
            max={5}
            step={1}
            value={[dischargeConsistency ?? 3]}
            onValueChange={([value]) => onUpdate(entry.setDischargeConsistency(value))}
          />
          <span className="text-sm font-semibold tabular-nums text-center">
            {dischargeConsistency ?? '-'}
          </span>

          {/* Discharge amount row */}
          <Label htmlFor="discharge-amount-slider" className="text-sm truncate">
            Wenig→Viel
          </Label>
          <Slider
            id="discharge-amount-slider"
            min={1}
            max={5}
            step={1}
            value={[dischargeAmount ?? 3]}
            onValueChange={([value]) => onUpdate(entry.setDischargeAmount(value))}
          />
          <span className="text-sm font-semibold tabular-nums text-center">
            {dischargeAmount ?? '-'}
          </span>
        </div>

        {/* Symptoms multi-select */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Symptome
          </p>
          <div className="flex flex-wrap gap-2">
            {symptomOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleSymptom(option.value)}
                className={cn(
                  'px-3 py-1 text-sm rounded-full border transition-colors',
                  symptoms.includes(option.value)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-input hover:bg-muted'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <textarea
          placeholder="Notizen..."
          value={notes ?? ''}
          onChange={(e) => onUpdate(entry.setNotes(e.target.value || undefined))}
          className="w-full text-base p-2 rounded-md border border-input bg-background resize-none h-12 focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </CardContent>
    </Card>
  )
}
