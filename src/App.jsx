import { useState } from 'react'
import { sampleTasks, STATUS } from './data/sampleTasks'
import { getNextTask } from './logic/priority'
import FocusCard from './components/FocusCard'

const GAP_OPTIONS = [15, 30, 45, 60]

function App() {
  const [tasks] = useState(sampleTasks)
  const [gapMinutes, setGapMinutes] = useState(45)

  const nextTask = getNextTask(tasks, gapMinutes)
  const todoCount = tasks.filter((t) => t.status === STATUS.TODO).length
  const hiddenCount = nextTask ? todoCount - 1 : todoCount

  const handleStart = (task) => {
    console.log('Start session for:', task.title) // real timer comes in Step 5
  }

  return (
    <main>
      <FocusCard
        task={nextTask}
        gapMinutes={gapMinutes}
        hiddenCount={hiddenCount}
        onStart={handleStart}
      />

      <p style={{ marginTop: 32, fontSize: 12, color: '#94a3b8' }}>
        DEMO: how much free time do you have?
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        {GAP_OPTIONS.map((g) => (
          <button
            key={g}
            onClick={() => setGapMinutes(g)}
            style={{
              flex: 1, padding: 10, borderRadius: 10, color: '#fff',
              background: g === gapMinutes ? '#4f46e5' : '#1e293b',
            }}
          >
            {g} min
          </button>
        ))}
      </div>
    </main>
  )
}

export default App