import { abiBVault2, abiBvault2Query, abiRewardManager } from '@/config/abi/BVault2'
import { codeBvualt2Query } from '@/config/abi/codes'
import { BVault2Config } from '@/config/bvaults2'
import { getTokenBy, Token } from '@/config/tokens'
import { DECIMAL, DECIMAL_10 } from '@/constants'
import { useFet, useFets } from '@/hooks/useFet'
import { aarToNumber, bnRange, getBigint, promiseAll, UnPromise } from '@/lib/utils'
import { getPC } from '@/providers/publicClient'
import { now } from 'lodash'
import { Address, erc20Abi, isAddressEqual, parseUnits, PublicClient } from 'viem'
import { useAccount } from 'wagmi'
import { FetKEYS } from './fetKeys'
import { getLpToken } from './getToken'
import { useStore } from '@/providers/useBoundStore'
import { useBalance, useBalances } from '@/hooks/useToken'
import { useLogs, useLogss } from './useDatas'
import { useMemo } from 'react'
import { TVLItem } from '@/hooks/tvl'

export async function getBvault2Epoch(vc: BVault2Config, id: bigint, pc: PublicClient) {
  return await pc.readContract({ abi: abiBVault2, address: vc.vault, functionName: 'epochInfoById', args: [id] })
}

export async function getBvaut2Data(vc: BVault2Config) {
  const pc = getPC(vc.chain)
  const res = await promiseAll({
    initialized: pc.readContract({ abi: abiBVault2, address: vc.vault, functionName: 'initialized' }),
    BT: pc.readContract({ abi: abiBVault2, address: vc.vault, functionName: 'BT' }),
    mintPoolTokenPot: pc.readContract({ abi: abiBVault2, address: vc.vault, functionName: 'mintPoolTokenPot' }),
    Points: pc.readContract({ abi: abiBVault2, address: vc.vault, functionName: 'points' }),
    bootstrapStartTime: pc.readContract({ abi: abiBVault2, address: vc.vault, functionName: 'bootstrapStartTime' }),
    bootstrapDuration: pc.readContract({ abi: abiBVault2, address: vc.vault, functionName: 'bootstrapDuration' }),
    bootstrapThreshold: pc.readContract({ abi: abiBVault2, address: vc.vault, functionName: 'bootstrapThreshold' }),
    epochIdCount: pc.readContract({ abi: abiBVault2, address: vc.vault, functionName: 'epochIdCount' }),
    totalDeposits: pc.readContract({ abi: abiBVault2, address: vc.vault, functionName: 'bootstrapTotalDeposits' }),
  })

  return { ...res, current: res.epochIdCount > 0n ? await getBvault2Epoch(vc, res.epochIdCount, pc) : undefined }
}

export type Vault2Data = UnPromise<ReturnType<typeof getBvaut2Data>>
export function useBvualt2Data(vc: BVault2Config) {
  return useFet({
    key: FetKEYS.Bvault2Data(vc),
    fetfn: async () => getBvaut2Data(vc),
  })
}
export function useBvualt2sData(vcs: BVault2Config[]) {
  return useFets(
    ...vcs.map((vc) => ({
      key: FetKEYS.Bvault2Data(vc),
      fetfn: async () => getBvaut2Data(vc),
    })),
  )
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

export async function getBvault2Epochs(vc: BVault2Config, epochCount: bigint) {
  if (epochCount <= 0n) return []
  const pc = getPC(vc.chain)
  const epochs = await Promise.all(bnRange(epochCount).map((id) => getBvault2Epoch(vc, id, pc)))
  return epochs.reverse()
}
export function useBvault2Epochs(vc: BVault2Config) {
  const vd = useBvualt2Data(vc)
  const epochs = useFet({
    key: FetKEYS.Bvault2Epochs(vc, vd.result?.epochIdCount),
    initResult: [],
    fetfn: () => getBvault2Epochs(vc, vd.result!.epochIdCount),
  })
  if (vd.status == 'fetching') {
    epochs.status = 'fetching'
  }
  return epochs
}
export function useBvault2sEpochs(vcs: BVault2Config[]) {
  const vds = useBvualt2sData(vcs)
  const epochs = useFets(
    ...vcs.map((vc, i) => ({
      key: FetKEYS.Bvault2Epochs(vc, vds.result[i]?.epochIdCount),
      initResult: [],
      fetfn: () => getBvault2Epochs(vc, vds.result[i]!.epochIdCount),
    })),
  )
  if (vds.status == 'fetching') {
    epochs.status = 'fetching'
  }
  return epochs
}

export async function getBvualt2PTRedeems(vc: BVault2Config, epochs: UnPromise<typeof getBvault2Epochs>, user: Address) {
  if (epochs.length == 0) return []
  const pc = getPC(vc.chain)
  return Promise.all(epochs.map((item) => pc.readContract({ abi: erc20Abi, address: item.PT, functionName: 'balanceOf', args: [user] }))).then((datas) =>
    datas.map((redeemable, i) => ({ ...epochs[i], redeemable })),
  )
}
export function useBvualt2PTRedeems(vc: BVault2Config) {
  const epochs = useBvault2Epochs(vc)
  const { address } = useAccount()
  const redeems = useFet({
    key: FetKEYS.Bvualt2PTRedeems(vc, address, epochs.result),
    initResult: [],
    fetfn: () => getBvualt2PTRedeems(vc, epochs.result, address!),
  })
  if (epochs.status === 'fetching') {
    redeems.status = 'fetching'
  }
  return redeems
}
export function useBvualt2sPTRedeems(vcs: BVault2Config[]) {
  const epochs = useBvault2sEpochs(vcs)
  const { address } = useAccount()
  const redeems = useFets(
    ...vcs.map((vc, i) => ({
      key: FetKEYS.Bvualt2PTRedeems(vc, address, epochs.result[i]),
      initResult: [],
      fetfn: () => getBvualt2PTRedeems(vc, epochs.result[i], address!),
    })),
  )
  if (epochs.status === 'fetching') {
    redeems.status = 'fetching'
  }
  return redeems
}

export async function getRewardsBy(rewradManager: Address, user: Address, pc: PublicClient) {
  return pc
    .readContract({ abi: abiBvault2Query, code: codeBvualt2Query, functionName: 'earned', args: [rewradManager, user, parseUnits('1', 28)] })
    .then((item) => item.map((r) => [r.token, r.value] as [Address, bigint]))
}

export async function getBvault2YTRewards(vc: BVault2Config, epochs: UnPromise<typeof getBvault2Epochs>, user: Address) {
  if (epochs.length == 0) return []
  const pc = getPC(vc.chain)
  return Promise.all(epochs.map((item) => getRewardsBy(item.YT, user, pc))).then((datas) => datas.map((rewrads, i) => ({ ...epochs[i], rewrads })))
}
export function useBvault2YTRewards(vc: BVault2Config) {
  const epochs = useBvault2Epochs(vc)
  const { address } = useAccount()
  const rewards = useFet({
    key: FetKEYS.Bvault2YTRewards(vc, address, epochs.result),
    initResult: [],
    fetfn: () => getBvault2YTRewards(vc, epochs.result, address!),
  })
  if (epochs.status === 'fetching') {
    rewards.status = 'fetching'
  }
  return rewards
}
export function useBvault2sYTRewards(vcs: BVault2Config[]) {
  const epochs = useBvault2sEpochs(vcs)
  const { address } = useAccount()
  const rewards = useFets(
    ...vcs.map((vc, i) => ({
      key: FetKEYS.Bvault2YTRewards(vc, address, epochs.result[i]),
      initResult: [],
      fetfn: () => getBvault2YTRewards(vc, epochs.result[i], address!),
    })),
  )
  if (epochs.status === 'fetching') {
    rewards.status = 'fetching'
  }
  return rewards
}

export async function getBvault2LPBTRewards(vc: BVault2Config, user: Address) {
  const lp = getLpToken(vc)
  const bt = getTokenBy(vc.bt, vc.chain)!
  const pc = getPC(vc.chain)
  const [lpRewards, btRewards] = await Promise.all([getRewardsBy(lp.address, user, pc), getRewardsBy(bt.address, user, pc)])
  return [
    { token: lp, rewards: lpRewards },
    { token: bt, rewards: btRewards },
  ]
}
export function useBvault2LPBTRewards(vc: BVault2Config) {
  const { address } = useAccount()
  const rewards = useFet({
    key: FetKEYS.Bvault2LPBTRewards(vc, address),
    initResult: [],
    fetfn: async () => getBvault2LPBTRewards(vc, address!),
  })
  return rewards
}
export function useBvault2sLPBTRewards(vcs: BVault2Config[]) {
  const { address } = useAccount()
  const rewards = useFets(
    ...vcs.map((vc) => ({
      key: FetKEYS.Bvault2LPBTRewards(vc, address),
      initResult: [],
      fetfn: async () => getBvault2LPBTRewards(vc, address!),
    })),
  )
  return rewards
}

export function useBvault2TVL(vc: BVault2Config) {
  const vd = useBvualt2Data(vc)
  const prices = useStore((s) => s.sliceTokenStore.prices, ['sliceTokenStore.prices'])
  const btPrice = getBigint(prices, vc.bt)
  const bt = getTokenBy(vc.bt, vc.chain)!
  const mintPoolBt = useBalance(bt, vd.result?.mintPoolTokenPot)
  const logs = useLogs(vc)
  const totalBt = (logs.result?.BTtp ?? 0n) + mintPoolBt.result
  console.info('tvl:', logs.result?.BTtp ?? 0n, mintPoolBt.result)
  return (totalBt * btPrice) / DECIMAL
}
export function useBvault2sTVL(vcs: BVault2Config[]) {
  const vds = useBvualt2sData(vcs)
  const mintPoolBt = useBalances(vcs.map((vc, i) => ({ token: getTokenBy(vc.bt, vc.chain), user: vds.result[i]?.mintPoolTokenPot })))
  const logss = useLogss(vcs)
  const prices = useStore((s) => s.sliceTokenStore.prices, ['sliceTokenStore.prices'])
  return useMemo(() => {
    const items: TVLItem[] = []
    vcs.forEach((vc, i) => {
      const btPrice = getBigint(prices, vc.bt)
      const bt = getTokenBy(vc.bt, vc.chain)!
      const totalBt = (logss.result[i]?.BTtp ?? 0n) + mintPoolBt.result[i]
      console.info('tvl:', logss.result[i]?.BTtp ?? 0n, mintPoolBt.result)
      const usdAmount = (totalBt * btPrice) / DECIMAL
      const last = items.find((item) => isAddressEqual(item.address, bt.address))
      if (last) {
        last.amount += totalBt
        last.usdAmount += usdAmount
      } else {
        items.push({
          name: bt.symbol,
          symbol: bt.symbol,
          address: bt.address,
          decimals: bt.decimals,
          price: btPrice,
          amount: totalBt,
          usdAmount,
        })
      }
    })
    return items
  }, [vds.result, mintPoolBt.result, logss.result, prices])
}
