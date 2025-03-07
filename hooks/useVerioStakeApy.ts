import { VerioStakePool } from '@/config/bvaults'
import { DECIMAL, DECIMAL_10 } from '@/constants'
import { getPC } from '@/providers/publicClient'
import { useQuery } from '@tanstack/react-query'
import { erc20Abi } from 'viem'
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
      const vipTotalSupply = await pc.readContract({ abi: erc20Abi, functionName: 'totalSupply', address: '0x5267F7eE069CEB3D8F1c760c215569b79d0685aD' })
      return (280320n * DECIMAL * DECIMAL_10) / vipTotalSupply
    },
  })
}
