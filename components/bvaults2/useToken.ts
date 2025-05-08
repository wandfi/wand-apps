import { Token } from '@/config/tokens'
import { useFet } from '@/hooks/useFet'
import { getPC } from '@/providers/publicClient'
import { erc20Abi } from 'viem'
import { useAccount } from 'wagmi'

export function useBalance(token?: Token) {
  const { address } = useAccount()
  return useFet({
    key: address && token ? `tokenBalance:${token.chain}-${token.address}-by-${address}` : '',
    initResult: 0n,
    fetfn: async () =>
      token!.isNative ? getPC().getBalance({ address: address! }) : getPC().readContract({ abi: erc20Abi, functionName: 'balanceOf', address: token!.address, args: [address!] }),
  })
}

export function useTotalSupply(token?: Token) {
  return useFet({
    key: token ? `tokenTotalSupply:${token.chain}-${token.address}`:'',
    initResult: 0n,
    fetfn: async () => (token!.isNative ? 0n : getPC().readContract({ abi: erc20Abi, functionName: 'totalSupply', address: token!.address })),
  })
}
