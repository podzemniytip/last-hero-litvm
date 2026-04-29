import { describe, expect, it } from 'vitest'
import { countdownProgress, isDangerTime, secondsRemaining } from './time'

describe('time helpers', () => {
  it('calculates remaining seconds', () => {
    expect(secondsRemaining(120, 90_000)).toBe(30)
    expect(secondsRemaining(120, 130_000)).toBe(0)
  })

  it('calculates countdown progress', () => {
    expect(countdownProgress(0, 100, 50_000)).toBe(0.5)
    expect(countdownProgress(0, 100, 125_000)).toBe(0)
  })

  it('marks the final five minutes as danger time', () => {
    expect(isDangerTime(299)).toBe(true)
    expect(isDangerTime(300)).toBe(false)
    expect(isDangerTime(0)).toBe(false)
  })
})
