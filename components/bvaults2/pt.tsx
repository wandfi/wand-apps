import { BVault2Config } from "@/config/bvaults2"
import { useCurrentChainId } from "@/hooks/useCurrentChainId"
import { getTokenBy, handleError, parseEthers } from "@/lib/utils"
import { useWalletClient } from "wagmi"
import { CoinIcon } from "../icons/coinicon"
import { SimpleTabs } from "../simple-tabs"
import { AssetInput } from "../asset-input"
import { useState } from "react"
import { useBalances } from "@/providers/useTokenStore"
import { Swap, SwapDown } from "../ui/bbtn"
import { GetvIP } from "../get-lp"
import { ApproveAndTx } from "../approve-and-tx"
import { abiBVault2 } from "@/config/abi"
import { useToggle } from "react-use"
import { Fees } from "../fees"

function PTSwap({ vc }: { vc: BVault2Config }) {
    const chainId = useCurrentChainId()
    const asset = getTokenBy(vc.asset, chainId)
    const pt = getTokenBy(vc.pt, chainId)
    const balances = useBalances()
    const assetBalance = balances[vc.asset]
    const [inputAsset, setInputAsset] = useState('')
    const inputAssetBn = parseEthers(inputAsset)
    const [isToggled, toggle] = useToggle(false)
    const input = isToggled ? pt : asset
    const output = isToggled ? asset : pt
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
            <div>Implied APY Change: 233% → 235%</div>
            <Fees fees={[{ name: 'Transaction Fees', value: 1.2 }, { name: 'Unstake Fees(Verio)', value: 1.2 }]}/>
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
export function PTYTMint({ vc }: { vc: BVault2Config }) {
    const chainId = useCurrentChainId()
    const asset = getTokenBy(vc.asset, chainId)
    const pt = getTokenBy(vc.pt, chainId)
    const yt = getTokenBy(vc.yt, chainId)
    const balances = useBalances()
    const assetBalance = balances[vc.asset]
    const [inputAsset, setInputAsset] = useState('')
    const inputAssetBn = parseEthers(inputAsset)
    const input = asset
    return <div className='flex flex-col gap-1'>
        <AssetInput asset={input.symbol} amount={inputAsset} balance={balances[input.address]} setAmount={setInputAsset} />
        <SwapDown />
        <div className="flex justify-between items-center">
            <div className="font-bold">Receive</div>
            <GetvIP address={asset.address} />
        </div>
        <AssetInput asset={pt.symbol} disable amount={inputAsset} />
        <div className="text-center opacity-60 text-xs font-medium">And</div>
        <AssetInput asset={`y${asset.symbol}`} disable amount={inputAsset} />
        <ApproveAndTx
            className='mx-auto mt-4'
            tx='Mint'
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
export function PTYTRedeem({ vc }: { vc: BVault2Config }) {
    const chainId = useCurrentChainId()
    const asset = getTokenBy(vc.asset, chainId)
    const pt = getTokenBy(vc.pt, chainId)
    const yt = getTokenBy(vc.yt, chainId)
    const balances = useBalances()
    const assetBalance = balances[vc.asset]
    const [input1, setInput1] = useState('')
    const [input2, setInput2] = useState('')
    const input1Bn = parseEthers(input1)
    const input2Bn = parseEthers(input2)

    return <div className='flex flex-col gap-1'>
        <AssetInput asset={pt.symbol} amount={input1} balance={balances[pt.address]} setAmount={setInput1} />
        <div className="text-center opacity-60 text-xs font-medium">And</div>
        <AssetInput asset={`y${asset.symbol}`} amount={input2} balance={0n} setAmount={setInput2} />
        <SwapDown />
        <div className="flex justify-between items-center">
            <div className="font-bold">Receive</div>
            <GetvIP address={asset.address} />
        </div>
        <AssetInput asset={asset.symbol} disable amount={'0'} />

        <ApproveAndTx
            className='mx-auto mt-4'
            tx='Redeem'
            disabled={input1Bn <= 0n || input2Bn <= 0n}
            spender={vc.vault}
            config={{
                abi: abiBVault2,
                address: vc.vault,
                functionName: 'swap',
                args: [0n],
            }}
            onTxSuccess={() => {
            }}
        />
    </div>
}

export function PT({ vc }: { vc: BVault2Config }) {
    const chainId = useCurrentChainId()
    const asset = getTokenBy(vc.asset, chainId)
    const pt = getTokenBy(vc.pt, chainId)
    const { data: walletClient } = useWalletClient()
    const onAddPToken = () => {
        walletClient?.watchAsset({ type: 'ERC20', options: pt }).catch(handleError)
    }
    return <div className="flex flex-col gap-4 w-full">
        <div className='card !p-0 overflow-hidden w-full'>
            <div className='flex p-5 bg-[#10B98126] gap-5'>
                <CoinIcon size={48} symbol='PToken' />
                <div className='flex flex-col gap-3'>
                    <div className='text-xl leading-6 text-black dark:text-white font-semibold'>{pt.symbol}</div>
                    <div className='text-xs leading-none text-black/60 dark:text-white/60 font-medium'>1 {pt.symbol} is equal to1 {asset.symbol} at maturity</div>
                </div>
            </div>
            <div className='flex whitespace-nowrap items-baseline justify-between px-2.5 pt-2 gap-2.5'>
                <div className="text-lg font-medium">150%</div>
                <div className="text-xs font-semibold opacity-60">Fixed APY</div>
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
                    { tab: 'Swap', content: <PTSwap vc={vc} /> },
                    { tab: 'Mint', content: <PTYTMint vc={vc} /> },
                    { tab: 'Redeem', content: <PTYTRedeem vc={vc} /> },
                ]}
            />
        </div>
    </div>
}