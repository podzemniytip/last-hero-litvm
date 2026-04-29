import { describe, expect, it } from 'vitest'
import { getBuyButtonState } from './buttonState'

const base = {
  isConfigured: true,
  isConnected: true,
  wrongNetwork: false,
  expired: false,
  isPending: false,
  balance: 20n,
  ticketPrice: 10n
}

describe('buy button state', () => {
  it('requires configuration and connection', () => {
    expect(getBuyButtonState({ ...base, isConfigured: false }).label).toBe('Set contract address')
    expect(getBuyButtonState({ ...base, isConnected: false }).label).toBe('Connect wallet')
  })

  it('handles wrong network and expired rounds', () => {
    expect(getBuyButtonState({ ...base, wrongNetwork: true }).label).toBe('Switch to LitVM')
    expect(getBuyButtonState({ ...base, expired: true }).label).toBe('Round expired')
  })

  it('handles insufficient balance', () => {
    const state = getBuyButtonState({ ...base, balance: 9n })
    expect(state.disabled).toBe(true)
    expect(state.label).toBe('Need 0.01 zkLTC')
  })

  it('enables buying when ready', () => {
    const state = getBuyButtonState(base)
    expect(state.disabled).toBe(false)
    expect(state.label).toBe('Buy ticket')
  })
})
