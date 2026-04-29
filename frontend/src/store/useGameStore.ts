import { create } from 'zustand'
import type { Address } from 'viem'
import type { FeedItem } from '../lib/events'
import { prependFeedItem } from '../lib/events'

export type ToastKind = 'success' | 'error' | 'warning' | 'info'

export type ToastItem = {
  id: string
  kind: ToastKind
  title: string
  message?: string
}

export type WinnerReveal = {
  roundId: bigint
  winner?: Address
  pot: bigint
  prize?: bigint
  txHash?: string
}

type GameStore = {
  audioEnabled: boolean
  feed: FeedItem[]
  toasts: ToastItem[]
  winnerReveal?: WinnerReveal
  toggleAudio: () => void
  addFeedItem: (item: FeedItem) => void
  addToast: (toast: Omit<ToastItem, 'id'>) => void
  dismissToast: (id: string) => void
  setWinnerReveal: (winner?: WinnerReveal) => void
}

function initialAudioState() {
  if (typeof window === 'undefined') return true
  return window.localStorage.getItem('last-hero-audio') !== 'off'
}

function makeId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export const useGameStore = create<GameStore>((set, get) => ({
  audioEnabled: initialAudioState(),
  feed: [],
  toasts: [],
  winnerReveal: undefined,
  toggleAudio: () => {
    const next = !get().audioEnabled
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('last-hero-audio', next ? 'on' : 'off')
    }
    set({ audioEnabled: next })
  },
  addFeedItem: (item) => set((state) => ({ feed: prependFeedItem(state.feed, item) })),
  addToast: (toast) => {
    const id = makeId()
    set((state) => ({ toasts: [...state.toasts, { id, ...toast }].slice(-5) }))
    window.setTimeout(() => get().dismissToast(id), 5200)
  },
  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
  setWinnerReveal: (winnerReveal) => set({ winnerReveal })
}))
