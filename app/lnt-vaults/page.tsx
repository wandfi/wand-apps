'use client'

import { LntOperators, LNTVaultCard, LntVesting, LntYield } from '@/components/lnt-vault'
import { PageWrap } from '@/components/page-wrap'
import { SimpleTabs } from '@/components/simple-tabs'
import { LntVaultConfig, LNTVAULTS_CONFIG } from '@/config/lntvaults'
import { ENV } from '@/constants'
import { useCurrentChainId } from '@/hooks/useCurrentChainId'
import { useLoadLntVaults, useLoadLVaults } from '@/hooks/useLoads'
import { tabToSearchParams } from '@/lib/utils'
import { useBoundStore } from '@/providers/useBoundStore'
import { useQuery } from '@tanstack/react-query'
import { Grid } from '@tremor/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAccount } from 'wagmi'
import { toLntVault } from '../routes'
import { useLntVault } from '@/providers/useLntVaultsData'


function LntVaultPage({ vc, tab }: { vc: LntVaultConfig; tab?: string }) {
  const { address } = useAccount()
  const vd = useLntVault(vc.vault)
  useQuery({
    queryKey: ['UpdateLntVaultDetails', vc, address, vd.epochCount.toString()],
    enabled: vd.epochCount > 0n,
    queryFn: async () => {
      if (!address) return false
      await Promise.all([
        useBoundStore.getState().sliceLntVaultsStore.updateEpoches(vc),
        useBoundStore.getState().sliceLntVaultsStore.updateUserEpoches(vc, address),
      ])
      return true
    },
  })
  useQuery({
    queryKey: ['UpdateUserLntVault', vc, address, vd.epochCount.toString()],
    queryFn: async () => {
      if (!address) return false
      await Promise.all([
        useBoundStore.getState().sliceLntVaultsStore.updateUserNftStat(vc, address),
        useBoundStore.getState().sliceTokenStore.updateNftBalance([vc.asset], address)
      ])
      return true
    },
  })
  const r = useRouter()
  const data = [
    {
      tab: 'Vesting Token',
      content: <LntVesting vc={vc} />,
    },
    {
      tab: 'Yield Token',
      content: <LntYield vc={vc} />,
    },
    {
      tab: 'Node Operators',
      content: <LntOperators vc={vc} />,
    },
  ]
  const currentTab = data.find((item) => tabToSearchParams(item.tab) == tab)?.tab || data[0].tab
  return (
    <SimpleTabs
      listClassName='flex-wrap p-0 mb-5 md:gap-14'
      triggerClassName='text-lg sm:text-xl md:text-2xl py-0 data-[state="active"]:border-b border-b-black dark:border-b-white leading-[0.8] rounded-none whitespace-nowrap'
      contentClassName='gap-5'
      currentTab={currentTab}
      onTabChange={(tab) => toLntVault(r, vc.vault, tab)}
      data={data}
    />
  )
}

export default function Vaults() {
  const chainId = useCurrentChainId()
  const vcs = LNTVAULTS_CONFIG[chainId].filter(item => item.onEnv ? item.onEnv.includes(ENV) : true)
  // const pvcs = PLAIN_VAULTS_CONFIG[chainId] || []
  // const groupsVcs = useMemo(() => Object.values(_.groupBy(vcs, 'assetTokenSymbol')), [vcs])
  const params = useSearchParams()
  const paramsVault = params.get('vault')
  const paramsTab = params.get('tab')
  const currentVc = vcs.find((item) => item.vault == paramsVault)
  useLoadLntVaults()
  return (
    <PageWrap>

      <div className='w-full max-w-[1160px] px-4 mx-auto md:pb-8'>
        {!currentVc ? (
          <>
            <div className='page-title'>LNT-Vaults</div>
            {/* <Noti data='Deposit assets into the Vaults to pair-mint stablecoin and margin token' /> */}
            <Grid numItems={1} className='gap-5 mt-4'>
              {vcs.map((item, index) => (
                <LNTVaultCard key={`group_vault_item_${index}`} vc={item} />
              ))}
            </Grid>
          </>
        ) : (
          <LntVaultPage vc={currentVc} tab={paramsTab as string} />
        )}
      </div>
    </PageWrap>
  )
}
