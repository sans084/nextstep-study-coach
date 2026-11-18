import { sampleTasks } from '../src/data/sampleTasks.js'
import { buildRebalanceOptions, applyOption } from '../src/logic/recalibrator.js'

const show = (tasks) =>
  console.table(
    tasks.map(({ id, title, status, scheduledDate, estimatedMinutes }) => ({
      id, title, status, scheduledDate, estimatedMinutes,
    }))
  )

for (const id of ['t2', 't1']) {
  const missed = sampleTasks.find((t) => t.id === id)
  const options = buildRebalanceOptions(missed, sampleTasks)
  console.log(`\nMissed: ${missed.title} (due ${missed.deadline})`)
  console.table(options.map((o) => ({ id: o.id, label: o.label, late: o.late })))

  if (options.length > 0) {
    console.log(`After applying "${options[0].id}":`)
    show(applyOption(sampleTasks, missed, options[0]).filter((t) => t.id.startsWith(id)))
  }
}