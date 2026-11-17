import { sampleTasks } from './data/sampleTasks'

function App() {
  return (
    <div style={{ padding: 24 }}>
      <h1>NextStep</h1>
      <ul>
        {sampleTasks.map((task) => (
          <li key={task.id}>
            {task.title} ({task.course}): due {task.deadline}, {task.estimatedMinutes} min, {task.weight}% of grade
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App