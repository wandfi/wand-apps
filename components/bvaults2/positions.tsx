import { abiMaturityPool, abiRewardManager } from "@/config/abi/BVault2";
import { BVault2Config } from "@/config/bvaults2";
import { Token } from "@/config/tokens";
import { useCurrentChainId } from "@/hooks/useCurrentChainId";
import { cn, getTokenBy } from "@/lib/utils";
import { displayBalance } from "@/utils/display";
import { useMemo } from "react";
import { useAccount } from "wagmi";
import { ApproveAndTx } from "../approve-and-tx";
import { CoinAmount } from "../coin-amount";
import { CoinIcon } from "../icons/coinicon";
import STable from "../simple-table";
import { useBvault2LPBTRewards, useBvault2YTRewards, useBvualt2Data, useBvualt2PTRedeems } from "./useFets";
import { useBalance } from "./useToken";
import { now } from "lodash";
import { reFet } from "@/hooks/useFet";

const MCoinAmount = ({ ...p }: Parameters<typeof CoinAmount>[0]) => {
    return <CoinAmount className="font-bold text-sm" symbolClassName="opacity-100" {...p} />
}
function TokenSymbol({ t, size = 32, className }: { t?: Token, size?: number, className?: string }) {
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
    const redeems = useBvualt2PTRedeems(vc)
    const data = useMemo(() => {
        if (!redeems.result.length) return []
        return redeems.result.map(item => {
            const epochActive = (item.startTime + item.duration) * 1000n > BigInt(now())
            const pt = { address: item.PT, chain: [chainId], symbol: `p${asset.symbol}`, decimals: asset.decimals } as Token
            return [
                <TokenSymbol key="token" t={pt} />,
                <MCoinAmount key='ptBalance' token={getTokenBy(vc.bt)} />,
                epochActive ? 'Active' : 'Mature',
                <div key='redeemable'>
                    <MCoinAmount token={getTokenBy(vc.bt)} amount={item.redeemable} />
                </div>,
                <ApproveAndTx onTxSuccess={() => reFet(redeems.key)} key="claim" className="w-28 font-semibold h-7" tx="Claim" disabled={item.redeemable <= 0n} config={{ abi: abiMaturityPool, functionName: 'redeem', address: vc.maturitypool, args: [pt.address, item.redeemable] }} />,
            ]
        })
    }, [redeems.result])
    const header = ['PT', 'Value', 'Status', 'Redeemable', '']
    return <div className="card !p-4 bg-white">
        <STable
            headerClassName='text-left font-semibold border-b-0'
            headerItemClassName='py-1 px-0 text-base'
            rowClassName='text-left text-black text-sm leading-none font-medium'
            cellClassName='py-2 px-0'
            header={header}
            span={{ 2: statuColSize, 3: 2, [header.length - 1]: claimColSize }}
            data={data}
        />
    </div>
}

function TokenBalance({ t }: { t?: Token }) {
    const balance = useBalance(t)
    if (!t) return null;
    return <>{displayBalance(balance.result, undefined, t.decimals)}</>
}
function YT({ vc }: { vc: BVault2Config }) {
    const chainId = useCurrentChainId()
    const asset = getTokenBy(vc.asset, chainId)
    const rewards = useBvault2YTRewards(vc)
    const { address } = useAccount()
    const data = useMemo(() => {
        if (!rewards.result.length) {
            return []
        }
        return rewards.result.map(item => {
            const epochActive = (item.startTime + item.duration) * 1000n > BigInt(now())
            const yt = { address: item.YT, chain: [chainId], symbol: `y${asset.symbol}`, decimals: asset.decimals } as Token
            return [
                <TokenSymbol key="token" t={yt} />,
                <TokenBalance t={yt} key='ytBalance' />,
                epochActive ? 'Active' : 'Rewards for mature YT',
                <div key="token2">
                    {item.rewrads.map(([token, amount]) => <MCoinAmount token={getTokenBy(token)} key={`rewards_${token}`} amount={amount} />)}
                </div>,
                '',
                <ApproveAndTx onTxSuccess={() => reFet(rewards.key)} key="claim" className="w-28 font-semibold h-7" tx="Claim" config={{ abi: abiRewardManager, functionName: 'claimRewards', address: yt.address, args: [address!] }} />,
            ]
        })
    }, [rewards.result])
    const header = ['YT', 'Value', 'Status', 'Yield', 'Airdrops', '']
    return <div className="card !p-4 bg-white">
        <STable
            headerClassName='text-left font-semibold border-b-0'
            headerItemClassName='py-1 px-0 text-base'
            rowClassName='text-left text-black text-sm leading-none font-medium'
            cellClassName='py-2 px-0'
            header={header}
            span={{ 2: statuColSize, [header.length - 1]: claimColSize }}
            data={data}
        />
    </div>
}
function LPBT({ vc }: { vc: BVault2Config }) {
    useCurrentChainId()
    const rewards = useBvault2LPBTRewards(vc)
    const { address } = useAccount()
    const data = useMemo(() => {
        if (!rewards.result.length) return []
        return rewards.result.map(item => [
            <TokenSymbol key="token" t={item.token} />, <TokenBalance t={item.token} key={'tokenBalance'} />, '', <div key="token2">
                {item.rewards.map(([token, amount]) => <MCoinAmount token={getTokenBy(token)} key={`rewards_${token}`} amount={amount} />)}
            </div>,
            <MCoinAmount key="amount" token={getTokenBy('0x5267F7eE069CEB3D8F1c760c215569b79d0685aD')} />,
            <ApproveAndTx onTxSuccess={() => reFet(rewards.key)} key="claim" className="w-28 font-semibold h-7" tx="Claim" config={{ abi: abiRewardManager, functionName: 'claimRewards', address: item.token.address, args: [address!] }} />,
        ])
    }, [rewards.result])
    const header = ['YT', 'Value', '', 'Yield', 'Airdrops', '']
    return <div className="card !p-4 bg-white">
        <STable
            headerClassName='text-left font-semibold border-b-0'
            headerItemClassName='py-1 px-0 text-base'
            rowClassName='text-left text-black text-sm leading-none font-medium'
            cellClassName='py-2 px-0'
            header={header}
            span={{ 2: statuColSize, [header.length - 1]: claimColSize }}
            data={data}
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