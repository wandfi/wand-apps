import { abiBT } from "@/config/abi/BVault2";
import { BVault2Config } from "@/config/bvaults2";
import { useCurrentChainId } from "@/hooks/useCurrentChainId";
import { fmtBn, formatPercent, getTokenBy, handleError, parseEthers } from "@/lib/utils";
import { useState } from "react";
import { useDebounce, useToggle } from "react-use";
import { useAccount, useWalletClient } from "wagmi";
import { ApproveAndTx } from "../approve-and-tx";
import { AssetInput } from "../asset-input";
import { GetvIP } from "../get-lp";
import { CoinIcon } from "../icons/coinicon";
import { Swap } from "../ui/bbtn";
import { useBalance, useTotalSupply } from "./useToken";
import { displayBalance } from "@/utils/display";
import { reFet } from "@/hooks/useFet";
import { useQuery } from "@tanstack/react-query";
import { getPC } from "@/providers/publicClient";
import { useUnderlingApy } from "./useDatas";

export function BT({ vc }: { vc: BVault2Config }) {
    const chainId = useCurrentChainId()
    const asset = getTokenBy(vc.asset, chainId)
    const bt = getTokenBy(vc.bt, chainId)
    const { data: walletClient } = useWalletClient()
    const onAddPToken = () => {
        walletClient?.watchAsset({ type: 'ERC20', options: bt }).catch(handleError)
    }
    const { address } = useAccount()
    const assetBalance = useBalance(asset)
    const btBalance = useBalance(bt)
    const btTotalSupply = useTotalSupply(bt)
    const [inputAsset, setInputAsset] = useState('')
    const inputAssetBn = parseEthers(inputAsset)
    const [isToggled, toggle] = useToggle(false)
    const inputBalance = isToggled ? btBalance : assetBalance
    const input = isToggled ? bt : asset
    const output = isToggled ? asset : bt
    const [calcOutAmountKey, setCalcOutAmountKey] = useState<any[]>(['calcBTSwapOut'])
    useDebounce(() => setCalcOutAmountKey(['calcBTSwapOut', isToggled, inputAssetBn]), 300, [isToggled, inputAssetBn])
    const { data: outAmount, isFetching: isFetchingCalc } = useQuery({
        queryKey: calcOutAmountKey,
        initialData: 0n,
        enabled: calcOutAmountKey.length > 1,
        queryFn: async () => getPC().readContract({ abi: abiBT, address: vc.bt, functionName: isToggled ? 'previewRedeem' : 'previewDeposit', args: isToggled ? [vc.asset, inputAssetBn] : [vc.asset, inputAssetBn] })
    })
    const onSwitch = () => {
        toggle()
    }
    const { result: unlerlingApy } = useUnderlingApy(vc)
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
                <div className="text-lg font-medium">{formatPercent(unlerlingApy)}</div>
                <div className="text-xs font-semibold opacity-60">Underlying APY</div>
                <div className="text-xs font-semibold opacity-60 ml-auto">Circulation amount</div>
                <div className="text-lg font-medium">{displayBalance(btTotalSupply.result, undefined, bt.decimals)}</div>
            </div>
            <div className='flex px-2.5 pb-4'>
                <button className='btn-link ml-auto text-primary text-xs underline-offset-2' onClick={onAddPToken}>
                    Add to wallet
                </button>
            </div>

        </div>
        <div className='card !p-4 flex flex-col gap-1'>
            <AssetInput asset={input.symbol} amount={inputAsset} balance={inputBalance.result} setAmount={setInputAsset} />
            <Swap onClick={onSwitch} />
            <div className="flex justify-between items-center">
                <div className="font-bold">Receive</div>
                <GetvIP address={asset.address} />
            </div>
            <AssetInput asset={output.symbol} loading={isFetchingCalc && inputAssetBn > 0n} disable amount={fmtBn(outAmount, output.decimals)} />
            <ApproveAndTx
                className='mx-auto mt-4'
                tx={isToggled ? 'Unwrap' : 'Wrap'}
                disabled={inputAssetBn <= 0n}
                spender={bt.address}
                approves={{
                    [input.address]: inputAssetBn,
                }}
                config={{
                    abi: abiBT,
                    address: bt.address,
                    functionName: isToggled ? 'redeem' : 'deposit',
                    args: isToggled ? [address!, inputAssetBn, asset.address, 0n] : [address!, asset.address, inputAssetBn, 0n],
                }}
                onTxSuccess={() => {
                    setInputAsset('')
                    reFet(assetBalance.key, btBalance.key, btTotalSupply.key)
                }}
            />
        </div>
    </div>
}