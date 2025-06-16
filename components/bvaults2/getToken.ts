import { BVault2Config } from '@/config/bvaults2'
import { Token, getTokenBy } from '@/config/tokens'
import { useCurrentChainId } from '@/hooks/useCurrentChainId'
import { Address } from 'viem'
import { useBvualt2Data } from './useFets'

export function getPtToken(vc: BVault2Config, chainId: number, pt: Address) {
  const asset = getTokenBy(vc.asset, chainId)!
  return { address: pt, chain: [chainId], symbol: `p${asset.symbol}`, decimals: asset.decimals } as Token
}
export function usePtToken(vc: BVault2Config) {
  const chainId = useCurrentChainId()
  const vd = useBvualt2Data(vc)
  const epoch = vd.result?.current
  return epoch ? getPtToken(vc, chainId, epoch.PT) : undefined
}

export function getYtToken(vc: BVault2Config, chainId: number, yt: Address) {
  const asset = getTokenBy(vc.asset, chainId)!
  return { address: yt, chain: [chainId], symbol: `y${asset.symbol}`, decimals: asset.decimals } as Token
}
export function useYtToken(vc: BVault2Config) {
  const chainId = useCurrentChainId()
  const vd = useBvualt2Data(vc)
  const epoch = vd.result?.current
  return epoch ? getYtToken(vc, chainId, epoch.YT) : undefined
}

export function getLpToken(vc: BVault2Config, chainId: number) {
  const asset = getTokenBy(vc.asset)!
  return { address: vc.hook, symbol: `LP${asset.symbol}`, chain: [chainId], decimals: asset.decimals } as Token
}
