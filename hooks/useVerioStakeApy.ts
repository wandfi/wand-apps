import { VerioStakePool } from '@/config/bvaults'
import { useCurrentChainId } from './useCurrentChainId'
import { useQuery } from '@tanstack/react-query'
import { getPC } from '@/providers/publicClient'
import { abiVerioStakePool } from '@/config/abi'
import { DECIMAL, DECIMAL_10 } from '@/constants'
import { fmtPercent } from '@/lib/utils'

export function useVerioStakeApy() {
  const chainId = useCurrentChainId()
  const verioStakePool = VerioStakePool[chainId]
  return useQuery<bigint>({
    initialData: 0n,
    queryKey: ['VerioStakeApy', verioStakePool],
    enabled: Boolean(verioStakePool),
    queryFn: async () => {
      const pc = getPC()
      const [stakePoolAmount, totalStake] = await Promise.all([
        pc.readContract({ abi: abiVerioStakePool, address: verioStakePool, functionName: 'getStakePoolAmount' }),
        pc.readContract({ abi: abiVerioStakePool, address: verioStakePool, functionName: 'getTotalStake' }),
      ])
      // Number(formatUnits((stakePoolAmount as BigNumberish) ?? 0)) + Number(formatUnits((totalStake as BigNumberish) ?? 0))
      const singularityIncentivePerDayInIp = 260n
      const apy = (singularityIncentivePerDayInIp * DECIMAL * DECIMAL_10 * 365n) / (stakePoolAmount + totalStake)
      console.info('VerioStakeApy:', fmtPercent(apy, 10))
      return apy
    },
  })
}
