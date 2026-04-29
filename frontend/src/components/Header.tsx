import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Activity, Volume2, VolumeX, Wallet } from 'lucide-react'
import type { Address } from 'viem'
import { formatAddress, formatZkLtc } from '../lib/format'
import { Blockie } from './Blockie'

export function Header({
  balance,
  audioEnabled,
  onToggleAudio
}: {
  balance?: bigint
  audioEnabled: boolean
  onToggleAudio: () => void
}) {
  return (
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 overflow-hidden px-4 py-5 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded border border-cyan/60 bg-cyan/10 shadow-neon">
          <Activity className="text-cyan" size={23} />
        </div>
        <div className="min-w-0">
          <div className="font-display text-lg font-black tracking-normal text-platinum sm:text-2xl">
            Last Hero
          </div>
          <div className="font-mono text-[0.68rem] uppercase tracking-[0.26em] text-cyan/55">
            LitVM LiteForge
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="icon-button hidden sm:inline-flex"
          onClick={onToggleAudio}
          aria-label={audioEnabled ? 'Disable audio' : 'Enable audio'}
          title={audioEnabled ? 'Disable audio' : 'Enable audio'}
        >
          {audioEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
        <ConnectButton.Custom>
          {({ account, chain, mounted, openAccountModal, openChainModal, openConnectModal }) => {
            const ready = mounted
            const connected = ready && account && chain
            if (!connected) {
              return (
              <button className="neon-button shrink-0" onClick={openConnectModal} type="button" aria-label="Connect wallet">
                <Wallet size={18} />
                <span className="hidden sm:inline">Connect</span>
              </button>
              )
            }
            if (chain.unsupported) {
              return (
                <button className="danger-button" onClick={openChainModal} type="button">
                  Switch network
                </button>
              )
            }
            return (
              <button className="wallet-pill" onClick={openAccountModal} type="button">
                <Blockie address={account.address as Address} size={30} />
                <span className="hidden font-mono text-xs text-platinum sm:inline">
                  {balance !== undefined ? `${formatZkLtc(balance, 3)} zkLTC` : formatAddress(account.address)}
                </span>
                <span className="font-mono text-xs text-cyan sm:hidden">
                  {formatAddress(account.address)}
                </span>
              </button>
            )
          }}
        </ConnectButton.Custom>
      </div>
    </header>
  )
}
