import { getCourseSummaries, dueLabel } from '../logic/stats'
import './CoursesScreen.css'

export default function CoursesScreen({ tasks }) {
  const courses = getCourseSummaries(tasks)

  return (
    <section>
      <h2 className="courses__title">Courses</h2>
      {courses.map((c) => (
        <div key={c.course} className="courses__card">
          <div className="courses__row">
            <p className="courses__name">{c.course}</p>
            <p className="courses__percent">{c.percent}%</p>
          </div>
          <p className="courses__meta">
            {c.todoCount === 0
              ? 'All tasks done'
              : `${c.todoCount} task${c.todoCount > 1 ? 's' : ''} left • next: ${dueLabel(c.nextDeadline)}`}
          </p>
          <div className="courses__bar">
            <div className="courses__fill" style={{ width: `${c.percent}%` }} />
          </div>
        </div>
      ))}
    </section>
  )
}