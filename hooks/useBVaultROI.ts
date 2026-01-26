import { abiAdhocBribesPool, abiBVault } from '@/config/abi'
import { type BVaultConfig } from '@/config/bvaults'
import { fetRouter } from '@/lib/fetRouter'
import type { fetBVaultUnderlyingAPY } from '@/lib/fetsBVault'
import { getPC } from '@/providers/publicClient'
import { useBVault } from '@/providers/useBVaultsData'
import { DECIMAL, YEAR_SECONDS } from '@/src/constants'
import { useQuery } from '@tanstack/react-query'
import { round } from 'es-toolkit'
import { zeroAddress } from 'viem'

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
export function useBVaultUnderlyingAPY(vc: BVaultConfig) {
  return useQuery({
    initialData: { avrageApy: 0n, items: [] },
    queryKey: ['bvualtunderlyingapy', vc.vault],
    enabled: vc.assetSymbol == 'vIP',
    gcTime: 60 * 60 * 1000,
    queryFn: () => fetRouter('/api/bvault', { chain: vc.chain, vault: vc.vault, fet: 'fetBVaultUnderlyingAPY' }) as ReturnType<typeof fetBVaultUnderlyingAPY>
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
  const remainTime = bvd.current.duration + bvd.current.startTime - BigInt(round(Date.now() / 1000))
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
