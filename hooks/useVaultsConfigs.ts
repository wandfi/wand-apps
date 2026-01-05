import { type BVaultConfig, BVAULTS_CONFIG } from '@/config/bvaults'
import { type BVault2Config, BVAULTS2CONIG } from '@/config/bvaults2'
import { ENV } from '@/src/constants'
import { useMemo } from 'react'
import { useSetState } from 'react-use'
import { type Address } from 'viem'
import { useCurrentChainId } from './useCurrentChainId'

type OptionItem<T, type> = { label: string; value: Address; data: T; type: type }
type OptionsItem =
  | OptionItem<BVaultConfig, 'B-Vault'>
  | OptionItem<BVault2Config, 'B-Vault2'>

export function useVaultsConfigs() {
  const chainId = useCurrentChainId()
  const bvcs = useMemo(() => BVAULTS_CONFIG.filter((item) => item.chain === chainId && item.onEnv.includes(ENV)), [chainId])
  const b2vcs = useMemo(() => BVAULTS2CONIG.filter((vc) => vc.onEnv && vc.onEnv.includes(ENV) && vc.chain === chainId), [chainId])

  const options: OptionsItem[] = useMemo(() => {
   
    const bvcsOpt = bvcs.map<OptionItem<BVaultConfig, 'B-Vault'>>((bvc) => ({
      label: bvc.assetSymbol,
      value: bvc.vault,
      data: bvc,
      type: 'B-Vault',
    }))
   
    const b2vcsOpt = b2vcs.map<OptionItem<BVault2Config, 'B-Vault2'>>((vc) => ({
      label: vc.tit,
      value: vc.vault,
      data: vc,
      type: 'B-Vault2',
    }))
    return [ ...bvcsOpt,  ...b2vcsOpt].map((item) => ({ ...item, label: `${item.label}(${item.type}:${item.data.vault})` }))
  }, [bvcs])
  const [{ current }, setState] = useSetState<{ current: OptionsItem }>({
    current: options[0],
  })

  return { current, setState, options }
}
