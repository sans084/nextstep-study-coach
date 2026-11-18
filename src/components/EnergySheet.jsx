import { ENERGY_OPTIONS } from '../data/energy'
import './EnergySheet.css'

export default function EnergySheet({ current, onSelect, onClose }) {
  return (
    <div className="sheet__backdrop" onClick={onClose}>
      {/* stopPropagation: clicking inside the sheet should not close it */}
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <h2 className="sheet__title">How's your energy?</h2>
        <p className="sheet__sub">NextStep will match your next task.</p>

        {ENERGY_OPTIONS.map((o) => (
          <button
            key={o.id}
            className={`sheet__option ${o.id === current ? 'sheet__option--on' : ''}`}
            onClick={() => onSelect(o.id)}
          >
            <strong>{o.label}</strong>
            <span>{o.hint}</span>
          </button>
        ))}

        <button className="sheet__clear" onClick={() => onSelect(null)}>
          Skip: show me anything
        </button>
      </div>
    </div>
  )
}