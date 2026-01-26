import { type BVault2Config } from '@/config/bvaults2'
import { getTokenBy } from '@/config/tokens'
import { useFet, useFets } from '@/hooks/useFet'
import { useBalance, useBalances } from '@/hooks/useToken'
import type { TVLItem } from '@/hooks/useTVL'
import { fetRouter } from '@/lib/fetRouter'
import type { fetBalance } from '@/lib/fetsToken'
import { aarToNumber, type UnPromise } from '@/lib/utils'
import { useTokenPrices } from '@/providers/sliceTokenStore'
import { DECIMAL, DECIMAL_10 } from '@/src/constants'
import { useMemo } from 'react'
import { type Address, isAddressEqual } from 'viem'
import { useAccount } from 'wagmi'
import { FetKEYS } from './fetKeys'
import type { fetBvault2Epochs, fetBvaut2Data, fetRewardsBy } from './fets'
import { getLpToken } from './getToken'
import { useLogs, useLogss } from './useDatas'


export type Vault2Data = UnPromise<ReturnType<typeof fetBvaut2Data>>
export function useBvualt2Data(vc: BVault2Config) {
  return useFet({
    key: FetKEYS.Bvault2Data(vc),
    fetfn: () => fetRouter('/api/bvault2', { chain: vc.chain, vault: vc.vault, fet: 'fetBvaut2Data' }) as ReturnType<typeof fetBvaut2Data>,
  })
}
export function useBvualt2sData(vcs: BVault2Config[]) {
  return useFets(
    ...vcs.map((vc) => ({
      key: FetKEYS.Bvault2Data(vc),
      fetfn: () => fetRouter('/api/bvault2', { chain: vc.chain, vault: vc.vault, fet: 'fetBvaut2Data' }) as ReturnType<typeof fetBvaut2Data>,
    })),
  )
}

export function getBvault2EpochTimes(vd?: Vault2Data) {
  const startTime = (vd?.current?.startTime ?? 0n) * 1000n
  const endTime = ((vd?.current?.startTime ?? 0n) + (vd?.current?.duration ?? 0n)) * 1000n
  const reamin = endTime > BigInt(Date.now()) ? endTime - BigInt(Date.now()) : 0n
  const duration = (vd?.current?.duration ?? 0n) * 1000n
  const progress = duration > 0n ? Math.round(aarToNumber(((duration - reamin) * DECIMAL_10) / duration, 8)) : 0
  return { startTime, endTime, reamin, duration, progress }
}

export function getBvualt2BootTimes(vd?: Vault2Data) {
  const startTime = (vd?.bootstrapStartTime ?? 0n) * 1000n
  const endTime = ((vd?.bootstrapStartTime ?? 0n) + (vd?.bootstrapDuration ?? 0n)) * 1000n
  const reamin = endTime > BigInt(Date.now()) ? endTime - BigInt(Date.now()) : 0n
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


export function useBvault2Epochs(vc: BVault2Config) {
  const vd = useBvualt2Data(vc)
  const epochs = useFet({
    key: FetKEYS.Bvault2Epochs(vc, vd.result?.epochIdCount),
    initResult: [],
    fetfn: () => fetRouter('/api/bvault2', { chain: vc.chain, vault: vc.vault, fet: 'fetBvault2Epochs' }) as ReturnType<typeof fetBvault2Epochs>,
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
      fetfn: () => fetRouter('/api/bvault2', { chain: vc.chain, vault: vc.vault, fet: 'fetBvault2Epochs' }) as ReturnType<typeof fetBvault2Epochs>,
    })),
  )
  if (vds.status == 'fetching') {
    epochs.status = 'fetching'
  }
  return epochs
}

export async function getBvualt2PTRedeems(vc: BVault2Config, epochs: UnPromise<typeof fetBvault2Epochs>, user: Address) {
  if (epochs.length == 0) return []
  return Promise.all(epochs.map((item) => fetRouter('/api/token', { token: JSON.stringify({ address: item.PT, chain: vc.chain }), byUser: user, fet: 'fetBalance' }) as ReturnType<typeof fetBalance>)).then((datas) =>
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

export async function getBvault2YTRewards(vc: BVault2Config, epochs: UnPromise<typeof fetBvault2Epochs>, user: Address) {
  if (epochs.length == 0) return []
  return Promise.all(epochs.map((item) => fetRouter("/api/bvault2", { rewradManager: item.YT, user, chain: vc.chain, fet: 'fetRewardsBy' }) as ReturnType<typeof fetRewardsBy>)).then((datas) => datas.map((rewrads, i) => ({ ...epochs[i], rewrads })))
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
  const [lpRewards, btRewards] = await Promise.all([
    fetRouter("/api/bvault2", { rewradManager: lp.address, user, chain: vc.chain, fet: 'fetRewardsBy' }) as ReturnType<typeof fetRewardsBy>,
    fetRouter("/api/bvault2", { rewradManager: bt.address, user, chain: vc.chain, fet: 'fetRewardsBy' }) as ReturnType<typeof fetRewardsBy>])
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
  const prices = useTokenPrices().data
  const bt = getTokenBy(vc.bt, vc.chain)!
  const btPrice = prices[bt.symbol]?.bn ?? 0n
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
  const prices = useTokenPrices().data
  return useMemo(() => {
    const items: TVLItem[] = []
    vcs.forEach((vc, i) => {
      const bt = getTokenBy(vc.bt, vc.chain)!
      const btPrice = prices[bt.symbol]?.bn ?? 0n
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
