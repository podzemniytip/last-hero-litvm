import confetti from 'canvas-confetti'
import { AnimatePresence, motion } from 'framer-motion'
import { Crown, ExternalLink, X } from 'lucide-react'
import { useEffect } from 'react'
import { addressUrl, formatAddress, formatZkLtc, isZeroAddress, txUrl } from '../lib/format'
import { useGameStore } from '../store/useGameStore'

export function WinnerModal() {
  const winnerReveal = useGameStore((state) => state.winnerReveal)
  const close = useGameStore((state) => state.setWinnerReveal)

  useEffect(() => {
    if (!winnerReveal) return
    confetti({
      particleCount: 160,
      spread: 80,
      origin: { y: 0.62 },
      colors: ['#00FFCC', '#FF003C', '#8A2BE2', '#D8FFF7']
    })
  }, [winnerReveal])

  return (
    <AnimatePresence>
      {winnerReveal ? (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 backdrop-blur-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ type: 'spring', stiffness: 110, damping: 15 }}
            className="glass-panel relative w-full max-w-2xl overflow-hidden p-6 text-center"
          >
            <button
              className="icon-button absolute right-4 top-4"
              onClick={() => close(undefined)}
              aria-label="Close"
            >
              <X size={17} />
            </button>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded border border-cyan/60 bg-cyan/10 text-cyan shadow-neon">
              <Crown size={34} />
            </div>
            <div className="mt-5 font-mono text-xs uppercase tracking-[0.34em] text-platinum/50">
              Round {winnerReveal.roundId.toString()} resolved
            </div>
            <div className="mt-3 animate-glitch font-display text-4xl font-black tracking-normal text-cyan md:text-6xl">
              LAST HERO
            </div>
            <div className="mt-4 font-mono text-lg text-platinum">
              {winnerReveal.winner && !isZeroAddress(winnerReveal.winner)
                ? formatAddress(winnerReveal.winner)
                : 'No tickets'}
            </div>
            <div className="mt-2 font-display text-3xl font-black text-cyan">
              {formatZkLtc(winnerReveal.prize ?? 0n, 5)} zkLTC
            </div>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              {winnerReveal.winner && !isZeroAddress(winnerReveal.winner) ? (
                <a
                  className="secondary-button justify-center"
                  href={addressUrl(winnerReveal.winner)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink size={16} />
                  Winner
                </a>
              ) : null}
              {winnerReveal.txHash ? (
                <a
                  className="neon-button justify-center"
                  href={txUrl(winnerReveal.txHash)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink size={16} />
                  Transaction
                </a>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
