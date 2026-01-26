import { getBvaultsPtSynthetic } from '@/config/api'
import { type BVaultConfig, BvcsByEnv } from '@/config/bvaults'
import { fetRouter } from '@/lib/fetRouter'
import { fetBVault, fetBVaultEpoches } from '@/lib/fetsBVault'
import { useQueries, useQuery } from '@tanstack/react-query'
import { mapValues } from 'es-toolkit'
import { type Address } from 'viem'

export type BVaultEpochDTO = {
  epochId: bigint
  startTime: bigint
  duration: bigint
  redeemPool: Address
  yTokenTotal: bigint
  vaultYTokenBalance: bigint
  assetTotalSwapAmount: bigint
  yTokenAmountForSwapYT: bigint
  totalRedeemingBalance: bigint
  settled: boolean
  stakingBribesPool: Address
  adhocBribesPool: Address
}

export type BVaultDTO = {
  epochCount: bigint
  pTokenTotal: bigint
  lockedAssetTotal: bigint
  f2: bigint
  closed: boolean
  lpLiq: bigint
  lpBase: bigint
  lpQuote: bigint
  Y: bigint
  current: BVaultEpochDTO
  ptRebaseRate: bigint
  ytPointsMaxTotalSupply: bigint
}

const queryBVault = (vc: BVaultConfig) => ({
  queryKey: ['queryBvaultData', vc.chain, vc.vault],
  refetchOnMount: 'always' as 'always',
  staleTime: 1000,
  queryFn: () => fetRouter('/api/bvault', { chain: vc.chain, vault: vc.vault, fet: 'fetBVault' }) as ReturnType<typeof fetBVault>,
})

export function useBVaultData(vc: BVaultConfig) {
  return useQuery(queryBVault(vc))
}

export function useBVaultsData(vcs: BVaultConfig[]) {
  return useQueries({
    queries: vcs.map((item) => queryBVault(item)),
  })
}

export function useBVaultEpoch(vc: BVaultConfig) {
  const vd = useBVaultData(vc)
  return useQuery({
    queryKey: ['queryBvualtEpochs', vc.chain, vc.vault],
    enabled: vd.data && vd.data.epochCount > 0n,
    queryFn: () => fetRouter('/api/bvault', { chain: vc.chain, vault: vc.vault, fet: 'fetBVaultEpoches' }) as ReturnType<typeof fetBVaultEpoches>,
  })
}

export function useBVaultsYTokenSythetic() {
  return useQuery({
    queryKey: ['queryBVaultsYTokenSythetic'],
    queryFn: async () => {
      const data = await getBvaultsPtSynthetic(BvcsByEnv.map((vc) => vc.vault))
      const datas = mapValues(data, (v) => BigInt(v))
      return datas
    },
  })
}
