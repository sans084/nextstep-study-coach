import { STATUS } from '../data/sampleTasks.js'
import { DAILY_CAPACITY, DAY_NAMES } from '../data/capacity.js'

// ---------- date helpers (dates are "YYYY-MM-DD" strings) ----------
export function toDateString(date) {
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${m}-${d}`
}

function parse(dateString) {
  const [y, m, d] = dateString.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(dateString, n) {
  const date = parse(dateString)
  date.setDate(date.getDate() + n)
  return toDateString(date)
}

export function dayName(dateString) {
  return DAY_NAMES[parse(dateString).getDay()]
}

// ---------- capacity helpers ----------
export function plannedMinutes(tasks, dateString) {
  return tasks
    .filter((t) => t.status === STATUS.TODO && t.scheduledDate === dateString)
    .reduce((sum, t) => sum + t.estimatedMinutes, 0)
}

export function freeMinutes(tasks, dateString) {
  const capacity = DAILY_CAPACITY[parse(dateString).getDay()]
  return capacity - plannedMinutes(tasks, dateString)
}

// Days we may reschedule onto: tomorrow up to the deadline.
// If that leaves nothing, fall back to the next 3 days and flag it as late.
function candidateDays(task, today) {
  const todayString = toDateString(today)
  const next7 = [1, 2, 3, 4, 5, 6, 7].map((n) => addDays(todayString, n))
  const beforeDeadline = next7.filter((d) => d <= task.deadline)
  return beforeDeadline.length > 0
    ? { days: beforeDeadline, late: false }
    : { days: next7.slice(0, 3), late: true }
}

// ---------- the rebalance options ----------
export function buildRebalanceOptions(missed, tasks, today = new Date()) {
  const others = tasks.filter((t) => t.id !== missed.id) // missed task is leaving its slot
  const { days, late } = candidateDays(missed, today)
  const options = []

  // Option A: spread across two days
  const half = Math.ceil(missed.estimatedMinutes / 2)
  const roomy = days.filter((d) => freeMinutes(others, d) >= half)
  if (missed.estimatedMinutes >= 10 && roomy.length >= 2) {
    const [d1, d2] = roomy
    options.push({
      id: 'spread',
      label: `Spread across ${dayName(d1)} & ${dayName(d2)} (+${half}m/day)`,
      placements: [
        { date: d1, minutes: half },
        { date: d2, minutes: missed.estimatedMinutes - half },
      ],
      late,
    })
  }

  // Option B: move the whole task to the day with the most free time
  const fits = days.filter((d) => freeMinutes(others, d) >= missed.estimatedMinutes)
  if (fits.length > 0) {
    const best = fits.reduce((a, b) => (freeMinutes(others, b) > freeMinutes(others, a) ? b : a))
    options.push({
      id: 'move',
      label: `Move to ${dayName(best)} (${freeMinutes(others, best)}m free)`,
      placements: [{ date: best, minutes: missed.estimatedMinutes }],
      late,
    })
  }

  return options
}

// ---------- applying the chosen option ----------
export function applyOption(tasks, missed, option) {
  // One placement = just reschedule the same task
  if (option.placements.length === 1) {
    return tasks.map((t) =>
      t.id === missed.id
        ? { ...t, status: STATUS.TODO, scheduledDate: option.placements[0].date }
        : t
    )
  }
  // Several placements = keep the original as 'missed', add one part per day
  const parts = option.placements.map((p, i) => ({
    ...missed,
    id: `${missed.id}-p${i + 1}`,
    title: `${missed.title} (part ${i + 1}/${option.placements.length})`,
    estimatedMinutes: p.minutes,
    scheduledDate: p.date,
    status: STATUS.TODO,
  }))
  return [
    ...tasks.map((t) => (t.id === missed.id ? { ...t, status: STATUS.MISSED } : t)),
    ...parts,
  ]
}