'use client'
import { CoinIcon } from '@/components/icons/coinicon'
import { PageWrap } from '@/components/page-wrap'
import STable from '@/components/simple-table'
import { BVaultConfig, BvcsByEnv } from '@/config/bvaults'
import { LP_TOKENS } from '@/config/lpTokens'
import { DECIMAL } from '@/constants'
import { useLoadBVaults } from '@/hooks/useLoads'
import { useTVL } from '@/hooks/useTVL'
import { fmtPercent, getBigint } from '@/lib/utils'
import { useStore } from '@/providers/useBoundStore'
import { displayBalance } from '@/utils/display'
import { TableCell as _TableCell } from '@tremor/react'

import { BVaultApy } from '@/components/b-vault'
import { getTokenBy } from '@/config/tokens'
import { useBvaultROI } from '@/hooks/useBVaultROI'
import { ReactNode, useMemo } from 'react'
import { useCurrentChainId } from '@/hooks/useCurrentChainId'

const TableCell = (p: React.TdHTMLAttributes<HTMLTableCellElement> & React.RefAttributes<HTMLTableCellElement>) => {
  return <_TableCell {...p} className={`!p-3 w-max ${p.className}`} />
}

const greenPoint = (
  <svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 14 14' fill='none'>
    <circle cx='7' cy='7' r='5' fill='white' stroke='#00DE9C' strokeWidth='4' />
  </svg>
)

const redPoint = (
  <svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 14 14' fill='none'>
    <circle cx='7' cy='7' r='5' fill='white' stroke='#FF3D3D' strokeWidth='4' />
  </svg>
)

function DashItem({ title, sub, tHeader, tData }: { title: ReactNode; sub?: ReactNode; tHeader: ReactNode[]; tData: ReactNode[][] }) {
  return (
    <div className='card whitespace-nowrap'>
      {typeof title == 'string' ? <div className='text-2xl leading-none font-semibold'>{title}</div> : title}
      {typeof sub == 'string' ? <div className='text-[2rem] text-primary leading-none font-semibold mt-2'>{sub}</div> : sub}
      <div className='my-4 h-[1px] bg-border/60 dark:bg-border'></div>
      <div className='w-full overflow-x-auto'>
        <STable headerClassName='border-b-0' header={tHeader} data={tData} />
      </div>
    </div>
  )
}

function TVLItem() {
  const tvl = useTVL()
  const data: ReactNode[][] = useMemo(() => {
    return tvl.tvlItems.map((item) => [
      <div key='icon' className='flex gap-2 items-center'>
        {<CoinIcon symbol={item.symbol} size={20} />}
        <span>{item.symbol}</span>
      </div>,
      `$${displayBalance(item.price)}`,
      displayBalance(item.amount, undefined, item.decimals),
      `$${displayBalance(item.usdAmount)}`,
    ])
  }, [tvl.tvlItems])
  return <DashItem title='Total Value Locked' sub={`$${displayBalance(tvl.tvl)}`} tHeader={['Asset', 'NAV', 'Amount', 'Total']} tData={data} />
}
function BVaultROI({ vc }: { vc: BVaultConfig }) {
  const { roi } = useBvaultROI(vc)
  return <>{fmtPercent(roi, 18, 2)}</>
}
function BVaultsItem() {
  const chainId = useCurrentChainId()
  const bvcs = BvcsByEnv.filter(item => item.chain === chainId)
  const bvaults = useStore((s) => s.sliceBVaultsStore.bvaults, ['sliceBVaultsStore.bvaults'])
  const prices = useStore((s) => s.sliceTokenStore.prices, ['sliceTokenStore.prices'])

  const data: ReactNode[][] = useMemo(() => {
    const datas = bvcs.map((bvc) => {
      const decimals = getTokenBy(bvc.asset, bvc.chain)!.decimals
      const totalDeposit = getBigint(bvaults, [bvc.vault, 'lockedAssetTotal'])

      let totalDepositUsd = (totalDeposit * getBigint(prices, [bvc.asset])) / (10n ** BigInt(decimals))
      const lp = LP_TOKENS[bvc.asset]
      if (lp) {
        const base = getBigint(bvaults, [bvc.vault, 'lpBase']);
        const quote = getBigint(bvaults, [bvc.vault, 'lpQuote']);
        totalDepositUsd = (base * getBigint(prices, [lp.base]) + quote * getBigint(prices, [lp.quote])) / DECIMAL
      }
      const [baseSymbol, quoteSymbol] = lp ? bvc.assetSymbol.split('-') : ['', '']
      const totalLeftWidth = Math.max(22 + displayBalance(totalDeposit).length * 5, displayBalance(totalDepositUsd).length * 5 + 5)

      return { bvc, totalDeposit, decimals, totalDepositUsd, totalLeftWidth, lp, baseSymbol, quoteSymbol }
    })
    const totalLeftWidth = datas.reduce((max, item) => Math.max(max, item.totalLeftWidth), 0) + 20

    return datas.map(({ bvc, totalDeposit, decimals, totalDepositUsd, lp, baseSymbol, quoteSymbol }) => [
      <div key='icon' className='flex gap-2 items-center'>
        {<CoinIcon symbol={bvc.assetSymbol} size={20} />}
        <span>{bvc.assetSymbol}</span>
      </div>,
      <div key='total' className='flex gap-8 items-start'>
        <div style={{ width: totalLeftWidth }}>
          <div key='icon' className='flex gap-2 items-center'>
            {<CoinIcon symbol={bvc.assetSymbol} size={14} />}
            <span>{displayBalance(totalDeposit, undefined, decimals)}</span>
          </div>
          <div className='opacity-60'>~{displayBalance(totalDepositUsd)}</div>
        </div>
        {lp && (
          <div>
            <div key='icon' className='flex gap-2 items-center'>
              {<CoinIcon symbol={baseSymbol} size={14} />}
              <span>{displayBalance(getBigint(bvaults, [bvc.vault, 'lpBase']))}</span>
            </div>
            <div key='icon' className='flex gap-2 items-center'>
              {<CoinIcon symbol={quoteSymbol} size={14} />}
              <span>{displayBalance(getBigint(bvaults, [bvc.vault, 'lpQuote']))}</span>
            </div>
          </div>
        )}
      </div>,
      <div key='status' className='flex gap-2 items-center'>
        {greenPoint}
        <span>Epoch {getBigint(bvaults, [bvc.vault, 'epochCount']).toString()}</span>
      </div>,
      <BVaultApy key={'apy'} bvc={bvc} />,
      <BVaultROI key={'roi'} vc={bvc} />,
    ])
  }, [bvcs, bvaults, prices])
  return <DashItem title='B-Vault' tHeader={['Vaults', 'Total Deposit', 'Status', 'PT APY', 'YT ROI']} tData={data} />
}
export default function Dashboard() {
  useLoadBVaults()
  return (
    <PageWrap>
      <div className='w-full max-w-[1200px] px-4 mx-auto flex flex-col gap-5 md:pb-8'>
        <TVLItem />
        {/* <LVaultsItem /> */}
        <BVaultsItem />
      </div>
    </PageWrap>
  )
}
