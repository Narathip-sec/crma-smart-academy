import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'

import HomeView from '@/app/(app)/views/HomeView'

test('HomeView renders home root + profile section', () => {
  render(<HomeView />)
  expect(screen.getByTestId('home.root')).toBeInTheDocument()
  expect(screen.getByTestId('home.section.profile')).toBeInTheDocument()
})
