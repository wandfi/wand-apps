import { abiBVault2, abiRewardManager } from "@/config/abi/BVault2";
import { type BVault2Config } from "@/config/bvaults2";
import { getTokenBy, type Token } from "@/config/tokens";
import { reFet } from "@/hooks/useFet";
import { cn } from "@/lib/utils";
import { displayBalance } from "@/utils/display";
import { groupBy } from "es-toolkit";
import { keys } from "es-toolkit/compat";
import { type ReactNode, useMemo } from "react";
import { type Address } from "viem";
import { useAccount } from "wagmi";
import { useBalance } from "../../hooks/useToken";
import { ApproveAndTx, Txs } from "../approve-and-tx";
import { CoinAmount } from "../coin-amount";
import { CoinIcon } from "../icons/coinicon";
import STable from "../simple-table";
import { getPtToken, getYtToken } from "./getToken";
import { Points } from "./points";
import { useBvault2LPBTRewards, useBvault2YTRewards, useBvualt2PTRedeems } from "./useFets";


const MCoinAmount = ({ ...p }: Parameters<typeof CoinAmount>[0]) => {
    return <CoinAmount className="font-bold text-sm" symbolClassName="opacity-100" {...p} />
}
function TokenSymbol({ t, size = 32, className }: { t?: Token, size?: number, className?: string }) {
    if (!t) return null
    return <div className={cn("flex gap-2 items-center font-semibold w-max", className)}>
        <CoinIcon symbol={t.symbol} size={size} />
        {t.symbol}
    </div>
}

const claimColSize = 1.3;
const statuColSize = 1.6

export function getPTPositions(vc: BVault2Config, redeems: ReturnType<typeof useBvualt2PTRedeems>['result'], onClaimSuccess?: () => void): ReactNode[][] {
    if (!redeems.length) return []
    const groups = groupBy(redeems, item => {
        const epochActive = (item.startTime + item.duration) * 1000n > BigInt(Date.now())
        return epochActive ? 'active' : 'mature'
    })
    const res = []
    const active = groups['active']?.[0]
    if (active) {
        const pt = getPtToken(vc, active.PT)
        res.push([
            <TokenSymbol key="token" t={pt} />,
            displayBalance(active.redeemable, undefined, pt.decimals),
            'Active',
            <div key='redeemable'>
            </div>,
            <div key='calim'>
            </div>
        ])
    }
    const matures = groups['mature']
    if (matures && matures.length) {
        const pt = getPtToken(vc, active?.PT ?? matures[0].PT)
        const sum = matures.reduce((sum, item) => sum + item.redeemable, 0n)
        res.push([
            active ? '' : <TokenSymbol key="token" t={pt} />,
            displayBalance(sum, undefined, pt.decimals),
            'Mature',
            <div key='redeemable'>
                <MCoinAmount token={getTokenBy(vc.bt, vc.chain)!} amount={sum} />
            </div>,
            <div key='calim'>
                <Txs
                    tx="Claim"
                    className="w-28 font-semibold h-7"
                    onTxSuccess={onClaimSuccess}
                    txs={matures.filter(item => item.redeemable > 0n).map(item => ({ abi: abiBVault2, functionName: 'redeemByMaturedPT', address: vc.vault, args: [item.PT, item.redeemable] }))}
                />
            </div>
        ])
    }
    return res;
}
function PT({ vc }: { vc: BVault2Config }) {
    const redeems = useBvualt2PTRedeems(vc)
    const data = useMemo(() => getPTPositions(vc, redeems.result, () => reFet(redeems.key)), [vc, redeems.result])
    const header = ['PT', 'Value', 'Status', 'Redeemable', '']
    return <div className="animitem card !p-4 overflow-x-auto">
        <STable
            headerClassName='text-left font-semibold border-b-0'
            headerItemClassName='py-1 px-4 text-base'
            rowClassName='text-left text-black text-sm leading-none font-medium'
            cellClassName='py-2 px-4'
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


export function getYtPositions(vc: BVault2Config, rewards: ReturnType<typeof useBvault2YTRewards>['result'], user: Address, onClaimSuccess?: () => void): ReactNode[][] {
    if (!rewards.length) {
        return []
    }
    const res = []
    const groups = groupBy(rewards, (item) => {
        const epochActive = (item.startTime + item.duration) * 1000n > BigInt(Date.now())
        return epochActive ? 'active' : 'mature'
    })
    const active = groups['active']?.[0]
    const matures = groups['mature']
    if (active) {
        const yt = getYtToken(vc, active.YT)
        const disableClaim = !active.rewrads.find(item => item[1] > 0n)
        res.push([
            <TokenSymbol key="token" t={yt} />,
            <TokenBalance t={yt} key='ytBalance' />,
            'Active',
            <div key="token2">
                {active.rewrads.map(([token, amount]) => <MCoinAmount token={getTokenBy(token, vc.chain)!} key={`rewards_${token}`} amount={amount} />)}
                <Points vc={vc} size={16} />
            </div>,
            '',
            <ApproveAndTx disabled={disableClaim} onTxSuccess={onClaimSuccess} key="claim" className="w-28 font-semibold h-7" tx="Claim" config={{ abi: abiRewardManager, functionName: 'claimRewards', address: yt.address, args: [user] }} />,
        ])
    }
    if (matures && matures.length) {
        const tokens: { [k: Address]: bigint } = {}
        const yts: Address[] = []

        matures.forEach(item => {
            item.rewrads.forEach(([t, value]) => {
                tokens[t] = (tokens[t] ?? 0n) + value
                if (value > 0n) {
                    yts.push(item.YT)
                }
            })
        })
        const sumRewards = keys(tokens).map(key => ([key, tokens[key as Address]] as [Address, bigint]))
        res.push([
            '',
            '',
            'Rewards for mature YT',
            <div key="token2">
                {sumRewards.map(([token, amount]) => <MCoinAmount token={getTokenBy(token, vc.chain)!} key={`rewards_${token}`} amount={amount} />)}
            </div>,
            '',
            <Txs
                onTxSuccess={onClaimSuccess}
                key="claim"
                className="w-28 font-semibold h-7"
                tx="Claim"
                txs={yts.map((yt) => ({ abi: abiRewardManager, functionName: 'claimRewards', address: yt, args: [user] }))}
            />
        ])
    }
    return res;
}

function YT({ vc }: { vc: BVault2Config }) {
    const rewards = useBvault2YTRewards(vc)
    const { address } = useAccount()
    const data = useMemo(() => !address ? [] : getYtPositions(vc, rewards.result, address!, () => reFet(rewards.key)), [rewards.result, address])
    const header = ['YT', 'Value', 'Status', 'Yield', 'Airdrops', '']
    return <div className="animitem card !p-4 overflow-x-auto">
        <STable
            headerClassName='text-left font-semibold border-b-0'
            headerItemClassName='py-1 px-4 text-base'
            rowClassName='text-left text-black text-sm leading-none font-medium'
            cellClassName='py-2 px-4'
            header={header}
            span={{ 2: statuColSize, [header.length - 1]: claimColSize }}
            data={data}
        />
    </div>
}

export function getLPBTPositons(vc: BVault2Config, rewards: ReturnType<typeof useBvault2LPBTRewards>['result'], user: Address, onClaimSuccess?: () => void): ReactNode[][] {
    if (!rewards.length) return []
    return rewards.map(item => [
        <TokenSymbol key="token" t={item.token} />,
        <TokenBalance t={item.token} key={'tokenBalance'} />,
        '',
        <div key="token2">
            {item.rewards.map(([token, amount]) => <MCoinAmount token={getTokenBy(token, vc.chain)!} key={`rewards_${token}`} amount={amount} />)}
            <Points vc={vc} size={16} />
        </div>,
        // <MCoinAmount key="amount" token={getTokenBy('0x5267F7eE069CEB3D8F1c760c215569b79d0685aD', chainId)!} />,
        '',
        <ApproveAndTx disabled={!item.rewards.find(item => item[1] > 0n)} onTxSuccess={onClaimSuccess} key="claim" className="w-28 font-semibold h-7" tx="Claim" config={{ abi: abiRewardManager, functionName: 'claimRewards', address: item.token.address, args: [user] }} />,
    ])
}
function LPBT({ vc }: { vc: BVault2Config }) {
    const rewards = useBvault2LPBTRewards(vc)
    const { address } = useAccount()
    const data = useMemo(() => address ? getLPBTPositons(vc, rewards.result, address, () => reFet(rewards.key)) : [], [rewards.result, address])
    const header = ['LP/BT', 'Value', '', 'Yield', 'Airdrops', '']
    return <div className="animitem card !p-4 overflow-x-auto">
        <STable
            headerClassName='text-left font-semibold border-b-0'
            headerItemClassName='py-1 px-4 text-base'
            rowClassName='text-left text-black text-sm leading-none font-medium'
            cellClassName='py-2 px-4'
            header={header}
            span={{ 2: statuColSize, [header.length - 1]: claimColSize }}
            data={data}
        />
    </div>
}

export function MyPositions({ vc }: { vc: BVault2Config }) {
    return <div className="flex flex-col gap-5">
        <div className="animitem font-semibold text-2xl leading-none">My Positions</div>
        <PT vc={vc} />
        <YT vc={vc} />
        <LPBT vc={vc} />
    </div>
}