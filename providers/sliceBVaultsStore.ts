import { abiBeraLP, abiBeraVault, abiBQuery } from '@/config/abi'
import { abiBQuery2, codeBQuery2 } from '@/config/abi/BQuery2'
import { getBvaultsPtSynthetic } from '@/config/api'
import { type BVaultConfig, BvcsByEnv } from '@/config/bvaults'
import { LP_TOKENS } from '@/config/lpTokens'
import { DECIMAL } from '@/src/constants'
import { promiseAll, toDecimal18 } from '@/lib/utils'
import { useQueries, useQuery } from '@tanstack/react-query'
import _, { range, toNumber } from 'lodash'
import { type Address, parseAbiItem, zeroAddress } from 'viem'
import { getPC } from './publicClient'

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
  ptRebaseRate: bigint
  ytPointsMaxTotalSupply: bigint
}

const queryBVault = (vc: BVaultConfig) => ({
  queryKey: ['queryBvaultData', vc.chain, vc.vault],
  refetchOnMount: 'always' as 'always',
  staleTime: 1000,
  queryFn: async () => {
    const pc = getPC(vc.chain)
    const getLpData = async () => {
      if (LP_TOKENS[vc.asset]?.poolId) {
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
      }
    }
    const { vd, lpdata, ptRebaseRate } = await promiseAll({
      vd: pc.readContract({ abi: abiBQuery2, code: codeBQuery2, functionName: 'queryBVault', args: [vc.vault] }),
      lpdata: getLpData(),
      ptRebaseRate: vc.pTokenV2
        ? pc.readContract({ abi: [parseAbiItem('function rebaseRate() view returns (uint256)')], address: vc.pToken, functionName: 'rebaseRate' })
        : Promise.resolve(0n),
    })

    if (lpdata) {
      vd.lpLiq = vd.lockedAssetTotal
      const shareLp = (vd.lpLiq * DECIMAL) / lpdata.totalSupply
      vd.lpBase = toDecimal18((lpdata.baseBalance * shareLp) / DECIMAL, LP_TOKENS[lpdata.lp]!.baseDecimal)
      vd.lpQuote = toDecimal18((lpdata.quoteBalance * shareLp) / DECIMAL, LP_TOKENS[lpdata.lp]!.quoteDecimal)
    }
    let ytPointsMaxTotalSupply = 0n
    if (vc.pTokenV2 && vd.current.adhocBribesPool !== zeroAddress) {
      ytPointsMaxTotalSupply = await pc.readContract({
        abi: [parseAbiItem('function maxTotalSupply() external view returns (uint256)')],
        address: vd.current.adhocBribesPool,
        functionName: 'maxTotalSupply',
      })
    }
    return { ...vd, ytPointsMaxTotalSupply, ptRebaseRate }
  },
})

export function useBVaultData(vc: BVaultConfig) {
  return useQuery(queryBVault(vc))
}

export function useBVaultsData(vcs: BVaultConfig[]) {
  return useQueries({
    queries: vcs.map((item) => queryBVault(item)),
  })
}

export function useBVaultEpoch(vc: BVaultConfig) {
  const vd = useBVaultData(vc)
  return useQuery({
    queryKey: ['queryBvualtEpochs', vc.chain, vc.vault],
    enabled: vd.data && vd.data.epochCount > 0n,
    queryFn: async () => {
      const ids = range(toNumber(vd.data!.epochCount.toString()) + 1).map((n) => BigInt(n))
      const pc = getPC(vc.chain)
      return Promise.all(ids.map((epochId) => pc.readContract({ abi: abiBQuery, address: vc.bQueryAddres, functionName: 'queryBVaultEpoch', args: [vc.vault, epochId] })))
    },
  })
}

export function useBVaultsYTokenSythetic() {
  return useQuery({
    queryKey: ['queryBVaultsYTokenSythetic'],
    queryFn: async () => {
      const data = await getBvaultsPtSynthetic(BvcsByEnv.map((vc) => vc.vault))
      const datas = _.mapValues(data, (v) => BigInt(v))
      return datas
    },
  })
}
