import type { Address } from 'viem'

function hashAddress(address?: string) {
  const input = address?.toLowerCase() || 'last-hero'
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function Blockie({ address, size = 34 }: { address?: Address | string; size?: number }) {
  const seed = hashAddress(address)
  const colors = ['#00ffcc', '#ff003c', '#8a2be2', '#d8fff7', '#091512']
  const cells = Array.from({ length: 25 }, (_, index) => {
    const x = index % 5
    const mirrorX = x > 2 ? 4 - x : x
    const value = (seed >> ((mirrorX + Math.floor(index / 5) * 3) % 18)) & 3
    return colors[value]
  })

  return (
    <span
      className="grid overflow-hidden border border-cyan/50 shadow-neon"
      style={{
        width: size,
        height: size,
        gridTemplateColumns: 'repeat(5, 1fr)',
        borderRadius: 7,
        background: '#020605'
      }}
      aria-hidden="true"
    >
      {cells.map((color, index) => (
        <span key={index} style={{ backgroundColor: color, opacity: color === colors[4] ? 0.25 : 1 }} />
      ))}
    </span>
  )
}
