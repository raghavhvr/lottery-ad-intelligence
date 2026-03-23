import { useCallback } from 'react'

const PREFIX = 'lottery_agent_'

export function useStorage() {
  const save = useCallback((key, value) => {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch (e) {
      console.warn('Storage save failed:', e)
    }
  }, [])

  const load = useCallback((key, fallback = null) => {
    try {
      const raw = localStorage.getItem(PREFIX + key)
      return raw ? JSON.parse(raw) : fallback
    } catch {
      return fallback
    }
  }, [])

  const remove = useCallback(key => {
    localStorage.removeItem(PREFIX + key)
  }, [])

  return { save, load, remove }
}
