import { type BVaultConfig } from '@/config/bvaults'
import { fmtPercent, proxyGetDef, retry } from '@/lib/utils'
import { DECIMAL, YEAR_SECONDS } from '@/src/constants'
import { useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useAccount } from 'wagmi'
import { type BVaultDTO, type BVaultEpochDTO, useBVaultData, useBVaultEpoch, useBVaultsYTokenSythetic } from './sliceBVaultsStore'
import { useTokenPrices } from './sliceTokenStore'
import { useBVaultUserData } from './sliceUserBVaults'

const defBvault = proxyGetDef<BVaultDTO>({ current: proxyGetDef<BVaultEpochDTO>({}, 0n) }, 0n)
export function useBVault(vc: BVaultConfig) {
  return useBVaultData(vc).data ?? defBvault
}

export function useBvaultTVL(vc: BVaultConfig) {
  const bvd = useBVault(vc)
  const prices = useTokenPrices().data
  // console.info('lpTypes', lpBaseTvlBn, lpQuoteTvlBn , lpQuoteTvlBn == lpBaseTvlBn)
  let vaultTvlBn = ((bvd.lockedAssetTotal || 0n) * (prices[vc.assetSymbol]?.bn || 0n)) / DECIMAL

  return [vaultTvlBn, 0n, 0n]
}

export function useBVaultEpoches(vc: BVaultConfig) {
  return (useBVaultEpoch(vc).data ?? []).reverse()
}

export function useEpochesData(vc: BVaultConfig) {
  const epochs = useBVaultEpoches(vc)
  const userEpochs = useBVaultUserData(vc).data ?? []
  return useMemo(() => {
    const userEpochsMap = userEpochs.reduce<{ [k: string]: (typeof userEpochs)[number] }>((map, item) => ({ ...map, [item.epochId.toString()]: item }), {})
    return epochs.map((ep) => proxyGetDef({ ...ep!, ...(userEpochsMap[ep!.epochId.toString()] || { sBribes: [], aBribes: [] }) }, 0n))
  }, [epochs, userEpochs])
}

export function useCalcClaimable(vc: BVaultConfig) {
  const epoches = useEpochesData(vc)
  return useMemo(() => {
    const fitlerEpoches = epoches.filter((item) => item.claimableAssetBalance && item.settled)
    return {
      ids: fitlerEpoches.map((item) => item.epochId),
      claimable: fitlerEpoches.reduce((sum, item) => sum + item.claimableAssetBalance, 0n),
    }
  }, [epoches])
}

export const calcBVaultPTApy = (vc: BVaultConfig, bvd: ReturnType<typeof useBVault>, pTokenSynthetic: bigint) => {
  let apy = 0n
  if (vc.pTokenV2) {
    apy = bvd && bvd.ptRebaseRate && bvd.pTokenTotal ? ((bvd.ptRebaseRate / DECIMAL) * YEAR_SECONDS * BigInt(1e10)) / bvd.pTokenTotal / DECIMAL : 0n
  } else {
    apy = bvd && bvd.current.assetTotalSwapAmount && pTokenSynthetic > 0n ? (bvd.current.assetTotalSwapAmount * YEAR_SECONDS * BigInt(1e10)) / pTokenSynthetic : 0n
  }
  return apy
}
export function useBVaultApy(vc: BVaultConfig): [string, bigint] {
  const bvd = useBVault(vc)
  const pTokenSynthetic = useBVaultsYTokenSythetic().data?.[vc.vault] ?? 0n
  let apy = calcBVaultPTApy(vc, bvd, pTokenSynthetic)
  console.info('apy:', vc.vault, apy, vc.pTokenV2, bvd?.ptRebaseRate, bvd?.pTokenTotal)
  // const { data: stakingApy} = useVerioStakeApy()
  return [fmtPercent(apy, 10), apy]
}

export function useUpBVaultForUserAction(bvc: BVaultConfig, onUserAction?: () => void) {
  const { address } = useAccount()
  const qc = useQueryClient()
  // const chainId = useCurrentChainId()
  return () => {
    retry(
      async () => {
        onUserAction?.()
        if (!address) return
        await qc.refetchQueries({ queryKey: [bvc.vault] })
      },
      3,
      1000,
    )
  }
}
