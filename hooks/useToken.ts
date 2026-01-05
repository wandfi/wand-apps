import { type Token } from '@/config/tokens'
import { useFet, useFets } from '@/hooks/useFet'
import { getPC } from '@/providers/publicClient'
import { type Address, erc20Abi } from 'viem'
import { useAccount } from 'wagmi'
import { useCurrentChainId } from './useCurrentChainId'

export const keyBalance = (token?: Token, address?: Address) => (address && token ? `tokenBalance:${token.chain}-${token.address}-by-${address}` : '')

export async function getBalance(token: Token, user: Address) {
  return token!.isNative
    ? getPC(token.chain).getBalance({ address: user })
    : getPC(token.chain).readContract({ abi: erc20Abi, functionName: 'balanceOf', address: token!.address, args: [user] })
}
export function useBalance(token?: Token, user?: Address) {
  const { address } = useAccount()
  const muser = user ?? address
  return useFet({
    key: keyBalance(token, muser),
    initResult: 0n,
    fetfn: () => getBalance(token!, muser!),
  })
}
export function useBalances(items: { token?: Token; user?: Address }[]) {
  return useFets(
    ...items.map(({ token, user }) => ({
      key: keyBalance(token, user),
      initResult: 0n,
      fetfn: () => getBalance(token!, user!),
    })),
  )
}

export const keyTotalSupply = (token?: Token) => (token ? `tokenTotalSupply:${token.chain}-${token.address}` : '')
export function useTotalSupply(token?: Token) {
  const chainId = useCurrentChainId()
  return useFet({
    key: keyTotalSupply(token),
    initResult: 0n,
    fetfn: async () => (token!.isNative ? 0n : getPC(chainId).readContract({ abi: erc20Abi, functionName: 'totalSupply', address: token!.address })),
  })
}
