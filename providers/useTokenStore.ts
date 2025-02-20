import { proxyGetDef } from '@/lib/utils'
import { TokenStore } from './sliceTokenStore'
import { useStore } from './useBoundStore'
import { Address } from 'viem'

export function useBalances() {
  return useStore((s) => proxyGetDef<TokenStore['balances']>(s.sliceTokenStore.balances, 0n), ['sliceTokenStore.balances'])
}

export function useNftBalance(token: Address) {
  return useStore((s) => s.sliceTokenStore.nftBalance[token] || [], [`sliceTokenStore.nftBalance.${token}`])
}

export function useTotalSupplies() {
  return useStore((s) => proxyGetDef<TokenStore['totalSupply']>(s.sliceTokenStore.totalSupply, 0n), ['sliceTokenStore.totalSupply'])
}
export function useTotalSupply(token: Address) {
  return useStore((s) => s.sliceTokenStore.totalSupply[token] ?? 0n, [`sliceTokenStore.totalSupply.${token}`])
}
