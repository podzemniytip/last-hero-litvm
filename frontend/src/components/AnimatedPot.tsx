import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useEffect, useMemo } from 'react'
import { ethers } from 'ethers'

export function AnimatedPot({ pot }: { pot: bigint }) {
  const numericPot = useMemo(() => Number(ethers.formatEther(pot)), [pot])
  const motionValue = useMotionValue(numericPot)
  const spring = useSpring(motionValue, { stiffness: 85, damping: 18, mass: 0.6 })
  const display = useTransform(spring, (latest) =>
    latest.toLocaleString('en-US', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 5
    })
  )

  useEffect(() => {
    motionValue.set(numericPot)
  }, [motionValue, numericPot])

  return (
    <div>
      <div className="font-mono text-[0.7rem] uppercase tracking-[0.34em] text-cyan/60">Pot</div>
      <div className="mt-2 flex items-end gap-3">
        <motion.span className="font-display text-5xl font-black tracking-normal text-cyan drop-shadow-[0_0_24px_rgba(0,255,204,.6)] md:text-7xl">
          {display}
        </motion.span>
        <span className="mb-2 font-mono text-sm text-platinum/70 md:mb-4">zkLTC</span>
      </div>
    </div>
  )
}
