import { motion } from 'framer-motion'
import type { Address } from 'viem'
import { isZeroAddress } from '../lib/format'
import { Blockie } from './Blockie'

export function LastHeroCard({ hero, tickets }: { hero?: Address; tickets: bigint }) {
  const empty = !hero || isZeroAddress(hero)
  const ticketLabel = `${tickets.toLocaleString('en-US')} ticket${tickets === 1n ? '' : 's'}`

  return (
    <motion.div
      key={hero || 'empty'}
      initial={{ rotateX: -82, opacity: 0, y: 18 }}
      animate={{ rotateX: 0, opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      className="glass-panel relative overflow-hidden p-5"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan to-transparent" />
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="font-mono text-[0.7rem] uppercase tracking-[0.34em] text-platinum/55">
            Last Hero
          </div>
          <div className="mt-3 flex items-center gap-3">
            <Blockie address={hero} size={42} />
            <div className="min-w-0">
              <div className="font-display text-xl font-bold text-platinum">
                {empty ? 'Awaiting challenger' : 'Cloaked hero'}
              </div>
              <div className="mt-1 font-mono text-xs text-cyan/60">
                {ticketLabel}
              </div>
            </div>
          </div>
        </div>
        {!empty ? <div className="h-2 w-2 shrink-0 rounded-full bg-cyan shadow-neon" /> : null}
      </div>
    </motion.div>
  )
}
