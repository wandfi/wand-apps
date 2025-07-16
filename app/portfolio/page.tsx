'use client'
import { BVaultApy } from '@/components/b-vault'
import { CoinIcon } from '@/components/icons/coinicon'
import { PageWrap } from '@/components/page-wrap'
import STable, { TableProps } from '@/components/simple-table'
import { BVaultConfig, BvcsByEnv } from '@/config/bvaults'
import { LP_TOKENS } from '@/config/lpTokens'
import { getTokenBy } from '@/config/tokens'
import { useCurrentChainId } from '@/hooks/useCurrentChainId'
import { useLoadBVaults, useLoadUserBVaults } from '@/hooks/useLoads'
import { fmtDate } from '@/lib/utils'
import { useBoundStore } from '@/providers/useBoundStore'
import { calcBVaultPTApy } from '@/providers/useBVaultsData'
import { displayBalance } from '@/utils/display'
import { useRouter } from 'next/navigation'
import { ReactNode, useMemo } from 'react'
import { MdArrowOutward } from 'react-icons/md'
import { Address } from 'viem'
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
    <div className='card whitespace-nowrap'>
      {typeof title == 'string' ? <div className='text-2xl leading-none font-semibold'>{title}</div> : title}
      {typeof sub == 'string' ? <div className='text-[2rem] text-primary leading-none font-semibold mt-2'>{sub}</div> : sub}
      <div className='my-4 h-[1px] bg-border/60 dark:bg-border'></div>
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
  const r = useRouter()
  const chainId = useCurrentChainId()
  const bvcs = BvcsByEnv.filter(item => item.chain === chainId)
  const data: ReactNode[][] = useMemo(() => {
    const s = useBoundStore.getState()
    const inRedeem = (bvc: BVaultConfig) => {
      return (s.sliceUserBVaults.epoches[bvc.vault] || []).reduce((sum, item) => sum + item.redeemingBalance, 0n)
    }
    const claimAble = (bvc: BVaultConfig) => {
      return (s.sliceUserBVaults.epoches[bvc.vault] || []).reduce((sum, item) => sum + item.claimableAssetBalance, 0n)
    }
    const yieldDay = (bvc: BVaultConfig) => {
      const balance = s.sliceTokenStore.balances[bvc.pToken] || 0n
      return (calcBVaultPTApy(bvc) * balance) / 10n ** 10n / 365n
    }
    const datas = bvcs
      .map((bvc) => {
        const pBalance = s.sliceTokenStore.balances[bvc.pToken] || 0n
        const pRedeeming = inRedeem(bvc)
        const pClaimAble = claimAble(bvc)
        const pTotalUser = pBalance + pRedeeming + pClaimAble
        const lp = LP_TOKENS[bvc.asset]
        const [baseSymbol, quoteSymbol] = lp ? bvc.assetSymbol.split('-') : ['', '']
        const totalLP = s.sliceBVaultsStore.bvaults[bvc.vault]?.lpLiq || 0n
        const totalLPBase = s.sliceBVaultsStore.bvaults[bvc.vault]?.lpBase || 0n
        const totalLPQuote = s.sliceBVaultsStore.bvaults[bvc.vault]?.lpQuote || 0n
        const uBase = lp && totalLP && totalLPBase && pTotalUser ? (pTotalUser * totalLPBase) / totalLP : 0n
        const uQuote = lp && totalLP && totalLPQuote && pTotalUser ? (pTotalUser * totalLPQuote) / totalLP : 0n
        const fmtTotalUser = displayBalance(pTotalUser)
        return { bvc, pBalance, pRedeeming, pClaimAble, lp, baseSymbol, quoteSymbol, uBase, uQuote, pTotalUser, fmtTotalUser }
      })
      .filter((item) => item.pTotalUser > 0n)
    const maxFmtTotalUserLength = datas.reduce((max, item) => Math.max(max, item.fmtTotalUser.length), 0)
    const fmtTotalUserWidth = Math.round(maxFmtTotalUserLength * 5 + 20)
    return datas.map(({ bvc, pBalance, pRedeeming, pClaimAble, lp, fmtTotalUser, baseSymbol, quoteSymbol, uBase, uQuote }) => {
      return [
        <CoinText key={'coin'} symbol={bvc.assetSymbol} txt={bvc.pTokenSymbol} size={32} />,
        displayBalance(pBalance),
        displayBalance(pRedeeming),
        <div key={'claim'} className='flex w-fit cursor-pointer items-center gap-2 underline' onClick={() => toBVault(r, bvc.vault, 'principal_panda', 'claim')}>
          {displayBalance(pClaimAble)}
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
        <BVaultApy key={'apy'} bvc={bvc} />,
        displayBalance(yieldDay(bvc)),
      ]
    })
  }, [bvcs, useBoundStore.getState()])
  return (
    <PortfolioItem
      title={<IconTitle tit='Principal Token' icon='PToken' />}
      tHeader={['', 'Balance', 'In Redemption', 'Claimable', 'Total Amount', 'APY', 'Est.Yield/day']}
      tData={data}
    />
  )
}
//

function BoostItem() {
  const r = useRouter()
  const chainId = useCurrentChainId()
  const bvcs = BvcsByEnv.filter(item => item.chain === chainId)
  const data: ReactNode[][] = useMemo(() => {
    const s = useBoundStore.getState()
    const epochInfo = (vault: Address, id: number) => s.sliceBVaultsStore.epoches[`${vault}_${id}`]
    // const myShare = (bribes: Exclude<UserBVaultsStore['epoches'][Address], undefined>[number]['bribes']) => {
    //   const fb = bribes.find((b) => b.bribeAmount > 0n)
    //   if (!fb || fb.bribeTotalAmount == 0n) return { myShare: '0.0%', myShareBn: 0n }
    //   const myShareBn = (fb.bribeAmount * DECIMAL) / fb.bribeTotalAmount
    //   return { myShare: fmtPercent(myShareBn, 18), myShareBn }
    // }
    const datas = bvcs
      .map((bvc) => {
        const epochs = s.sliceUserBVaults.epoches[bvc.vault] || []
        const epochsData = epochs

          .map((epoch) => ({
            ...epoch,
            // ...myShare(epoch.bribes||[]),
            epochInfo: epochInfo(bvc.vault, parseInt(epoch.epochId.toString())),
            settled: s.sliceBVaultsStore.epoches[`${bvc.vault}_${parseInt(epoch.epochId.toString())}`]?.settled || false,
          }))
          .filter((item) => !!item.epochInfo && (item.userBalanceYToken > 0n || item.userBalanceYTokenSyntyetic > 0n || item.userClaimableYTokenSyntyetic > 0n))
        return { bvc, epochsData, ytDecimals: getTokenBy(bvc.asset, chainId)!.decimals }
      })
      .filter((item) => item.epochsData.length)

    return datas.map(({ bvc, epochsData, ytDecimals }) => [
      <CoinText key={'coin'} symbol={bvc.assetSymbol} txt={bvc.yTokenSymbol} size={32} />,
      <div key={'epochs'}>
        {epochsData.map((epoch) => (
          <div key={epoch.epochId.toString()} className='flex items-baseline'>
            <div className='w-[4rem]'>Epoch {epoch.epochId.toString()}</div>
            <div className='opacity-60 text-xs'>
              {fmtDate(epoch.epochInfo!.startTime * 1000n)} - {fmtDate((epoch.epochInfo!.startTime + epoch.epochInfo!.duration) * 1000n)}
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
            {epoch.settled ? (
              <div key={'claim'} className='flex w-fit cursor-pointer items-center gap-2 underline' onClick={() => toBVault(r, bvc.vault, 'boost_venom')}>
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
  }, [bvcs, useBoundStore.getState()])
  return (
    <PortfolioItem
      title={<IconTitle tit='Yield Token' icon='YToken' />}
      tHeader={['', 'Epoch', 'YT Balance', 'YT Points', 'Status']}
      tData={data}
      tableProps={{ cellClassName: (_index, celIndex) => (celIndex == 0 ? 'flex flex-col' : 'leading-[30px]') }}
    />
  )
}
export default function Dashboard() {
  useLoadBVaults()
  useLoadUserBVaults()
  return (
    <PageWrap>
      <div className='w-full max-w-[1200px] px-4 mx-auto flex flex-col gap-5 md:pb-8'>
        {/* {<InterestItem />} */}
        {/* <LeverageItem /> */}
        <PrincipalItem />
        <BoostItem />
        {/* {chainId !== 80094 && <StakedPoolsItem />} */}
      </div>
    </PageWrap>
  )
}
