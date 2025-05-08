import { abiBVault2, abiMarket } from '@/config/abi/BVault2'
import { BVault2Config } from '@/config/bvaults2'
import { DECIMAL_10 } from '@/constants'
import { useFet, useMerge } from '@/hooks/useFet'
import { aarToNumber, promiseAll, UnPromise } from '@/lib/utils'
import { getPC } from '@/providers/publicClient'
import { now } from 'lodash'
import { Address, erc20Abi, PublicClient, zeroAddress } from 'viem'

export async function getBvaut2Data(vc: BVault2Config, pc: PublicClient = getPC()) {
  return await promiseAll({
    initialized: pc.readContract({ abi: abiBVault2, address: vc.vault, functionName: 'initialized' }),
    BT: pc.readContract({ abi: abiBVault2, address: vc.vault, functionName: 'BT' }),
    Points: pc.readContract({ abi: abiBVault2, address: vc.vault, functionName: 'Points' }),
    bootstrapStartTime: pc.readContract({ abi: abiBVault2, address: vc.vault, functionName: 'bootstrapStartTime' }),
    bootstrapDuration: pc.readContract({ abi: abiBVault2, address: vc.vault, functionName: 'bootstrapDuration' }),
    bootstrapStarted: pc.readContract({ abi: abiBVault2, address: vc.vault, functionName: 'bootstrapStarted' }),
    bootstrapEnded: pc.readContract({ abi: abiBVault2, address: vc.vault, functionName: 'bootstrapEnded' }),
    bootstrapFailed: pc.readContract({ abi: abiBVault2, address: vc.vault, functionName: 'bootstrapFailed' }),
    bootstrapSucceeded: pc.readContract({ abi: abiBVault2, address: vc.vault, functionName: 'bootstrapSucceeded' }),
    bootstrapping: pc.readContract({ abi: abiBVault2, address: vc.vault, functionName: 'bootstrapping' }),
    bootstrapThreshold: pc.readContract({ abi: abiBVault2, address: vc.vault, functionName: 'bootstrapThreshold' }),
    epochIdCount: pc.readContract({ abi: abiBVault2, address: vc.vault, functionName: 'epochIdCount' }),
    totalDeposits: pc.readContract({ abi: abiBVault2, address: vc.vault, functionName: 'totalDeposits' }),
    hook: pc.readContract({ abi: abiMarket, functionName: 'getYieldSwapHook', address: vc.market, args: [vc.bt] }),
  })
}

export async function getBvault2Epoch(vc: BVault2Config, id: bigint, pc: PublicClient = getPC()) {
  return await pc.readContract({ abi: abiBVault2, address: vc.vault, functionName: 'epochInfoById', args: [id] })
}

export async function getHookData(vc: BVault2Config, user: Address, pc: PublicClient = getPC()) {
  const hook = await pc.readContract({ abi: abiMarket, functionName: 'getYieldSwapHook', address: vc.market, args: [vc.bt] })
  if (hook == zeroAddress) {
    return {}
  }
  return promiseAll({
    total: pc.readContract({ abi: erc20Abi, address: hook, functionName: 'totalSupply' }),
    balance: pc.readContract({ abi: erc20Abi, address: hook, functionName: 'balanceOf', args: [user] }),
  })
}

export type Vault2Data = UnPromise<ReturnType<typeof getBvaut2Data>> & { current?: UnPromise<ReturnType<typeof getBvault2Epoch>> }
export function useBvualt2Data(vc: BVault2Config) {
  const vd = useFet({
    key: `vault2Data:${vc.vault}`,
    fetfn: async () => getBvaut2Data(vc),
  })
  const vdc = useFet({
    key: `vault2DataCurrent:${vc.vault}:${vd.result?.epochIdCount ?? 0n}`,
    fetfn: async () => {
      const epochCount = vd.result?.epochIdCount ?? 0n
      if (epochCount > 0n) {
        const current = await getBvault2Epoch(vc, vd.result!.epochIdCount)
        return { current }
      }
      return {}
    },
  })
  // console.info('vd2:', vd.status, vdc.status)
  return useMerge<Vault2Data>(vd, vdc)
}

export function getBvault2EpochTimes(vd?: Vault2Data) {
  const startTime = (vd?.current?.startTime ?? 0n) * 1000n
  const endTime = ((vd?.current?.startTime ?? 0n) + (vd?.current?.duration ?? 0n)) * 1000n
  const reamin = endTime > BigInt(now()) ? endTime - BigInt(now()) : 0n
  const duration = (vd?.current?.duration ?? 0n) * 1000n
  const progress = duration > 0n ? Math.round(aarToNumber(((duration - reamin) * DECIMAL_10) / duration, 8)) : 0
  return { startTime, endTime, reamin, duration, progress }
}

export function getBvualt2BootTimes(vd?: Vault2Data) {
  const startTime = (vd?.bootstrapStartTime ?? 0n) * 1000n
  const endTime = ((vd?.bootstrapStartTime ?? 0n) + (vd?.bootstrapDuration ?? 0n)) * 1000n
  const reamin = endTime > BigInt(now()) ? endTime - BigInt(now()) : 0n
  const duration = (vd?.bootstrapDuration ?? 0n) * 1000n
  const progress = duration > 0n ? Math.round(aarToNumber(((duration - reamin) * DECIMAL_10) / duration, 8)) : 0
  return { startTime, endTime, reamin, duration, progress }
}
export function getBvualt2Times(vd?: Vault2Data) {
  if (vd?.current) {
    return getBvault2EpochTimes(vd)
  } else {
    return getBvualt2BootTimes(vd)
  }
}
