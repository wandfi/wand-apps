import { abiBvault2Query, abiHook } from '@/config/abi/BVault2'
import { codeBvualt2Query } from '@/config/abi/codes'
import { BVault2Config } from '@/config/bvaults2'
import { Token } from '@/config/tokens'
import { useCurrentChainId } from '@/hooks/useCurrentChainId'
import { useFet } from '@/hooks/useFet'
import { aarToNumber, getTokenBy } from '@/lib/utils'
import { getPC } from '@/providers/publicClient'
import _ from 'lodash'
import { parseUnits } from 'viem'
import { useBvualt2Data } from './useFets'

export function useLogs(vc: BVault2Config) {
  const chainId = useCurrentChainId()
  return useFet({
    key: `Logs:${chainId}:${vc.vault}`,
    // initResult: proxyGetDef({}, 0n) as any,
    fetfn: async () => getPC(chainId).readContract({ abi: abiBvault2Query, code: codeBvualt2Query, functionName: 'getLog', args: [vc.protocal, vc.bt] }),
  })
}
export function useBT2PTPrice(vc: BVault2Config) {
  const chainId = useCurrentChainId()
  const bt = getTokenBy(vc.bt)
  return useFet({
    key: `BT2PT:Price:${chainId}:${bt.address}`,
    initResult: 0n,
    fetfn: async () => getPC(chainId).readContract({ abi: abiHook, address: vc.hook, functionName: 'getAmountOutBTToVPT', args: [parseUnits('1', bt.decimals)] }),
  })
}
export function usePT2BTPrice(vc: BVault2Config) {
  const chainId = useCurrentChainId()
  const asset = getTokenBy(vc.asset, chainId)
  const vd = useBvualt2Data(vc)
  const epoch = vd.result?.current
  const pt = epoch ? ({ address: epoch.PT, chain: [chainId], symbol: `p${asset.symbol}`, decimals: asset.decimals } as Token) : undefined
  return useFet({
    key: pt ? `PT2BT:Price:${chainId}:${pt.address}` : '',
    initResult: 0n,
    fetfn: async () => getPC(chainId).readContract({ abi: abiHook, address: vc.hook, functionName: 'getAmountOutVPTToBT', args: [parseUnits('1', pt!.decimals)] }),
  })
}

export function usePTApy(vc: BVault2Config, inputBn: bigint = 0n, outputBn: bigint = 0n, input: 'bt' | 'pt' = 'bt') {
  const { result: bt2ptPrice } = useBT2PTPrice(vc)
  const { result: logs } = useLogs(vc)
  const t = aarToNumber(logs?.pt ?? 0n, 18)
  const p = aarToNumber(bt2ptPrice, 18)
  const apy = t > 0 && p > 0 ? _.round(Math.pow(p, 1 / t - 1), 5) : 0
  console.info('ptapy:', p, t, apy)
  let apyto = apy
  let priceimpact = 0
  // calc change
  if (inputBn > 0n && outputBn > 0n && logs) {
    const isInputBT = input == 'bt'
    const rateScalar = aarToNumber(logs.rateScalar, 18)
    const rateAnchor = aarToNumber(logs.rateAnchor, 18)
    const nPt = aarToNumber(logs.vPT + (isInputBT ? outputBn : -inputBn), 18)
    const nBt = aarToNumber(logs.BTtp + (isInputBT ? -inputBn : outputBn), 18)
    const Pt = nPt / (nPt + nBt)
    const nPrice = (1 / rateScalar) * Math.log(Pt / (1 - Pt)) + rateAnchor
    priceimpact = Math.abs(nPrice - p) / p
    apyto = _.round(Math.pow(nPrice, 1 / t - 1), 5)
  }
  return [apy, apyto, priceimpact]
}
