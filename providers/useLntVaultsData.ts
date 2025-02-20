import { LntVaultConfig } from '@/config/lntvaults'
import { proxyGetDef, retry, sleep } from '@/lib/utils'
import _ from 'lodash'
import { useEffect, useMemo } from 'react'
import { Address } from 'viem'
import { useAccount } from 'wagmi'
import { LntVaultDTO, LntVaultEpochDTO, LntVaultUserNftStatDTO } from './sliceLntVaultsStore'
import { BoundStoreType, useBoundStore, useStore } from './useBoundStore'
import { DECIMAL } from '@/constants'
import { displayBalance } from '@/utils/display'

export function useResetBVaultsData() {
  const { address } = useAccount()
  useEffect(() => {
    // useBoundStore.getState().
  }, [address])
}

export function useLntVault(vault: Address) {
  return useStore(
    (s) =>
      s.sliceLntVaultsStore.vaults[vault] ||
      proxyGetDef<Exclude<BoundStoreType['sliceLntVaultsStore']['vaults'][Address], undefined>>({ current: proxyGetDef<LntVaultEpochDTO>({}, 0n) }, 0n),
    [`sliceLntVaultsStore.vaults.${vault}`],
  )
}

export function useLntVaultEpoches(vault: Address) {
  return useStore(
    (s: BoundStoreType) => {
      const bvd = s.sliceLntVaultsStore.vaults[vault]
      if (!bvd || bvd.epochCount <= 0n) return []
      const ids = _.range(1, parseInt((bvd.epochCount + 1n).toString())).reverse()
      const epochesMap = s.sliceLntVaultsStore.epoches
      return ids.map((eppchId) => epochesMap[`${vault}_${eppchId}`]).filter((item) => item != null)
    },
    [`sliceLntVaultsStore.vaults.${vault}`, 'sliceLntVaultsStore.epoches'],
  )
}

export function useUserLntVaultEpoches(vault: Address) {
  return useStore((s) => s.sliceLntVaultsStore.userEpoches[vault] || [], [`sliceLntVaultsStore.userEpoches.${vault}`])
}

export function useLntEpochesData(vault: Address) {
  const epochs = useLntVaultEpoches(vault)
  const userEpochs = useUserLntVaultEpoches(vault)
  return useMemo(() => {
    const userEpochsMap = userEpochs.reduce<{ [k: string]: (typeof userEpochs)[number] }>((map, item) => ({ ...map, [item.epochId.toString()]: item }), {})
    return epochs.map((ep) => proxyGetDef({ ...ep!, ...(userEpochsMap[ep!.epochId.toString()] || { opt1: [], opt2: [] }) }, 0n))
  }, [epochs, userEpochs])
}

export function useUpLntVaultForUserAction(bvc: LntVaultConfig, onUserAction?: () => void) {
  const { address } = useAccount()
  return () => {
    retry(
      async () => {
        onUserAction?.()
        if (!address) return
        await Promise.all([
          useBoundStore.getState().sliceTokenStore.updateTokensBalance([bvc.vToken, bvc.vestingToken], address),
          useBoundStore.getState().sliceTokenStore.updateNftBalance([bvc.asset], address),
          useBoundStore.getState().sliceTokenStore.updateTokenTotalSupply([bvc.vToken, bvc.vestingToken]),
          useBoundStore.getState().sliceLntVaultsStore.updateLntVaults([bvc]),
          useBoundStore.getState().sliceLntVaultsStore.updateUserNftStat(bvc, address),
        ])

        const bvd = useBoundStore.getState().sliceLntVaultsStore.vaults[bvc.vault]!
        if (bvd.epochCount > 0n) {
          await useBoundStore.getState().sliceLntVaultsStore.updateEpoches(bvc, bvd.epochCount > 1n ? [bvd.epochCount, bvd.epochCount - 1n] : [bvd.epochCount])
          await useBoundStore.getState().sliceLntVaultsStore.updateUserEpoches(bvc, address)
        }
      },
      3,
      1000,
    )
  }
}

export function calcLntVaultBoost(vault: Address) {
  const s = useBoundStore.getState()
  const bvd = s.sliceLntVaultsStore.vaults[vault]
  const vualtYTokenBalance = bvd?.current.vaultYTokenBalance || 0n
  const Y = bvd?.Y || 0n
  const ytAssetPriceBnReverse = Y > 0n ? (vualtYTokenBalance * DECIMAL) / Y : 0n
  // const ytAssetPriceBn = vualtYTokenBalance > 0n ? (bvd.Y * DECIMAL) / vualtYTokenBalance : 0n
  const yTokenAmountForSwapYT = (bvd?.current.yTokenTotalSupply || 0n) - (bvd?.current.vaultYTokenBalance || 0n)
  const lockedAssetTotal = bvd?.nftVtAmount || 0n
  const oneYTYieldOfAsset = yTokenAmountForSwapYT > 0n ? (lockedAssetTotal * DECIMAL) / yTokenAmountForSwapYT : 0n
  // bvd?.current.
  // const boost = bvd && bvd.current.assetTotalSwapAmount > 0n ? (bvd.lockedAssetTotal * 100n) / bvd.current.assetTotalSwapAmount : 100000n

  console.info('calcBootst:', displayBalance(ytAssetPriceBnReverse), displayBalance(oneYTYieldOfAsset))
  const boost = (oneYTYieldOfAsset * ytAssetPriceBnReverse) / DECIMAL
  return boost
}
export function useLntVaultBoost(vault: Address): [string, bigint] {
  const boost = useStore(() => calcLntVaultBoost(vault), [`sliceLntVaultsStore.vaults.${vault}`])
  return [displayBalance(boost, 0), boost]
}

export function useLntVaultNftStat(vault: Address) {
  return useStore((s) => s.sliceLntVaultsStore.userNftStat[vault] || [], [`sliceLntVaultsStore.userNftStat.${vault}`])
}

export function calcVtAmountBy(vd: LntVaultDTO, startTime: bigint) {
  if (!vd.initialized) return 0n
  const endTime = vd.nftVestingEndTime
  const duration = vd.nftVestingDuration
  const vtAmountTotal = vd.nftVtAmount
  let leadTime = endTime - startTime
  leadTime < 0n && (leadTime = 0n)
  leadTime > duration && (leadTime = duration)
  const vtAmount = duration > 0n ? (leadTime * vtAmountTotal) / duration : 0n
  // console.info('vtAmount:' , leadTime, endTime, duration, vtAmountTotal, item.claimableTime, item.startTime)
  return vtAmount
}

export function calcItemVtAmount(vd: LntVaultDTO, item: LntVaultUserNftStatDTO) {
  return calcVtAmountBy(vd, item.stat == 'Deposited' ? item.claimableTime : item.startTime)
}

export function calcDepositVtAmountBy(vd: LntVaultDTO, count: number) {
  if (count == 0) return 0n
  const claimableTime = BigInt(Math.round(_.now() / 1000)) + vd.NftDepositLeadingTime + 1n
  return calcVtAmountBy(vd, claimableTime) * BigInt(count)
}

export function calcRedeemVtAmountBy(vd: LntVaultDTO, count: number) {
  if (count == 0) return 0n
  return calcVtAmountBy(vd, BigInt(Math.round(_.now() / 1000))) * BigInt(count)
}
