import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders Hello World heading', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /hello world/i })).toBeInTheDocument()
  })

  it('renders welcome message', () => {
    render(<App />)
    expect(screen.getByText(/welcome to cycle tracker/i)).toBeInTheDocument()
  })
})
