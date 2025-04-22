import { BVault2Config } from "@/config/bvaults2"
import { AssetInput } from "../asset-input"
import { Swap } from "../ui/bbtn"
import { useCurrentChainId } from "@/hooks/useCurrentChainId"
import { getTokenBy, handleError, parseEthers } from "@/lib/utils"
import { useBalances } from "@/providers/useTokenStore"
import { useState } from "react"
import { useToggle } from "react-use"
import { GetvIP } from "../get-lp"
import { ApproveAndTx } from "../approve-and-tx"
import { abiBVault2 } from "@/config/abi"
import { useWalletClient } from "wagmi"
import { CoinIcon } from "../icons/coinicon"
import { SimpleTabs } from "../simple-tabs"
import { PTYTMint, PTYTRedeem } from "./pt"
import { Tip } from "../ui/tip"

function YTSwap({ vc }: { vc: BVault2Config }) {
    const chainId = useCurrentChainId()
    const asset = getTokenBy(vc.asset, chainId)
    const yt = getTokenBy(vc.yt, chainId)
    const balances = useBalances()
    const assetBalance = balances[vc.asset]
    const [inputAsset, setInputAsset] = useState('')
    const inputAssetBn = parseEthers(inputAsset)
    const [isToggled, toggle] = useToggle(false)
    const input = isToggled ? yt : asset
    const output = isToggled ? asset : yt
    const swapPrice = `1 ${input.symbol} = ${'23.3'} ${output.symbol}`
    const priceImpact = `20%`
    const onSwitch = () => {
        toggle()
    }
    return <div className='flex flex-col gap-1'>
        <AssetInput asset={input.symbol} amount={inputAsset} balance={balances[input.address]} setAmount={setInputAsset} />
        <Swap onClick={onSwitch} />
        <div className="flex justify-between items-center">
            <div className="font-bold">Receive</div>
            <GetvIP address={asset.address} />
        </div>
        <AssetInput asset={output.symbol} disable amount={inputAsset} />
        <div className="flex justify-between items-center text-xs font-medium">
            <div>Price: {swapPrice}</div>
            <div>Price Impact: {priceImpact}</div>
        </div>
        <div className="flex justify-between items-center text-xs font-medium opacity-60">
            <div>
                Est. ROI Change:   233% → 235%<br />
                Implied APY Change: 233% → 235%
            </div>
            <div>Fees: $54.48</div>
        </div>
        <ApproveAndTx
            className='mx-auto mt-4'
            tx='Swap'
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
export function YT({ vc }: { vc: BVault2Config }) {
    const chainId = useCurrentChainId()
    const asset = getTokenBy(vc.asset, chainId)
    const yt = getTokenBy(vc.yt, chainId)
    const { data: walletClient } = useWalletClient()
    const onAddPToken = () => {
        walletClient?.watchAsset({ type: 'ERC20', options: yt }).catch(handleError)
    }
    return <div className="flex flex-col gap-4 w-full">
        <div className='card !p-0 overflow-hidden w-full'>
            <div className='flex p-5 bg-[#E8E8FD] gap-5'>
                <CoinIcon size={48} symbol='YToken' />
                <div className='flex flex-col gap-3'>
                    <div className='text-xl leading-6 text-black dark:text-white font-semibold'>{yt.symbol}</div>
                    <div className='text-xs leading-none text-black/60 dark:text-white/60 font-medium'>1 {yt.symbol} gets the yield of 1 {asset.symbol} until maturity</div>
                </div>
            </div>
            <div className='flex whitespace-nowrap items-baseline justify-between px-2.5 pt-2 gap-2.5'>
                <div className="text-lg font-medium">150%</div>
                <div className="text-xs font-semibold opacity-60">Est.ROI <Tip>If underlying APY remains unchanged from now on</Tip></div>
                <div className="text-xs font-semibold opacity-60 ml-auto">Circulation amount</div>
                <div className="text-lg font-medium">23,132.32</div>
            </div>
            <div className='flex px-2 pb-4'>
                <button className='btn-link ml-auto text-primary text-xs underline-offset-2' onClick={onAddPToken}>
                    Add to wallet
                </button>
            </div>
        </div>
        <div className="card !p-4">
            <SimpleTabs
                listClassName="p-0 gap-6 mb-4"
                triggerClassName={`text-base font-bold leading-none data-[state="active"]:text-black`}
                data={[
                    { tab: 'Swap', content: <YTSwap vc={vc} /> },
                    { tab: 'Mint', content: <PTYTMint vc={vc} /> },
                    { tab: 'Redeem', content: <PTYTRedeem vc={vc} /> },
                ]}
            />
        </div>
    </div>
}
