import confetti from 'canvas-confetti'
import { motion } from 'framer-motion'
import { AlertTriangle, Loader2, RotateCw, ShieldAlert, Ticket, TimerReset, Zap } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Address, Hex } from 'viem'
import { decodeEventLog, encodeFunctionData } from 'viem'
import {
  useAccount,
  useBalance,
  useChainId,
  useEstimateGas,
  useReadContracts,
  useSimulateContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
  useWriteContract
} from 'wagmi'
import { LAST_HERO_ABI } from './abi/lastHero'
import { ActionModal } from './components/ActionModal'
import { AnimatedPot } from './components/AnimatedPot'
import { CountdownRing } from './components/CountdownRing'
import { Header } from './components/Header'
import { HistoryTable, type HistoryRow } from './components/HistoryTable'
import { LastHeroCard } from './components/LastHeroCard'
import { LiveFeed } from './components/LiveFeed'
import { ParticleBackdrop } from './components/ParticleBackdrop'
import { ToastStack } from './components/ToastStack'
import { WinnerModal } from './components/WinnerModal'
import { litvmLiteForge } from './config/chains'
import { LITVM_CHAIN_ID, contractAddress, contractDeployBlock, isContractConfigured } from './config/env'
import { playRoundEndSound, playTicketSound, playTickSound } from './lib/audio'
import { getBuyButtonState } from './lib/buttonState'
import { ticketFeedItem } from './lib/events'
import { TICKET_PRICE_WEI, formatAddress, formatZkLtc, humanizeError, isZeroAddress } from './lib/format'
import { secondsRemaining } from './lib/time'
import { useContractEvents } from './lib/useContractEvents'
import { useGameStore } from './store/useGameStore'

type CurrentRound = {
  id: bigint
  startedAt: bigint
  endsAt: bigint
  hero: Address
  pot: bigint
  tickets: bigint
  expired: boolean
}

type DialogKind = 'buy' | 'end'

type TicketPurchasedArgs = {
  roundId: bigint
  buyer: Address
  paid: bigint
  potAfter: bigint
  ticketCount: bigint
  endsAt: bigint
  purchasedAt: bigint
}

type RoundEndedArgs = {
  roundId: bigint
  winner: Address
  pot: bigint
  prize: bigint
  devFee: bigint
  ticketCount: bigint
  startedAt: bigint
  endedAt: bigint
  finalizedAt: bigint
}

type RoundCancelledArgs = {
  roundId: bigint
  startedAt: bigint
  endedAt: bigint
  finalizedAt: bigint
}

function normalizeCurrentRound(result?: readonly unknown[]): CurrentRound | undefined {
  if (!result) return undefined
  return {
    id: result[0] as bigint,
    startedAt: result[1] as bigint,
    endsAt: result[2] as bigint,
    hero: result[3] as Address,
    pot: result[4] as bigint,
    tickets: result[5] as bigint,
    expired: result[6] as boolean
  }
}

function logId(log: { transactionHash?: string; logIndex?: number }) {
  return `${log.transactionHash || 'log'}-${log.logIndex ?? 0}`
}

export default function App() {
  const [nowMs, setNowMs] = useState(Date.now())
  const [dialog, setDialog] = useState<DialogKind | undefined>()
  const [pendingHash, setPendingHash] = useState<Hex | undefined>()
  const [pendingAction, setPendingAction] = useState<DialogKind | undefined>()
  const lastBeepSecond = useRef<number | undefined>()

  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const wrongNetwork = isConnected && chainId !== LITVM_CHAIN_ID
  const { switchChain, isPending: switching } = useSwitchChain()
  const { data: balance } = useBalance({
    address,
    chainId: LITVM_CHAIN_ID,
    query: { enabled: Boolean(address), refetchInterval: 12_000 }
  })

  const audioEnabled = useGameStore((state) => state.audioEnabled)
  const toggleAudio = useGameStore((state) => state.toggleAudio)
  const addToast = useGameStore((state) => state.addToast)
  const addFeedItem = useGameStore((state) => state.addFeedItem)
  const feed = useGameStore((state) => state.feed)
  const setWinnerReveal = useGameStore((state) => state.setWinnerReveal)

  useEffect(() => {
    const interval = window.setInterval(() => setNowMs(Date.now()), 1000)
    return () => window.clearInterval(interval)
  }, [])

  const roundReads = useReadContracts({
    contracts: [
      {
        address: contractAddress,
        abi: LAST_HERO_ABI,
        functionName: 'currentRound',
        chainId: LITVM_CHAIN_ID
      },
      {
        address: contractAddress,
        abi: LAST_HERO_ABI,
        functionName: 'devWallet',
        chainId: LITVM_CHAIN_ID
      }
    ],
    query: {
      enabled: isContractConfigured,
      refetchInterval: 10_000
    }
  })

  const currentRound = useMemo(() => {
    const current = roundReads.data?.[0]
    return current?.status === 'success'
      ? normalizeCurrentRound(current.result as readonly unknown[])
      : undefined
  }, [roundReads.data])

  const devWallet = roundReads.data?.[1]?.status === 'success'
    ? (roundReads.data[1].result as Address)
    : undefined

  const remaining = currentRound ? secondsRemaining(currentRound.endsAt, nowMs) : 0
  const expired = currentRound ? currentRound.expired || remaining === 0 : false
  const pending = Boolean(pendingHash)

  useEffect(() => {
    if (!currentRound || remaining <= 0 || remaining > 60) return
    if (lastBeepSecond.current === remaining) return
    lastBeepSecond.current = remaining
    playTickSound(audioEnabled)
  }, [audioEnabled, currentRound, remaining])

  const buyButtonState = getBuyButtonState({
    isConfigured: isContractConfigured,
    isConnected,
    wrongNetwork,
    expired,
    isPending: pending,
    balance: balance?.value,
    ticketPrice: TICKET_PRICE_WEI
  })

  const buyData = useMemo(
    () => encodeFunctionData({ abi: LAST_HERO_ABI, functionName: 'buyTicket' }),
    []
  )
  const endData = useMemo(
    () => encodeFunctionData({ abi: LAST_HERO_ABI, functionName: 'endRound' }),
    []
  )

  const buySimulation = useSimulateContract({
    address: contractAddress,
    abi: LAST_HERO_ABI,
    functionName: 'buyTicket',
    chainId: LITVM_CHAIN_ID,
    value: TICKET_PRICE_WEI,
    query: {
      enabled:
        isContractConfigured &&
        isConnected &&
        !wrongNetwork &&
        !expired &&
        balance?.value !== undefined &&
        balance.value >= TICKET_PRICE_WEI
    }
  })

  const endSimulation = useSimulateContract({
    address: contractAddress,
    abi: LAST_HERO_ABI,
    functionName: 'endRound',
    chainId: LITVM_CHAIN_ID,
    query: {
      enabled: isContractConfigured && isConnected && !wrongNetwork && expired
    }
  })

  const buyGas = useEstimateGas({
    account: address,
    chainId: LITVM_CHAIN_ID,
    to: contractAddress,
    value: TICKET_PRICE_WEI,
    data: buyData,
    query: {
      enabled: dialog === 'buy' && isContractConfigured && isConnected && !wrongNetwork && !expired
    }
  })

  const endGas = useEstimateGas({
    account: address,
    chainId: LITVM_CHAIN_ID,
    to: contractAddress,
    data: endData,
    query: {
      enabled: dialog === 'end' && isContractConfigured && isConnected && !wrongNetwork && expired
    }
  })

  const { writeContractAsync, isPending: walletPending } = useWriteContract()
  const receipt = useWaitForTransactionReceipt({
    hash: pendingHash,
    chainId: LITVM_CHAIN_ID,
    query: { enabled: Boolean(pendingHash) }
  })

  const endedEvents = useContractEvents<RoundEndedArgs>({
    address: contractAddress,
    abi: LAST_HERO_ABI,
    eventName: 'RoundEnded',
    chainId: LITVM_CHAIN_ID,
    fromBlock: contractDeployBlock,
    query: { enabled: isContractConfigured }
  })

  const cancelledEvents = useContractEvents<RoundCancelledArgs>({
    address: contractAddress,
    abi: LAST_HERO_ABI,
    eventName: 'RoundCancelled',
    chainId: LITVM_CHAIN_ID,
    fromBlock: contractDeployBlock,
    query: { enabled: isContractConfigured }
  })

  const historyRows = useMemo<HistoryRow[]>(() => {
    const ended = (endedEvents.data ?? []).map((log) => {
      const args = log.args
      return {
        id: logId(log),
        roundId: args.roundId,
        winner: args.winner,
        pot: args.pot,
        ticketCount: args.ticketCount,
        timestamp: args.finalizedAt,
        txHash: log.transactionHash
      } satisfies HistoryRow
    })
    const cancelled = (cancelledEvents.data ?? []).map((log) => {
      const args = log.args
      return {
        id: logId(log),
        roundId: args.roundId,
        pot: 0n,
        ticketCount: 0n,
        timestamp: args.finalizedAt,
        txHash: log.transactionHash,
        cancelled: true
      } satisfies HistoryRow
    })
    return [...ended, ...cancelled].sort((a, b) => Number(b.roundId - a.roundId))
  }, [cancelledEvents.data, endedEvents.data])

  useWatchContractEvent({
    address: contractAddress,
    abi: LAST_HERO_ABI,
    eventName: 'TicketPurchased',
    chainId: LITVM_CHAIN_ID,
    onLogs(logs) {
      logs.forEach((log) => {
        const args = log.args as TicketPurchasedArgs
        addFeedItem(
          ticketFeedItem({
            roundId: args.roundId,
            buyer: args.buyer,
            paid: args.paid,
            purchasedAt: args.purchasedAt,
            txHash: log.transactionHash,
            logIndex: log.logIndex
          })
        )
      })
      roundReads.refetch()
      endedEvents.refetch()
      cancelledEvents.refetch()
    }
  })

  useWatchContractEvent({
    address: contractAddress,
    abi: LAST_HERO_ABI,
    eventName: 'RoundEnded',
    chainId: LITVM_CHAIN_ID,
    onLogs(logs) {
      logs.forEach((log) => {
        const args = log.args as RoundEndedArgs
        addFeedItem({
          id: logId(log),
          kind: 'round-ended',
          address: args.winner,
          roundId: args.roundId,
          amount: args.prize,
          timestamp: args.finalizedAt,
          txHash: log.transactionHash
        })
      })
      playRoundEndSound(audioEnabled)
      roundReads.refetch()
      endedEvents.refetch()
      cancelledEvents.refetch()
    }
  })

  useWatchContractEvent({
    address: contractAddress,
    abi: LAST_HERO_ABI,
    eventName: 'RoundCancelled',
    chainId: LITVM_CHAIN_ID,
    onLogs(logs) {
      logs.forEach((log) => {
        const args = log.args as RoundCancelledArgs
        addFeedItem({
          id: logId(log),
          kind: 'round-cancelled',
          roundId: args.roundId,
          timestamp: args.finalizedAt,
          txHash: log.transactionHash
        })
      })
      roundReads.refetch()
      endedEvents.refetch()
      cancelledEvents.refetch()
    }
  })

  useEffect(() => {
    if (!receipt.data || !pendingAction) return
    if (pendingAction === 'buy') {
      addToast({ kind: 'success', title: 'Ticket confirmed', message: 'You are the current hero.' })
      playTicketSound(audioEnabled)
      navigator.vibrate?.(18)
      confetti({
        particleCount: 70,
        spread: 58,
        origin: { y: 0.78 },
        colors: ['#00FFCC', '#8A2BE2', '#FF003C']
      })
    } else {
      const decoded = receipt.data.logs
        .map((log) => {
          try {
            return decodeEventLog({
              abi: LAST_HERO_ABI,
              data: log.data,
              topics: log.topics
            })
          } catch {
            return undefined
          }
        })
        .find((event) => event?.eventName === 'RoundEnded' || event?.eventName === 'RoundCancelled')

      if (decoded?.eventName === 'RoundEnded') {
        const args = decoded.args as RoundEndedArgs
        setWinnerReveal({
          roundId: args.roundId,
          winner: args.winner,
          pot: args.pot,
          prize: args.prize,
          txHash: receipt.data.transactionHash
        })
      } else if (decoded?.eventName === 'RoundCancelled') {
        const args = decoded.args as RoundCancelledArgs
        setWinnerReveal({
          roundId: args.roundId,
          pot: 0n,
          txHash: receipt.data.transactionHash
        })
      }
      addToast({ kind: 'success', title: 'Round finalized', message: 'Next round is live.' })
      playRoundEndSound(audioEnabled)
      navigator.vibrate?.([20, 40, 20])
    }
    roundReads.refetch()
    endedEvents.refetch()
    cancelledEvents.refetch()
    setPendingAction(undefined)
    setPendingHash(undefined)
  }, [
    addToast,
    audioEnabled,
    cancelledEvents,
    endedEvents,
    pendingAction,
    receipt.data,
    roundReads,
    setWinnerReveal
  ])

  useEffect(() => {
    if (!receipt.error || !pendingAction) return
    addToast({ kind: 'error', title: 'Transaction failed', message: humanizeError(receipt.error) })
    setPendingAction(undefined)
    setPendingHash(undefined)
  }, [addToast, pendingAction, receipt.error])

  async function executeDialogAction() {
    if (!dialog || !contractAddress) return
    try {
      const hash =
        dialog === 'buy'
          ? await writeContractAsync({
              address: contractAddress,
              abi: LAST_HERO_ABI,
              functionName: 'buyTicket',
              chainId: LITVM_CHAIN_ID,
              value: TICKET_PRICE_WEI
            })
          : await writeContractAsync({
              address: contractAddress,
              abi: LAST_HERO_ABI,
              functionName: 'endRound',
              chainId: LITVM_CHAIN_ID
            })
      setPendingAction(dialog)
      setPendingHash(hash)
      setDialog(undefined)
    } catch (error) {
      addToast({
        kind: /cancelled|rejected/i.test(humanizeError(error)) ? 'warning' : 'error',
        title: humanizeError(error),
        message: 'Wallet request closed.'
      })
    }
  }

  const simulationError = dialog === 'buy' ? buySimulation.error || buyGas.error : endSimulation.error || endGas.error
  const simulationReady =
    dialog === 'buy'
      ? Boolean(buySimulation.data && !buySimulation.error)
      : Boolean(endSimulation.data && !endSimulation.error)
  const gas = dialog === 'buy' ? buyGas.data : endGas.data

  return (
    <div className="min-h-screen overflow-hidden bg-void text-platinum">
      <ParticleBackdrop />
      <div className="fixed inset-0 -z-30 bg-[linear-gradient(115deg,rgba(0,255,204,.11),transparent_28%,rgba(138,43,226,.08)_48%,transparent_66%),linear-gradient(180deg,#000,#070707_44%,#10001d)]" />
      <div className="fixed inset-0 -z-10 bg-grid-lines bg-[length:42px_42px] opacity-[0.08]" />
      <Header balance={balance?.value} audioEnabled={audioEnabled} onToggleAudio={toggleAudio} />

      <main className="mx-auto grid w-full max-w-7xl gap-5 px-4 pb-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8">
        <section className="min-w-0 space-y-5">
          {!isContractConfigured ? (
            <StatusBanner
              tone="danger"
              title="Contract address missing"
              detail="Set VITE_CONTRACT_ADDRESS in frontend/.env."
            />
          ) : null}
          {wrongNetwork ? (
            <StatusBanner
              tone="warning"
              title="Wrong network"
              detail="Switch wallet to LitVM LiteForge chain 4441."
              action={
                <button
                  className="secondary-button"
                  onClick={() => switchChain({ chainId: litvmLiteForge.id })}
                  disabled={switching}
                >
                  {switching ? <Loader2 size={16} className="animate-spin" /> : <RotateCw size={16} />}
                  Switch
                </button>
              }
            />
          ) : null}

          <motion.section
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="relative overflow-hidden rounded border border-cyan/20 bg-black/45 p-4 shadow-neon backdrop-blur-2xl md:p-7"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan to-transparent" />
            {!isContractConfigured ? (
              <ConfigState />
            ) : roundReads.isLoading ? (
              <SkeletonGame />
            ) : currentRound ? (
              <div className="grid items-center gap-8 xl:grid-cols-[360px_1fr]">
                <CountdownRing startedAt={currentRound.startedAt} endsAt={currentRound.endsAt} nowMs={nowMs} />
                <div className="space-y-6">
                  <div>
                    <div className="font-mono text-[0.72rem] uppercase tracking-[0.38em] text-platinum/45">
                      Round {currentRound.id.toString()}
                    </div>
                    <h1 className="mt-3 max-w-[320px] break-words font-display text-[2.05rem] font-black leading-[1.08] tracking-normal text-platinum sm:max-w-3xl sm:text-5xl md:text-6xl">
                      Last wallet before zero takes the arena.
                    </h1>
                  </div>
                  <AnimatedPot pot={currentRound.pot} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <LastHeroCard hero={currentRound.hero} tickets={currentRound.tickets} />
                    <div className="glass-panel grid content-between gap-5 p-5">
                      <div>
                        <div className="font-mono text-[0.7rem] uppercase tracking-[0.34em] text-platinum/55">
                          Ticket
                        </div>
                        <div className="mt-3 font-display text-3xl font-black text-cyan">0.01 zkLTC</div>
                        <div className="mt-2 font-mono text-xs text-platinum/50">
                          Winner split 90% / dev 10%
                        </div>
                      </div>
                      {balance?.value !== undefined && balance.value < TICKET_PRICE_WEI ? (
                        <div className="rounded border border-glitch/40 bg-glitch/10 p-3 font-mono text-xs text-glitch">
                          Need exactly {formatZkLtc(TICKET_PRICE_WEI)} zkLTC plus gas.
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      className="neon-button min-h-12 justify-center text-base"
                      disabled={buyButtonState.disabled}
                      onClick={() => setDialog('buy')}
                    >
                      {walletPending && dialog === 'buy' ? <Loader2 className="animate-spin" size={19} /> : <Ticket size={19} />}
                      {buyButtonState.label}
                    </button>
                    <button
                      className={expired ? 'danger-button min-h-12 justify-center text-base' : 'secondary-button min-h-12 justify-center text-base'}
                      disabled={!isContractConfigured || !isConnected || wrongNetwork || !expired || pending}
                      onClick={() => setDialog('end')}
                    >
                      <TimerReset size={19} />
                      End round
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <StatusBanner
                tone="danger"
                title="Unable to read game"
                detail={humanizeError(roundReads.error)}
              />
            )}
          </motion.section>

          <HistoryTable
            rows={historyRows}
            currentRound={
              currentRound
                ? {
                    roundId: currentRound.id,
                    hero: currentRound.hero,
                    pot: currentRound.pot,
                    ticketCount: currentRound.tickets,
                    expired
                  }
                : undefined
            }
          />
        </section>

        <section className="min-w-0 space-y-5">
          <LiveFeed feed={feed} />
          <div className="glass-panel p-4">
            <div className="mb-3 flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.28em] text-platinum/55">
              <Zap size={15} className="text-cyan" />
              Chain Matrix
            </div>
            <div className="space-y-3 font-mono text-xs text-platinum/62">
              <Metric label="Network" value="LitVM LiteForge" />
              <Metric label="Chain ID" value="4441" />
              <Metric label="Contract" value={contractAddress ? formatAddress(contractAddress) : 'not set'} />
              <Metric label="Dev wallet" value={devWallet ? formatAddress(devWallet) : 'loading'} />
            </div>
          </div>
        </section>
      </main>

      <ActionModal
        open={Boolean(dialog)}
        kind={dialog || 'buy'}
        gas={gas}
        simulationError={simulationError}
        ready={simulationReady}
        pending={walletPending || pending}
        onClose={() => setDialog(undefined)}
        onConfirm={executeDialogAction}
      />
      <WinnerModal />
      <ToastStack />
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3 last:border-0 last:pb-0">
      <span className="text-platinum/42">{label}</span>
      <span className="text-right text-cyan">{value}</span>
    </div>
  )
}

function StatusBanner({
  title,
  detail,
  tone,
  action
}: {
  title: string
  detail: string
  tone: 'warning' | 'danger'
  action?: ReactNode
}) {
  return (
    <div
      className={`glass-panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between ${
        tone === 'danger' ? 'border-glitch/40' : 'border-violet/45'
      }`}
    >
      <div className="flex items-start gap-3">
        {tone === 'danger' ? (
          <ShieldAlert className="mt-0.5 text-glitch" size={20} />
        ) : (
          <AlertTriangle className="mt-0.5 text-violet" size={20} />
        )}
        <div>
          <div className="font-display text-base font-bold text-platinum">{title}</div>
          <div className="mt-1 font-mono text-xs text-platinum/55">{detail}</div>
        </div>
      </div>
      {action}
    </div>
  )
}

function ConfigState() {
  return (
    <div className="grid items-center gap-8 xl:grid-cols-[320px_minmax(0,1fr)]">
      <div className="grid aspect-square w-full max-w-[240px] place-items-center rounded-full border border-cyan/25 bg-cyan/[0.04] shadow-neon sm:mx-auto sm:max-w-[300px]">
        <div className="text-center">
          <div className="font-display text-5xl font-black text-cyan">00</div>
          <div className="mt-2 font-mono text-[0.68rem] uppercase tracking-[0.34em] text-platinum/45">
            deploy
          </div>
        </div>
      </div>
      <div className="min-w-0 space-y-5">
        <div>
          <div className="font-mono text-[0.72rem] uppercase tracking-[0.34em] text-platinum/45">
            Contract pending
          </div>
          <h1 className="mt-3 max-w-[330px] font-display text-3xl font-black leading-tight tracking-normal text-platinum sm:max-w-3xl sm:text-4xl md:text-6xl">
            Deploy the arena, then paste the address.
          </h1>
        </div>
        <div className="glass-panel max-w-[330px] p-5 sm:max-w-none">
          <div className="font-mono text-[0.7rem] uppercase tracking-[0.28em] text-cyan/60">
            frontend/.env
          </div>
          <div className="mt-3 break-all font-mono text-sm text-platinum/70">
            VITE_CONTRACT_ADDRESS=0x...
          </div>
        </div>
      </div>
    </div>
  )
}

function SkeletonGame() {
  return (
    <div className="grid gap-8 xl:grid-cols-[360px_1fr]">
      <div className="mx-auto aspect-square w-full max-w-[330px] animate-pulse rounded-full border border-cyan/20 bg-cyan/5" />
      <div className="space-y-5">
        <div className="h-5 w-32 animate-pulse rounded bg-white/10" />
        <div className="h-24 max-w-2xl animate-pulse rounded bg-white/10" />
        <div className="h-20 w-64 animate-pulse rounded bg-cyan/10" />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="h-32 animate-pulse rounded bg-white/10" />
          <div className="h-32 animate-pulse rounded bg-white/10" />
        </div>
      </div>
    </div>
  )
}
