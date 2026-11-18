import { useState } from 'react'
import { sampleTasks, STATUS } from './data/sampleTasks'
import { ENERGY_OPTIONS } from './data/energy'
import { getNextTask } from './logic/priority'
import { buildRebalanceOptions, applyOption } from './logic/recalibrator'
import FocusCard from './components/FocusCard'
import FocusSession from './components/FocusSession'
import SessionComplete from './components/SessionComplete'
import Recalibrator from './components/Recalibrator'
import EnergySheet from './components/EnergySheet'

const GAP_OPTIONS = [15, 30, 45, 60]

function App() {
  const [tasks, setTasks] = useState(sampleTasks)
  const [gapMinutes, setGapMinutes] = useState(45)
  const [energy, setEnergy] = useState(null) // null = any
  const [showEnergy, setShowEnergy] = useState(false)
  const [screen, setScreen] = useState('hub') // 'hub' | 'session' | 'complete' | 'recalibrate'
  const [activeTask, setActiveTask] = useState(null)
  const [missedTask, setMissedTask] = useState(null)
  const [notice, setNotice] = useState('')

  const nextTask = getNextTask(tasks, gapMinutes, new Date(), energy)
  const todoCount = tasks.filter((t) => t.status === STATUS.TODO).length
  const hiddenCount = nextTask ? todoCount - 1 : todoCount
  const energyLabel = ENERGY_OPTIONS.find((o) => o.id === energy)?.label ?? 'Any'

  const startSession = (task) => {
    setNotice('')
    setActiveTask(task)
    setScreen('session')
  }

  const finishSession = () => {
    setTasks((prev) =>
      prev.map((t) => (t.id === activeTask.id ? { ...t, status: STATUS.DONE } : t))
    )
    setScreen('complete')
  }

  const openRecalibrator = (task) => {
    setMissedTask(task)
    setScreen('recalibrate')
  }

  const confirmRebalance = (option) => {
    setTasks((prev) => applyOption(prev, missedTask, option))
    setNotice(`Plan updated: ${option.label}`)
    setScreen('hub')
  }

  const chooseEnergy = (level) => {
    setEnergy(level)
    setShowEnergy(false)
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

  if (screen === 'recalibrate') {
    return (
      <main>
        <Recalibrator
          missed={missedTask}
          options={buildRebalanceOptions(missedTask, tasks)}
          onConfirm={confirmRebalance}
          onCancel={() => setScreen('hub')}
        />
      </main>
    )
  }

  return (
    <main>
      {notice && (
        <p style={{ margin: '0 0 16px', padding: 12, borderRadius: 12, fontSize: 14, background: '#064e3b', color: '#d1fae5' }}>
          {notice}
        </p>
      )}

      <FocusCard
        task={nextTask}
        gapMinutes={gapMinutes}
        hiddenCount={hiddenCount}
        energyLabel={energyLabel}
        onStart={startSession}
        onChangeEnergy={() => setShowEnergy(true)}
        onLifeHappened={openRecalibrator}
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

      {showEnergy && (
        <EnergySheet current={energy} onSelect={chooseEnergy} onClose={() => setShowEnergy(false)} />
      )}
    </main>
  )
}

export default App