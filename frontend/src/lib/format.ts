import { ethers } from 'ethers'
import { type Address } from 'viem'
import { litvmExplorerUrl } from '../config/env'

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
export const TICKET_PRICE_WEI = ethers.parseEther('0.01')

export function isZeroAddress(address?: string | null) {
  return !address || address.toLowerCase() === ZERO_ADDRESS
}

export function formatAddress(address?: string | null) {
  if (!address || isZeroAddress(address)) return '0x0000...0000'
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatZkLtc(value?: bigint | null, maximumFractionDigits = 4) {
  if (value === undefined || value === null) return '0'
  const parsed = Number(ethers.formatEther(value))
  if (!Number.isFinite(parsed)) return ethers.formatEther(value)
  return parsed.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits
  })
}

export function formatCountdown(totalSeconds: number) {
  const safe = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(safe / 3600)
  const minutes = Math.floor((safe % 3600) / 60)
  const seconds = safe % 60
  const pad = (value: number) => value.toString().padStart(2, '0')
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

export function formatRelativeTime(timestampSeconds?: bigint | number | null, nowMs = Date.now()) {
  if (timestampSeconds === undefined || timestampSeconds === null) return 'just now'
  const timestampMs = Number(timestampSeconds) * 1000
  const diffSeconds = Math.max(0, Math.floor((nowMs - timestampMs) / 1000))
  if (diffSeconds < 10) return 'just now'
  if (diffSeconds < 60) return `${diffSeconds}s ago`
  const minutes = Math.floor(diffSeconds / 60)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hr ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

export function formatGas(gas?: bigint | null) {
  if (!gas) return 'estimating'
  return `${gas.toLocaleString('en-US')} gas`
}

export function addressUrl(address: Address | string) {
  return `${litvmExplorerUrl.replace(/\/$/, '')}/address/${address}`
}

export function txUrl(hash: string) {
  return `${litvmExplorerUrl.replace(/\/$/, '')}/tx/${hash}`
}

export function humanizeError(error: unknown) {
  if (!error) return ''
  if (typeof error === 'string') return error
  if (error instanceof Error) {
    const anyError = error as Error & { shortMessage?: string; details?: string }
    const text = anyError.shortMessage || anyError.details || error.message
    if (/User rejected|rejected request|denied transaction/i.test(text)) {
      return 'Transaction cancelled'
    }
    if (/insufficient funds|exceeds balance/i.test(text)) {
      return 'Insufficient balance for ticket and gas'
    }
    if (/RoundExpired/i.test(text)) return 'Round expired. End the round first.'
    if (/RoundStillActive/i.test(text)) return 'Timer is still active.'
    if (/IncorrectTicketPrice/i.test(text)) return 'Ticket price must be exactly 0.01 zkLTC.'
    return text
  }
  return 'Unexpected error'
}
