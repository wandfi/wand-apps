import { BVault2Config } from "@/config/bvaults2";
import { useCurrentChainId } from "@/hooks/useCurrentChainId";
import { getTokenBy, handleError, parseEthers } from "@/lib/utils";
import { useWalletClient } from "wagmi";
import { CoinIcon } from "../icons/coinicon";
import { AssetInput } from "../asset-input";
import { useState } from "react";
import { useToggle } from "react-use";
import { Swap } from "../ui/bbtn";
import { useBalances } from "@/providers/useTokenStore";
import { GetvIP } from "../get-lp";
import { ApproveAndTx } from "../approve-and-tx";
import { abiBVault2 } from "@/config/abi";

export function BT({ vc }: { vc: BVault2Config }) {
    const chainId = useCurrentChainId()
    const asset = getTokenBy(vc.asset, chainId)
    const lp = getTokenBy(vc.lp, chainId)
    const bt = getTokenBy(vc.bt, chainId)
    const pt = getTokenBy(vc.pt, chainId)
    const yt = getTokenBy(vc.yt, chainId)
    const { data: walletClient } = useWalletClient()
    const onAddPToken = () => {
        walletClient?.watchAsset({ type: 'ERC20', options: bt }).catch(handleError)
    }
    const balances = useBalances()
    const [inputAsset, setInputAsset] = useState('')
    const inputAssetBn = parseEthers(inputAsset)
    const [isToggled, toggle] = useToggle(false)
    const input = isToggled ? bt : asset
    const output = isToggled ? asset : bt

    const onSwitch = () => {
        toggle()
    }
    return <div className="flex flex-col gap-4 w-full">
        <div className='card !p-0 overflow-hidden w-full'>
            <div className='flex p-5 bg-[#E8E8FD] gap-5'>
                <CoinIcon size={48} symbol={bt.symbol} />
                <div className='flex flex-col gap-3'>
                    <div className='text-xl leading-6 text-black dark:text-white font-semibold'>{bt.symbol}</div>
                    <div className='text-xs leading-none text-black/60 dark:text-white/60 font-medium'>{bt.symbol} is a 1:1 wrapped version of the {asset.symbol}</div>
                </div>
            </div>
            <div className='flex whitespace-nowrap items-baseline justify-between px-2.5 pt-2 gap-2.5'>
                <div className="text-lg font-medium">150%</div>
                <div className="text-xs font-semibold opacity-60">Underlying APY</div>
                <div className="text-xs font-semibold opacity-60 ml-auto">Circulation amount</div>
                <div className="text-lg font-medium">23,132.32</div>
            </div>
            <div className='flex px-2.5 pb-4'>
                <button className='btn-link ml-auto text-primary text-xs underline-offset-2' onClick={onAddPToken}>
                    Add to wallet
                </button>
            </div>

        </div>
        <div className='card !p-4 flex flex-col gap-1'>
            <AssetInput asset={input.symbol} amount={inputAsset} balance={balances[input.address]} setAmount={setInputAsset} />
            <Swap onClick={onSwitch} />
            <div className="flex justify-between items-center">
                <div className="font-bold">Receive</div>
                <GetvIP address={asset.address} />
            </div>
            <AssetInput asset={output.symbol} disable amount={inputAsset} />

            <ApproveAndTx
                className='mx-auto mt-4'
                tx={isToggled ? 'Unwrap' : 'Wrap'}
                disabled={inputAssetBn <= 0n}
                spender={vc.vault}
                approves={{
                    [vc.asset]: inputAssetBn,
                }}
                config={{
                    abi: abiBVault2,
                    address: vc.vault,
                    functionName: 'swap',
                    args: [inputAssetBn],
                }}
                onTxSuccess={() => {
                    setInputAsset('')
                }}
            />
        </div>
    </div>
}