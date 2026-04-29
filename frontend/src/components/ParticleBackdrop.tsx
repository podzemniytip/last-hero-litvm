import Particles, { initParticlesEngine } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import type { ISourceOptions } from '@tsparticles/engine'
import { useEffect, useMemo, useState } from 'react'

export function ParticleBackdrop() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine)
    }).then(() => setReady(true))
  }, [])

  const options = useMemo<ISourceOptions>(
    () => ({
      fullScreen: { enable: false },
      background: { color: 'transparent' },
      fpsLimit: 60,
      detectRetina: true,
      particles: {
        number: { value: 78, density: { enable: true, area: 900 } },
        color: { value: ['#00ffcc', '#8a2be2', '#ff003c'] },
        links: {
          enable: true,
          color: '#00ffcc',
          distance: 145,
          opacity: 0.14,
          width: 1
        },
        move: {
          enable: true,
          speed: 0.48,
          direction: 'none',
          random: true,
          straight: false,
          outModes: { default: 'out' }
        },
        opacity: { value: { min: 0.12, max: 0.44 } },
        size: { value: { min: 0.8, max: 2.4 } }
      },
      interactivity: {
        events: {
          onHover: { enable: true, mode: 'repulse' },
          resize: { enable: true }
        },
        modes: {
          repulse: { distance: 88, duration: 0.4 }
        }
      }
    }),
    []
  )

  if (!ready) return null
  return <Particles id="last-hero-particles" className="fixed inset-0 -z-20" options={options} />
}
