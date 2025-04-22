import { BVault2Config } from "@/config/bvaults2";
import EChartsReact from "echarts-for-react";
import { useMemo } from "react";
import { SimpleSelect } from "./ui/select";

export function BVault2Chart({ vc }: { vc: BVault2Config }) {
    const options = useMemo(() => {

        return {
            animation: true,
            animationDuration: 200,
            tooltip: {
                trigger: 'axis',
                // valueFormatter: valueFormater,
            },
            grid: { top: 30, bottom: 30, right: 20, show: false },
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
                max: (value: any) => value.max * 1.1,
                // axisLabel: {
                //     formatter: valueFormater,
                // },
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
        }
    }, [])
    return <div className='card flex flex-col gap-5 w-full min-w-0 bg-white'>
        <div className='flex justify-between gap-2 items-center'>
            <span className='text-base font-bold'>Chart</span>
            <SimpleSelect className="text-sm" options={["PT APY", 'PT Price', 'YT APY', 'YT Price']} />
        </div>
        <EChartsReact option={options} style={{ height: 300 }}></EChartsReact>
    </div>
}
