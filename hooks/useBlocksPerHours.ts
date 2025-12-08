import { getPC } from '@/providers/publicClient'
import { useQuery } from '@tanstack/react-query'

export function useBlocksPerHours(chain: number) {
  return useQuery({
    queryKey: ['blocksPerHours:', chain],
    refetchOnMount: 'always',
    staleTime: 2 * 60 * 60 * 1000,
    queryFn: async () => {
      const pc = getPC(chain, 0)
      const blockLatest = await pc.getBlockNumber({ cacheTime: 2 * 60 * 60 * 1000 })
      const [{ timestamp: timeLastest }, { timestamp: timeSub }] = await Promise.all([
        pc.getBlock({ blockNumber: blockLatest }),
        pc.getBlock({ blockNumber: blockLatest - 10000n }),
      ])
      const blocksPerHours = (10000n * 60n * 60n) / (timeLastest - timeSub)
      console.info('chian:blocksPerHours:', chain, blocksPerHours)
      return blocksPerHours
    },
  })
}
