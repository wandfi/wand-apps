'use client'

import { PageWrap } from "@/components/page-wrap"
import { getLogsBy } from "@/lib/logs"
import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
const testDef: any = [
    ['2025/12/1 12:23:24', { a: 100, b: 100, c: 10000, aa: 10, cc: 'cccc', action: 'aljksdkljfklajklsjkdlfjklaj', bb: {a: 100, b: 100, c: 10000, aa: 10, cc: 'cccc', action: 'aljksdkljfklajklsjkdlfjklaj'} }],
    ['2025/12/1 12:23:25', { a: 100, b: 100, c: 10000, aa: 10, cc: 'cccc', action: 'aljksdkljfklajklsjkdlfjklaj', bb: {a: 100, b: 100, c: 10000, aa: 10, cc: 'cccc', action: 'aljksdkljfklajklsjkdlfjklaj'} }],
    ['2025/12/1 12:23:26', { a: 100, b: 100, c: 10000, aa: 10, cc: 'cccc', action: 'aljksdkljfklajklsjkdlfjklaj', bb: {a: 100, b: 100, c: 10000, aa: 10, cc: 'cccc', action: 'aljksdkljfklajklsjkdlfjklaj'} }],
    ['2025/12/1 12:23:27', { a: 100, b: 100, c: 10000, aa: 10, cc: 'cccc', action: 'aljksdkljfklajklsjkdlfjklaj', bb: {a: 100, b: 100, c: 10000, aa: 10, cc: 'cccc', action: 'aljksdkljfklajklsjkdlfjklaj'} }],
    ['2025/12/1 12:23:28', { a: 100, b: 100, c: 10000, aa: 10, cc: 'cccc', action: 'aljksdkljfklajklsjkdlfjklaj', bb: {a: 100, b: 100, c: 10000, aa: 10, cc: 'cccc', action: 'aljksdkljfklajklsjkdlfjklaj'} }],
    ['2025/12/1 12:23:29', { a: 100, b: 100, c: 10000, aa: 10, cc: 'cccc', action: 'aljksdkljfklajklsjkdlfjklaj', bb: {a: 100, b: 100, c: 10000, aa: 10, cc: 'cccc', action: 'aljksdkljfklajklsjkdlfjklaj'} }],
    ['2025/12/1 12:23:30', { a: 100, b: 100, c: 10000, aa: 10, cc: 'cccc', action: 'aljksdkljfklajklsjkdlfjklaj', bb: {a: 100, b: 100, c: 10000, aa: 10, cc: 'cccc', action: 'aljksdkljfklajklsjkdlfjklaj'} }],
    ['2025/12/1 12:23:31', { a: 100, b: 100, c: 10000, aa: 10, cc: 'cccc', action: 'aljksdkljfklajklsjkdlfjklaj', bb: {a: 100, b: 100, c: 10000, aa: 10, cc: 'cccc', action: 'aljksdkljfklajklsjkdlfjklaj'} }],
    ['2025/12/1 12:23:32', { a: 100, b: 100, c: 10000, aa: 10, cc: 'cccc', action: 'aljksdkljfklajklsjkdlfjklaj', bb: {a: 100, b: 100, c: 10000, aa: 10, cc: 'cccc', action: 'aljksdkljfklajklsjkdlfjklaj'} }],
    ['2025/12/1 12:23:33', { a: 100, b: 100, c: 10000, aa: 10, cc: 'cccc', action: 'aljksdkljfklajklsjkdlfjklaj', bb: {a: 100, b: 100, c: 10000, aa: 10, cc: 'cccc', action: 'aljksdkljfklajklsjkdlfjklaj'} }],
    ['2025/12/1 12:23:34', { a: 100, b: 100, c: 10000, aa: 10, cc: 'cccc', action: 'aljksdkljfklajklsjkdlfjklaj', bb: {a: 100, b: 100, c: 10000, aa: 10, cc: 'cccc', action: 'aljksdkljfklajklsjkdlfjklaj'} }],
    ['2025/12/1 12:23:35', { a: 100, b: 100, c: 10000, aa: 10, cc: 'cccc', action: 'aljksdkljfklajklsjkdlfjklaj', bb: {a: 100, b: 100, c: 10000, aa: 10, cc: 'cccc', action: 'aljksdkljfklajklsjkdlfjklaj'} }],
    ['2025/12/1 12:23:36', { a: 100, b: 100, c: 10000, aa: 10, cc: 'cccc', action: 'aljksdkljfklajklsjkdlfjklaj', bb: {a: 100, b: 100, c: 10000, aa: 10, cc: 'cccc', action: 'aljksdkljfklajklsjkdlfjklaj'} }],
    ['2025/12/1 12:23:37', { a: 100, b: 100, c: 10000, aa: 10, cc: 'cccc', action: 'aljksdkljfklajklsjkdlfjklaj', bb: {a: 100, b: 100, c: 10000, aa: 10, cc: 'cccc', action: 'aljksdkljfklajklsjkdlfjklaj'} }],
    ['2025/12/1 12:23:38', { a: 100, b: 100, c: 10000, aa: 10, cc: 'cccc', action: 'aljksdkljfklajklsjkdlfjklaj', bb: {a: 100, b: 100, c: 10000, aa: 10, cc: 'cccc', action: 'aljksdkljfklajklsjkdlfjklaj'} }],
    ['2025/12/1 12:23:39', { a: 100, b: 100, c: 10000, aa: 10, cc: 'cccc', action: 'aljksdkljfklajklsjkdlfjklaj', bb: {a: 100, b: 100, c: 10000, aa: 10, cc: 'cccc', action: 'aljksdkljfklajklsjkdlfjklaj'} }],
    ['2025/12/1 12:23:40', { a: 100, b: 100, c: 10000, aa: 10, cc: 'cccc', action: 'aljksdkljfklajklsjkdlfjklaj', bb: {a: 100, b: 100, c: 10000, aa: 10, cc: 'cccc', action: 'aljksdkljfklajklsjkdlfjklaj'} }],
    ['2025/12/1 12:23:41', { a: 100, b: 100, c: 10000, aa: 10, cc: 'cccc', action: 'aljksdkljfklajklsjkdlfjklaj', bb: {a: 100, b: 100, c: 10000, aa: 10, cc: 'cccc', action: 'aljksdkljfklajklsjkdlfjklaj'} }],
    ['2025/12/1 12:23:42', { a: 100, b: 100, c: 10000, aa: 10, cc: 'cccc', action: 'aljksdkljfklajklsjkdlfjklaj', bb: {a: 100, b: 100, c: 10000, aa: 10, cc: 'cccc', action: 'aljksdkljfklajklsjkdlfjklaj'} }],
]
export default function Logs() {
    const { address } = useAccount()
    const [infos, setInfos] = useState<[string, any][]>([])
    useEffect(() => {
        if (address) {
            setInfos(getLogsBy(address))
        }
        return () => { }
    }, [address])
    const onClickItem = (time: string) => {
        document.getElementById(time)?.scrollIntoView({ block: 'start', behavior: 'smooth' })
    }

    return <PageWrap>
        <div className="w-full h-[calc(100vh_-_90px)] p-5 text-base flex gap-5 overflow-hidden">
            <div className="flex flex-col w-60 gap-1 h-full overflow-y-auto">
                {infos.map(([time,]) => <div className="w-full px-4 py-2 rounded-lg bg-white cursor-pointer" key={time} onClick={() => onClickItem(time)}>{time}</div>)}
            </div>
            <div className="flex flex-col gap-2 h-full overflow-y-auto flex-1 pr-3">
                {infos.map(([time, item]) => <div className="w-full px-4 py-2 rounded-lg bg-white" key={time} id={time}>{JSON.stringify(item)}</div>)}
            </div>
        </div>
    </PageWrap>
}

