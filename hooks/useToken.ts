import { type Token } from '@/config/tokens'
import { useFet, useFets } from '@/hooks/useFet'
import { fetRouter } from '@/lib/fetRouter'
import type { fetBalance, fetTotalSupply } from '@/lib/fetsToken'
import { type Address } from 'viem'
import { useAccount } from 'wagmi'

export const keyBalance = (token?: Token, address?: Address) => (address && token ? `tokenBalance:${token.chain}-${token.address}-by-${address}` : '')

export function useBalance(token?: Token, user?: Address) {
  const { address } = useAccount()
  const muser = user ?? address
  return useFet({
    key: keyBalance(token, muser),
    initResult: 0n,
    fetfn: () => fetRouter('/api/token', { fet: 'fetBalance', token: JSON.stringify(token), byUser: muser }) as ReturnType<typeof fetBalance>,
  })
}
export function useBalances(items: { token?: Token; user?: Address }[]) {
  return useFets(
    ...items.map(({ token, user }) => ({
      key: keyBalance(token, user),
      initResult: 0n,
      fetfn: () => fetRouter('/api/token', { fet: 'fetBalance', token: JSON.stringify(token), byUser: user }) as ReturnType<typeof fetBalance>,
    })),
  )
}

export const keyTotalSupply = (token?: Token) => (token ? `tokenTotalSupply:${token.chain}-${token.address}` : '')
export function useTotalSupply(token?: Token) {
  return useFet({
    key: keyTotalSupply(token),
    initResult: 0n,
    fetfn: () => fetRouter('/api/token', { fet: 'fetTotalSupply', token: JSON.stringify(token) }) as ReturnType<typeof fetTotalSupply>,
  })
}
