import { sampleTasks } from '../src/data/sampleTasks.js'
import { rankTasks, getNextTask } from '../src/logic/priority.js'

for (const gap of [45, 30, 15]) {
  console.log(`\nFree gap: ${gap} min`)
  console.table(
    rankTasks(sampleTasks, gap).map(({ task, daysLeft, urgency, score }) => ({
      title: task.title,
      daysLeft,
      urgency: urgency.toFixed(2),
      score: score.toFixed(3),
    }))
  )
  console.log('Next task:', getNextTask(sampleTasks, gap)?.title ?? 'none fits')
}