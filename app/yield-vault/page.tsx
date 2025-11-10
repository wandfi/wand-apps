'use client'

import { BVaultB, BVaultCard, BVaultP, BVaultRedeemAll } from '@/components/b-vault'
import * as BVaultN from '@/components/b-vault-new'
import { BVaultAddReward } from '@/components/bvault-add-reward'
import BvaultEpochYtPrices from '@/components/bvault-epoch-ytprices'
import { BVault2Card, BVault2Info, BVault2Swaps } from '@/components/bvaults2'
import { MyPositions } from '@/components/bvaults2/positions'
import { getBvaut2Data, useBvualt2Data } from '@/components/bvaults2/useFets'
import { BVault2Chart } from '@/components/bvaut2-chart'
import { Noti } from '@/components/noti'
import { PageWrap } from '@/components/page-wrap'
import { SimpleTabs } from '@/components/simple-tabs'
import { Spinner } from '@/components/spinner'
import { ConfigChainsProvider } from '@/components/support-chains'
import { SimpleSelect } from '@/components/ui/select'
import { abiBVault } from '@/config/abi'
import { BVaultConfig, BvcsByEnv } from '@/config/bvaults'
import { BVault2Config, BVAULTS2CONIG } from '@/config/bvaults2'
import { ENV } from '@/constants'
import { useCurrentChainId } from '@/hooks/useCurrentChainId'
import { isError, isLoading, isSuccess, useFets } from '@/hooks/useFet'
import { useLoadBVaults } from '@/hooks/useLoads'
import { getPC } from '@/providers/publicClient'
import { useBoundStore, useStore } from '@/providers/useBoundStore'
import { useBVault, useBVaultEpoches } from '@/providers/useBVaultsData'
import { useQuery } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { Fragment, ReactNode, useMemo, useState } from 'react'
import { FaSpinner } from 'react-icons/fa6'
import { Address, isAddressEqual } from 'viem'
import { useAccount } from 'wagmi'
import { toBVault } from '../routes'
import { FetKEYS } from '@/components/bvaults2/fetKeys'
import { nowUnix } from '@/lib/utils'
function StrongSpan({ children }: { children: ReactNode }) {
  return <span className='font-extrabold'>{children}</span>
}

function BVaultPage({ bvc, currentTab }: { bvc: BVaultConfig; currentTab?: string }) {
  const { address } = useAccount()
  const bvd = useBVault(bvc.vault)

  useQuery({
    queryKey: ['UpdateVaultDetails', bvc, bvd],
    queryFn: async () => {
      if (bvd.epochCount == 0n) return false
      await useBoundStore.getState().sliceBVaultsStore.updateEpoches(bvc)
      return true
    },
  })
  const epoches = useBVaultEpoches(bvc.vault)
  useQuery({
    queryKey: ['UpdateUserData', bvc, epoches, address],
    queryFn: async () => {
      if (epoches.length == 0 || !address) return false
      console.info('epochesOld:', epoches)
      await useBoundStore.getState().sliceUserBVaults.updateEpoches(bvc, address!, epoches)
      return true
    },
  })
  const { data: showAddReward } = useQuery({
    queryKey: ['checkIsBriber', address, bvc],
    queryFn: async () => {
      if (!address) return false
      const pc = getPC(bvc.chain)
      const passes = await Promise.all([
        pc.readContract({ abi: abiBVault, address: bvc.vault, functionName: 'isBriber', args: [address] }),
        pc.readContract({ abi: abiBVault, address: bvc.vault, functionName: 'owner' }).then((owner) => owner == address),
      ])
      return passes.includes(true) || isAddressEqual(address, '0xFE18Aa1EFa652660F36Ab84F122CD36108f903B6')
    },
  })
  const r = useRouter()

  if (bvc.newUI) {
    return <>
      <div className='grid lg:grid-cols-[1.6fr_1fr] gap-4 xl:gap-5'>
        <BVaultN.Info vc={bvc} />
        <div className='animitem row-span-2'>
          <BVaultN.PTYT vc={bvc} currentTab={currentTab} />
        </div>
        <BvaultEpochYtPrices bvc={bvc} epochId={bvd.epochCount} />
      </div>
      <BVaultN.MyPositions vc={bvc} />
    </>
  }
  const odata = [
    ...(bvd.closed ? [
      {
        tab: 'Redeem',
        content: <div className='max-w-xl mx-auto pt-8 w-full'>
          <BVaultRedeemAll bvc={bvc} />
        </div>
      }
    ] : [
      {
        tab: 'Principal Token',
        content: <BVaultP bvc={bvc} />,
      }
    ]),
    {
      tab: 'Yield Token',
      content: <BVaultB bvc={bvc} />,
    },
  ]
  const data =
    showAddReward
      ? [
        ...odata,
        {
          tab: 'Add Reward',
          content: <BVaultAddReward bvc={bvc} />,
        },
      ]
      : odata

  return (
    <SimpleTabs
      currentTab={currentTab}
      onTabChange={(tab) => toBVault(r, bvc.vault, tab)}
      className='animitem'
      listClassName='flex-wrap p-0 mb-5 md:gap-14'
      triggerClassName='text-lg sm:text-xl md:text-2xl py-0 data-[state="active"]:border-b border-b-black dark:border-b-white leading-[0.8] rounded-none whitespace-nowrap'
      contentClassName='gap-5'
      data={data}
    />
  )
}


function Bvualt2Page({ vc, currentTab }: { vc: BVault2Config, currentTab?: string }) {
  const vd = useBvualt2Data(vc)
  return <Fragment>
    {isError(vd) && 'Opps! Network Error!'}
    {isLoading(vd) && <Spinner className="mt-10 mx-auto text-black dark:text-white" />}
    {isSuccess(vd) && <Fragment>
      {vd.result?.current ? <>
        <div className="grid gap-5 lg:grid-cols-[7fr_5fr] mb-5">
          <BVault2Info vc={vc} />
          <div className="animitem row-span-2">
            <BVault2Swaps vc={vc} currentTab={currentTab} />
          </div>
          <BVault2Chart vc={vc} />
        </div>
        <MyPositions vc={vc} />
      </> : <div>Now not started</div>}
    </Fragment>}
  </Fragment>
}

const vaultsFilters = ['Active', 'All', 'Closed'] as const

type VCItem = (BVault2Config & { type: 'BVault2' }) | (BVaultConfig & { type: 'BVault' })
export default function Vaults() {
  const chainId = useCurrentChainId()
  const vcs = useMemo(() => {
    const olds = BvcsByEnv.filter(item => item.chain === chainId).map(vc => ({ ...vc, type: 'BVault' }) as VCItem)
    const v2vc = BVAULTS2CONIG.filter(item => item.onEnv.includes(ENV)).map(vc => ({ ...vc, type: 'BVault2' }) as VCItem)
    return [...v2vc, ...olds]
  }, [ENV, chainId])
  const params = useSearchParams()
  const paramsVault = params.get('vault') as Address
  const currentTab = params.get('tab') as string
  const currentVc = vcs.findLast((item) => item.vault.toLowerCase() == (paramsVault ?? '').toLowerCase())
  const { loading } = useLoadBVaults()
  const [currentFilter, setFilter] = useState(vaultsFilters.find(item => item === sessionStorage.getItem('bvualts-filter')) ?? vaultsFilters[0])
  const wrapSetFilter = (nf: (typeof vaultsFilters)[number]) => {
    setFilter(nf)
    sessionStorage.setItem("bvualts-filter", nf)
  }
  const vc2 = BVAULTS2CONIG.filter(item => item.onEnv.includes(ENV))
  const vd2Res = useFets(...vc2.map(vc => ({ key: FetKEYS.Bvault2Data(vc), fetfn: async () => getBvaut2Data(vc) })))
  const vd2 = vd2Res.result.map((vd, i) => ({ vc: vc2[i], ...(vd ?? {}) }))
  const mloading = loading || isLoading(vd2Res)
  const bvaults = useStore(s => s.sliceBVaultsStore.bvaults, ['sliceBVaultsStore.bvaults'])
  const fVcs = (() => {
    console.info('vd2', vd2)
    const mvcs = vcs.filter(item => item.type === 'BVault' || vd2.find(vd => vd.vc.vault === item.vault)?.current)
    if (currentFilter == 'All') return mvcs
    function isActive(vc: VCItem): boolean {
      // const forceClosed = ['0xd589836c3c031e2238c25ad5c6a910794c8827ad']
      //  && !forceClosed.includes(vc.vault)
      if (vc.type == 'BVault2') {
        const vd = vd2.find(vd => vd.vc.vault === vc.vault)
        return Boolean(vd && vd.current && (vd.current.startTime + vd.current.duration) > nowUnix())
      } else {
        const vd = bvaults[vc.vault]
        return Boolean(vd && !vd.closed)
      }
    }
    if (currentFilter == 'Active') return mvcs.filter(isActive)
    return mvcs.filter((vc) => !isActive(vc))
  })()

  return (
    <PageWrap>
      <div className='w-full max-w-[1232px] px-4 mx-auto md:pb-8'>
        {!currentVc ? (
          <>
            <div className='animitem page-title'>Yield-Vault</div>
            <div className='animitem flex items-center gap-8 justify-between relative z-50'>
              <Noti data='A Pendle-like Yield Tokenization Protocol Tailored for IP Assets' />
              <SimpleSelect value={currentFilter} options={vaultsFilters} onChange={wrapSetFilter} />
            </div>
            {mloading ? <div className='animitem w-full flex items-center justify-center pt-40'>
              <FaSpinner className='animate-spin text-4xl opacity-80' />
            </div> :
              <div className='grid grid-cols-[repeat(auto-fill,minmax(330px,1fr))] gap-5 mt-4'>
                {fVcs.map((item, index) => (
                  <ConfigChainsProvider chains={[item.chain]} key={`vault_item_${index}`}>
                    {
                      item.type === 'BVault' && <>
                        {item.newUI ? <BVaultN.BVaultCard vc={item} /> : <BVaultCard vc={item} />}
                      </>
                    }
                    {
                      item.type === 'BVault2' &&
                      <BVault2Card vc={item} />
                    }
                  </ConfigChainsProvider>
                ))}
              </div>
            }
          </>
        ) : (
          <ConfigChainsProvider chains={[currentVc.chain]}>
            {currentVc.type === 'BVault' && <BVaultPage bvc={currentVc} currentTab={currentTab} />}
            {currentVc.type === 'BVault2' && <Bvualt2Page vc={currentVc} currentTab={currentTab} />}
          </ConfigChainsProvider>
        )}
      </div>
    </PageWrap>
  )
}
