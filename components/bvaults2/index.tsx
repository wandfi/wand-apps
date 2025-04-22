import { abiBVault2 } from "@/config/abi";
import { BVault2Config } from "@/config/bvaults2";
import { useCurrentChainId } from "@/hooks/useCurrentChainId";
import { getTokenBy, parseEthers } from "@/lib/utils";
import { useBalances } from "@/providers/useTokenStore";
import { ProgressBar } from "@tremor/react";
import { useState } from "react";
import { BsFire } from "react-icons/bs";
import { ApproveAndTx } from "../approve-and-tx";
import { AssetInput } from "../asset-input";
import { GetvIP } from "../get-lp";
import { CoinIcon } from "../icons/coinicon";
import { SimpleTabs } from "../simple-tabs";
import { Tip } from "../ui/tip";
import { PT } from "./pt";
import { YT } from "./yt";
import { LP } from "./lp";
import { BT } from "./bt";


export function BVault2Init({ vc }: { vc: BVault2Config }) {
    const chainId = useCurrentChainId()
    const asset = getTokenBy(vc.asset, chainId)
    const balances = useBalances()
    const assetBalance = balances[vc.asset]
    const [inputAsset, setInputAsset] = useState('')
    const inputAssetBn = parseEthers(inputAsset)

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
                <AssetInput asset={asset.symbol} amount={inputAsset} setAmount={setInputAsset} balance={balances[vc.asset]} />
                <GetvIP address={vc.asset} />
                <ApproveAndTx
                    className='mx-auto mt-auto'
                    tx='Deposit'
                    disabled={inputAssetBn <= 0n || inputAssetBn > assetBalance}
                    spender={vc.vault}
                    approves={{
                        [vc.asset]: inputAssetBn,
                    }}
                    config={{
                        abi: abiBVault2,
                        address: vc.vault,
                        functionName: 'deposit',
                        args: [inputAssetBn],
                    }}
                    onTxSuccess={() => {
                        setInputAsset('')
                        // upForUserAction()
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
                    <div className="flex items-center gap-2">Deadline: 9/10/2024, 12:54PM <Tip>If the Bootstrap does not reach the target before the Deadline, users can withdraw deposited assets</Tip></div>
                    <div>233.45 / 10,000</div>
                </div>
                <ProgressBar value={30} className='mt-4 rounded-full overflow-hidden' />
                <div className="font-medium text-sm flex items-center gap-2 mt-2">
                    Deposited: 22.33 <Tip>The deposited assets will become LP after launch and users can withdraw deposited assets anytime.</Tip>
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
                    disabled={inputAssetBn <= 0n || inputAssetBn > assetBalance}
                    spender={vc.vault}
                    approves={{
                        [vc.asset]: inputAssetBn,
                    }}
                    config={{
                        abi: abiBVault2,
                        address: vc.vault,
                        functionName: 'deposit',
                        args: [inputAssetBn],
                    }}
                    onTxSuccess={() => {
                        setInputAsset('')
                        // upForUserAction()
                    }}
                />
            </div>
        </div>
    </div>
}

export function BVault2Info({ vc }: { vc: BVault2Config }) {
    return <div className="card bg-white flex flex-col gap-10">
        <div className="flex items-center gap-4">
            <div className="flex items-center font-semibold text-2xl mr-auto"><CoinIcon size={30} symbol="vIP" />vIP-Verio Vault</div>
            <div className="flex flex-col gap-2 mt-2">
                <div className="font-semibold text-sm">Underlying Asset</div>
                <div className="flex items-center gap-2 text-xs font-medium leading-4"> <CoinIcon size={16} symbol="vIP" /> vIP</div>
            </div>
            <div className="flex flex-col gap-2 mt-2 ml-10">
                <div className="font-semibold text-sm">Total Vaule Locked</div>
                <div className="text-xs font-medium opacity-60 leading-4">$232323.29</div>
            </div>
        </div>
        <div className="font-medium text-sm opacity-70">
            Verio is the liquid staking and IP asset restaking platform for Story. Users stake IP to receive vIP, a yield bearing LSD.
            vIP can be restaked on multiple IP Assets to earn profits, while YT holders can leverage profits through the vIP-Verio Vault.
        </div>

        <div className="flex flex-col gap-2 text-xs">
            <div className="opacity-60 flex justify-between items-center"><span>Duration</span><span>~12 days remaining</span></div>
            <ProgressBar value={30} className='rounded-full overflow-hidden' />
            <div className="opacity-70 flex justify-between items-center"><span>9/10/2024, 12:54PM</span><span>9/10/2024, 12:54PM</span></div>
        </div>
    </div>
}


export function BVault2Swaps({ vc }: { vc: BVault2Config }) {
    return <div className="card bg-white h-full min-h-[48.6875rem]">
        <SimpleTabs
            listClassName="p-0 gap-8 mb-4"
            triggerClassName={`text-2xl font-semibold leading-none data-[state="active"]:underline underline-offset-2`}
            data={[
                { tab: 'PT', content: <PT vc={vc} /> },
                { tab: 'YT', content: <YT vc={vc} /> },
                { tab: 'LP', content: <LP vc={vc} /> },
                { tab: 'BT', content: <BT vc={vc} /> },
            ]}
        />
    </div>
}

