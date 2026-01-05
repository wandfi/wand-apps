import { ProgressBar } from "@/components/ui/progress-bar";
import { abiBVault2 } from "@/config/abi/BVault2";
import { type BVault2Config } from "@/config/bvaults2";
import { getTokenBy } from "@/config/tokens";
import { reFet } from "@/hooks/useFet";
import { useBalance } from "@/hooks/useToken";
import { withIfAiraSign } from "@/lib/aria";
import { aarToNumber, bnMin, cn, FMT, fmtDate, fmtPercent, genDeadline, parseEthers } from "@/lib/utils";
import { getPC } from "@/providers/publicClient";
import { DECIMAL } from "@/src/constants";
import { displayBalance } from "@/utils/display";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { BsFire } from "react-icons/bs";
import { erc20Abi } from "viem";
import { useAccount } from "wagmi";
import { Txs, withTokenApprove } from "../approve-and-tx";
import { GetByThird } from "../get-lp";
import { CoinIcon } from "../icons/coinicon";
import { TokenInput } from "../token-input";
import { Tip } from "../ui/tip";
import { convertBt, useWrapBtTokens } from "./bt";
import { getLpToken } from "./getToken";
import { getBvualt2BootTimes, useBvualt2Data } from "./useFets";

export function BVault2Bootstrap({ vc }: { vc: BVault2Config }) {
    const tokens = useWrapBtTokens(vc)
    const [ct, setCT] = useState(tokens[0])
    const input = ct;
    const inputBalance = useBalance(input)
    const [inputAsset, setInputAsset] = useState('')
    const inputAssetBn = parseEthers(inputAsset)
    const asset = getTokenBy(vc.asset, vc.chain)!
    const vdFS = useBvualt2Data(vc)
    const vd = vdFS.result
    const inited = vd?.initialized ?? false
    const targetAmount = vd?.bootstrapThreshold ?? 0n
    const currentAmount = vd?.totalDeposits ?? 0n
    const { endTime } = getBvualt2BootTimes(vd)
    const progressNum = Math.round(aarToNumber(targetAmount > 0n ? currentAmount >= targetAmount ? DECIMAL : currentAmount * DECIMAL / targetAmount : 0n, 16))
    const lp = getLpToken(vc)
    const lpBalance = useBalance(lp)
    const bootFinished = currentAmount > 0n && currentAmount >= targetAmount;
    const getTxs: Parameters<typeof Txs>['0']['txs'] = async (arg) => {
        await withIfAiraSign({ ...arg, token: ct, user: arg.wc.account.address })
        const { txs, out: sharesBn } = await convertBt(vc, true, input.address, inputAssetBn, arg.wc.account.address)
        const txsApprove = await withTokenApprove({
            approves: [{ spender: vc.vault, token: vc.bt, amount: sharesBn }], pc: getPC(vc.chain), user: arg.wc.account.address,
            tx: { abi: abiBVault2, address: vc.vault, name: 'Add Liquidity', functionName: 'addLiquidity', args: [sharesBn, genDeadline()], }
        })
        return [...txs, ...txsApprove]
    }
    const { address } = useAccount()

    const { data: bootLpBalance } = useQuery({
        queryKey: ['bootstrap-lpBalance', address, vc.vault],
        enabled: Boolean(address),
        initialData: 0n,
        queryFn: async () => {
            const pc = getPC(vc.chain)
            const blockLatest = await pc.getBlockNumber()
            const bootLpBalance = await pc.readContract({ abi: erc20Abi, address: lp.address, functionName: 'balanceOf', args: [address!], blockNumber: vc.bootendblock && vc.bootendblock < blockLatest ? vc.bootendblock : blockLatest })
            return bootLpBalance
        }
    })
    const bootTotal = bnMin([currentAmount, targetAmount])
    const share = bootTotal > 0n && bootLpBalance > 0n ? bootLpBalance * DECIMAL / bootTotal : 0n

    return <div style={{ order: vc.bootsort }} className={cn("card  animitem")}>
        <div className="flex items-center gap-2 text-xl font-medium">
            <BsFire className='text-[#ff0000]' />
            {vc.tit}{" "}{vc.testnet && "(Testnet)"}
            {/* <Tip>
                Verio is the liquid staking and IP asset restaking platform for Story. Users stake IP to receive vIP, a yield bearing LSD.
                vIP can be restaked on multiple IP Assets to earn profits, while YT holders can leverage profits through the vIP-Verio Vault.
            </Tip> */}
        </div>
        <div className="opacity-60 text-xs pl-7">{vc.subTitle}</div>
        <div className="flex flex-col h-auto lg:flex-row lg:h-[10rem] gap-8">
            <div className="flex-1 w-full lg:w-0 h-full flex flex-col pt-5">
                {/* <AssetInput asset={bt.symbol} amount={inputAsset} setAmount={setInputAsset} balance={inputBalance.result} /> */}
                <TokenInput tokens={tokens} amount={inputAsset} setAmount={setInputAsset} onTokenChange={setCT} otherInfo={<GetByThird t={asset} />} />
                <Txs
                    className={cn('mx-auto mt-auto', { 'bg-red-300 disabled:hover:bg-red-300 text-black': bootFinished })}
                    tx={bootFinished ? 'Finished' : 'Deposit'}
                    disabled={!inited || bootFinished || inputAssetBn <= 0n || inputAssetBn > inputBalance.result}
                    txs={getTxs}
                    onTxSuccess={() => {
                        setInputAsset('')
                        reFet(inputBalance.key, vdFS.key, lpBalance.key)
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
                {vc.bootreward && <>
                    <div className="font-medium text-sm justify-between flex items-center mt-4 gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                            <span className="w-fit whitespace-nowrap">Pool Share: {fmtPercent(share, 18, 2)}</span>
                            <div className="flex items-center flex-nowrap">
                                (
                                <div className="font-medium text-sm flex items-center gap-1 my-auto">
                                    <div>~{displayBalance(vc.bootreward.amount * share / DECIMAL)}</div>
                                    <CoinIcon symbol={vc.bootreward.tokenSymbol} size={16} />
                                </div>
                                )
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-nowrap whitespace-nowrap">Share a total rewards of {displayBalance(vc.bootreward.amount)} <CoinIcon size={16} symbol={vc.bootreward.tokenSymbol} /> {vc.bootreward.tokenSymbol}</div>
                    </div>
                    <div className=" justify-end w-full items-center gap-5 pt-2 hidden">
                        <div className="font-medium text-sm flex items-center justify-center gap-2 my-auto">
                            <CoinIcon symbol={vc.bootreward.tokenSymbol} size={16} />
                            <div>{displayBalance(vc.bootreward.amount * share / DECIMAL)}</div>
                        </div>
                        <Txs
                            className='w-[6.25rem]'
                            tx='Claim'
                            disabled={true}
                            txs={[]}
                        />
                    </div>
                </>}
            </div>
        </div>
    </div>
}
