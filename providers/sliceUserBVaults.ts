import { abiBQuery } from '@/config/abi'
import { type BVaultConfig } from '@/config/bvaults'
import { useQuery } from '@tanstack/react-query'
import { range, toNumber } from 'lodash'
import { type Address } from 'viem'
import { useAccount } from 'wagmi'
import { getPC } from './publicClient'
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
    queryFn: async () => {
      const pc = getPC(vc.chain)
      const ids = range(toNumber(vd.data!.epochCount.toString()) + 1).map((n) => BigInt(n))
      return Promise.all(ids.map((id) => pc.readContract({ abi: abiBQuery, address: vc.bQueryAddres, functionName: 'queryBVaultEpochUser', args: [vc.vault, id, address!] })))
    },
  })
}
