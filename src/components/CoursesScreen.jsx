import { useState } from 'react'
import { getCourseSummaries, dueLabel } from '../logic/stats'
import './CoursesScreen.css'

export default function CoursesScreen({ tasks, courses, onAdd, onRename, onDelete }) {
  const [newName, setNewName] = useState('')
  const [addError, setAddError] = useState('')
  const [editing, setEditing] = useState(null) // name of the course being renamed
  const [editValue, setEditValue] = useState('')
  const [editError, setEditError] = useState('')
  const [confirming, setConfirming] = useState(null) // name of the course being deleted

  // Saved list + any course that only exists on a task, so nothing disappears
  const names = [...new Set([...courses, ...tasks.map((t) => t.course)])]
  const summaries = getCourseSummaries(tasks, names)

  // Returns an error message, or '' when the name is fine
  const check = (name, ignore = null) => {
    const clean = name.trim()
    if (!clean) return 'Please type a course name.'
    if (clean.length > 30) return 'Keep the name under 30 characters.'
    const clash = names.some((n) => n !== ignore && n.toLowerCase() === clean.toLowerCase())
    return clash ? 'You already have a course with that name.' : ''
  }

  const submitAdd = (e) => {
    e.preventDefault()
    const problem = check(newName)
    if (problem) return setAddError(problem)
    onAdd(newName.trim())
    setNewName('')
    setAddError('')
  }

  const startEdit = (name) => {
    setEditing(name)
    setEditValue(name)
    setEditError('')
    setConfirming(null)
  }

  const saveEdit = () => {
    const problem = check(editValue, editing)
    if (problem) return setEditError(problem)
    if (editValue.trim() !== editing) onRename(editing, editValue.trim())
    setEditing(null)
  }

  const taskCount = (name) => tasks.filter((t) => t.course === name).length

  return (
    <section>
      <h2 className="courses__title">Courses</h2>

      <form className="courses__add" onSubmit={submitAdd}>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Add a course, e.g. Operating Systems"
          maxLength={40}
        />
        <button type="submit">Add</button>
      </form>
      {addError && <p className="courses__error">{addError}</p>}

      {summaries.length === 0 && (
        <p className="courses__empty">No courses yet. Add your first one above.</p>
      )}

      {summaries.map((c) => (
        <div key={c.course} className="courses__card">
          {editing === c.course ? (
            <>
              <input
                className="courses__edit"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                maxLength={40}
                autoFocus
              />
              {editError && <p className="courses__error">{editError}</p>}
              <div className="courses__actions">
                <button className="courses__btn courses__btn--primary" onClick={saveEdit}>Save</button>
                <button className="courses__btn" onClick={() => setEditing(null)}>Cancel</button>
              </div>
            </>
          ) : (
            <>
              <div className="courses__row">
                <p className="courses__name">{c.course}</p>
                <p className="courses__percent">{c.percent}%</p>
              </div>
              <p className="courses__meta">
                {c.totalMinutes === 0
                  ? 'No tasks yet. Use + Add to plan some work.'
                  : c.todoCount === 0
                  ? 'All tasks done'
                  : `${c.todoCount} task${c.todoCount > 1 ? 's' : ''} left • next: ${dueLabel(c.nextDeadline)}`}
              </p>
              <div className="courses__bar">
                <div className="courses__fill" style={{ width: `${c.percent}%` }} />
              </div>

              {confirming === c.course ? (
                <div className="courses__confirm">
                  <p>
                    Delete <strong>{c.course}</strong>
                    {taskCount(c.course) > 0
                      ? ` and its ${taskCount(c.course)} task${taskCount(c.course) > 1 ? 's' : ''}?`
                      : '?'}
                  </p>
                  <div className="courses__actions">
                    <button
                      className="courses__btn courses__btn--danger"
                      onClick={() => { onDelete(c.course); setConfirming(null) }}
                    >
                      Delete
                    </button>
                    <button className="courses__btn" onClick={() => setConfirming(null)}>Keep it</button>
                  </div>
                </div>
              ) : (
                <div className="courses__actions">
                  <button className="courses__btn" onClick={() => startEdit(c.course)}>Rename</button>
                  <button className="courses__btn" onClick={() => { setConfirming(c.course); setEditing(null) }}>
                    Delete
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </section>
  )
}