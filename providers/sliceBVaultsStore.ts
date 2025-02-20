import { abiBeraLP, abiBeraVault, abiBQuery, abiBQueryOld } from '@/config/abi'
import { getBvaultsPtSynthetic } from '@/config/api'
import { BVaultConfig } from '@/config/bvaults'
import _ from 'lodash'
import { Address, erc20Abi, PublicClient } from 'viem'
import { getPC } from './publicClient'
import { SliceFun } from './types'
import { berachain, getCurrentChainId } from '@/config/network'
import { LP_TOKENS } from '@/config/lpTokens'
import { DECIMAL } from '@/constants'
import { toDecimal18 } from '@/lib/utils'

export type BVaultEpochDTO = {
  epochId: bigint
  startTime: bigint
  duration: bigint
  redeemPool: Address
  yTokenTotal: bigint
  vaultYTokenBalance: bigint
  assetTotalSwapAmount: bigint
  yTokenAmountForSwapYT: bigint
  totalRedeemingBalance: bigint
  settled: boolean
  stakingBribesPool: Address
  adhocBribesPool: Address
}

export type BVaultDTO = {
  epochCount: bigint
  pTokenTotal: bigint
  lockedAssetTotal: bigint
  f2: bigint
  closed: boolean
  lpLiq: bigint
  lpBase: bigint
  lpQuote: bigint
  Y: bigint
  current: BVaultEpochDTO
}
export type BVaultsStore = {
  bvaults: {
    [vault: Address]: BVaultDTO | undefined
  }
  epoches: {
    [vaultEpocheId: `${Address}_${number}`]: BVaultEpochDTO | undefined
  }
  yTokenSythetic: {
    [k: Address]: bigint
  }

  updateBvaults: (bvcs: BVaultConfig[]) => Promise<BVaultsStore['bvaults']>
  updateEpoches: (bvc: BVaultConfig, ids?: bigint[]) => Promise<BVaultsStore['epoches']>

  updateYTokenSythetic: (bvcs?: BVaultConfig[]) => Promise<BVaultsStore['yTokenSythetic']>
}
export const sliceBVaultsStore: SliceFun<BVaultsStore> = (set, get, init = {}) => {
  const getBvaultLpData = async (pc: PublicClient, vc: BVaultConfig) => {
    const lp = vc.asset
    const [[tokens, balances], totalSupply] = await Promise.all([
      pc.readContract({
        abi: abiBeraVault,
        address: '0x4Be03f781C497A489E3cB0287833452cA9B9E80B',
        functionName: 'getPoolTokens',
        args: [LP_TOKENS[lp]!.poolId!],
      }),
      pc.readContract({
        abi: abiBeraLP,
        address: lp,
        functionName: LP_TOKENS[lp].isStable ? 'getActualSupply' : 'totalSupply',
      }),
    ])
    const baseIndex = tokens.findIndex((item) => item == LP_TOKENS[lp]!.base)
    const quoteIndex = tokens.findIndex((item) => item == LP_TOKENS[lp]!.quote)

    return {
      lp,
      vault: vc.vault,
      baseBalance: balances[baseIndex],
      quoteBalance: balances[quoteIndex],
      totalSupply,
    }
    // const bvd = map[vc.vault]!
    // bvd.lpLiq = bvd.lockedAssetTotal
    // const shareLp = (bvd.lpLiq * DECIMAL) / totalSupply
    // console.info('updateBvaultForLP:', tokens, balances, totalSupply, bvd.lpLiq)
    // const baseIndex = tokens.findIndex((item) => item == LP_TOKENS[lp]!.base)
    // const quoteIndex = tokens.findIndex((item) => item == LP_TOKENS[lp]!.quote)
    // bvd.lpBase = toDecimal18((balances[baseIndex] * shareLp) / DECIMAL, LP_TOKENS[lp]!.baseDecimal)
    // bvd.lpQuote = toDecimal18((balances[quoteIndex] * shareLp) / DECIMAL, LP_TOKENS[lp]!.quoteDecimal)
    // return
  }
  const updateBvaults = async (bvcs: BVaultConfig[]) => {
    const start = _.now()
    console.info('timeStart:updateBvaults', start)
    const pc = getPC()
    const [datas, lpdatas] = await Promise.all([
      Promise.all(
        bvcs.map((bvc) =>
          pc
            .readContract({ abi: bvc.isOld ? abiBQueryOld : abiBQuery, address: bvc.bQueryAddres, functionName: 'queryBVault', args: [bvc.vault] })
            .then((item) => ({ vault: bvc.vault, item })),
        ),
      ),
      berachain.id == getCurrentChainId()
        ? Promise.all(bvcs.map((bvc) => (LP_TOKENS[bvc.asset]?.poolId ? getBvaultLpData(pc, bvc) : Promise.resolve(null))))
        : Promise.resolve(null),
    ])
    console.info('timeEND:updateBvaults', _.now() - start)
    const map = _.filter(datas, (item) => item != null).reduce<BVaultsStore['bvaults']>((map, item) => ({ ...map, [item.vault]: item.item }), {})
    if (lpdatas) {
      for (const lpdata of lpdatas) {
        if (lpdata) {
          const bvd = map[lpdata.vault]!
          bvd.lpLiq = bvd.lockedAssetTotal
          const shareLp = (bvd.lpLiq * DECIMAL) / lpdata.totalSupply
          bvd.lpBase = toDecimal18((lpdata.baseBalance * shareLp) / DECIMAL, LP_TOKENS[lpdata.lp]!.baseDecimal)
          bvd.lpQuote = toDecimal18((lpdata.quoteBalance * shareLp) / DECIMAL, LP_TOKENS[lpdata.lp]!.quoteDecimal)
        }
      }
    }

    set({ bvaults: { ...get().bvaults, ...map } })
    return map
  }

  const updateEpoches = async (bvc: BVaultConfig, ids?: bigint[]) => {
    const mIds = ids || _.range(1, parseInt(((get().bvaults[bvc.vault]?.epochCount || 0n) + 1n).toString())).map((num) => BigInt(num))
    if (mIds.length == 0) return {}
    const pc = getPC()
    const datas = await Promise.all(
      mIds.map((epochId) =>
        pc.readContract({ abi: bvc.isOld ? abiBQueryOld : abiBQuery, address: bvc.bQueryAddres, functionName: 'queryBVaultEpoch', args: [bvc.vault, epochId] }),
      ),
    )
    const map = datas.reduce<BVaultsStore['epoches']>((map, item) => ({ ...map, [`${bvc.vault}_${item!.epochId.toString()}`]: item }), {})
    set({ epoches: { ...get().epoches, ...map } })
    return map
  }

  const updateYTokenSythetic = async (bvcs?: BVaultConfig[]) => {
    const vaults = bvcs?.map((b) => b.vault) || (_.keys(get().bvaults) as Address[])
    // const data = await Promise.all(vaults.map((vault) => getBvaultPtSynthetic(vault, 100n))).then((data) =>
    //   data.reduce<{ [k: Address]: bigint }>((map, item, i) => ({ ...map, [vaults[i]]: BigInt(item) }), {}),
    // )
    const data = await getBvaultsPtSynthetic(vaults)
    const datas = _.mapValues(data, (v) => BigInt(v))
    set({ yTokenSythetic: { ...get().yTokenSythetic, ...datas } })
    return datas
  }

  // init
  return {
    bvaults: {},
    epoches: {},
    yTokenSythetic: {},
    ...init,
    updateBvaults,
    updateEpoches,
    updateYTokenSythetic,
  }
}
