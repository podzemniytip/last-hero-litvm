export const LAST_HERO_ABI = [
  {
    type: 'constructor',
    inputs: [{ name: 'devWallet_', type: 'address', internalType: 'address' }],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'BPS_DENOMINATOR',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'EXTENSION',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'INITIAL_DURATION',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'MAX_ENDS_AT_FROM_NOW',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'PRIZE_BPS',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'TICKET_PRICE',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'buyTicket',
    inputs: [],
    outputs: [],
    stateMutability: 'payable'
  },
  {
    type: 'function',
    name: 'currentRound',
    inputs: [],
    outputs: [
      { name: 'id', type: 'uint256', internalType: 'uint256' },
      { name: 'startedAt', type: 'uint256', internalType: 'uint256' },
      { name: 'endsAt', type: 'uint256', internalType: 'uint256' },
      { name: 'hero', type: 'address', internalType: 'address' },
      { name: 'currentPot', type: 'uint256', internalType: 'uint256' },
      { name: 'tickets', type: 'uint256', internalType: 'uint256' },
      { name: 'expired', type: 'bool', internalType: 'bool' }
    ],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'devWallet',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'endRound',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'getRound',
    inputs: [{ name: 'id', type: 'uint256', internalType: 'uint256' }],
    outputs: [
      {
        name: 'snapshot',
        type: 'tuple',
        internalType: 'struct LastHero.RoundSnapshot',
        components: [
          { name: 'roundId', type: 'uint256', internalType: 'uint256' },
          { name: 'winner', type: 'address', internalType: 'address' },
          { name: 'pot', type: 'uint256', internalType: 'uint256' },
          { name: 'prize', type: 'uint256', internalType: 'uint256' },
          { name: 'devFee', type: 'uint256', internalType: 'uint256' },
          { name: 'startedAt', type: 'uint256', internalType: 'uint256' },
          { name: 'endedAt', type: 'uint256', internalType: 'uint256' },
          { name: 'finalizedAt', type: 'uint256', internalType: 'uint256' },
          { name: 'ticketCount', type: 'uint256', internalType: 'uint256' },
          { name: 'cancelled', type: 'bool', internalType: 'bool' }
        ]
      }
    ],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'lastHero',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'pot',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'roundEndsAt',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'roundId',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'roundStartedAt',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'ticketCount',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'event',
    name: 'RoundCancelled',
    inputs: [
      { name: 'roundId', type: 'uint256', indexed: true, internalType: 'uint256' },
      { name: 'startedAt', type: 'uint256', indexed: false, internalType: 'uint256' },
      { name: 'endedAt', type: 'uint256', indexed: false, internalType: 'uint256' },
      { name: 'finalizedAt', type: 'uint256', indexed: false, internalType: 'uint256' }
    ],
    anonymous: false
  },
  {
    type: 'event',
    name: 'RoundEnded',
    inputs: [
      { name: 'roundId', type: 'uint256', indexed: true, internalType: 'uint256' },
      { name: 'winner', type: 'address', indexed: true, internalType: 'address' },
      { name: 'pot', type: 'uint256', indexed: false, internalType: 'uint256' },
      { name: 'prize', type: 'uint256', indexed: false, internalType: 'uint256' },
      { name: 'devFee', type: 'uint256', indexed: false, internalType: 'uint256' },
      { name: 'ticketCount', type: 'uint256', indexed: false, internalType: 'uint256' },
      { name: 'startedAt', type: 'uint256', indexed: false, internalType: 'uint256' },
      { name: 'endedAt', type: 'uint256', indexed: false, internalType: 'uint256' },
      { name: 'finalizedAt', type: 'uint256', indexed: false, internalType: 'uint256' }
    ],
    anonymous: false
  },
  {
    type: 'event',
    name: 'RoundStarted',
    inputs: [
      { name: 'roundId', type: 'uint256', indexed: true, internalType: 'uint256' },
      { name: 'startedAt', type: 'uint256', indexed: false, internalType: 'uint256' },
      { name: 'endsAt', type: 'uint256', indexed: false, internalType: 'uint256' }
    ],
    anonymous: false
  },
  {
    type: 'event',
    name: 'TicketPurchased',
    inputs: [
      { name: 'roundId', type: 'uint256', indexed: true, internalType: 'uint256' },
      { name: 'buyer', type: 'address', indexed: true, internalType: 'address' },
      { name: 'paid', type: 'uint256', indexed: false, internalType: 'uint256' },
      { name: 'potAfter', type: 'uint256', indexed: false, internalType: 'uint256' },
      { name: 'ticketCount', type: 'uint256', indexed: false, internalType: 'uint256' },
      { name: 'endsAt', type: 'uint256', indexed: false, internalType: 'uint256' },
      { name: 'purchasedAt', type: 'uint256', indexed: false, internalType: 'uint256' }
    ],
    anonymous: false
  },
  { type: 'error', name: 'DirectPaymentsDisabled', inputs: [] },
  { type: 'error', name: 'IncorrectTicketPrice', inputs: [] },
  { type: 'error', name: 'RoundExpired', inputs: [] },
  { type: 'error', name: 'RoundNotFound', inputs: [] },
  { type: 'error', name: 'RoundStillActive', inputs: [] },
  {
    type: 'error',
    name: 'TransferFailed',
    inputs: [
      { name: 'to', type: 'address', internalType: 'address' },
      { name: 'amount', type: 'uint256', internalType: 'uint256' }
    ]
  },
  { type: 'error', name: 'ZeroDevWallet', inputs: [] }
] as const
