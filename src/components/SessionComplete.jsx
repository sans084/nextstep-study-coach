import './SessionComplete.css'

export default function SessionComplete({ doneTask, nextTask, onNext, onBreak }) {
  return (
    <section className="done">
      <div className="done__check">✓</div>
      <h2 className="done__heading">Nice work!</h2>
      <p className="done__sub">
        {doneTask.estimatedMinutes} min done • {doneTask.title} completed
      </p>

      {nextTask ? (
        <>
          <div className="done__next">
            <p className="done__label">NEXT UP</p>
            <p className="done__title">{nextTask.title}</p>
            <p className="done__meta">{nextTask.estimatedMinutes} min • fits your free gap</p>
          </div>
          <button className="done__btn" onClick={() => onNext(nextTask)}>Start next</button>
        </>
      ) : (
        <p className="done__sub">Nothing else fits right now. You're all caught up for this gap.</p>
      )}

      <button className="done__link" onClick={onBreak}>Take a break</button>
    </section>
  )
}