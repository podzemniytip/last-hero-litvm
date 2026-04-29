import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, ShieldCheck, Ticket, TimerReset, X } from 'lucide-react'
import { formatGas, humanizeError } from '../lib/format'

type ActionKind = 'buy' | 'end'

export function ActionModal({
  open,
  kind,
  gas,
  simulationError,
  onClose,
  onConfirm,
  ready,
  pending
}: {
  open: boolean
  kind: ActionKind
  gas?: bigint
  simulationError?: unknown
  onClose: () => void
  onConfirm: () => void
  ready: boolean
  pending: boolean
}) {
  const isBuy = kind === 'buy'

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-black/72 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            className="glass-panel w-full max-w-lg p-5"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded border border-cyan/50 bg-cyan/10 text-cyan">
                  {isBuy ? <Ticket size={22} /> : <TimerReset size={22} />}
                </span>
                <div>
                  <div className="font-display text-xl font-bold text-platinum">
                    {isBuy ? 'Authorize Ticket' : 'End Round'}
                  </div>
                  <div className="mt-1 font-mono text-xs uppercase tracking-[0.22em] text-platinum/45">
                    {isBuy ? '0.01 zkLTC' : 'Payout and restart'}
                  </div>
                </div>
              </div>
              <button className="icon-button" onClick={onClose} aria-label="Close">
                <X size={17} />
              </button>
            </div>

            <div className="rounded border border-white/10 bg-black/30 p-4">
              <div className="flex items-center gap-2 font-mono text-sm text-platinum">
                <ShieldCheck size={16} className="text-cyan" />
                Simulation status
              </div>
              <div className="mt-3 grid gap-2 font-mono text-xs text-platinum/58">
                <div className="flex justify-between gap-4">
                  <span>Estimated gas</span>
                  <span className="text-cyan">{formatGas(gas)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Network</span>
                  <span className="text-cyan">LitVM / 4441</span>
                </div>
              </div>
              {simulationError ? (
                <div className="mt-4 rounded border border-glitch/40 bg-glitch/10 p-3 font-mono text-xs text-glitch">
                  {humanizeError(simulationError)}
                </div>
              ) : null}
            </div>

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button className="secondary-button" onClick={onClose} disabled={pending}>
                Cancel
              </button>
              <button className="neon-button justify-center" onClick={onConfirm} disabled={!ready || pending}>
                {pending ? <Loader2 className="animate-spin" size={18} /> : null}
                {pending ? 'Waiting' : 'Confirm'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
