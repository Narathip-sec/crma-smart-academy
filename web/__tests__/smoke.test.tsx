import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'

import HomeView from '@/app/(app)/views/HomeView'

test('HomeView stub renders', () => {
  render(<HomeView />)
  expect(screen.getByTestId('view-home')).toBeInTheDocument()
})
