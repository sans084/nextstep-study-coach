import { useState } from 'react'
import { atomize, scheduleSteps, ASSIGNMENT_TYPES } from '../logic/atomizer'
import { toDateString, addDays, dayName } from '../logic/recalibrator'
import './AddWorkScreen.css'

const HOURS = [1, 2, 3, 4, 6, 8]

export default function AddWorkScreen({ tasks, courses: courseList = [], onAdd }) {
  const today = toDateString(new Date())
  const [form, setForm] = useState({
    title: '', course: '', deadline: addDays(today, 5), weight: 20, type: 'report', hours: 3,
  })
  const [steps, setSteps] = useState(null) // null = form view, array = review view

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })
  const courses = [...new Set([...courseList, ...tasks.map((t) => t.course)])]

  const generate = (e) => {
    e.preventDefault()
    setSteps(
      atomize({
        title: form.title.trim(),
        course: form.course.trim() || 'General',
        deadline: form.deadline,
        weight: Number(form.weight) || 10,
        type: form.type,
        totalMinutes: Number(form.hours) * 60,
      })
    )
  }

  // ---------- review view ----------
  if (steps) {
    const placed = scheduleSteps(tasks, steps)
    const total = placed.reduce((sum, t) => sum + t.estimatedMinutes, 0)
    const lateCount = placed.filter((t) => t.scheduledDate > form.deadline).length

    return (
      <section>
        <h2 className="add__title">Review sub-tasks</h2>
        <p className="add__sub">
          {form.title} • due {form.deadline} • {placed.length} steps, {total} min in total
        </p>

        {placed.map((t) => (
          <div key={t.id} className="add__step">
            <div className="add__stepmain">
              <p className="add__stepname">{t.title.replace(`${form.title.trim()}: `, '')}</p>
              <p className="add__stepmeta">
                {dayName(t.scheduledDate).slice(0, 3)} {t.scheduledDate.slice(8)} • {t.energy} energy
              </p>
            </div>
            <span className="add__min">{t.estimatedMinutes} min</span>
            <button
              className="add__remove"
              aria-label="Remove this step"
              onClick={() => setSteps(steps.filter((s) => s.id !== t.id))}
            >
              ✕
            </button>
          </div>
        ))}

        {lateCount > 0 && (
          <p className="add__note">
            {lateCount} step{lateCount > 1 ? 's' : ''} land after the deadline because your days are full.
            Consider removing a step or asking for an extension.
          </p>
        )}

        <button
          className="add__primary"
          disabled={placed.length === 0}
          onClick={() => onAdd(placed, `Added ${placed.length} sub-tasks for “${form.title}”`)}
        >
          ACCEPT & SCHEDULE
        </button>
        <button className="add__link" onClick={() => setSteps(null)}>Back</button>
      </section>
    )
  }

  // ---------- form view ----------
  return (
    <section>
      <h2 className="add__title">Add work</h2>
      <p className="add__sub">Tell NextStep about a big assignment and it will break it into small steps.</p>

      <form onSubmit={generate} className="add__form">
        <label>
          Assignment
          <input required value={form.title} onChange={update('title')} placeholder="e.g. Design Systems Assignment" />
        </label>
        <label>
          Course
          <input list="course-list" value={form.course} onChange={update('course')} placeholder="e.g. Design Systems" />
          <datalist id="course-list">
            {courses.map((c) => <option key={c} value={c} />)}
          </datalist>
        </label>
        <label>
          Type
          <select value={form.type} onChange={update('type')}>
            {ASSIGNMENT_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </label>
        <div className="add__row">
          <label>
            Deadline
            <input type="date" required min={today} value={form.deadline} onChange={update('deadline')} />
          </label>
          <label>
            Grade weight (%)
            <input type="number" min="1" max="100" value={form.weight} onChange={update('weight')} />
          </label>
        </div>
        <label>
          Total time needed
          <select value={form.hours} onChange={update('hours')}>
            {HOURS.map((h) => <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}</option>)}
          </select>
        </label>
        <button type="submit" className="add__primary">BREAK IT INTO STEPS</button>
      </form>
    </section>
  )
}