import { AnimatePresence, motion } from 'framer-motion'
import { Activity, Crown, Ticket } from 'lucide-react'
import type { FeedItem } from '../lib/events'
import { formatAddress, formatRelativeTime, formatZkLtc, txUrl } from '../lib/format'

function labelFor(item: FeedItem) {
  if (item.kind === 'ticket') return `${formatAddress(item.address)} bought`
  if (item.kind === 'round-ended') return `${formatAddress(item.address)} won`
  return 'Round restarted'
}

function IconFor({ kind }: { kind: FeedItem['kind'] }) {
  if (kind === 'ticket') return <Ticket size={15} />
  if (kind === 'round-ended') return <Crown size={15} />
  return <Activity size={15} />
}

export function LiveFeed({ feed }: { feed: FeedItem[] }) {
  return (
    <aside className="glass-panel min-h-[280px] p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="font-mono text-[0.7rem] uppercase tracking-[0.32em] text-platinum/55">
          Live Feed
        </div>
        <span className="h-2 w-2 rounded-full bg-cyan shadow-neon" />
      </div>
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {feed.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded border border-white/10 bg-white/[0.03] p-4 font-mono text-xs text-platinum/45"
            >
              Waiting for on-chain signal
            </motion.div>
          ) : (
            feed.map((item) => (
              <motion.a
                key={item.id}
                href={item.txHash ? txUrl(item.txHash) : undefined}
                target={item.txHash ? '_blank' : undefined}
                rel="noreferrer"
                initial={{ opacity: 0, x: 24, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -18 }}
                className="group flex items-center gap-3 rounded border border-white/10 bg-white/[0.035] p-3 transition hover:border-cyan/50 hover:bg-cyan/[0.06]"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-cyan/40 text-cyan">
                  <IconFor kind={item.kind} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-mono text-xs text-platinum">{labelFor(item)}</span>
                  <span className="mt-1 block font-mono text-[0.68rem] text-platinum/45">
                    R{item.roundId.toString()} / {formatRelativeTime(item.timestamp)}
                  </span>
                </span>
                {item.amount ? (
                  <span className="font-mono text-xs text-cyan">{formatZkLtc(item.amount, 3)}</span>
                ) : null}
              </motion.a>
            ))
          )}
        </AnimatePresence>
      </div>
    </aside>
  )
}
