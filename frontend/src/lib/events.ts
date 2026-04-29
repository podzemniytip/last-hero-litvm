import type { Address } from 'viem'

export type FeedKind = 'ticket' | 'round-ended' | 'round-cancelled'

export type FeedItem = {
  id: string
  kind: FeedKind
  address?: Address
  roundId: bigint
  amount?: bigint
  timestamp: bigint
  txHash?: string
}

export function prependFeedItem(feed: FeedItem[], item: FeedItem, maxItems = 24) {
  const withoutDuplicate = feed.filter((existing) => existing.id !== item.id)
  return [item, ...withoutDuplicate].slice(0, maxItems)
}

export function ticketFeedItem(input: {
  roundId: bigint
  buyer: Address
  paid: bigint
  purchasedAt: bigint
  txHash?: string
  logIndex?: number
}): FeedItem {
  return {
    id: `${input.txHash || 'ticket'}-${input.logIndex ?? 0}`,
    kind: 'ticket',
    address: input.buyer,
    roundId: input.roundId,
    amount: input.paid,
    timestamp: input.purchasedAt,
    txHash: input.txHash
  }
}
