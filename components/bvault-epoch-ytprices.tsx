import { getBvaultEpochYtPrices } from '@/config/api'
import { type BVaultConfig } from '@/config/bvaults'
import { useQuery } from '@tanstack/react-query'
import EChartsReact, { type EChartsReactProps } from 'echarts-for-react'

import { cn, FMT, fmtDate } from '@/lib/utils'
import { graphic } from 'echarts'
import { round } from 'es-toolkit'
import { useMemo } from 'react'
import { useToggle } from 'react-use/esm'
import { formatEther } from 'viem'

const bnToNum = (bn: string) => round(parseFloat(formatEther(BigInt(bn))), 5)
const multip = 90
const logTrans = (num: number) => round(Math.log10(num * multip + 1), 5)
const revertLog = (num: number) => round((Math.pow(10, num) - 1) / multip, 5)
export default function BvaultEpochYtPrices({ bvc, epochId }: { bvc: BVaultConfig; epochId: bigint }) {
  const { data: prices } = useQuery({
    queryKey: ['bvualt-epoch-yt-prices', bvc.vault, epochId],
    queryFn: () => getBvaultEpochYtPrices(bvc.vault, epochId),
    initialData: [],
  })
  const [isLOG, togLOG] = useToggle(true)
  const { options } = useMemo(() => {
    const data = prices.map((p) => [fmtDate(p.time * 1000, FMT.ALL), isLOG ? logTrans(bnToNum(p.price)) : bnToNum(p.price)])
    const valueFormater = (value: number) => (isLOG ? revertLog(value).toString() : value.toString())
    const calcMax = (v: any) => {
      //    const max = value.max * 1.1
    }
    const options = {
      animation: true,
      animationDuration: 200,
      tooltip: {
        trigger: 'axis',
        valueFormatter: valueFormater,
      },
      grid: { left: 0, top: 0, right: 0, bottom: 0, show: false },
      toolbox: { show: false },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        axisLine: {
          onZero: false,
        }
      },
      yAxis: {
        type: 'value',
        boundaryGap: [0, '100%'],
        splitLine: { show: false },
        max: (value: any) => ((value.max - value.min) * 0.1 + value.max),
        min: (value: any) => (value.min - (value.max - value.min) * 0.1),
        axisLabel: {
          formatter: valueFormater,
          showMinLabel: false,
          showMaxLabel: false,
        },
      },
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 100,
          minValueSpan: 10,
        },
        {
          show: false,
        },
      ],
      series: [
        {
          name: 'YT Price',
          type: 'line',
          symbol: 'none',
          sampling: 'lttb',
          itemStyle: {
            color: 'rgb(30, 202, 83)',
          },
          areaStyle: {
            origin: 'start',
            color: new graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(30, 202, 83, 0.26)' },
              { offset: 1, color: 'rgba(30, 202, 83, 0.07)' },
            ]),
          },
          data: data,
        },
      ],
    }
    return { data, options }
  }, [prices, isLOG])
  const EChartsReactCom = EChartsReact as unknown as React.FC<EChartsReactProps>
  return (
    <div className='animitem card p-4 mx-auto max-w-4xl w-full min-w-0'>
      <div className='flex justify-between gap-2 items-center'>
        <span className='text-base font-bold'>YT Price Chart</span>
        <span className='text-xs font-medium dark:text-[#FBECEC]'></span>
      </div>
      <div className='flex gap-2 justify-end items-center mt-2'>
        <span className={cn('cursor-pointer text-xs px-1 py-0 rounded border-primary border', isLOG ? 'bg-primary' : 'bg-transparent')} onClick={() => togLOG()}>
          LOG
        </span>
      </div>
      <EChartsReactCom option={options} style={{ height: 240 }} />
    </div>
  )
}
