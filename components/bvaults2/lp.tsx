import { BVault2Config } from "@/config/bvaults2"
import { useCurrentChainId } from "@/hooks/useCurrentChainId"
import { getTokenBy, handleError, parseEthers } from "@/lib/utils"
import { useWalletClient } from "wagmi"
import { CoinIcon } from "../icons/coinicon"
import { CoinAmount } from "../coin-amount"
import { SimpleTabs } from "../simple-tabs"
import { useBalances } from "@/providers/useTokenStore"
import { useState } from "react"
import { AssetInput } from "../asset-input"
import { SwapDown } from "../ui/bbtn"
import { GetvIP } from "../get-lp"
import { ApproveAndTx } from "../approve-and-tx"
import { abiBVault2 } from "@/config/abi"
import { shuffle } from "lodash"
import { Switch } from "../ui/switch"


function LPAdd({ vc }: { vc: BVault2Config }) {
    const chainId = useCurrentChainId()
    const asset = getTokenBy(vc.asset, chainId)
    const lp = getTokenBy(vc.lp, chainId)
    const yt = getTokenBy(vc.yt, chainId)
    const pt = getTokenBy(vc.pt, chainId)
    const balances = useBalances()
    const assetBalance = balances[vc.asset]
    const [inputAsset, setInputAsset] = useState('')
    const inputAssetBn = parseEthers(inputAsset)
    const input = asset
    const andout = shuffle([yt, pt])[0]
    return <div className='flex flex-col gap-1'>
        <AssetInput asset={input.symbol} amount={inputAsset} balance={balances[input.address]} setAmount={setInputAsset} />
        <SwapDown />
        <div className="flex justify-between items-center">
            <div className="font-bold">Receive</div>
            <GetvIP address={asset.address} />
        </div>
        <AssetInput asset={lp.symbol} disable amount={inputAsset} />
        <div className="text-center opacity-60 text-xs font-medium">And</div>
        <AssetInput asset={andout.symbol} disable amount={inputAsset} />
        <div className="font-medium text-xs opacity-60">Pool Share Change: 233% → 235%</div>
        <ApproveAndTx
            className='mx-auto mt-4'
            tx='Add'
            disabled={inputAssetBn <= 0n || inputAssetBn > assetBalance}
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
}
function LPRemove({ vc }: { vc: BVault2Config }) {
    const chainId = useCurrentChainId()
    const asset = getTokenBy(vc.asset, chainId)
    const lp = getTokenBy(vc.lp, chainId)
    const yt = getTokenBy(vc.yt, chainId)
    const pt = getTokenBy(vc.pt, chainId)
    const balances = useBalances()
    const assetBalance = balances[vc.asset]
    const [inputAsset, setInputAsset] = useState('')
    const inputAssetBn = parseEthers(inputAsset)
    const input = lp
    const andout = shuffle([yt, pt])[0]
    return <div className='flex flex-col gap-1'>
        <AssetInput asset={input.symbol} amount={inputAsset} balance={balances[input.address]} setAmount={setInputAsset} />
        <SwapDown />
        <div className="flex justify-between items-center text-xs font-medium">
            <span>Keep PT/YT mode</span>
            <Switch />
        </div>
        <div className="flex justify-between items-center">
            <div className="font-bold">Receive</div>
            <GetvIP address={asset.address} />
        </div>
        <AssetInput asset={asset.symbol} disable amount={inputAsset} />
        <div className="text-center opacity-60 text-xs font-medium">And</div>
        <AssetInput asset={andout.symbol} disable amount={inputAsset} />
        <div className="font-medium text-xs opacity-60">Pool Share Change: 233% → 235%</div>
        <ApproveAndTx
            className='mx-auto mt-4'
            tx='Remove'
            disabled={inputAssetBn <= 0n || inputAssetBn > assetBalance}
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
}
export function LP({ vc }: { vc: BVault2Config }) {
    const chainId = useCurrentChainId()
    const asset = getTokenBy(vc.asset, chainId)
    const lp = getTokenBy(vc.lp, chainId)
    const bt = getTokenBy(vc.bt, chainId)
    const pt = getTokenBy(vc.pt, chainId)
    const yt = getTokenBy(vc.yt, chainId)
    const { data: walletClient } = useWalletClient()
    const onAddPToken = () => {
        walletClient?.watchAsset({ type: 'ERC20', options: lp }).catch(handleError)
    }
    return <div className="flex flex-col gap-4 w-full">
        <div className='card !p-0 overflow-hidden w-full'>
            <div className='flex p-5 bg-[#E8E8FD] gap-5'>
                <CoinIcon size={48} symbol={lp.symbol} />
                <div className='flex flex-col gap-3'>
                    <div className='text-xl leading-6 text-black dark:text-white font-semibold'>{lp.symbol}</div>
                    <div className='text-xs leading-none text-black/60 dark:text-white/60 font-medium'>Provides liquidity for PT and YT transactions.</div>
                </div>
            </div>
            <div className='flex whitespace-nowrap items-baseline justify-between px-2.5 pt-2 gap-2.5'>
                <div className="text-lg font-medium">150%</div>
                <div className="text-xs font-semibold opacity-60">APY</div>
                <div className="text-xs font-semibold opacity-60 ml-auto">LP amount</div>
                <div className="text-lg font-medium">23,132.32</div>
            </div>
            <div className='flex px-2.5'>
                <button className='btn-link ml-auto text-primary text-xs underline-offset-2' onClick={onAddPToken}>
                    Add to wallet
                </button>
            </div>
            <div className="pb-4 px-3 text-xs flex flex-col gap-2">
                <span className="opacity-60">LP Positions</span>
                <div className="flex justify-between items-center gap-5">
                    <CoinAmount token={bt} />
                    <CoinAmount token={pt} />
                    <CoinAmount token={yt} />
                </div>
            </div>
        </div>
        <div className="card !p-4">
            <SimpleTabs
                listClassName="p-0 gap-6 mb-4"
                triggerClassName={`text-base font-bold leading-none data-[state="active"]:text-black`}
                data={[
                    { tab: 'Add', content: <LPAdd vc={vc} /> },
                    { tab: 'Remove', content: <LPRemove vc={vc} /> },
                ]}
            />
        </div>
    </div>
}