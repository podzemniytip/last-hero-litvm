export type BuyButtonStateInput = {
  isConfigured: boolean
  isConnected: boolean
  wrongNetwork: boolean
  expired: boolean
  isPending: boolean
  balance?: bigint
  ticketPrice: bigint
}

export function getBuyButtonState(input: BuyButtonStateInput) {
  if (!input.isConfigured) return { disabled: true, label: 'Set contract address' }
  if (!input.isConnected) return { disabled: true, label: 'Connect wallet' }
  if (input.wrongNetwork) return { disabled: true, label: 'Switch to LitVM' }
  if (input.expired) return { disabled: true, label: 'Round expired' }
  if (input.balance !== undefined && input.balance < input.ticketPrice) {
    return { disabled: true, label: 'Need 0.01 zkLTC' }
  }
  if (input.isPending) return { disabled: true, label: 'Confirming' }
  return { disabled: false, label: 'Buy ticket' }
}
