import { abiLntQuery, abiLntVault } from '@/config/abi'
import { LntVaultConfig } from '@/config/lntvaults'
import _ from 'lodash'
import { Address } from 'viem'
import { getPC } from './publicClient'
import { SliceFun } from './types'
import { getLntVaultNftStatByUser, getLntVaultsDeposited, NFT_STAT } from '@/config/api'

export type LntVaultEpochDTO = {
  epochId: bigint
  startTime: bigint
  duration: bigint
  ytSwapPaymentToken: Address
  ytSwapPrice: bigint
  ytRewardsPoolOpt1: Address
  ytRewardsPoolOpt2: Address
  yTokenTotalSupply: bigint
  vaultYTokenBalance: bigint
}

export type LntVaultDTO = {
  epochCount: bigint
  nftVtAmount: bigint
  nftVestingEndTime: bigint
  nftVestingDuration: bigint
  initialized: boolean
  yTokenTotalSupply: bigint
  f2: bigint
  Y: bigint
  NftDepositLeadingTime: bigint
  NftRedeemWaitingPeriod: bigint
  current: LntVaultEpochDTO
  // for
  nftCount: bigint
}

export type LntRewardInfoDTO = {
  epochId: bigint
  token: Address
  symbol: string
  decimals: number
  earned: bigint
  total: bigint
}
export type LntVaultEpochUserDTO = {
  epochId: bigint
  opt1: LntRewardInfoDTO[]
  opt2: LntRewardInfoDTO[]
  userBalanceYToken: bigint
  // for opt2
  userYTPoints: bigint
  userClaimableYTPoints: bigint
}
export type LntVaultUserNftStatDTO = {
  stat: NFT_STAT
  tx: Address
  nftTokenId: bigint
  claimableTime: bigint
  claimed: boolean
  startTime: bigint
}
export type LntVaultsStore = {
  vaults: {
    [vault: Address]: LntVaultDTO | undefined
  }
  epoches: {
    [vaultEpocheId: `${Address}_${number}`]: LntVaultEpochDTO | undefined
  }
  userEpoches: {
    [k: Address]: LntVaultEpochUserDTO[] | undefined
  }

  userNftStat: {
    [vault: Address]: LntVaultUserNftStatDTO[]
  }

  updateLntVaults: (vcs: LntVaultConfig[]) => Promise<LntVaultsStore['vaults']>
  updateEpoches: (vc: LntVaultConfig, ids?: bigint[]) => Promise<LntVaultsStore['epoches']>
  updateUserEpoches: (vc: LntVaultConfig, user: Address) => Promise<LntVaultEpochUserDTO[]>
  updateUserNftStat: (vc: LntVaultConfig, user: Address) => Promise<LntVaultsStore['userNftStat']>
}
export const sliceLntVaultsStore: SliceFun<LntVaultsStore> = (set, get, init = {}) => {
  const updateLntVaults = async (vcs: LntVaultConfig[]) => {
    const pc = getPC()
    const datas = await Promise.all(
      vcs.map((vc) => pc.readContract({ abi: abiLntQuery, address: vc.queryAddres, functionName: 'queryVault', args: [vc.vault] }).then((item) => ({ vault: vc.vault, item }))),
    )
    const countMap = await getLntVaultsDeposited(vcs.map((vc) => vc.vault))
    const map = _.filter(datas, (item) => item != null).reduce<LntVaultsStore['vaults']>(
      (map, item) => ({ ...map, [item.vault]: { ...item.item, nftCount: BigInt(countMap[item.vault] || 0) } }),
      {},
    )
    set({ vaults: { ...get().vaults, ...map } })
    return map
  }

  const updateEpoches = async (vc: LntVaultConfig, ids?: bigint[]) => {
    const mIds = ids || _.range(1, parseInt(((get().vaults[vc.vault]?.epochCount || 0n) + 1n).toString())).map((num) => BigInt(num))
    if (mIds.length == 0) return {}
    const pc = getPC()
    const datas = await Promise.all(
      mIds.map((epochId) => pc.readContract({ abi: abiLntQuery, address: vc.queryAddres, functionName: 'queryVaultEpoch', args: [vc.vault, epochId] })),
    )
    const map = datas.reduce<LntVaultsStore['epoches']>((map, item) => ({ ...map, [`${vc.vault}_${item!.epochId.toString()}`]: item }), {})
    set({ epoches: { ...get().epoches, ...map } })
    return map
  }

  const updateUserEpoches = async (vc: LntVaultConfig, user: Address) => {
    const pc = getPC()
    const mIds = _.range(1, parseInt(((get().vaults[vc.vault]?.epochCount || 0n) + 1n).toString())).map((num) => BigInt(num))
    if (mIds.length > 0) {
      const datas: LntVaultEpochUserDTO[] = (await Promise.all(
        mIds.map((id) => pc.readContract({ abi: abiLntQuery, address: vc.queryAddres, functionName: 'queryVaultEpochUser', args: [vc.vault, id, user] })),
      )) as any
      set({ userEpoches: { ...get().userEpoches, [vc.vault]: datas } })
      return datas
    }
    return []
  }

  const updateUserNftStat = async (vc: LntVaultConfig, user: Address) => {
    const nftstat = await getLntVaultNftStatByUser(vc.vault, user)
    const pc = getPC()
    if (nftstat.length > 0) {
      const datas = (await Promise.all(
        nftstat.map(({ tokenId, stat, tx }) =>
          pc
            .readContract({ abi: abiLntVault, address: vc.vault, functionName: stat == 'Redeemed' ? 'nftRedeemInfo' : 'nftDepositInfo', args: [BigInt(tokenId)] })
            .then<LntVaultUserNftStatDTO>((data) => {
              const startTime: bigint = stat == 'Redeemed' ? (data as any).redeemTime : (data as any).depositTime
              const claimableTime = data.claimableTime
              return {
                stat,
                tx,
                nftTokenId: data.nftTokenId,
                startTime,
                claimableTime,
                claimed: data.claimed,
              }
            }).catch(_e =>  null),
        ),
      )).filter(Boolean)
      set({ userNftStat: { ...get().userNftStat, [vc.vault]: datas } })
      return datas
    }
    return {}
  }

  // init
  return {
    vaults: {},
    epoches: {},
    userEpoches: {},
    userNftStat: {},
    ...init,
    updateLntVaults,
    updateEpoches,
    updateUserEpoches,
    updateUserNftStat,
  }
}
