import { abiAdhocBribesPool, abiBVault } from '@/config/abi'
import { BVaultConfig } from '@/config/bvaults'
import { getCurrentChainId } from '@/config/network'
import { DECIMAL, YEAR_SECONDS } from '@/constants'
import { getPC } from '@/providers/publicClient'
import { useBVault } from '@/providers/useBVaultsData'
import { useQuery } from '@tanstack/react-query'
import _, { flatten } from 'lodash'
import { Address, formatEther, parseAbi, parseEther, zeroAddress } from 'viem'

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

const abiIPA = parseAbi([
  'struct UserStakeAmountDetail { address stakeTokenAddress; uint256 amount; uint8 lockup; uint256 lastStakeTimestamp;}',
  'function getUserStakeAmountForIP(address _ipAsset, address _user) external view returns (UserStakeAmountDetail[][] memory)',
  'function getTotalStakeWeightedInIPForIP(address _ipAsset) external view returns (uint256)',
  'function getTotalStakeAmountForIP(address _ipAsset, address[] calldata _stakeTokens) external view returns (uint256[] memory)',
  'struct RewardPoolState {address rewardToken;uint8 rewardTokenType;uint8 distributionType;uint256 rewardsPerEpoch;uint256 rewardPerToken;uint256 totalRewards;uint256 totalDistributedRewards;uint256 lastEpochBlock;}',
  'function getRewardPools(address _ipAsset) external view returns (RewardPoolState[][] memory)',
  'function calculateIPWithdrawal(uint256 _vIPToBurn) external view returns (uint256)',
])

// const addressRestaking = '0xE884e394218Add9D5972B87291C2743401F88546'
// const addressIpAssetStaking = '0xe9be8e0Bd33C69a9270f8956507a237884dff3BE'
export const ipAssetsTit: { [k: Address]: string } = {
  '0xB1D831271A68Db5c18c8F0B69327446f7C8D0A42': 'IPPY',
  '0x0a0466c312687027E2BEa065d4Cca0DCEC19bb2C': 'Globkins',
  '0xCdF104e4F24d593E16B9F6c382cEB1FB5573EEDd': 'Mimboku',
  '0x8c40Ef7408D6036Dca0b69E67D960dd48014cB16': 'Sofamon',
  '0x00e23f81e489E43484B0B8Bc109faD6C1F4c28E7': 'Benjamin',
  '0x42A351E005De1330DeDe69Ca4Ae1B06715a2f4fA': 'WTF',
}
// 导出一个函数 useBVaultUnderlyingAPY，用于获取特定vault的底层资产年化收益率（APY）
export function useBVaultUnderlyingAPY(vc: BVaultConfig) {
  const vault = vc.vault
  const { data: ipAssets } = useBVaultIPAssets(vault)
  return useQuery({
    initialData: { avrageApy: 0n, items: [] },

    queryKey: ['bvualtunderlyingapy', vault, ipAssets],
    enabled: Boolean(vault) && ipAssets.length > 0 && vc.assetSymbol == 'vIP',
    gcTime: 60 * 60 * 1000,
    queryFn: async () => {
      const pc = getPC(getCurrentChainId(), 1)
      const multiplier = 4n
      const ratio = await pc.readContract({ abi: abiIPA, address: '0xf6701A6A20639f0E765bA7FF66FD4f49815F1a27', functionName: 'calculateIPWithdrawal', args: [parseEther('1')] })
      const blockTime = parseEther('2.367')
      const apyByIpAsset = async (ipAsset: Address) => {
        const [
          // rewardPools, 
          [totalStaked], totalStakedWeighted] = await Promise.all([
          // pc.readContract({
          //   abi: abiIPA,
          //   functionName: 'getRewardPools',
          //   address: vc.ipAssetStaking,
          //   args: [ipAsset],
          // }),
          pc.readContract({
            abi: abiIPA,
            functionName: 'getTotalStakeAmountForIP',
            address: vc.ipAssetStaking,
            args: [ipAsset, [vc.asset]],
          }),
          pc.readContract({
            abi: abiIPA,
            functionName: 'getTotalStakeWeightedInIPForIP',
            address: vc.ipAssetStaking,
            args: [ipAsset],
          }),
        ])
        // const rewardsPerEpoch = flatten(rewardPools).find((item) => item.rewardsPerEpoch > 0n)?.rewardsPerEpoch || 0n
        const rewardsPerEpoch = parseEther("0.00009")
        let baseApy = totalStakedWeighted > 0n ? (rewardsPerEpoch * YEAR_SECONDS * DECIMAL) / blockTime * DECIMAL / totalStakedWeighted : 0n
        if (totalStaked >= parseEther('100') && ratio > 0n && totalStakedWeighted > 0n) {
          baseApy += ((parseEther('7.5') * DECIMAL) / ratio) * (totalStaked * DECIMAL / totalStakedWeighted) / DECIMAL/ 100n
        }
        const apy = baseApy * multiplier
        console.info('underlyingApy:', vault, ipAsset, formatEther(apy))
        return apy
      }
      const apys = await Promise.all(ipAssets.map(apyByIpAsset))
      const stakeed = await Promise.all(
        ipAssets.map((ipAsset) =>
          pc.readContract({
            abi: abiIPA,
            functionName: 'getUserStakeAmountForIP',
            address: vc.ipAssetStaking,
            args: [ipAsset, vault],
          }),
        ),
      )

      const staked = stakeed.map((item) => item.find((s) => s.length)?.find((s) => !!s))
      const stakedAll = staked.reduce((sum, s) => sum + (s?.amount || 0n), 0n)
      const avrageApy = stakedAll > 0n ? apys.map((apy, i) => apy * (staked?.[i]?.amount || 0n)).reduce((sum, apy) => sum + apy, 0n) / stakedAll : 0n
      const items = apys
        .map((apy, i) => ({ apy, staked: staked?.[i]?.amount || 0n, ipID: ipAssets[i], tit: ipAssetsTit[ipAssets[i]] }))
        .sort((a, b) => {
          const sub = b.apy - a.apy
          return sub > 0n ? 1 : sub < 0n ? -1 : 0
        })
      console.info('staked:', vault, staked, avrageApy)
      return { avrageApy, items }
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
      if (bvd.current.adhocBribesPool === zeroAddress) return 0n
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
  // const A = 1000n * DECIMAL
  const A = 0n * DECIMAL
  const B = YTp > 0n ? (A * DECIMAL) / YTp : 0n
  const P = DECIMAL * remainTime
  const I = (B * P) / DECIMAL
  const additionalRoi = ytPrice > 0n ? (I * DECIMAL) / ytPrice : 0n
  return additionalRoi
}
export function calcAdditionalApy2(ytPointsMaxTotalSupply: bigint, remainTime: bigint, ytPrice: bigint) {
  const YTp = ytPointsMaxTotalSupply
  // const A = 1000n * DECIMAL
  const A = 0n * DECIMAL
  const B = YTp > 0n ? (A * DECIMAL) / YTp : 0n
  const P = DECIMAL * remainTime
  const I = (B * P) / DECIMAL
  const additionalRoi = ytPrice > 0n ? (I * DECIMAL) / ytPrice : 0n
  return additionalRoi
}

export function useBvaultROI(vc: BVaultConfig, ytchange: bigint = 0n, afterYtPriceBn: bigint = 0n) {
  const vault = vc.vault
  const bvd = useBVault(vault)
  // restaking incomes
  const {
    data: { avrageApy },
  } = useBVaultUnderlyingAPY(vc)
  const ytAmount = bvd.current.yTokenAmountForSwapYT
  const vualtYTokenBalance = bvd.current.vaultYTokenBalance
  const remainTime = bvd.current.duration + bvd.current.startTime - BigInt(_.round(_.now() / 1000))
  const ptTotal = bvd.pTokenTotal
  const ytAssetPriceBn = vualtYTokenBalance > 0n ? (bvd.Y * DECIMAL) / vualtYTokenBalance : 0n
  const ytPriceChanged = afterYtPriceBn
  const restakingIncomesApy = calcRestakingApy(avrageApy, ptTotal, remainTime, ytAmount, ytAssetPriceBn)
  const restakingChangedApy = ytchange > 0n ? calcRestakingApy(avrageApy, ptTotal, remainTime, ytAmount + ytchange, ytPriceChanged) : 0n

  // aditional airdrops
  const { data: ytPoints } = useYTPoints(vault)
  const additionalRoi = vc.pTokenV2 ? calcAdditionalApy2(bvd.ytPointsMaxTotalSupply, remainTime, ytAssetPriceBn) : calcAdditionalApy(ytPoints, ytAmount, remainTime, ytAssetPriceBn)
  const additionalRoiChanged =
    ytchange > 0n
      ? vc.pTokenV2
        ? calcAdditionalApy2(bvd.ytPointsMaxTotalSupply + ytchange * remainTime, remainTime, ytPriceChanged)
        : calcAdditionalApy(ytPoints, ytAmount + ytchange, remainTime, ytPriceChanged)
      : 0n
  return {
    roi: restakingIncomesApy > 0n ? restakingIncomesApy + additionalRoi - DECIMAL : 0n,
    // roi: restakingIncomesApy > 0n && additionalRoi > 0n ? restakingIncomesApy + additionalRoi - DECIMAL : 0n,
    roiChange: restakingChangedApy > 0n ? restakingChangedApy + additionalRoiChanged - DECIMAL : 0n,
    // roiChange: restakingChangedApy > 0n && additionalRoiChanged > 0n ? restakingChangedApy + additionalRoiChanged - DECIMAL : 0n,
    restakingIncomesApy,
    additionalRoi,
  }
}
