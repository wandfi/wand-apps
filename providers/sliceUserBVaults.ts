import { type BVaultConfig } from '@/config/bvaults'
import { fetRouter } from '@/lib/fetRouter'
import type { fetUserBVault } from '@/lib/fetsBVault'
import { useQuery } from '@tanstack/react-query'
import { type Address } from 'viem'
import { useAccount } from 'wagmi'
import { useBVaultData } from './sliceBVaultsStore'

export type BVaultUserDTO = {
  epochId: bigint
  sBribes: { bribeTotalAmount: bigint; bribeSymbol: string; epochId: bigint; bribeToken: Address; bribeAmount: bigint }[]
  aBribes: { bribeTotalAmount: bigint; bribeSymbol: string; epochId: bigint; bribeToken: Address; bribeAmount: bigint }[]
  userBalanceYToken: bigint
  userBalanceYTokenSyntyetic: bigint
  userClaimableYTokenSyntyetic: bigint
  claimableAssetBalance: bigint
  redeemingBalance: bigint
}

export function useBVaultUserData(vc: BVaultConfig) {
  const { address } = useAccount()
  const vd = useBVaultData(vc)
  return useQuery({
    enabled: Boolean(address) && vd.data && vd.data.epochCount > 0n,
    queryKey: ['queryBVaultUserData', vc.chain, vc.vault, address],
    refetchOnMount: 'always',
    staleTime: 1000,
    queryFn: () => fetRouter('/api/bvault', { chain: vc.chain, vault: vc.vault, byUser: address!, fet: 'fetUserBVault' }) as ReturnType<typeof fetUserBVault>,
  })
}
