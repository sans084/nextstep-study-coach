import { STATUS } from '../data/sampleTasks.js'
import { toDateString } from './recalibrator.js'

const MS_PER_DAY = 24 * 60 * 60 * 1000

// Days from today (midnight) to the deadline (midnight). Negative if overdue.
export function getDaysLeft(deadline, today = new Date()) {
  const [y, m, d] = deadline.split('-').map(Number)
  const deadlineDate = new Date(y, m - 1, d)
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  return Math.round((deadlineDate - todayDate) / MS_PER_DAY)
}

// Closer deadline = higher urgency. Overdue counts as due today.
export function getUrgency(daysLeft) {
  return 1 / (Math.max(daysLeft, 0) + 1)
}

// Priority = (Urgency x Weight) / Available Gap
export function getPriorityScore(task, gapMinutes, today = new Date()) {
  const daysLeft = getDaysLeft(task.deadline, today)
  const urgency = getUrgency(daysLeft)
  return { task, daysLeft, urgency, score: (urgency * task.weight) / gapMinutes }
}

// Eligible tasks (not done, scheduled for today or earlier, fits the gap), best first.
export function rankTasks(tasks, gapMinutes, today = new Date()) {
  const todayString = toDateString(today)
  return tasks
    .filter(
      (t) =>
        t.status === STATUS.TODO &&
        (!t.scheduledDate || t.scheduledDate <= todayString) &&
        t.estimatedMinutes <= gapMinutes
    )
    .map((t) => getPriorityScore(t, gapMinutes, today))
    .sort((a, b) => b.score - a.score)
}

// The single recommended task, or null if nothing fits.
export function getNextTask(tasks, gapMinutes, today = new Date()) {
  const ranked = rankTasks(tasks, gapMinutes, today)
  return ranked.length > 0 ? ranked[0].task : null
}