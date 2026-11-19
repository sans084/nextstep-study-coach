import { dayName } from '../logic/recalibrator'
import { toDateString } from '../logic/recalibrator'
import { getTotals, getHeatmap, getBusiestDay, formatMinutes } from '../logic/stats'
import './InsightsScreen.css'
import useCountUp from '../hooks/useCountUp'

export default function InsightsScreen({ tasks }) {
  const totals = getTotals(tasks)
  const countMinutes = useCountUp(totals.doneMinutes)
  const countTasks = useCountUp(totals.doneCount)
  const cells = getHeatmap(tasks)
  const busiest = getBusiestDay(tasks)
  const today = toDateString(new Date())

  return (
    <section>
      <h2 className="ins__title">Your progress</h2>

      <div className="ins__tiles">
        <div className="ins__tile">
          <strong>{formatMinutes(countMinutes)}</strong>
          <span>focus time done</span>
        </div>
        <div className="ins__tile">
          <strong>{countTasks}</strong>
          <span>tasks done</span>
        </div>
      </div>

      <p className="ins__label">Workload heatmap</p>
      <div className="ins__heads">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <span key={i}>{d}</span>)}
      </div>
      <div className="ins__grid">
        {cells.map((c) => (
          <div
            key={c.date}
            title={`${dayName(c.date)} ${c.date}: ${c.minutes} min`}
            className={`ins__cell ins__cell--${c.level} ${c.isPast ? 'ins__cell--past' : ''} ${c.isToday ? 'ins__cell--today' : ''}`}
          />
        ))}
      </div>
      <p className="ins__legend">Darker = heavier day, compared with what you can handle</p>

      {busiest && (
        <div className="ins__insight">
          <p className="ins__insightlabel">INSIGHT</p>
          <p>
            {dayName(busiest.date)}{busiest.date === today ? ' (today)' : ''} is your heaviest day this
            week, with {formatMinutes(busiest.minutes)} planned.
          </p>
        </div>
      )}
    </section>
  )
}