import { BVaultConfig, BvcsByEnv } from '@/config/bvaults'
import { BVaultEpochDTO } from '@/providers/sliceBVaultsStore'
import { useBoundStore, useStore } from '@/providers/useBoundStore'
import { useQuery } from '@tanstack/react-query'
import _ from 'lodash'
import { useMemo } from 'react'
import { Address } from 'viem'
import { useAccount } from 'wagmi'
import { useCurrentChainId } from './useCurrentChainId'
import { story } from '@/config/network'

export function useLoadBVaults() {
  const chainId = useCurrentChainId()
  const bvcs = BvcsByEnv.filter(item => item.chain === chainId)
  // useUpdateBVaultsData(bvcs)
  const { isLoading: isLoading1 } = useQuery({
    queryKey: ['UpdateBVaults', bvcs],
    queryFn: async () => {
      await Promise.all([useBoundStore.getState().sliceBVaultsStore.updateBvaults(bvcs), useBoundStore.getState().sliceBVaultsStore.updateYTokenSythetic(bvcs)])
      return true
    },
  })
  const { address } = useAccount()
  const tokens = useMemo(
    () =>
      bvcs
        .map((b) => [b.asset, b.pToken])
        .flat()
        .reduce<Address[]>((union, item) => (union.includes(item) ? union : [...union, item]), []),
    [bvcs],
  )
  const { isLoading: isLoading2 } = useQuery({
    queryKey: ['UpdateBvautlsTokens', tokens],
    enabled: chainId == story.id,
    queryFn: async () => {
      await Promise.all([useBoundStore.getState().sliceTokenStore.updateTokenTotalSupply(chainId,tokens), useBoundStore.getState().sliceTokenStore.updateTokenPrices()])
      return true
    },
    throwOnError(error, query) {
      console.error(error)
      return false
    },
  })
  const { isLoading: isLoading3 } = useQuery({
    queryKey: ['UpdateUserBvautlsTokens', tokens, address],
    enabled: chainId == story.id,
    queryFn: async () => {
      if (!address) return false
      await useBoundStore.getState().sliceTokenStore.updateTokensBalance(chainId, tokens, address)
      return true
    },
  })
  return { loading: isLoading1 || isLoading2 || isLoading3 }
}

export function useLoadUserBVaults() {
  const { address } = useAccount()
  const chainId = useCurrentChainId()
  const bvcs = BvcsByEnv.filter(item => item.chain === chainId)
  const bvaultsKeys = useStore((s) => _.keys(s.sliceBVaultsStore.bvaults).toString(), ['sliceBVaultsStore.bvaults'])
  useQuery({
    queryKey: ['UpdateAllUserBvaults', bvcs, address, bvaultsKeys],
    queryFn: async () => {
      if (!address) return false
      const bvaults = useBoundStore.getState().sliceBVaultsStore.bvaults
      for (const bvc of bvcs) {
        if (!bvaults[bvc.vault]) return false
      }
      await Promise.all(bvcs.map((bvc) => useBoundStore.getState().sliceBVaultsStore.updateEpoches(bvc)))
      const getEpochesParams = (bvc: BVaultConfig) => {
        const bvd = useBoundStore.getState().sliceBVaultsStore.bvaults[bvc.vault]!
        const epoches: BVaultEpochDTO[] = []
        for (let epocheId = parseInt(bvd.epochCount.toString()); epocheId > 0; epocheId--) {
          const epoch = useBoundStore.getState().sliceBVaultsStore.epoches[`${bvc.vault}_${epocheId}`]!
          epoches.push(epoch)
        }
        return epoches
      }
      await Promise.all(bvcs.map((bvc) => useBoundStore.getState().sliceUserBVaults.updateEpoches(bvc, address, getEpochesParams(bvc))))
      return true
    },
  })
}
