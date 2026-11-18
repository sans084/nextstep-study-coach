import { useState } from 'react'
import './Recalibrator.css'

export default function Recalibrator({ missed, options, onConfirm, onCancel }) {
  const [selectedId, setSelectedId] = useState(options[0]?.id)
  const selected = options.find((o) => o.id === selectedId)

  return (
    <section className="recal">
      <div className="recal__card">
        <h2 className="recal__title">Missed Session? No Problem!</h2>
        <p className="recal__sub">
          You missed <strong>“{missed.title}”</strong>. Pick a conflict-free option:
        </p>

        {options.length === 0 ? (
          <p className="recal__empty">
            No day in the next week has enough free time. Try clearing a lighter task first.
          </p>
        ) : (
          <div className="recal__options">
            {options.map((o, i) => (
              <button
                key={o.id}
                className={`recal__option ${o.id === selectedId ? 'recal__option--on' : ''}`}
                onClick={() => setSelectedId(o.id)}
              >
                <span className="recal__letter">{String.fromCharCode(65 + i)}</span>
                {o.label}
              </button>
            ))}
          </div>
        )}

        {selected?.late && (
          <p className="recal__note">
            Heads up: no day fits before the deadline. You may want to ask for a short extension.
          </p>
        )}

        {options.length > 0 && (
          <button className="recal__confirm" onClick={() => onConfirm(selected)}>
            CONFIRM RE-SCHEDULE (ONE TAP)
          </button>
        )}
        <button className="recal__cancel" onClick={onCancel}>Never mind</button>
      </div>
    </section>
  )
}