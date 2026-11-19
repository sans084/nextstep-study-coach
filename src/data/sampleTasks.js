// Possible states of a task
export const STATUS = {
  TODO: 'todo',
  DONE: 'done',
  MISSED: 'missed',
}

// Returns a date string like "2026-11-18", n days from today.
// Using relative dates means the sample data never goes out of date.
const daysFromNow = (n) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}

export const sampleTasks = [
  { id: 't1', title: 'Draft ER-Diagram Explanation', course: 'DBMS', deadline: daysFromNow(1), weight: 40, estimatedMinutes: 35, status: STATUS.TODO, scheduledDate: daysFromNow(0), energy: 'high' },
  { id: 't2', title: 'Java OOPs Practice', course: 'Java OOPs', deadline: daysFromNow(2), weight: 10, estimatedMinutes: 20, status: STATUS.TODO, scheduledDate: daysFromNow(0), energy: 'medium' },
  { id: 't3', title: 'Research 3 Design Systems', course: 'Design Systems', deadline: daysFromNow(1), weight: 30, estimatedMinutes: 20, status: STATUS.TODO, scheduledDate: daysFromNow(0), energy: 'low' },
  { id: 't4', title: 'Create Component Grid Layout', course: 'Design Systems', deadline: daysFromNow(1), weight: 30, estimatedMinutes: 40, status: STATUS.TODO, scheduledDate: daysFromNow(1), energy: 'high' },
  { id: 't5', title: 'Write Rationale Document', course: 'Design Systems', deadline: daysFromNow(1), weight: 30, estimatedMinutes: 30, status: STATUS.TODO, scheduledDate: daysFromNow(1), energy: 'medium' },
  { id: 't6', title: 'Networks Quiz 2 Revision', course: 'Computer Networks', deadline: daysFromNow(4), weight: 15, estimatedMinutes: 25, status: STATUS.TODO, scheduledDate: daysFromNow(3), energy: 'medium' },
  { id: 't7', title: 'Flashcards: Normalization', course: 'DBMS', deadline: daysFromNow(5), weight: 5, estimatedMinutes: 12, status: STATUS.TODO, scheduledDate: daysFromNow(4), energy: 'low' },
  { id: 't8', title: 'Java Lab Record', course: 'Java OOPs', deadline: daysFromNow(7), weight: 20, estimatedMinutes: 45, status: STATUS.TODO, scheduledDate: daysFromNow(5), energy: 'high' },
]

// The starting course list, taken from the sample tasks
export const sampleCourses = [...new Set(sampleTasks.map((t) => t.course))]