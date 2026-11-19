import { getDaysLeft } from '../logic/priority'
import './FocusCard.css'

function dueLabel(deadline) {
  const days = getDaysLeft(deadline)
  if (days < 0) return 'Overdue'
  if (days === 0) return 'Due today'
  if (days === 1) return 'Due tomorrow'
  return `Due in ${days} days`
}

export default function FocusCard({ task, gapMinutes, hiddenCount, energyLabel, onStart, onChangeEnergy, onLifeHappened }) {
  // Nothing fits in the free gap
  if (!task) {
    return (
      <section className="hub">
        <p className="hub__label">AI RECOMMENDED ACTION</p>
        <div className="hub__card">
          <h2 className="hub__title">Nothing fits this gap</h2>
          <p className="hub__meta">
            No task matches {gapMinutes} minutes and this energy level. Enjoy the break, or change your energy.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="hub">
      <div className="hub__top">
        <p className="hub__label">AI RECOMMENDED ACTION</p>
        <p className="hub__gap">{gapMinutes}m free gap</p>
      </div>

      <div className="hub__card" key={task.id}>
        <p className="hub__course">{task.course.toUpperCase()}</p>
        <h2 className="hub__title">{task.title}</h2>
        <p className="hub__meta">
          Est. {task.estimatedMinutes} mins • Grade weight {task.weight}% • {dueLabel(task.deadline)}
        </p>
        <button className="hub__start" onClick={() => onStart(task)}>
          START FOCUS SESSION
        </button>
      </div>

      <div className="hub__actions">
        <button className="hub__chip" onClick={onChangeEnergy}>Energy: {energyLabel}</button>
        <button className="hub__chip" onClick={() => onLifeHappened(task)}>
            Life Happened
        </button>
      </div>

      <p className="hub__hidden">{hiddenCount} other tasks hidden</p>
    </section>
  )
}