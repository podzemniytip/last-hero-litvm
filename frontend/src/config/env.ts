import { isAddress, type Address } from 'viem'

export const LITVM_CHAIN_ID = 4441
export const DEFAULT_RPC_URL = 'https://liteforge.rpc.caldera.xyz/http'
export const DEFAULT_EXPLORER_URL = 'https://liteforge.explorer.caldera.xyz'

export const litvmRpcUrl = import.meta.env.VITE_LITVM_RPC_URL || DEFAULT_RPC_URL
export const litvmExplorerUrl =
  import.meta.env.VITE_LITVM_EXPLORER_URL || DEFAULT_EXPLORER_URL
export const walletConnectProjectId =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'last-hero-litvm-local'

const rawContractAddress = import.meta.env.VITE_CONTRACT_ADDRESS?.trim()
export const contractAddress = rawContractAddress && isAddress(rawContractAddress)
  ? (rawContractAddress as Address)
  : undefined

const deployBlockRaw = import.meta.env.VITE_CONTRACT_DEPLOY_BLOCK?.trim()
export const contractDeployBlock =
  deployBlockRaw && /^\d+$/.test(deployBlockRaw) ? BigInt(deployBlockRaw) : 0n

export const isContractConfigured = Boolean(contractAddress)
