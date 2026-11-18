import { useEffect, useState } from 'react'
import './FocusSession.css'

// 125 seconds -> "02:05"
const format = (total) => {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function FocusSession({ task, onDone, onExit }) {
  const totalSeconds = task.estimatedMinutes * 60
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds)
  const [paused, setPaused] = useState(false)
  const finished = secondsLeft === 0

  // Tick once per second, unless paused or finished
  useEffect(() => {
    if (paused || finished) return
    const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearInterval(id) // cleanup: stop the clock
  }, [paused, finished])

  const progress = 1 - secondsLeft / totalSeconds // 0 -> 1

  return (
    <section className="session">
      <p className="session__label">FOCUS SESSION</p>
      <h2 className="session__task">{task.title}</h2>

      <div
        className="session__ring"
        style={{ background: `conic-gradient(#4f46e5 ${progress * 360}deg, #1e293b 0deg)` }}
      >
        <div className="session__inner">
          <span className="session__time">{format(secondsLeft)}</span>
        </div>
      </div>

      <p className="session__sub">
        {finished ? "Time's up! Mark it done." : `of ${task.estimatedMinutes} min`}
      </p>

      <div className="session__buttons">
        <button
          className="session__btn session__btn--pause"
          onClick={() => setPaused((p) => !p)}
          disabled={finished}
        >
          {paused ? 'Resume' : 'Pause'}
        </button>
        <button className="session__btn session__btn--done" onClick={onDone}>
          Done
        </button>
      </div>

      <button className="session__link" onClick={onExit}>End early</button>
      <button className="session__link" onClick={() => setSecondsLeft((s) => Math.max(s - 60, 0))}>
        Demo: skip 1 min
      </button>
    </section>
  )
}