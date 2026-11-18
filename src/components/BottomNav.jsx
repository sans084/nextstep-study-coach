import './BottomNav.css'

const TABS = [
  { id: 'today', label: 'Today' },
  { id: 'add', label: '+ Add' },
  { id: 'plan', label: 'Plan' },
  { id: 'courses', label: 'Courses' },
  { id: 'insights', label: 'Insights' },
]

export default function BottomNav({ tab, onChange }) {
  return (
    <nav className="nav">
      {TABS.map((t) => (
        <button
          key={t.id}
          className={`nav__tab ${t.id === tab ? 'nav__tab--on' : ''}`}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </nav>
  )
}