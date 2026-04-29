import { describe, expect, it } from 'vitest'
import { prependFeedItem, ticketFeedItem, type FeedItem } from './events'

describe('event feed helpers', () => {
  it('creates ticket feed items and dedupes by id', () => {
    const item = ticketFeedItem({
      roundId: 1n,
      buyer: '0x1234567890abcdef1234567890abcdef12345678',
      paid: 10n,
      purchasedAt: 100n,
      txHash: '0xabc',
      logIndex: 2
    })
    const feed = prependFeedItem(prependFeedItem([], item), item)
    expect(feed).toHaveLength(1)
    expect(feed[0].id).toBe('0xabc-2')
  })

  it('caps feed size', () => {
    const items = Array.from({ length: 30 }, (_, index) => ({
      id: `id-${index}`,
      kind: 'ticket' as const,
      roundId: BigInt(index),
      timestamp: BigInt(index)
    }))
    const feed = items.reduce<FeedItem[]>((acc, item) => prependFeedItem(acc, item, 10), [])
    expect(feed).toHaveLength(10)
    expect(feed[0].id).toBe('id-29')
  })
})
