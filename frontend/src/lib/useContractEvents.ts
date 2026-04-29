import { useQuery } from '@tanstack/react-query'
import { usePublicClient } from 'wagmi'
import type { Abi, Address } from 'viem'

export type ContractEventLog<TArgs extends Record<string, unknown> = Record<string, unknown>> = {
  args: TArgs
  transactionHash?: `0x${string}`
  logIndex?: number
}

export function useContractEvents<TArgs extends Record<string, unknown>>({
  address,
  abi,
  eventName,
  chainId,
  fromBlock,
  query
}: {
  address?: Address
  abi: Abi
  eventName: string
  chainId: number
  fromBlock: bigint
  query?: { enabled?: boolean; refetchInterval?: number }
}) {
  const publicClient = usePublicClient({ chainId })

  return useQuery({
    queryKey: ['contract-events', chainId, address, eventName, fromBlock.toString()],
    enabled: Boolean(query?.enabled && address && publicClient),
    refetchInterval: query?.refetchInterval,
    queryFn: async () => {
      if (!address || !publicClient) return []
      const logs = await publicClient.getContractEvents({
        address,
        abi,
        eventName,
        fromBlock,
        toBlock: 'latest'
      } as never)
      return logs as ContractEventLog<TArgs>[]
    }
  })
}
