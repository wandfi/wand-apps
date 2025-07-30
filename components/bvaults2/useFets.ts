import { abiBVault2, abiBvault2Query, abiRewardManager } from '@/config/abi/BVault2'
import { codeBvualt2Query } from '@/config/abi/codes'
import { BVault2Config } from '@/config/bvaults2'
import { getTokenBy } from '@/config/tokens'
import { DECIMAL, DECIMAL_10 } from '@/constants'
import { useFet } from '@/hooks/useFet'
import { aarToNumber, bnRange, getBigint, promiseAll, UnPromise } from '@/lib/utils'
import { getPC } from '@/providers/publicClient'
import { now } from 'lodash'
import { Address, erc20Abi, parseUnits, PublicClient } from 'viem'
import { useAccount } from 'wagmi'
import { FetKEYS } from './fetKeys'
import { getLpToken } from './getToken'
import { useStore } from '@/providers/useBoundStore'
import { useBalance } from '@/hooks/useToken'
import { useLogs } from './useDatas'

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

export function useBvault2Epochs(vc: BVault2Config) {
  const vd = useBvualt2Data(vc)
  const epochs = useFet({
    key: FetKEYS.Bvault2Epochs(vc, vd.result?.epochIdCount),
    initResult: [],
    fetfn: async () => {
      const count = vd.result!.epochIdCount
      const pc = getPC(vc.chain)
      const epochs = await Promise.all(bnRange(count).map((id) => getBvault2Epoch(vc, id, pc)))
      return epochs.reverse()
    },
  })
  if (vd.status == 'fetching') {
    epochs.status = 'fetching'
  }
  return epochs
}

export function useBvualt2PTRedeems(vc: BVault2Config) {
  const epochs = useBvault2Epochs(vc)
  const { address } = useAccount()
  const redeems = useFet({
    key: FetKEYS.Bvualt2PTRedeems(vc, address, epochs.result),
    initResult: [],
    fetfn: async () => {
      const mEpochs = epochs.result!
      const pc = getPC(vc.chain)
      return Promise.all(mEpochs.map((item) => pc.readContract({ abi: erc20Abi, address: item.PT, functionName: 'balanceOf', args: [address!] }))).then((datas) =>
        datas.map((redeemable, i) => ({ ...mEpochs[i], redeemable })),
      )
    },
  })
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
export function useBvault2YTRewards(vc: BVault2Config) {
  const epochs = useBvault2Epochs(vc)
  const { address } = useAccount()
  const rewards = useFet({
    key: FetKEYS.Bvault2YTRewards(vc, address, epochs.result),
    initResult: [],
    fetfn: async () => {
      const mEpochs = epochs.result!
      const pc = getPC(vc.chain)
      return Promise.all(mEpochs.map((item) => getRewardsBy(item.YT, address!, pc))).then((datas) => datas.map((rewrads, i) => ({ ...mEpochs[i], rewrads })))
    },
  })
  if (epochs.status === 'fetching') {
    rewards.status = 'fetching'
  }
  return rewards
}
export function useBvault2LPBTRewards(vc: BVault2Config) {
  const { address } = useAccount()
  const rewards = useFet({
    key: FetKEYS.Bvault2LPBTRewards(vc, address),
    initResult: [],
    fetfn: async () => {
      const lp = getLpToken(vc)
      const bt = getTokenBy(vc.bt, vc.chain)!
      const pc = getPC(vc.chain)
      pc.readContract({ abi: abiRewardManager, functionName: 'getUserRewards', address: lp.address, args: [address!] }).then((data) => {
        console.info('userRewards:', data)
      })
      const [lpRewards, btRewards] = await Promise.all([getRewardsBy(lp.address, address!, pc), getRewardsBy(bt.address, address!, pc)])
      return [
        { token: lp, rewards: lpRewards },
        { token: bt, rewards: btRewards },
      ]
    },
  })
  return rewards
}

export function useBvault2TVL(vc: BVault2Config) {
  const vd = useBvualt2Data(vc)
  const prices = useStore((s) => s.sliceTokenStore.prices, ['sliceTokenStore.prices'])
  const btPrice = getBigint(prices, vc.bt)
  const bt = getTokenBy(vc.bt, vc.chain)!
  const mintPoolBt = useBalance(bt, vd.result?.mintPoolTokenPot)
  const logs = useLogs(vc)
  const totalBt = logs.result?.BTtp ?? 0n + mintPoolBt.result
  return (totalBt * btPrice) / DECIMAL
}
