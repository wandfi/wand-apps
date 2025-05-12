import { abiBVault2, abiMarket, abiRewardManager } from '@/config/abi/BVault2'
import { BVault2Config } from '@/config/bvaults2'
import { getCurrentChainId } from '@/config/network'
import { Token } from '@/config/tokens'
import { DECIMAL_10 } from '@/constants'
import { useFet, useMerge } from '@/hooks/useFet'
import { aarToNumber, bnRange, getTokenBy, promiseAll, UnPromise } from '@/lib/utils'
import { getPC } from '@/providers/publicClient'
import { now } from 'lodash'
import { Address, erc20Abi, isAddressEqual, PublicClient, zeroAddress } from 'viem'
import { useAccount } from 'wagmi'

export async function getBvault2Epoch(vc: BVault2Config, id: bigint, pc: PublicClient = getPC()) {
  return await pc.readContract({ abi: abiBVault2, address: vc.vault, functionName: 'epochInfoById', args: [id] })
}

export async function getBvaut2Data(vc: BVault2Config, pc: PublicClient = getPC()) {
  const res = await promiseAll({
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
    // hook: pc.readContract({ abi: abiMarket, functionName: 'getYieldSwapHook', address: vc.market, args: [vc.bt] }),
  })

  return { ...res, current: res.epochIdCount > 0n ? await getBvault2Epoch(vc, res.epochIdCount, pc) : undefined }
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

export type Vault2Data = UnPromise<ReturnType<typeof getBvaut2Data>>
export function useBvualt2Data(vc: BVault2Config) {
  // console.info('vd2:', vd.status, vdc.status)
  return useFet({
    key: `vault2Data:${vc.vault}`,
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
  const vd = useFet({
    key: `vault2Data:${vc.vault}`,
    fetfn: async () => getBvaut2Data(vc),
  })
  const epochs = useFet({
    key: vd.result && vd.result.epochIdCount > 0n ? `vault2Data:epoches:${vc.vault}:${vd.result.epochIdCount}` : '',
    initResult: [],
    fetfn: async () => {
      const count = vd.result!.epochIdCount
      const pc = getPC()
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
    key: address && epochs.result && epochs.result.length ? `vault2Data:epochesPTRedeems:${vc.vault}:${epochs.result.length}` : '',
    initResult: [],
    fetfn: async () => {
      const mEpochs = epochs.result!
      const pc = getPC()
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

export async function getRewardsBy(rewradManager: Address, user: Address, pc: PublicClient = getPC()) {
  return Promise.all([
    pc.readContract({ abi: abiRewardManager, address: rewradManager, functionName: 'getRewardTokens' }),
    pc.readContract({ abi: abiRewardManager, address: rewradManager, functionName: 'getUserRewards', args: [user] }),
  ]).then(([tokens, rewards]) => tokens.map((token, i) => [token, rewards[i]] as [Address, bigint]))
}
export function useBvault2YTRewards(vc: BVault2Config) {
  const epochs = useBvault2Epochs(vc)
  const { address } = useAccount()
  const rewards = useFet({
    key: address && epochs.result && epochs.result.length ? `vault2Data:epochesRewardsForYT:${vc.vault}:${epochs.result.length}` : '',
    initResult: [],
    fetfn: async () => {
      const mEpochs = epochs.result!
      const pc = getPC()
      return Promise.all(mEpochs.map((item) => getRewardsBy(item.YT, address!, pc))).then((datas) => datas.map((rewrads, i) => ({ ...mEpochs[i], rewrads })))
    },
  })
  if (epochs.status === 'fetching') {
    rewards.status = 'fetching'
  }
  return rewards
}
export function useBvault2LPBTRewards(vc: BVault2Config) {
  const vd = useBvualt2Data(vc)
  const asset = getTokenBy(vc.asset)
  const { address } = useAccount()
  const rewards = useFet({
    key: address ? `vault2Data:RewardsForLPBT:${vc.vault}:` : '',
    initResult: [],
    fetfn: async () => {
      const lp = { address: vc.hook, decimals: asset.decimals, symbol: `LP${asset.symbol}`, chain: [getCurrentChainId()] } as Token
      const bt = getTokenBy(vc.bt)
      const pc = getPC()
      const [lpRewards, btRewards] = await Promise.all([getRewardsBy(lp.address, address!, pc), getRewardsBy(bt.address, address!, pc)])
      return [
        { token: lp, rewards: lpRewards },
        { token: bt, rewards: btRewards },
      ]
    },
  })
  if (vd.status === 'fetching') {
    rewards.status = 'fetching'
  }
  return rewards
}
