import { useEffect, useState } from 'react'

// Works like useState, but remembers the value in localStorage.
export default function usePersistentState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      return saved !== null ? JSON.parse(saved) : initialValue
    } catch {
      return initialValue // storage blocked or data corrupted: start fresh
    }
  })

  // Runs after every change to `value` and saves it
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // ignore: the app still works, it just won't remember
    }
  }, [key, value])

  return [value, setValue]
}