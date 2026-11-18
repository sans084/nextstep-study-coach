import { STATUS } from '../data/sampleTasks.js'
import { toDateString, addDays, freeMinutes } from './recalibrator.js'

export const ASSIGNMENT_TYPES = [
  { id: 'report', label: 'Report / document' },
  { id: 'coding', label: 'Coding project' },
  { id: 'presentation', label: 'Presentation' },
  { id: 'exam', label: 'Exam revision' },
]

// Each step takes a share of the total time (shares add up to 1)
const TEMPLATES = {
  report: [
    { name: 'Research and gather sources', share: 0.2, energy: 'medium' },
    { name: 'Outline the structure', share: 0.1, energy: 'medium' },
    { name: 'Write the first draft', share: 0.4, energy: 'high' },
    { name: 'Add visuals and references', share: 0.15, energy: 'low' },
    { name: 'Review and polish', share: 0.15, energy: 'medium' },
  ],
  coding: [
    { name: 'Plan and list the features', share: 0.1, energy: 'medium' },
    { name: 'Set up the project', share: 0.1, energy: 'low' },
    { name: 'Build the core feature', share: 0.4, energy: 'high' },
    { name: 'Test and fix bugs', share: 0.25, energy: 'high' },
    { name: 'Write the README and clean up', share: 0.15, energy: 'low' },
  ],
  presentation: [
    { name: 'Research the topic', share: 0.25, energy: 'medium' },
    { name: 'Draft the slides', share: 0.35, energy: 'high' },
    { name: 'Design and visuals', share: 0.2, energy: 'medium' },
    { name: 'Rehearse out loud', share: 0.2, energy: 'low' },
  ],
  exam: [
    { name: 'Review your notes', share: 0.3, energy: 'low' },
    { name: 'Practice problems', share: 0.4, energy: 'high' },
    { name: 'Flashcards on weak topics', share: 0.2, energy: 'low' },
    { name: 'Timed mock test', share: 0.1, energy: 'medium' },
  ],
}

const MAX_CHUNK = 45 // minutes: no sub-task is longer than this
const roundTo5 = (n) => Math.max(10, Math.round(n / 5) * 5)

// Turn one big assignment into a list of small tasks
export function atomize({ title, course, deadline, weight, type, totalMinutes, idPrefix = `a${Date.now()}` }) {
  const tasks = []
  for (const step of TEMPLATES[type] ?? TEMPLATES.report) {
    const minutes = roundTo5(step.share * totalMinutes)
    const parts = Math.ceil(minutes / MAX_CHUNK)
    const each = roundTo5(minutes / parts)
    for (let p = 1; p <= parts; p++) {
      tasks.push({
        id: `${idPrefix}-${tasks.length + 1}`,
        title: parts > 1 ? `${title}: ${step.name} (${p}/${parts})` : `${title}: ${step.name}`,
        course,
        deadline,
        weight,
        estimatedMinutes: each,
        status: STATUS.TODO,
        energy: step.energy,
      })
    }
  }
  return tasks
}

// Give each step a day: in order, never over a day's capacity
export function scheduleSteps(existing, steps, today = new Date()) {
  const todayString = toDateString(today)
  const placed = []
  let pointer = 0 // steps never move earlier than the step before them

  for (const step of steps) {
    let offset = pointer
    while (
      offset < 60 &&
      freeMinutes([...existing, ...placed], addDays(todayString, offset)) < step.estimatedMinutes
    ) {
      offset++
    }
    if (offset >= 60) offset = pointer // no room anywhere: stay put
    pointer = offset
    placed.push({ ...step, scheduledDate: addDays(todayString, offset) })
  }
  return placed
}