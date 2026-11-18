import { STATUS } from '../data/sampleTasks.js'
import { DAILY_CAPACITY } from '../data/capacity.js'
import { toDateString, addDays } from './recalibrator.js'
import { getDaysLeft } from './priority.js'

const weekday = (dateString) => {
  const [y, m, d] = dateString.split('-').map(Number)
  return new Date(y, m - 1, d).getDay()
}

export const capacityOn = (dateString) => DAILY_CAPACITY[weekday(dateString)]

// The original of a split task is marked 'missed' and replaced by its parts, so skip it
const counted = (tasks) => tasks.filter((t) => t.status !== STATUS.MISSED)

// 200 -> "3h 20m", 45 -> "45m"
export function formatMinutes(total) {
  const h = Math.floor(total / 60)
  const m = total % 60
  if (h === 0) return `${m}m`
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

export function dueLabel(deadline) {
  const days = getDaysLeft(deadline)
  if (days < 0) return 'Overdue'
  if (days === 0) return 'Due today'
  if (days === 1) return 'Due tomorrow'
  return `Due in ${days} days`
}

// Minutes of work (todo + done) scheduled on one day
export function loadOn(tasks, dateString) {
  return counted(tasks)
    .filter((t) => t.scheduledDate === dateString)
    .reduce((sum, t) => sum + t.estimatedMinutes, 0)
}

// One summary per course: progress, next deadline, tasks left
export function getCourseSummaries(tasks) {
  const byCourse = {}
  for (const t of counted(tasks)) {
    const c = (byCourse[t.course] ??= {
      course: t.course, totalMinutes: 0, doneMinutes: 0, todoCount: 0, nextDeadline: null,
    })
    c.totalMinutes += t.estimatedMinutes
    if (t.status === STATUS.DONE) {
      c.doneMinutes += t.estimatedMinutes
    } else {
      c.todoCount += 1
      if (!c.nextDeadline || t.deadline < c.nextDeadline) c.nextDeadline = t.deadline
    }
  }
  return Object.values(byCourse)
    .map((c) => ({ ...c, percent: Math.round((100 * c.doneMinutes) / c.totalMinutes) }))
    .sort((a, b) => (a.nextDeadline ?? '9999').localeCompare(b.nextDeadline ?? '9999'))
}

export function getTotals(tasks) {
  const done = tasks.filter((t) => t.status === STATUS.DONE)
  return {
    doneCount: done.length,
    doneMinutes: done.reduce((sum, t) => sum + t.estimatedMinutes, 0),
  }
}

// 0 = nothing planned, 1-3 = light to heavy compared with that day's capacity
function loadLevel(minutes, capacity) {
  if (minutes === 0) return 0
  const ratio = minutes / capacity
  if (ratio < 0.34) return 1
  if (ratio < 0.67) return 2
  return 3
}

// 4 weeks of cells, starting on the Monday of this week
export function getHeatmap(tasks, today = new Date(), weeks = 4) {
  const todayString = toDateString(today)
  const offset = (weekday(todayString) + 6) % 7 // days since Monday
  const start = addDays(todayString, -offset)
  return Array.from({ length: weeks * 7 }, (_, i) => {
    const date = addDays(start, i)
    const minutes = loadOn(tasks, date)
    return {
      date,
      minutes,
      level: loadLevel(minutes, capacityOn(date)),
      isPast: date < todayString,
      isToday: date === todayString,
    }
  })
}

// Heaviest day in the next 7 days (or null if nothing is planned)
export function getBusiestDay(tasks, today = new Date()) {
  const todayString = toDateString(today)
  const week = [0, 1, 2, 3, 4, 5, 6].map((n) => {
    const date = addDays(todayString, n)
    return { date, minutes: loadOn(tasks, date) }
  })
  const best = week.reduce((a, b) => (b.minutes > a.minutes ? b : a))
  return best.minutes > 0 ? best : null
}