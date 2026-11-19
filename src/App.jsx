import { useState } from 'react'
import { ENERGY_OPTIONS } from './data/energy'
import { getNextTask } from './logic/priority'
import { buildRebalanceOptions, applyOption } from './logic/recalibrator'
import FocusCard from './components/FocusCard'
import FocusSession from './components/FocusSession'
import SessionComplete from './components/SessionComplete'
import Recalibrator from './components/Recalibrator'
import EnergySheet from './components/EnergySheet'
import BottomNav from './components/BottomNav'
import PlanScreen from './components/PlanScreen'
import CoursesScreen from './components/CoursesScreen'
import InsightsScreen from './components/InsightsScreen'
import usePersistentState from './hooks/usePersistentState'
import AddWorkScreen from './components/AddWorkScreen'
import { sampleTasks, sampleCourses, STATUS } from './data/sampleTasks'

const GAP_OPTIONS = [15, 30, 45, 60]

function App() {
  const [tasks, setTasks] = usePersistentState('nextstep:tasks:v1', sampleTasks)
  const [courses, setCourses] = usePersistentState('nextstep:courses:v1', sampleCourses)
  const [gapMinutes, setGapMinutes] = usePersistentState('nextstep:gap:v1', 45)
  const [energy, setEnergy] = usePersistentState('nextstep:energy:v1', null)
  const [showEnergy, setShowEnergy] = useState(false)
  const [tab, setTab] = useState('today') // 'today' | 'plan' | 'courses' | 'insights'
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

  const changeTab = (id) => {
    setNotice('')
    setTab(id)
  }

  const addCourse = (name) => setCourses((prev) => [...prev, name])
  
  const renameCourse = (oldName, newName) => {
    setCourses((prev) => prev.map((c) => (c === oldName ? newName : c)))
    setTasks((prev) => prev.map((t) => (t.course === oldName ? { ...t, course: newName } : t)))
  }

  const deleteCourse = (name) => {
    setCourses((prev) => prev.filter((c) => c !== name))
    setTasks((prev) => prev.filter((t) => t.course !== name))
  }

  const addTasks = (newTasks, message) => {
    setTasks((prev) => [...prev, ...newTasks])
    const course = newTasks[0]?.course
    if (course) setCourses((prev) => (prev.includes(course) ? prev : [...prev, course]))
    setNotice(message)
    setTab('today')
  }

  const resetDemo = () => {
    setTasks(sampleTasks)
    setGapMinutes(45)
    setEnergy(null)
    setNotice('Demo data reset')
    setCourses(sampleCourses)
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
      {tab === 'today' && (
        <>
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
          <button
            onClick={resetDemo}
            style={{ display: 'block', margin: '24px auto 0', fontSize: 12, color: '#64748b', background: 'none' }}
          >
            Reset demo data
          </button>
        </>
      )}

      {tab === 'plan' && <PlanScreen tasks={tasks} />}
      {tab === 'courses' && (
        <CoursesScreen
          tasks={tasks}
          courses={courses}
          onAdd={addCourse}
          onRename={renameCourse}
          onDelete={deleteCourse}
        />
      )}
      {tab === 'add' && <AddWorkScreen tasks={tasks} courses={courses} onAdd={addTasks} />}
      {tab === 'insights' && <InsightsScreen tasks={tasks} />}

      <BottomNav tab={tab} onChange={changeTab} />

      {showEnergy && (
        <EnergySheet current={energy} onSelect={chooseEnergy} onClose={() => setShowEnergy(false)} />
      )}
    </main>
  )
}

export default App