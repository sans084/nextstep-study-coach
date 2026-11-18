import { sampleTasks } from '../src/data/sampleTasks.js'
import { atomize, scheduleSteps } from '../src/logic/atomizer.js'
import { addDays, toDateString } from '../src/logic/recalibrator.js'

const steps = atomize({
  title: 'Design Systems Assignment',
  course: 'Design Systems',
  deadline: addDays(toDateString(new Date()), 5),
  weight: 30,
  type: 'report',
  totalMinutes: 180,
  idPrefix: 'demo',
})

const placed = scheduleSteps(sampleTasks, steps)
console.table(
  placed.map(({ id, title, estimatedMinutes, energy, scheduledDate }) => ({
    id, title, estimatedMinutes, energy, scheduledDate,
  }))
)
console.log('Total minutes:', placed.reduce((sum, t) => sum + t.estimatedMinutes, 0))