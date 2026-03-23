import { useState, useCallback } from 'react'
import { FILTER_GROUPS } from '../lib/filters'

function buildDefaults() {
  const state = {}
  FILTER_GROUPS.forEach(g => {
    state[g.key] = new Set(g.defaults)
  })
  return state
}

export function useFilters() {
  const [filters, setFilters] = useState(buildDefaults)

  const toggle = useCallback((group, value) => {
    setFilters(prev => {
      const next = { ...prev, [group]: new Set(prev[group]) }
      const grp = FILTER_GROUPS.find(g => g.key === group)

      if (grp?.exclusive === value) {
        // clicking the "all" pill — clear others, set only this
        next[group] = new Set([value])
        return next
      }

      if (grp?.exclusive && value !== grp.exclusive) {
        // clicking a specific brand — remove "all"
        next[group].delete(grp.exclusive)
      }

      if (next[group].has(value)) {
        if (next[group].size > 1) next[group].delete(value)
      } else {
        next[group].add(value)
      }
      return next
    })
  }, [])

  return { filters, toggle }
}
