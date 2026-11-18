import { useState } from 'react'
import { sampleTasks, STATUS } from './data/sampleTasks'
import { getNextTask } from './logic/priority'
import FocusCard from './components/FocusCard'
import FocusSession from './components/FocusSession'
import SessionComplete from './components/SessionComplete'

const GAP_OPTIONS = [15, 30, 45, 60]

function App() {
  const [tasks, setTasks] = useState(sampleTasks)
  const [gapMinutes, setGapMinutes] = useState(45)
  const [screen, setScreen] = useState('hub') // 'hub' | 'session' | 'complete'
  const [activeTask, setActiveTask] = useState(null)

  const nextTask = getNextTask(tasks, gapMinutes)
  const todoCount = tasks.filter((t) => t.status === STATUS.TODO).length
  const hiddenCount = nextTask ? todoCount - 1 : todoCount

  const startSession = (task) => {
    setActiveTask(task)
    setScreen('session')
  }

  const finishSession = () => {
    // Copy every task; only the active one gets status 'done'
    setTasks((prev) =>
      prev.map((t) => (t.id === activeTask.id ? { ...t, status: STATUS.DONE } : t))
    )
    setScreen('complete')
  }

  if (screen === 'session') {
    return (
      <main>
        <FocusSession
          key={activeTask.id}
          task={activeTask}
          onDone={finishSession}
          onExit={() => setScreen('hub')}
        />
      </main>
    )
  }

  if (screen === 'complete') {
    return (
      <main>
        <SessionComplete
          doneTask={activeTask}
          nextTask={nextTask}
          onNext={startSession}
          onBreak={() => setScreen('hub')}
        />
      </main>
    )
  }

  return (
    <main>
      <FocusCard
        task={nextTask}
        gapMinutes={gapMinutes}
        hiddenCount={hiddenCount}
        onStart={startSession}
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