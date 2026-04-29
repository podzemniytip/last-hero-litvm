let ctx: AudioContext | undefined

function getContext() {
  if (typeof window === 'undefined') return undefined
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext
  if (!AudioContextCtor) return undefined
  ctx ||= new AudioContextCtor()
  return ctx
}

function playTone(frequency: number, duration = 0.12, type: OscillatorType = 'sine', gain = 0.045) {
  const audio = getContext()
  if (!audio) return
  const oscillator = audio.createOscillator()
  const envelope = audio.createGain()
  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, audio.currentTime)
  envelope.gain.setValueAtTime(0.0001, audio.currentTime)
  envelope.gain.exponentialRampToValueAtTime(gain, audio.currentTime + 0.015)
  envelope.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + duration)
  oscillator.connect(envelope).connect(audio.destination)
  oscillator.start()
  oscillator.stop(audio.currentTime + duration + 0.02)
}

export function playTicketSound(enabled: boolean) {
  if (!enabled) return
  playTone(420, 0.08, 'square', 0.035)
  window.setTimeout(() => playTone(840, 0.12, 'sawtooth', 0.03), 48)
}

export function playRoundEndSound(enabled: boolean) {
  if (!enabled) return
  playTone(120, 0.22, 'sawtooth', 0.05)
  window.setTimeout(() => playTone(240, 0.28, 'triangle', 0.055), 90)
  window.setTimeout(() => playTone(960, 0.42, 'sine', 0.04), 180)
}

export function playTickSound(enabled: boolean) {
  if (!enabled) return
  playTone(980, 0.045, 'square', 0.018)
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext
  }
}
