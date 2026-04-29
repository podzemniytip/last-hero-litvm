import '@rainbow-me/rainbowkit/styles.css'

import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { WagmiProvider } from 'wagmi'
import { litvmLiteForge } from './chains'
import { walletConnectProjectId } from './env'

export const wagmiConfig = getDefaultConfig({
  appName: 'Last Hero',
  projectId: walletConnectProjectId,
  chains: [litvmLiteForge],
  ssr: false
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 8_000,
      refetchOnWindowFocus: true,
      retry: 2
    }
  }
})

const cyberpunkTheme = darkTheme({
  accentColor: '#00FFCC',
  accentColorForeground: '#001511',
  borderRadius: 'small',
  fontStack: 'system',
  overlayBlur: 'small'
})

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider modalSize="compact" theme={cyberpunkTheme}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
