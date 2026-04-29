import { ExternalLink } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Address } from 'viem'
import { addressUrl, formatAddress, formatRelativeTime, formatZkLtc, isZeroAddress, txUrl } from '../lib/format'

export type HistoryRow = {
  id: string
  roundId: bigint
  winner?: Address
  pot: bigint
  ticketCount: bigint
  timestamp: bigint
  cancelled?: boolean
  txHash?: string
}

type CurrentRoundSummary = {
  roundId: bigint
  hero?: Address
  pot: bigint
  ticketCount: bigint
  expired: boolean
}

export function HistoryTable({
  rows,
  currentRound
}: {
  rows: HistoryRow[]
  currentRound?: CurrentRoundSummary
}) {
  const [visible, setVisible] = useState(8)
  const visibleRows = useMemo(() => rows.slice(0, visible), [rows, visible])

  return (
    <section className="glass-panel min-w-0 p-4 md:p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-platinum">Round History</h2>
          <div className="mt-1 font-mono text-xs uppercase tracking-[0.24em] text-platinum/40">
            LitVM event log
          </div>
        </div>
        {rows.length > visible ? (
          <button className="secondary-button" onClick={() => setVisible((value) => value + 8)}>
            Load more
          </button>
        ) : null}
      </div>

      <div className="max-w-full overflow-x-auto">
        <table className="w-full min-w-[720px] border-separate border-spacing-y-2 text-left">
          <thead className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-platinum/42">
            <tr>
              <th className="px-3 py-2">Round</th>
              <th className="px-3 py-2">Winner</th>
              <th className="px-3 py-2">Pot</th>
              <th className="px-3 py-2">Tickets</th>
              <th className="px-3 py-2">Time</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody className="font-mono text-sm">
            {currentRound ? (
              <tr className="outline-row">
                <td className="rounded-l px-3 py-3 text-cyan">R{currentRound.roundId.toString()}</td>
                <td className="px-3 py-3 text-platinum">
                  {currentRound.hero && !isZeroAddress(currentRound.hero)
                    ? formatAddress(currentRound.hero)
                    : 'Open'}
                </td>
                <td className="px-3 py-3 text-cyan">{formatZkLtc(currentRound.pot)}</td>
                <td className="px-3 py-3 text-platinum/70">{currentRound.ticketCount.toString()}</td>
                <td className="px-3 py-3 text-platinum/55">
                  {currentRound.expired ? 'Ready to end' : 'Live'}
                </td>
                <td className="rounded-r px-3 py-3 text-right text-glitch">pending</td>
              </tr>
            ) : null}
            {visibleRows.map((row) => (
              <tr key={row.id} className="table-row">
                <td className="rounded-l px-3 py-3 text-cyan">R{row.roundId.toString()}</td>
                <td className="px-3 py-3 text-platinum">
                  {row.cancelled || !row.winner ? (
                    'No tickets'
                  ) : (
                    <a
                      href={addressUrl(row.winner)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 hover:text-cyan"
                    >
                      {formatAddress(row.winner)}
                      <ExternalLink size={13} />
                    </a>
                  )}
                </td>
                <td className="px-3 py-3 text-cyan">{formatZkLtc(row.pot)}</td>
                <td className="px-3 py-3 text-platinum/70">{row.ticketCount.toString()}</td>
                <td className="px-3 py-3 text-platinum/55">{formatRelativeTime(row.timestamp)}</td>
                <td className="rounded-r px-3 py-3 text-right">
                  {row.txHash ? (
                    <a
                      href={txUrl(row.txHash)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-platinum/45 transition hover:text-cyan"
                      aria-label="Open transaction"
                    >
                      <ExternalLink size={15} />
                    </a>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
