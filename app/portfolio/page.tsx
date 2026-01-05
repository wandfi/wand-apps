/* eslint-disable react-hooks/rules-of-hooks */
'use client'
import { BVaultApy } from '@/components/b-vault'
import { LPBTs, PTs, YTs } from '@/components/bvaults2/positionsAll'
import { CoinIcon } from '@/components/icons/coinicon'
import { PageWrap } from '@/components/page-wrap'
import STable, { type TableProps } from '@/components/simple-table'
import { BvcsByEnv } from '@/config/bvaults'
import { BVAULTS2CONIG } from '@/config/bvaults2'
import { LP_TOKENS } from '@/config/lpTokens'
import { getTokenBy } from '@/config/tokens'
import { ENV } from '@/src/constants'
import { useBalance } from '@/hooks/useToken'
import { fmtDate } from '@/lib/utils'
import { useBVaultsYTokenSythetic } from '@/providers/sliceBVaultsStore'
import { useBVaultUserData } from '@/providers/sliceUserBVaults'
import { calcBVaultPTApy, useBVault, useBVaultEpoches } from '@/providers/useBVaultsData'
import { displayBalance } from '@/utils/display'

import { useNavigate } from '@tanstack/react-router'
import { type ReactNode } from 'react'
import { MdArrowOutward } from 'react-icons/md'
import { toBVault } from '../routes'

function PortfolioItem({
  title,
  sub,
  tHeader,
  tData,
  tableProps,
}: {
  title: ReactNode
  sub?: ReactNode
  tHeader: ReactNode[]
  tData: ReactNode[][]
  tableProps?: Omit<TableProps, 'header' | 'data'>
}) {
  return (
    <div className='animitem card whitespace-nowrap p-4!'>
      {typeof title == 'string' ? <div className='text-2xl leading-none font-semibold'>{title}</div> : title}
      {typeof sub == 'string' ? <div className='text-[2rem] text-primary leading-none font-semibold mt-2'>{sub}</div> : sub}
      <div className='my-4 h-px bg-border/60 dark:bg-border'></div>
      <div className='w-full overflow-x-auto'>
        <STable headerClassName='border-b-0' tbodyClassName='text-sm font-medium' header={tHeader} data={tData} {...(tableProps || {})} />
      </div>
    </div>
  )
}

function IconTitle(p: { icon: string; tit: string }) {
  // const Micon = IconMap[p.icon]
  return (
    <div className='flex text-2xl leading-none font-semibold items-center gap-4'>
      {/* <Micon className='text-[2rem]' showBg /> */}
      <CoinIcon symbol={p.icon} size={32} />
      <span>{p.tit}</span>
    </div>
  )
}

function CoinText(p: { symbol: string; txt?: string; size?: number }) {
  return (
    <div className='flex gap-2 items-center'>
      {<CoinIcon symbol={p.symbol} size={p.size || 20} />}
      <span>{p.txt || p.symbol}</span>
    </div>
  )
}

function PrincipalItem() {
  const r = useNavigate()
  const data: ReactNode[][] = []
  for (const vc of BvcsByEnv) {
    const vd = useBVault(vc)
    const yTokenSythetic = useBVaultsYTokenSythetic().data?.[vc.vault] ?? 0n
    const epoches = useBVaultUserData(vc).data ?? []
    const pBalance = useBalance({ chain: vc.chain, address: vc.pToken } as any).result
    const pRedeeming = epoches.reduce((sum, item) => sum + item.redeemingBalance, 0n)
    const pClaimAble = epoches.reduce((sum, item) => sum + item.claimableAssetBalance, 0n)
    const pTotalUser = pBalance + pRedeeming + pClaimAble
    const yieldDay = (calcBVaultPTApy(vc, vd, yTokenSythetic) * pBalance) / 10n ** 10n / 365n
    const lp = LP_TOKENS[vc.asset]
    const [baseSymbol, quoteSymbol] = lp ? vc.assetSymbol.split('-') : ['', '']
    const totalLP = vd?.lpLiq ?? 0n
    const totalLPBase = vd?.lpBase ?? 0n
    const totalLPQuote = vd?.lpQuote ?? 0n
    const uBase = lp && totalLP && totalLPBase && pTotalUser ? (pTotalUser * totalLPBase) / totalLP : 0n
    const uQuote = lp && totalLP && totalLPQuote && pTotalUser ? (pTotalUser * totalLPQuote) / totalLP : 0n
    const fmtTotalUser = displayBalance(pTotalUser)
    const pDecimals = getTokenBy(vc.pToken, vc.chain)?.decimals
    const fmtTotalUserWidth = Math.round(fmtTotalUser.length * 5 + 20)
    if (pTotalUser > 0n) {
      data.push([
        <CoinText key={'coin'} symbol={vc.assetSymbol} txt={vc.pTokenSymbol} size={32} />,
        displayBalance(pBalance, undefined, pDecimals),
        displayBalance(pRedeeming, undefined, pDecimals),
        <div key={'claim'} className='flex w-fit cursor-pointer items-center gap-2 underline' onClick={() => toBVault(r, vc.vault, 'principal_panda', 'claim')}>
          {displayBalance(pClaimAble, undefined, pDecimals)}
          <MdArrowOutward />
        </div>,
        <div key={'total'} className='flex items-center gap-2'>
          <div style={{ width: fmtTotalUserWidth }}>{fmtTotalUser}</div>
          {lp && (
            <div>
              <CoinText size={14} symbol={baseSymbol} txt={displayBalance(uBase)} />
              <CoinText size={14} symbol={quoteSymbol} txt={displayBalance(uQuote)} />
            </div>
          )}
        </div>,
        <BVaultApy key={'apy'} bvc={vc} />,
        displayBalance(yieldDay),
      ])
    }
  }
  return (
    <PortfolioItem
      title={<IconTitle tit='Principal Token (v1)' icon='PToken' />}
      tHeader={['', 'Balance', 'In Redemption', 'Claimable', 'Total Amount', 'APY', 'Est.Yield/day']}
      tData={data}
    />
  )
}
//

function BoostItem() {
  const r = useNavigate()
  const data: ReactNode[][] = []
  for (const vc of BvcsByEnv) {
    const epochInfo = useBVaultEpoches(vc)[0]
    const epochsData = (useBVaultUserData(vc).data ?? []).filter(item => item.userBalanceYToken > 0n || item.userBalanceYTokenSyntyetic > 0n || item.userClaimableYTokenSyntyetic > 0n)
    const ytDecimals = getTokenBy(vc.asset, vc.chain)!.decimals
    if (epochInfo && epochsData.length) {
      data.push([
        <CoinText key={'coin'} symbol={vc.assetSymbol} txt={vc.yTokenSymbol} size={32} />,
        <div key={'epochs'}>
          {epochsData.map((epoch) => (
            <div key={epoch.epochId.toString()} className='flex items-baseline'>
              <div className='w-[4rem]'>Epoch {epoch.epochId.toString()}</div>
              <div className='opacity-60 text-xs'>
                {fmtDate(epochInfo.startTime * 1000n)} - {fmtDate((epochInfo.startTime + epochInfo.duration) * 1000n)}
              </div>
            </div>
          ))}
        </div>,
        <div key={'amount'}>
          {epochsData.map((epoch) => (
            <div key={epoch.epochId.toString()}>{displayBalance(epoch.userBalanceYToken, undefined, ytDecimals)}</div>
          ))}
        </div>,
        <div key={'time weighted'}>
          {epochsData.map((epoch) => (
            <div key={epoch.epochId.toString()}>{displayBalance(epoch.userBalanceYTokenSyntyetic, undefined, ytDecimals + 5)}</div>
          ))}
        </div>,
        // <div key={'my share'}>
        //   {epochsData.map((epoch) => (
        //     <div key={epoch.epochId.toString()}>{epoch.myShare}</div>
        //   ))}
        // </div>,
        <div key={'status'}>
          {epochsData.map((epoch) => (
            <div key={epoch.epochId.toString()}>
              {epochInfo.settled ? (
                <div key={'claim'} className='flex w-fit cursor-pointer items-center gap-2 underline' onClick={() => toBVault(r, vc.vault, 'boost_venom')}>
                  {'Ready to Harvest'}
                  <MdArrowOutward />
                </div>
              ) : (
                'Ongoing'
              )}
            </div>
          ))}
        </div>,
      ])
    }
  }
  return (
    <PortfolioItem
      title={<IconTitle tit='Yield Token (v1)' icon='YToken' />}
      tHeader={['', 'Epoch', 'YT Balance', 'YT Points', 'Status']}
      tData={data}
      tableProps={{ cellClassName: (_index, celIndex) => (celIndex == 0 ? 'flex flex-col' : 'leading-[30px]') }}
    />
  )
}


const vcsV2 = BVAULTS2CONIG.filter(item => item.onEnv.includes(ENV))
export default function Dashboard() {
  return (
    <PageWrap>
      <div className='w-full max-w-[1200px] px-4 mx-auto flex flex-col gap-5 md:pb-8'>
        <PrincipalItem />
        <BoostItem />
        <PTs vcs={vcsV2} />
        <YTs vcs={vcsV2} />
        <LPBTs vcs={vcsV2} />
      </div>
    </PageWrap>
  )
}
