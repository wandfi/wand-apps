import { getBvault2ChartsData } from "@/config/api";
import { BVault2Config } from "@/config/bvaults2";
import { useQuery } from "@tanstack/react-query";
import EChartsReact from "echarts-for-react";
import { ReactNode, useMemo, useState } from "react";
import { useBvualt2Data } from "./bvaults2/useFets";
import { SimpleSelect } from "./ui/select";
import { FMT, fmtDate, formatPercent, UnPromise } from "@/lib/utils";
import { round, toNumber } from "lodash";
import { formatUnits } from "viem";
import { graphic } from "echarts";

const chartTypes: {
    key: keyof UnPromise<ReturnType<typeof getBvault2ChartsData>>[number]
    show: ReactNode
    format?: (num: number) => string
}[] = [
        { key: 'ptApy', show: 'PT APY', format: (per) => formatPercent(per, 2, false) },
        { key: 'ptPrice', show: 'PT Price' },
        { key: 'ytRoi', show: 'YT ROI', format: (per) => formatPercent(per, 2, false) },
        { key: 'ytPrice', show: 'YT Price' },
    ]
export function BVault2Chart({ vc }: { vc: BVault2Config }) {
    const vd = useBvualt2Data(vc)
    const epoch = vd.result?.current
    const { data } = useQuery({
        queryKey: ['charts-data', vc, epoch?.startTime, epoch?.duration],
        enabled: Boolean(epoch),
        initialData: [],
        queryFn: async () => getBvault2ChartsData(vc.vault, epoch!.startTime, epoch!.startTime + epoch!.duration)
    })
    const [ct, setCT] = useState(chartTypes[0])
    const options = useMemo(() => {
        const cdata = data.map(item => [fmtDate(item.time * 1000, FMT.ALL), round(toNumber(formatUnits(BigInt(item[ct.key]), 18)), 6)])
        return {
            animation: true,
            animationDuration: 200,
            tooltip: {
                trigger: 'axis',
                valueFormatter: ct.format,
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
                    formatter: ct.format,
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
                    name: ct.show,
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
                    data: cdata,
                },
            ],
        }
    }, [data, ct])
    return <div className='animitem card flex flex-col gap-5 w-full min-w-0 bg-white'>
        <div className='flex justify-between gap-2 items-center'>
            <span className='text-base font-bold'>Chart</span>
            <SimpleSelect className="text-sm" options={chartTypes} value={ct} onChange={setCT} />
        </div>
        <EChartsReact option={options} style={{ height: 300 }}></EChartsReact>
    </div>
}
