import { useState } from 'react'
import { STATUS } from '../data/sampleTasks'
import { toDateString, addDays, dayName } from '../logic/recalibrator'
import { loadOn, capacityOn, formatMinutes } from '../logic/stats'
import './PlanScreen.css'

export default function PlanScreen({ tasks }) {
  const today = toDateString(new Date())
  const days = [0, 1, 2, 3, 4, 5, 6].map((n) => addDays(today, n))
  const [selected, setSelected] = useState(today)

  const dayTasks = tasks
    .filter((t) => t.status !== STATUS.MISSED && t.scheduledDate === selected)
    .sort((a, b) => a.deadline.localeCompare(b.deadline))
  const load = loadOn(tasks, selected)
  const capacity = capacityOn(selected)
  const percent = Math.min(100, Math.round((100 * load) / capacity))
  const over = load > capacity

  return (
    <section>
      <h2 className="plan__title">Your week</h2>

      <div className="plan__strip">
        {days.map((d) => (
          <button
            key={d}
            className={`plan__day ${d === selected ? 'plan__day--on' : ''}`}
            onClick={() => setSelected(d)}
          >
            <span>{dayName(d).slice(0, 3)}</span>
            <strong>{d.slice(8)}</strong>
          </button>
        ))}
      </div>

      <p className="plan__date">
        {dayName(selected)}{selected === today ? ' (today)' : ''}
      </p>
      <div className="plan__bar">
        <div className={`plan__fill ${over ? 'plan__fill--over' : ''}`} style={{ width: `${percent}%` }} />
      </div>
      <p className="plan__load">
        {formatMinutes(load)} planned of {formatMinutes(capacity)}
      </p>

      {dayTasks.length === 0 ? (
        <p className="plan__empty">Nothing planned. A free day is a good day.</p>
      ) : (
        dayTasks.map((t) => (
          <div key={t.id} className={`plan__task ${t.status === STATUS.DONE ? 'plan__task--done' : ''}`}>
            <div>
              <p className="plan__name">{t.title}</p>
              <p className="plan__meta">{t.course} • {t.energy} energy</p>
            </div>
            <span className="plan__min">{t.estimatedMinutes} min</span>
          </div>
        ))
      )}
    </section>
  )
}