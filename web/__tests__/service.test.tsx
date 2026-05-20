// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { ServiceGrid } from '@/components/service/ServiceGrid'
import { serviceItemsFixture } from '@/fixtures/service'

// ───────────────────────── fixtures/service ───────────────────────────────────
describe('service fixtures', () => {
  test('serviceItemsFixture has 6 items', () => {
    expect(serviceItemsFixture).toHaveLength(6)
  })

  test('each item has key, label, description, url', () => {
    for (const item of serviceItemsFixture) {
      expect(item.key.length).toBeGreaterThan(0)
      expect(item.label.length).toBeGreaterThan(0)
      expect(item.description.length).toBeGreaterThan(0)
      expect(item.url).toMatch(/^https:\/\//)
    }
  })
})

// ───────────────────────── ServiceGrid ───────────────────────────────────────
describe('ServiceGrid', () => {
  test('renders all service tile testids', () => {
    render(<ServiceGrid items={serviceItemsFixture} onPress={() => {}} />)
    expect(screen.getByTestId('servicegrid.root')).toBeInTheDocument()
    for (const item of serviceItemsFixture) {
      expect(screen.getByTestId(`servicegrid.tile.${item.key}`)).toBeInTheDocument()
    }
  })

  test('calls onPress with item url on click', () => {
    const onPress = vi.fn()
    render(<ServiceGrid items={serviceItemsFixture} onPress={onPress} />)
    const first = serviceItemsFixture[0]!
    fireEvent.click(screen.getByTestId(`servicegrid.tile.${first.key}`))
    expect(onPress).toHaveBeenCalledWith(first.url)
  })

  test('renders correct aria-label per tile', () => {
    render(<ServiceGrid items={serviceItemsFixture} onPress={() => {}} />)
    for (const item of serviceItemsFixture) {
      expect(screen.getByLabelText(item.label)).toBeInTheDocument()
    }
  })
})
