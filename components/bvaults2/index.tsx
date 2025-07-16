
import { toBVault } from "@/app/routes";
import { BVault2Config } from "@/config/bvaults2";
import { getTokenBy } from "@/config/tokens";
import { cn, FMT, fmtDate, fmtDuration, formatPercent } from "@/lib/utils";
import { displayBalance } from "@/utils/display";
import { ProgressBar } from "@tremor/react";
import { useRouter } from "next/navigation";
import { CoinIcon } from "../icons/coinicon";
import { SimpleTabs } from "../simple-tabs";
import { itemClassname, renderChoseSide, renderStat } from "../vault-card-ui";
import { BT } from "./bt";
import { LP } from "./lp";
import { PT } from "./pt";
import { usePTApy, useYTRoi } from "./useDatas";
import { getBvault2EpochTimes, getBvualt2Times, useBvualt2Data } from "./useFets";
import { YT } from "./yt";

export function BVault2Info({ vc }: { vc: BVault2Config }) {
    const vdFS = useBvualt2Data(vc)
    const vd = vdFS.result
    const { startTime, endTime, reamin, progress } = getBvault2EpochTimes(vd)
    return <div className="card bg-white flex flex-col gap-10">
        <div className="flex items-center gap-4">
            <div className="flex items-center font-semibold text-2xl mr-auto"><CoinIcon size={30} symbol="vIP" />vIP-Verio Vault</div>
            <div className="flex flex-col gap-2 mt-2">
                <div className="font-semibold text-sm">Underlying Asset</div>
                <div className="flex items-center gap-2 text-xs font-medium leading-4"> <CoinIcon size={16} symbol="vIP" /> vIP</div>
            </div>
            <div className="flex flex-col gap-2 mt-2 ml-10">
                <div className="font-semibold text-sm">Total Vaule Locked</div>
                <div className="text-xs font-medium opacity-60 leading-4">$-</div>
            </div>
        </div>
        <div className="font-medium text-sm opacity-70">
            Verio is the liquid staking and IP asset restaking platform for Story. Users stake IP to receive vIP, a yield bearing LSD.
            vIP can be restaked on multiple IP Assets to earn profits, while YT holders can leverage profits through the vIP-Verio Vault.
        </div>

        <div className="flex flex-col gap-2 text-xs">
            <div className="opacity-60 flex justify-between items-center"><span>Duration</span><span>~ {fmtDuration(reamin)} remaining</span></div>
            <ProgressBar value={progress} className='rounded-full overflow-hidden' />
            <div className="opacity-70 flex justify-between items-center"><span>{fmtDate(startTime, FMT.ALL2)}</span><span>{fmtDate(endTime, FMT.ALL2)}</span></div>
        </div>
    </div>
}


export function BVault2Swaps({ vc }: { vc: BVault2Config }) {
    return <div className="card bg-white h-full min-h-[49.25rem]">
        <SimpleTabs
            listClassName="p-0 gap-8 mb-4 w-full"
            triggerClassName={(i) => `text-2xl font-semibold leading-none data-[state="active"]:underline underline-offset-2 ${i == 3 ? 'ml-auto' : ''}`}
            data={[
                { tab: 'PT', content: <PT vc={vc} /> },
                { tab: 'YT', content: <YT vc={vc} /> },
                { tab: 'BT', content: <BT vc={vc} /> },
                { tab: 'Add Liquidity', content: <LP vc={vc} /> },
            ]}
        />
    </div>
}

export function BVault2Card({ vc }: { vc: BVault2Config }) {
    const r = useRouter()
    const asset = getTokenBy(vc.asset, vc.chain)!
    const vdFS = useBvualt2Data(vc)
    const vd = vdFS.result
    const { endTime, reamin } = getBvualt2Times(vd)
    const [apy] = usePTApy(vc)
    const [roi] = useYTRoi(vc)
    if (!asset) return null
    return <div className={cn('card !p-0 grid grid-cols-2 overflow-hidden cursor-pointer', {})} onClick={() => toBVault(r, vc.vault)}>
        <div className={cn(itemClassname, 'border-b', 'bg-black/10 dark:bg-white/10 col-span-2 flex-row px-4 md:px-5 py-4 items-center')}>
            <CoinIcon symbol={asset.symbol} size={44} />
            <div>
                <div className=' text-lg font-semibold whitespace-nowrap'>{asset.symbol}</div>
                <div className=' text-sm font-medium'>{asset.symbol.includes('-') ? 'LP Token' : ''}</div>
            </div>
            <div className='ml-auto'>
                <div className='text-[#64748B] dark:text-slate-50/60 text-xs font-semibold whitespace-nowrap'>{'Total Value Locked'}</div>
                <div className='text-sm font-medium'>${displayBalance(0n, 2)}</div>
            </div>
        </div>

        {renderStat(
            'Maturity Time',
            'status-red',
            // bvd.closed ? 'status-red' : 'status-green',
            <div className='relative'>
                <div className='flex gap-2 items-end'>
                    <span>{fmtDate(endTime, FMT.DATE2)}</span>
                    <span className='text-[#64748B] dark:text-slate-50/60 text-xs font-semibold whitespace-nowrap'>{fmtDuration(reamin)}</span>
                </div>
                {/* {bvd.epochCount > 0n && <div className='absolute top-full mt-1 left-0 text-[#64748B] dark:text-slate-50/60 text-xs font-semibold whitespace-nowrap'>{epochName}</div>} */}
            </div>
            ,
        )}
        {renderStat('Reward', asset.symbol, asset.symbol, true)}
        {renderChoseSide(
            'PToken',
            'Principal Token',
            formatPercent(apy),
            'YToken',
            'Yield Token',
            formatPercent(roi), // `${fmtBoost}x`,
            // (e) => {
            //     e.stopPropagation()
            //     //   toBVault(r, vc.vault, 'principal_token')
            // },
            // (e) => {
            //     e.stopPropagation()
            //     //   toBVault(r, vc.vault, 'yield_token')
            // },
        )}
    </div>
}