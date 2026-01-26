import { type BVaultConfig, BvcsByEnv } from '@/config/bvaults'
import { type BVault2Config, bvcs2ByEnv } from '@/config/bvaults2'
import { useMemo } from 'react'
import { useSetState } from 'react-use/esm'
import { type Address } from 'viem'

type OptionItem<T, type> = { label: string; value: Address; data: T; type: type }
type OptionsItem =
  | OptionItem<BVaultConfig, 'B-Vault'>
  | OptionItem<BVault2Config, 'B-Vault2'>

export function useVaultsConfigs() {
  const options: OptionsItem[] = useMemo(() => {
    const bvcsOpt = BvcsByEnv.map<OptionItem<BVaultConfig, 'B-Vault'>>((bvc) => ({
      label: bvc.assetSymbol,
      value: bvc.vault,
      data: bvc,
      type: 'B-Vault',
    }))

    const b2vcsOpt = bvcs2ByEnv.map<OptionItem<BVault2Config, 'B-Vault2'>>((vc) => ({
      label: vc.tit,
      value: vc.vault,
      data: vc,
      type: 'B-Vault2',
    }))
    return [...bvcsOpt, ...b2vcsOpt].map((item) => ({ ...item, label: `${item.label}(${item.type}:${item.data.vault})` }))
  }, [])
  const [{ current }, setState] = useSetState<{ current: OptionsItem }>({
    current: options[0],
  })

  return { current, setState, options }
}
