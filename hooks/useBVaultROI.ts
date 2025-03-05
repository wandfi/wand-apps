import { abiAdhocBribesPool, abiBVault, abiRedeemPool } from '@/config/abi'
import { getCurrentChainId } from '@/config/network'
import { DECIMAL, YEAR_SECONDS } from '@/constants'
import { getBigint } from '@/lib/utils'
import { getPC } from '@/providers/publicClient'
import { useBoundStore } from '@/providers/useBoundStore'
import { useBVault } from '@/providers/useBVaultsData'
import { useQuery } from '@tanstack/react-query'
import _ from 'lodash'
import { Address, formatEther, parseAbi } from 'viem'

export function useBVaultIPAssets(vault: Address) {
  return useQuery({
    initialData: [],
    queryKey: ['bvualtipassets', vault],
    enabled: Boolean(vault),
    queryFn: async () => {
      const ipAssets = await getPC().readContract({ abi: abiBVault, address: vault, functionName: 'ipAssets' })
      console.info('ipAssets:', ipAssets)
      return ipAssets
    },
  })
}

const abiIpAssetStaking = parseAbi([
  'struct UserStakeAmountDetail { address stakeTokenAddress; uint256 amount; uint8 lockup; uint256 lastStakeTimestamp;}',
  'function getUserStakeAmountForIP(address _ipAsset, address _user) external view returns (UserStakeAmountDetail[][] memory)',
  'function getTotalStakeWeightedInIPForIP(address _ipAsset) external view returns (uint256)',
  'struct RewardPoolState {address rewardToken;uint8 rewardTokenType;uint8 distributionType;uint256 rewardsPerEpoch;uint256 rewardPerToken;uint256 totalRewards;uint256 totalDistributedRewards;uint256 lastEpochBlock;}',
  'function getRewardPools(address _ipAsset) external view returns (RewardPoolState[][] memory)',
])

// const addressRestaking = '0xE884e394218Add9D5972B87291C2743401F88546'
const addressIpAssetStaking = '0xe9be8e0Bd33C69a9270f8956507a237884dff3BE'
// 导出一个函数 useBVaultUnderlyingAPY，用于获取特定vault的底层资产年化收益率（APY）
export function useBVaultUnderlyingAPY(vault: Address) {
  const { data: ipAssets } = useBVaultIPAssets(vault)
  return useQuery({
    initialData: 0n,

    queryKey: ['bvualtunderlyingapy', vault, ipAssets],
    enabled: Boolean(vault) && ipAssets.length > 0,
    gcTime: 60 * 60 * 1000,
    queryFn: async () => {
      const pc = getPC(getCurrentChainId(), 1)
      const multiplier = 4n
      const SECONDS_PER_YEAR = 60n * 60n * 24n * 365n
      const SCALE = BigInt(1e18) * BigInt(1e18) // Increased precision scaling factor
      const DIVISOR = BigInt(25e17) // Equivalent to 2.5 in 1e18 fixed point
      const apyByIpAsset = async (ipAsset: Address) => {
        const totalStake = await pc.readContract({
          abi: abiIpAssetStaking,
          functionName: 'getTotalStakeWeightedInIPForIP',
          address: addressIpAssetStaking,
          args: [ipAsset],
        })
        const rewardPools = await pc.readContract({
          abi: abiIpAssetStaking,
          functionName: 'getRewardPools',
          address: addressIpAssetStaking,
          args: [ipAsset],
        })
        let cumulativeRewardsPerEpoch = 0n
        rewardPools.forEach((item) => {
          item.forEach((rp) => {
            if (rp.totalRewards > rp.totalDistributedRewards) {
              cumulativeRewardsPerEpoch += rp.rewardsPerEpoch
            }
          })
        })
        const apy = (cumulativeRewardsPerEpoch * SECONDS_PER_YEAR * SCALE) / (totalStake * DIVISOR)
        return apy * multiplier
      }
      const apys = await Promise.all(ipAssets.map(apyByIpAsset))
      const stakeed = await Promise.all(
        ipAssets.map((ipAsset) =>
          pc.readContract({
            abi: abiIpAssetStaking,
            functionName: 'getUserStakeAmountForIP',
            address: addressIpAssetStaking,
            args: [ipAsset, vault],
          }),
        ),
      )

      const staked = stakeed.map((item) => item.find((s) => s.length)?.find((s) => !!s))
      console.info('staked:', staked)
      const avrageApy = apys.map((apy, i) => apy * (staked?.[i]?.amount || 0n)).reduce((sum, apy) => sum + apy, 0n) / staked.reduce((sum, s) => sum + (s?.amount || 0n), 0n)
      return avrageApy
    },
  })
}

export function useYTPoints(vault: Address) {
  const bvd = useBVault(vault)
  return useQuery({
    initialData: 0n,
    gcTime: 60 * 60 * 1000,
    queryKey: ['ytPoints', vault, bvd.current.adhocBribesPool],
    enabled: Boolean(vault) && Boolean(bvd.current.adhocBribesPool),
    queryFn: async () => {
      const pc = getPC()
      return pc.readContract({ abi: abiAdhocBribesPool, address: bvd.current.adhocBribesPool, functionName: 'totalSupply' })
    },
  })
}

export function calcRestakingApy(underlyingApy: bigint, ptTotal: bigint, remainTime: bigint, ytAmount: bigint, ytPrice: bigint) {
  const S = (ptTotal * underlyingApy * remainTime) / DECIMAL / YEAR_SECONDS
  const T = ytAmount > 0n ? (S * DECIMAL) / ytAmount : 0n
  const restakingIncomesApy = ytPrice > 0n ? (T * DECIMAL) / ytPrice : 0n
  return restakingIncomesApy
}

export function calcAdditionalApy(ytPoints: bigint, ytAmount: bigint, remainTime: bigint, ytPrice: bigint) {
  const YTp = ytPoints + ytAmount * remainTime
  const A = 1000n * DECIMAL
  const B = YTp > 0n ? (A * DECIMAL) / YTp : 0n
  const P = DECIMAL * remainTime
  const I = (B * P) / DECIMAL
  const additionalRoi = ytPrice > 0n ? (I * DECIMAL) / ytPrice : 0n
  return additionalRoi
}
export function useBvaultROI(vault: Address, ytchange: bigint = 0n) {
  const bvd = useBVault(vault)
  // restaking incomes
  const { data: underlyingApy } = useBVaultUnderlyingAPY(vault)
  const ytAmount = bvd.current.yTokenAmountForSwapYT
  const vualtYTokenBalance = bvd.current.vaultYTokenBalance
  const remainTime = bvd.current.duration + bvd.current.startTime - BigInt(_.round(_.now() / 1000))
  const ptTotal = bvd.pTokenTotal
  const ytAssetPriceBn = vualtYTokenBalance > 0n ? (bvd.Y * DECIMAL) / vualtYTokenBalance : 0n
  const ytPriceChanged = vualtYTokenBalance > 0n ? (bvd.Y * DECIMAL) / (vualtYTokenBalance - ytchange) : 0n
  const restakingIncomesApy = calcRestakingApy(underlyingApy, ptTotal, remainTime, ytAmount, ytAssetPriceBn)
  const restakingChangedApy = ytchange > 0n ? calcRestakingApy(underlyingApy, ptTotal, remainTime, ytAmount + ytchange, ytPriceChanged) : 0n

  // aditional airdrops
  const { data: ytPoints } = useYTPoints(vault)
  const additionalRoi = calcAdditionalApy(ytPoints, ytAmount, remainTime, ytAssetPriceBn)
  const additionalRoiChanged = ytchange > 0n ? calcAdditionalApy(ytPoints, ytAmount + ytchange, remainTime, ytPriceChanged) : 0n
  return [restakingIncomesApy, additionalRoi, restakingChangedApy, additionalRoiChanged]
}
