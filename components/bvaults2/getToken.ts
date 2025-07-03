import { BVault2Config } from '@/config/bvaults2'
import { Token, getTokenBy } from '@/config/tokens'
import { Address } from 'viem'
import { useBvualt2Data } from './useFets'

export function getPtToken(vc: BVault2Config, pt: Address) {
  const asset = getTokenBy(vc.asset)!
  return { address: pt, chain: [vc.chain], symbol: `p${asset.symbol}`, decimals: asset.decimals } as Token
}
export function usePtToken(vc: BVault2Config) {
  const vd = useBvualt2Data(vc)
  const epoch = vd.result?.current
  return epoch ? getPtToken(vc, epoch.PT) : undefined
}

export function getYtToken(vc: BVault2Config, yt: Address) {
  const asset = getTokenBy(vc.asset, vc.chain)!
  return { address: yt, chain: [vc.chain], symbol: `y${asset.symbol}`, decimals: asset.decimals } as Token
}
export function useYtToken(vc: BVault2Config) {
  const vd = useBvualt2Data(vc)
  const epoch = vd.result?.current
  return epoch ? getYtToken(vc, epoch.YT) : undefined
}

export function getLpToken(vc: BVault2Config) {
  const asset = getTokenBy(vc.asset, vc.chain)!
  return { address: vc.hook, symbol: `LP${asset.symbol}`, chain: [vc.chain], decimals: asset.decimals } as Token
}


export function useInputTokens(vc: BVault2Config){

}