import { abiAdhocBribesPool, abiBVault } from '@/config/abi'
import { type BVaultConfig } from '@/config/bvaults'
import { DECIMAL, YEAR_SECONDS } from '@/src/constants'
import { getPC } from '@/providers/publicClient'
import { useBVault } from '@/providers/useBVaultsData'
import { useQuery } from '@tanstack/react-query'
import _ from 'lodash'
import { type Address, parseAbi, zeroAddress } from 'viem'

export function useBVaultIPAssets(vc: BVaultConfig) {
  return useQuery({
    initialData: [],
    queryKey: ['bvualtipassets', vc.vault],
    enabled: vc.assetSymbol === 'vIP',
    queryFn: async () => {
      const ipAssets = await getPC(vc.chain).readContract({ abi: abiBVault, address: vc.vault, functionName: 'ipAssets' })
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
  '0xf12b7b0858268F9c726f9eea315eDfec161DA552': 'Drip Drip',
  '0xE8b4b3828EA3678F9BA975CBccB5D9f0c3c0cA8b': 'Nub Cat',
  '0x4D31d2417b64597Bf346f278728f3A1C7065907e': 'DaVinci',
  '0xCE11dD7008494B6b4F9DF01213F77B87A4dab579': 'Terra',
  '0x9B438f52a0A94d3D7D1325C80711FF4709571054': 'Oaisis',
  '0x5021F7438ea502b0c346cB59F8E92B749Ecd74B5': 'Variants🧬',
  '0x816453EbC9b9E55b4faF326614BfFf915e5dCc3d': 'DoubleUp',
}

export function useBVaultUnderlyingAPY(vc: BVaultConfig) {
  const vault = vc.vault
  const { data: ipAssets } = useBVaultIPAssets(vc)
  return useQuery({
    initialData: { avrageApy: 0n, items: [] },
    queryKey: ['bvualtunderlyingapy', vault, ipAssets],
    enabled: Boolean(vault) && ipAssets.length > 0 && vc.assetSymbol == 'vIP',
    gcTime: 60 * 60 * 1000,
    queryFn: async () => {
      const pc = getPC(vc.chain, 1)
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
      const apys = await Promise.all(
        ipAssets.map((ipID) =>
          pc
            .readContract({
              abi: parseAbi(['function ipAssetApy(address ipAsset) public view returns (uint256)']),
              address: '0xc0685Bb397ECa74763b8B90738ABf868a3502c21',
              functionName: 'ipAssetApy',
              args: [ipID],
            })
            .then((apy) => apy / 100n),
        ),
      )

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

export function useYTPoints(vc: BVaultConfig) {
  const bvd = useBVault(vc)
  return useQuery({
    initialData: 0n,
    gcTime: 60 * 60 * 1000,
    queryKey: ['ytPoints', vc.vault, bvd.current.adhocBribesPool],
    enabled: Boolean(bvd.current.adhocBribesPool),
    queryFn: async () => {
      const pc = getPC(vc.chain)
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
  const bvd = useBVault(vc)
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
  const { data: ytPoints } = useYTPoints(vc)
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
