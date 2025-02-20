import { BVaultConfig, BVAULTS_CONFIG } from '@/config/bvaults'
import { PLAIN_VAULTS_CONFIG, PlainVaultConfig, VaultConfig, VAULTS_CONFIG } from '@/config/swap'
import { ENV } from '@/constants'
import { useMemo } from 'react'
import { useSetState } from 'react-use'
import { Address } from 'viem'
import { useCurrentChainId } from './useCurrentChainId'
import { LntVaultConfig, LNTVAULTS_CONFIG } from '@/config/lntvaults'

type OptionItem<T, type> = { label: string; value: Address; data: T; type: type }
type OptionsItem = OptionItem<VaultConfig, 'L-Vault'> | OptionItem<PlainVaultConfig, 'P-Vault'> | OptionItem<BVaultConfig, 'B-Vault'> | OptionItem<LntVaultConfig, 'Lnt-Vault'>

export function useVaultsConfigs() {
  const chainId = useCurrentChainId()
  const vcs = VAULTS_CONFIG[chainId] || []
  const pvcs = PLAIN_VAULTS_CONFIG[chainId] || []
  const bvcs = useMemo(() => (BVAULTS_CONFIG[chainId] || []).filter((vc) => vc.onEnv && vc.onEnv.includes(ENV)), [chainId])
  const lntvcs = useMemo(() => (LNTVAULTS_CONFIG[chainId] || []).filter((vc) => vc.onEnv && vc.onEnv.includes(ENV)), [chainId])
  const options: OptionsItem[] = useMemo(() => {
    const vcsOpt = vcs.map<OptionItem<VaultConfig, 'L-Vault'>>((vc) => ({
      label: vc.assetTokenSymbol,
      value: vc.vault,
      data: vc,
      type: 'L-Vault',
    }))
    const pvcsOpt = pvcs.map<OptionItem<PlainVaultConfig, 'P-Vault'>>((pvc) => ({
      label: pvc.assetTokenSymbol,
      value: pvc.vault,
      data: pvc,
      type: 'P-Vault',
    }))
    const bvcsOpt = bvcs.map<OptionItem<BVaultConfig, 'B-Vault'>>((bvc) => ({
      label: bvc.assetSymbol,
      value: bvc.vault,
      data: bvc,
      type: 'B-Vault',
    }))
    const lntvcsOpt = lntvcs.map<OptionItem<LntVaultConfig, 'Lnt-Vault'>>((vc) => ({
      label: vc.assetSymbol,
      value: vc.vault,
      data: vc,
      type: 'Lnt-Vault',
    }))

    return [...vcsOpt, ...pvcsOpt, ...bvcsOpt, ...lntvcsOpt].map((item) => ({ ...item, label: `${item.label}(${item.type})` }))
  }, [vcs, pvcs, bvcs, lntvcs])
  const [{ current }, setState] = useSetState<{ current: OptionsItem }>({
    current: options[0],
  })

  return { current, setState, options }
}
