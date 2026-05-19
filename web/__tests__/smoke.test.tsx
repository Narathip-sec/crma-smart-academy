import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'

import Home from '@/app/page'

test('home placeholder renders', () => {
  render(<Home />)
  expect(screen.getByRole('heading', { name: /phase 1 chassis ok/i })).toBeInTheDocument()
})
