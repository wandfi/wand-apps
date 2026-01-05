import { type BVault2Config } from '@/config/bvaults2'
import { type Token, getTokenBy } from '@/config/tokens'
import { type Address } from 'viem'
import { useBvualt2Data } from './useFets'

const cacheTokens: { [k: string]: Token } = {}
export function getPtToken(vc: BVault2Config, pt: Address) {
  const asset = getTokenBy(vc.asset, vc.chain)!
  const key = `pt_${vc.chain}_${vc.vault}_${pt}`
  if (!cacheTokens[key]) {
    cacheTokens[key] = { address: pt, chain: vc.chain, symbol: `p${asset.symbol}`, decimals: asset.decimals } as Token
  }
  return cacheTokens[key]
}
export function usePtToken(vc: BVault2Config) {
  const vd = useBvualt2Data(vc)
  const epoch = vd.result?.current
  return epoch ? getPtToken(vc, epoch.PT) : undefined
}

export function getYtToken(vc: BVault2Config, yt: Address) {
  const asset = getTokenBy(vc.asset, vc.chain)!
  const key = `yt_${vc.chain}_${vc.vault}_${yt}`
  if (!cacheTokens[key]) {
    cacheTokens[key] = { address: yt, chain: vc.chain, symbol: `y${asset.symbol}`, decimals: asset.decimals } as Token
  }
  return cacheTokens[key]
}
export function useYtToken(vc: BVault2Config) {
  const vd = useBvualt2Data(vc)
  const epoch = vd.result?.current
  return epoch ? getYtToken(vc, epoch.YT) : undefined
}

export function getLpToken(vc: BVault2Config) {
  const asset = getTokenBy(vc.asset, vc.chain)!
  const key = `lp_${vc.chain}_${vc.vault}_${vc.hook}`
  if (!cacheTokens[key]) {
    cacheTokens[key] = { address: vc.hook, symbol: `LP${asset.symbol}`, chain: vc.chain, decimals: asset.decimals } as Token
  }
  return cacheTokens[key]
}

export function useInputTokens(vc: BVault2Config) {}
