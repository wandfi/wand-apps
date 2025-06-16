
import { toBVault2 } from "@/app/routes";
import { abiBVault2 } from "@/config/abi/BVault2";
import { BVault2Config } from "@/config/bvaults2";
import { DECIMAL } from "@/constants";
import { useCurrentChainId } from "@/hooks/useCurrentChainId";
import { reFet } from "@/hooks/useFet";
import { aarToNumber, cn, FMT, fmtDate, fmtDuration, formatPercent, genDeadline, parseEthers } from "@/lib/utils";
import { displayBalance } from "@/utils/display";
import { ProgressBar } from "@tremor/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BsFire } from "react-icons/bs";
import { ApproveAndTx } from "../approve-and-tx";
import { AssetInput } from "../asset-input";
import { GetvIP } from "../get-lp";
import { CoinIcon } from "../icons/coinicon";
import { SimpleTabs } from "../simple-tabs";
import { Tip } from "../ui/tip";
import { itemClassname, renderChoseSide, renderStat } from "../vault-card-ui";
import { BT } from "./bt";
import { LP } from "./lp";
import { PT } from "./pt";
import {  usePTApy, useYTRoi } from "./useDatas";
import { getBvault2EpochTimes, getBvualt2BootTimes, getBvualt2Times, useBvualt2Data } from "./useFets";
import { useBalance } from "../../hooks/useToken";
import { YT } from "./yt";
import { getLpToken } from "./getToken";
import { getTokenBy } from "@/config/tokens";


export function BVault2Bootstrap({ vc }: { vc: BVault2Config }) {
    const chainId = useCurrentChainId()
    const bt = getTokenBy(vc.bt, chainId)!
    const input = bt;
    const inputBalance = useBalance(input)
    const [inputAsset, setInputAsset] = useState('')
    const inputAssetBn = parseEthers(inputAsset)
    const vdFS = useBvualt2Data(vc)
    const vd = vdFS.result
    const inited = vd?.initialized ?? false
    const targetAmount = vd?.bootstrapThreshold ?? 0n
    const currentAmount = vd?.totalDeposits ?? 0n
    const { endTime } = getBvualt2BootTimes(vd)
    const progressNum = Math.round(aarToNumber(targetAmount > 0n ? currentAmount >= targetAmount ? DECIMAL : currentAmount * DECIMAL / targetAmount : 0n, 16))
    const lp =  getLpToken(vc, chainId)
    const lpBalance = useBalance(lp)
    return <div className="card bg-white">
        <div className="flex items-center gap-2 text-xl font-medium">
            <BsFire className='text-[#ff0000]' />
            {vc.tit}
            <Tip>
                Verio is the liquid staking and IP asset restaking platform for Story. Users stake IP to receive vIP, a yield bearing LSD.
                vIP can be restaked on multiple IP Assets to earn profits, while YT holders can leverage profits through the vIP-Verio Vault.
            </Tip>
        </div>
        <div className="flex flex-col h-auto lg:flex-row lg:h-[13.75rem] gap-8">
            <div className="flex-1 w-full lg:w-0 h-full flex flex-col pt-5">
                <AssetInput asset={bt.symbol} amount={inputAsset} setAmount={setInputAsset} balance={inputBalance.result} />
                <GetvIP address={vc.asset} />
                <ApproveAndTx
                    className='mx-auto mt-auto'
                    tx='Deposit'
                    disabled={!inited || inputAssetBn <= 0n || inputAssetBn > inputBalance.result}
                    spender={vc.vault}
                    approves={{
                        [input.address]: inputAssetBn,
                    }}
                    // skipSimulate
                    config={{
                        abi: abiBVault2,
                        address: vc.vault,
                        functionName: 'addLiquidity',
                        args: [inputAssetBn, genDeadline()],
                        // gas: 61917552n,
                    }}
                    onTxSuccess={() => {
                        setInputAsset('')
                        reFet(inputBalance.key, vdFS.key)
                    }}
                />
            </div>
            <div className="shrink-0 self-center h-[1px] w-[calc(100%-1.25em)] lg:mx-10 lg:w-[1px] lg:h-[calc(100%-1.25em)] bg-[#E4E4E7]" />
            <div className="flex-1 w-full lg:w-0 h-full flex flex-col">
                <div className="font-semibold text-sm justify-between flex items-center">
                    <div>Bootstrap</div>
                    <div>Current/Target</div>
                </div>
                <div className="text-xs justify-between flex items-center opacity-60 mt-1">
                    <div className="flex items-center gap-2">Deadline: {fmtDate(endTime, FMT.ALL2)} <Tip>If the Bootstrap does not reach the target before the Deadline, users can withdraw deposited assets</Tip></div>
                    <div>{displayBalance(currentAmount)} / {displayBalance(targetAmount)}</div>
                </div>
                <ProgressBar value={progressNum} className='mt-4 rounded-full overflow-hidden' />
                <div className="font-medium text-sm flex items-center gap-2 mt-2">
                    Deposited: {displayBalance(lpBalance.result, undefined, lp?.decimals)} <Tip>The deposited assets will become LP after launch and users can withdraw deposited assets anytime.</Tip>
                </div>
                <div className="font-medium text-sm justify-between flex items-center mt-4">
                    <div>Pool Share: 22.33%</div>
                    <div className="flex items-start gap-2">Share a total rewards of 1000 <CoinIcon size={20} symbol="vIP" /></div>
                </div>
                <div className="font-medium text-sm flex items-center justify-center gap-2 my-auto">
                    <CoinIcon symbol="vIP" size={20} /> 22.33
                </div>
                <ApproveAndTx
                    className='mx-auto'
                    tx='Claim'
                    disabled={true}
                    config={{
                        abi: abiBVault2,
                        address: vc.vault,
                        functionName: 'removeLiquidity',
                        args: [inputAssetBn, 0n, genDeadline()],
                    }}
                    onTxSuccess={() => {
                        setInputAsset('')
                    }}
                />
            </div>
        </div>
    </div>
}

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
            triggerClassName={(i) => `text-2xl font-semibold leading-none data-[state="active"]:underline underline-offset-2 ${i == 3? 'ml-auto': ''}`}
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
    const asset = getTokenBy(vc.asset)!
    const vdFS = useBvualt2Data(vc)
    const vd = vdFS.result
    const { endTime, reamin } = getBvualt2Times(vd)
    const [apy] = usePTApy(vc)
    const [roi] = useYTRoi(vc)
    return <div className={cn('card !p-0 grid grid-cols-2 overflow-hidden cursor-pointer', {})} onClick={() => toBVault2(r, vc.vault)}>
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