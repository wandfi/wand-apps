import { abiBVault2 } from "@/config/abi/BVault2";
import { BVault2Config } from "@/config/bvaults2";
import { DECIMAL } from "@/constants";
import { reFet } from "@/hooks/useFet";
import { useBalance } from "@/hooks/useToken";
import { aarToNumber, FMT, fmtDate, genDeadline, parseEthers } from "@/lib/utils";
import { getPC } from "@/providers/publicClient";
import { displayBalance } from "@/utils/display";
import { ProgressBar } from "@tremor/react";
import { useState } from "react";
import { BsFire } from "react-icons/bs";
import { useAccount } from "wagmi";
import { Txs, withTokenApprove } from "../approve-and-tx";
import { GetvIP } from "../get-lp";
import { CoinIcon } from "../icons/coinicon";
import { TokenInput } from "../token-input";
import { Tip } from "../ui/tip";
import { useWrapBtTokens, wrapToBT } from "./bt";
import { getLpToken } from "./getToken";
import { getBvualt2BootTimes, useBvualt2Data } from "./useFets";

export function BVault2Bootstrap({ vc }: { vc: BVault2Config }) {
    const tokens = useWrapBtTokens(vc)
    const [ct, setCT] = useState(tokens[0])
    const input = ct;
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
    const lp = getLpToken(vc)
    const lpBalance = useBalance(lp)

    const { address } = useAccount()
    const getTxs = async () => {
        const { txs, sharesBn } = await wrapToBT({ chainId: vc.chain, bt: vc.bt, token: ct.address, inputBn: inputAssetBn, user: address! })
        const txsApprove = await withTokenApprove({
            approves: [{ spender: vc.vault, token: vc.bt, amount: sharesBn }], pc: getPC(vc.chain), user: address!,
            tx: { abi: abiBVault2, address: vc.vault, functionName: 'addLiquidity', args: [sharesBn, genDeadline()], }
        })
        return [...txs, ...txsApprove]
    }
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
                {/* <AssetInput asset={bt.symbol} amount={inputAsset} setAmount={setInputAsset} balance={inputBalance.result} /> */}
                <TokenInput tokens={tokens} amount={inputAsset} setAmount={setInputAsset} onTokenChange={setCT} />
                <GetvIP address={vc.asset} />
                <Txs
                    className='mx-auto mt-auto'
                    tx='Deposit'
                    disabled={!inited || inputAssetBn <= 0n || inputAssetBn > inputBalance.result}
                    txs={getTxs}
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
                <Txs
                    className='mx-auto'
                    tx='Claim'
                    disabled={true}
                    txs={[{
                        abi: abiBVault2,
                        address: vc.vault,
                        functionName: 'removeLiquidity',
                        args: [inputAssetBn, 0n, genDeadline()],
                    }]}
                    onTxSuccess={() => {
                        setInputAsset('')
                    }}
                />
            </div>
        </div>
    </div>
}
