import { motion } from 'framer-motion'
import { formatCountdown } from '../lib/format'
import { countdownProgress, isDangerTime, secondsRemaining } from '../lib/time'

type CountdownRingProps = {
  startedAt: bigint
  endsAt: bigint
  nowMs: number
}

export function CountdownRing({ startedAt, endsAt, nowMs }: CountdownRingProps) {
  const remaining = secondsRemaining(endsAt, nowMs)
  const progress = countdownProgress(startedAt, endsAt, nowMs)
  const danger = isDangerTime(remaining)

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[330px]">
      <svg viewBox="0 0 220 220" className="h-full w-full -rotate-90">
        <circle
          cx="110"
          cy="110"
          r="92"
          fill="transparent"
          stroke="rgba(216,255,247,.09)"
          strokeWidth="14"
        />
        <motion.circle
          cx="110"
          cy="110"
          r="92"
          fill="transparent"
          stroke={danger ? '#FF003C' : '#00FFCC'}
          strokeWidth="14"
          strokeLinecap="round"
          pathLength={progress}
          initial={false}
          animate={{ pathLength: progress }}
          transition={{ type: 'spring', stiffness: 70, damping: 24 }}
          className={danger ? 'animate-pulseRed' : 'drop-shadow-[0_0_14px_rgba(0,255,204,.65)]'}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.34em] text-platinum/55">
          Time Lock
        </span>
        <span
          className={`mt-2 font-display text-4xl font-black tracking-normal sm:text-5xl ${
            danger ? 'text-glitch' : 'text-cyan'
          }`}
        >
          {formatCountdown(remaining)}
        </span>
        <span className="mt-3 h-px w-24 bg-gradient-to-r from-transparent via-cyan to-transparent" />
      </div>
    </div>
  )
}
