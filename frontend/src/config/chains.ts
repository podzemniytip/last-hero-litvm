import type { Chain } from 'viem'
import { DEFAULT_EXPLORER_URL, DEFAULT_RPC_URL, LITVM_CHAIN_ID, litvmExplorerUrl, litvmRpcUrl } from './env'

export const litvmLiteForge = {
  id: LITVM_CHAIN_ID,
  name: 'LitVM LiteForge',
  nativeCurrency: {
    decimals: 18,
    name: 'zkLTC',
    symbol: 'zkLTC'
  },
  rpcUrls: {
    default: { http: [litvmRpcUrl || DEFAULT_RPC_URL] },
    public: { http: [litvmRpcUrl || DEFAULT_RPC_URL] }
  },
  blockExplorers: {
    default: {
      name: 'LiteForge Explorer',
      url: litvmExplorerUrl || DEFAULT_EXPLORER_URL
    }
  },
  testnet: true
} as const satisfies Chain
