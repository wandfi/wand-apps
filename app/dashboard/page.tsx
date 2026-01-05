'use client'
import { CoinIcon } from '@/components/icons/coinicon'
import { PageWrap } from '@/components/page-wrap'
import STable from '@/components/simple-table'
import { useTVL } from '@/hooks/useTVL'
import { displayBalance } from '@/utils/display'

import { type ReactNode, useMemo } from 'react'

function DashItem({ title, sub, tHeader, tData }: { title: ReactNode; sub?: ReactNode; tHeader: ReactNode[]; tData: ReactNode[][] }) {
  return (
    <div className='animitem card whitespace-nowrap'>
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

export default function Dashboard() {
  return (
    <PageWrap>
      <div className='w-full max-w-[1200px] px-4 mx-auto flex flex-col gap-5 md:pb-8'>
        <TVLItem />
      </div>
    </PageWrap>
  )
}
