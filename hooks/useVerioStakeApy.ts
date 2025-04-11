import { abiVerioStakePool } from '@/config/abi'
import { VerioStakePool } from '@/config/bvaults'
import { DECIMAL, DECIMAL_10 } from '@/constants'
import { getPC } from '@/providers/publicClient'
import { useQuery } from '@tanstack/react-query'
import { useCurrentChainId } from './useCurrentChainId'

export function useVerioStakeApy() {
  const chainId = useCurrentChainId()
  const verioStakePool = VerioStakePool[chainId]
  return useQuery<bigint>({
    initialData: 0n,
    queryKey: ['VerioStakeApy', verioStakePool],
    enabled: Boolean(verioStakePool),
    queryFn: async () => {
      const pc = getPC()
      // const [stakePoolAmount, totalStake] = await Promise.all([
      //   pc.readContract({ abi: abiVerioStakePool, address: verioStakePool, functionName: 'getStakePoolAmount' }),
      //   pc.readContract({ abi: abiVerioStakePool, address: verioStakePool, functionName: 'getTotalStake' }),
      // ])
      // // Number(formatUnits((stakePoolAmount as BigNumberish) ?? 0)) + Number(formatUnits((totalStake as BigNumberish) ?? 0))
      // const singularityIncentivePerDayInIp = 260n
      // const apy = (singularityIncentivePerDayInIp * DECIMAL * DECIMAL_10 * 365n) / (stakePoolAmount + totalStake)
      // console.info('VerioStakeApy:', fmtPercent(apy, 10))
      // return apy
      const ipTotalStake = await pc.readContract({ abi: abiVerioStakePool, address: verioStakePool, functionName: 'getTotalStake' })
      return (262750n * DECIMAL * DECIMAL_10) / ipTotalStake
      // return (294920n * DECIMAL * DECIMAL_10) / ipTotalStake
    },
  })
}
