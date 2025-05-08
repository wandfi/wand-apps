import { BVault2Config } from "@/config/bvaults2";
import STable from "../simple-table";
import { Address } from "viem";
import { cn, getTokenBy } from "@/lib/utils";
import { CoinIcon } from "../icons/coinicon";
import { CoinAmount } from "../coin-amount";
import { Fees } from "../fees";
import { ApproveAndTx } from "../approve-and-tx";
import { abiBVault2, abiMaturityPool } from "@/config/abi/BVault2";
import { useCurrentChainId } from "@/hooks/useCurrentChainId";
import { useBvualt2Data } from "./useFets";
import { Token } from "@/config/tokens";

const MCoinAmount = ({ ...p }: Parameters<typeof CoinAmount>[0]) => {
    return <CoinAmount className="font-bold text-sm" symbolClassName="opacity-100" {...p} />
}
function TokenSymbol({ address, size = 32, className }: { address: Address, size?: number, className?: string }) {
    const t = getTokenBy(address)
    if (!t) return null
    return <div className={cn("flex gap-2 items-center font-semibold", className)}>
        <CoinIcon symbol={t.symbol} size={size} />
        {t.symbol}
    </div>
}

const claimColSize = 1.3;
const statuColSize = 1.6
function PT({ vc }: { vc: BVault2Config }) {
    const chainId = useCurrentChainId()
    const asset = getTokenBy(vc.asset, chainId)
    const vd = useBvualt2Data(vc)
    const epoch = vd.result!.current
    if (!epoch) return null
    const pt = { address: epoch.PT, chain: [chainId], symbol: `p${asset.symbol}`, decimals: asset.decimals } as Token
    const yt = { address: epoch.YT, chain: [chainId], symbol: `y${asset.symbol}`, decimals: asset.decimals } as Token
    const header = ['PT', 'Value', 'Status', 'Redeemable', '']
    return <div className="card !p-4 bg-white">
        <STable
            headerClassName='text-left font-semibold border-b-0'
            headerItemClassName='py-1 px-0 text-base'
            rowClassName='text-left text-black text-sm leading-none font-medium'
            cellClassName='py-2 px-0'
            header={header}
            span={{ 2: statuColSize, 3: 2, [header.length - 1]: claimColSize }}
            data={[
                [<TokenSymbol address={pt.address} key="token" />, '12.33', 'Active', '', ''],
                [<TokenSymbol address={pt.address} key="token2" />, '12.33', 'Mature', <div key="fees" className="flex items-center gap-10">
                    <MCoinAmount token={getTokenBy(vc.bt)} />
                    <Fees fees={[{ name: 'Transaction Fees', value: 1.2 }, { name: 'Unstake Fees(Verio)', value: 1.2 }]} />
                </div>,
                <ApproveAndTx key="claim" className="w-28 font-semibold h-7" tx="Redeem" config={{ abi: abiMaturityPool, functionName: 'redeem', address: vc.vault, args: [pt.address, 0n] }} />
                ]
            ]}
        />
    </div>
}
function YT({ vc }: { vc: BVault2Config }) {
    const chainId = useCurrentChainId()
    const asset = getTokenBy(vc.asset, chainId)
    const vd = useBvualt2Data(vc)
    const epoch = vd.result!.current
    if (!epoch) return null
    const pt = { address: epoch.PT, chain: [chainId], symbol: `p${asset.symbol}`, decimals: asset.decimals } as Token
    const yt = { address: epoch.YT, chain: [chainId], symbol: `y${asset.symbol}`, decimals: asset.decimals } as Token
    const header = ['YT', 'Value', 'Status', 'Yield', 'Airdrops', '']
    return <div className="card !p-4 bg-white">
        <STable
            headerClassName='text-left font-semibold border-b-0'
            headerItemClassName='py-1 px-0 text-base'
            rowClassName='text-left text-black text-sm leading-none font-medium'
            cellClassName='py-2 px-0'
            header={header}
            span={{ 2: statuColSize, [header.length - 1]: claimColSize }}
            data={[
                [
                    <TokenSymbol key="token" address={yt.address} />, '12.33', 'Active', <div key="token2">
                        <MCoinAmount token={getTokenBy(vc.asset)} />
                        <MCoinAmount token={getTokenBy(vc.reward2)} />
                    </div>, '',
                    '',
                    // <ApproveAndTx key="claim" className="w-28 font-semibold h-7" tx="Claim" disabled config={{ abi: abiBVault2, functionName: 'redeem', address: vc.vault, args: [0n] }} />,
                ],

                [
                    '', '', 'Rewards for mature YT', <div key="token2">
                        <MCoinAmount token={getTokenBy(vc.asset)} />
                        <MCoinAmount token={getTokenBy(vc.reward2)} />
                    </div>,
                    <MCoinAmount key="amount" token={getTokenBy('0x5267F7eE069CEB3D8F1c760c215569b79d0685aD')} />,
                    '',
                    // <ApproveAndTx key="claim" className="w-28 font-semibold h-7" tx="Claim" disabled config={{ abi: abiBVault2, functionName: 'redeem', address: vc.vault, args: [0n] }} />
                ]
            ]}
        />
    </div>
}
function LPBT({ vc }: { vc: BVault2Config }) {
    const chainId = useCurrentChainId()
    const asset = getTokenBy(vc.asset, chainId)
    const vd = useBvualt2Data(vc)
    const epoch = vd.result!.current
    if (!epoch) return null
    const lp = { address: vd.result!.hook, symbol: `LP${asset.symbol}`, chain: [chainId], decimals: asset.decimals, } as Token
    const pt = { address: epoch.PT, chain: [chainId], symbol: `p${asset.symbol}`, decimals: asset.decimals } as Token
    const yt = { address: epoch.YT, chain: [chainId], symbol: `y${asset.symbol}`, decimals: asset.decimals } as Token
    const header = ['YT', 'Value', '', 'Yield', 'Airdrops', '']
    return <div className="card !p-4 bg-white">
        <STable
            headerClassName='text-left font-semibold border-b-0'
            headerItemClassName='py-1 px-0 text-base'
            rowClassName='text-left text-black text-sm leading-none font-medium'
            cellClassName='py-2 px-0'
            header={header}
            span={{ 2: statuColSize, [header.length - 1]: claimColSize }}
            data={[
                [
                    <TokenSymbol key="token" address={lp.address} />, '12.33', '', <div key="token2">
                        <MCoinAmount token={getTokenBy(vc.asset)} />
                        <MCoinAmount token={getTokenBy(vc.reward2)} />
                    </div>,
                    <MCoinAmount key="amount" token={getTokenBy('0x5267F7eE069CEB3D8F1c760c215569b79d0685aD')} />,
                    '',
                    // <ApproveAndTx key="claim" className="w-28 font-semibold h-7" tx="Claim" disabled config={{ abi: abiBVault2, functionName: 'redeem', address: vc.vault, args: [0n] }} />,
                ],

                [
                    <TokenSymbol key="token" address={vc.bt} />, '12.33', '', <div key="token2">
                        <MCoinAmount token={getTokenBy(vc.asset)} />
                        <MCoinAmount token={getTokenBy(vc.reward2)} />
                    </div>,
                    <MCoinAmount key="amount" token={getTokenBy('0x5267F7eE069CEB3D8F1c760c215569b79d0685aD')} />,
                    '',
                    // <ApproveAndTx key="claim" className="w-28 font-semibold h-7" tx="Claim" disabled config={{ abi: abiBVault2, functionName: 'redeem', address: vc.vault, args: [0n] }} />,
                ]
            ]}
        />
    </div>
}

export function MyPositions({ vc }: { vc: BVault2Config }) {
    return <div className="flex flex-col gap-5">
        <div className="font-semibold text-2xl leading-none">My Positions</div>
        <PT vc={vc} />
        <YT vc={vc} />
        <LPBT vc={vc} />
    </div>
}