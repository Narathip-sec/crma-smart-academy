// @vitest-environment node
import { describe, expect, test } from 'vitest'

import { DEFAULT_TAB, isValidTab, NAV_TABS, TAB_KEYS, useTabStore } from '@/store/useTabStore'

describe('useTabStore — initial state', () => {
  test('defaults to home', () => {
    const { activeTab } = useTabStore.getState()
    expect(activeTab).toBe(DEFAULT_TAB)
    expect(activeTab).toBe('home')
  })
})

describe('useTabStore — setTab', () => {
  test('setTab updates activeTab', () => {
    const store = useTabStore.getState()
    store.setTab('health')
    expect(useTabStore.getState().activeTab).toBe('health')
    store.setTab('home') // restore
  })

  test('setTab to every valid key succeeds', () => {
    const store = useTabStore.getState()
    for (const key of TAB_KEYS) {
      store.setTab(key)
      expect(useTabStore.getState().activeTab).toBe(key)
    }
    store.setTab('home') // restore
  })
})

describe('isValidTab', () => {
  test('accepts all TAB_KEYS', () => {
    for (const key of TAB_KEYS) {
      expect(isValidTab(key)).toBe(true)
    }
  })

  test('rejects invalid strings', () => {
    expect(isValidTab('unknown')).toBe(false)
    expect(isValidTab('')).toBe(false)
    expect(isValidTab(null)).toBe(false)
    expect(isValidTab(42)).toBe(false)
  })
})

describe('NAV_TABS', () => {
  test('has 5 items for bottom nav', () => {
    expect(NAV_TABS).toHaveLength(5)
  })

  test('all keys are valid TabKeys', () => {
    for (const t of NAV_TABS) {
      expect(isValidTab(t.key)).toBe(true)
    }
  })

  test('home is first', () => {
    expect(NAV_TABS[0]?.key).toBe('home')
  })

  test('has Thai labels', () => {
    for (const t of NAV_TABS) {
      expect(t.labelTh.length).toBeGreaterThan(0)
    }
  })
})

describe('TAB_KEYS', () => {
  test('contains all 7 view keys', () => {
    expect(TAB_KEYS).toContain('home')
    expect(TAB_KEYS).toContain('class_schedule')
    expect(TAB_KEYS).toContain('health')
    expect(TAB_KEYS).toContain('activity')
    expect(TAB_KEYS).toContain('service')
    expect(TAB_KEYS).toContain('grades')
    expect(TAB_KEYS).toContain('me')
    expect(TAB_KEYS).toHaveLength(7)
  })
})
