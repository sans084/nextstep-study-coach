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

// Days we may reschedule onto. Normally: tomorrow up to the deadline.
// With allowLate: the first 3 days after the deadline (flagged as late).
function candidateDays(task, today, allowLate = false) {
  const todayString = toDateString(today)
  const next7 = [1, 2, 3, 4, 5, 6, 7].map((n) => addDays(todayString, n))
  if (!allowLate) {
    return { days: next7.filter((d) => d <= task.deadline), late: false }
  }
  const afterDeadline = next7.filter((d) => d > task.deadline)
  return { days: (afterDeadline.length > 0 ? afterDeadline : next7).slice(0, 3), late: true }
}

// Build spread / move options for a given set of candidate days
function optionsFor(missed, others, { days, late }) {
  const options = []
  const suffix = late ? ' (after the deadline)' : ''

  // Option A: spread across two days
  const half = Math.ceil(missed.estimatedMinutes / 2)
  const roomy = days.filter((d) => freeMinutes(others, d) >= half)
  if (missed.estimatedMinutes >= 10 && roomy.length >= 2) {
    const [d1, d2] = roomy
    options.push({
      id: 'spread',
      label: `Spread across ${dayName(d1)} & ${dayName(d2)} (+${half}m/day)${suffix}`,
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
      label: `Move to ${dayName(best)} (${freeMinutes(others, best)}m free)${suffix}`,
      placements: [{ date: best, minutes: missed.estimatedMinutes }],
      late,
    })
  }
  return options
}

export function buildRebalanceOptions(missed, tasks, today = new Date()) {
  const others = tasks.filter((t) => t.id !== missed.id) // missed task is leaving its slot

  // First try to keep the deadline; only if nothing fits, offer late options
  const onTime = optionsFor(missed, others, candidateDays(missed, today, false))
  if (onTime.length > 0) return onTime
  return optionsFor(missed, others, candidateDays(missed, today, true))
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