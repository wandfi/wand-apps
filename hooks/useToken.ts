import { Token } from '@/config/tokens'
import { useFet } from '@/hooks/useFet'
import { getPC } from '@/providers/publicClient'
import { Address, erc20Abi } from 'viem'
import { useAccount } from 'wagmi'
import { useCurrentChainId } from './useCurrentChainId'

export const keyBalance = (token?: Token, address?: Address) => (address && token ? `tokenBalance:${token.chain}-${token.address}-by-${address}` : '')

export function useBalance(token?: Token, user?: Address) {
  const { address } = useAccount()
  const muser = user ?? address
  const chainId = useCurrentChainId()
  return useFet({
    key: keyBalance(token, muser),
    initResult: 0n,
    fetfn: async () =>
      token!.isNative
        ? getPC(chainId).getBalance({ address: muser! })
        : getPC(chainId).readContract({ abi: erc20Abi, functionName: 'balanceOf', address: token!.address, args: [muser!] }),
  })
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
