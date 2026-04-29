export function secondsRemaining(endsAtSeconds: bigint | number, nowMs = Date.now()) {
  return Math.max(0, Number(endsAtSeconds) - Math.floor(nowMs / 1000))
}

export function countdownProgress(
  startedAtSeconds: bigint | number,
  endsAtSeconds: bigint | number,
  nowMs = Date.now()
) {
  const started = Number(startedAtSeconds)
  const ends = Number(endsAtSeconds)
  const total = Math.max(1, ends - started)
  const remaining = secondsRemaining(ends, nowMs)
  return Math.max(0, Math.min(1, remaining / total))
}

export function isDangerTime(remainingSeconds: number) {
  return remainingSeconds > 0 && remainingSeconds < 300
}
