import { describe, expect, it } from 'vitest'
import { formatAddress, formatCountdown, formatRelativeTime, formatZkLtc, isZeroAddress } from './format'

describe('format helpers', () => {
  it('formats addresses and zero addresses', () => {
    expect(formatAddress('0x1234567890abcdef1234567890abcdef12345678')).toBe('0x1234...5678')
    expect(isZeroAddress('0x0000000000000000000000000000000000000000')).toBe(true)
  })

  it('formats zkLTC values', () => {
    expect(formatZkLtc(10_000_000_000_000_000n)).toBe('0.01')
    expect(formatZkLtc(1_234_567_000_000_000_000n, 5)).toBe('1.23457')
  })

  it('formats countdowns', () => {
    expect(formatCountdown(0)).toBe('00:00:00')
    expect(formatCountdown(65)).toBe('00:01:05')
    expect(formatCountdown(3661)).toBe('01:01:01')
  })

  it('formats relative time', () => {
    expect(formatRelativeTime(100n, 105_000)).toBe('just now')
    expect(formatRelativeTime(100n, 145_000)).toBe('45s ago')
    expect(formatRelativeTime(100n, 280_000)).toBe('3 min ago')
  })
})
