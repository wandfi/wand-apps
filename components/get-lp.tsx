import { LP_TOKENS } from "@/config/lpTokens"
import { getBexPoolURL, story } from "@/config/network"
import { Address } from "viem"
import Link from 'next/link'
import { CoinIcon } from "./icons/coinicon"
import { getTokenBy, Token } from "@/config/tokens"
import { useCurrentChainId } from "@/hooks/useCurrentChainId"

export function GetLP({ address }: { address: Address }) {
    const lp = LP_TOKENS[address]
    const isLP = Boolean(lp)
    if (!isLP) return null
    return <div className='text-xs font-medium flex gap-2 justify-end items-center'>
        <CoinIcon symbol="berahub" size={18} />
        <Link target='_blank' className='underline' href={getBexPoolURL(address)}>
            Get LP on Beraswap
        </Link>
    </div>
}

export function GetvIP({ address }: { address: Address }) {
    const chainId = useCurrentChainId()
    const token = getTokenBy(address, chainId)
    if (token?.symbol !== 'vIP') return null
    return <div className='text-xs font-medium flex gap-2 justify-end items-center'>
        <CoinIcon symbol="verio" size={18} />
        <Link target='_blank' className='underline' href={getBexPoolURL(address)}>
            Get vIP on Verio
        </Link>
    </div>
}

export function GetByStoryHunt({ t }: { t: Token }) {
    if (!t || !t.chain.includes(story.id)) return null
    return <div className='text-xs font-medium flex gap-2 justify-end items-center'>
        <div className="bg-black">
            <CoinIcon symbol="StoryHunt" size={18} />
        </div>
        <Link target='_blank' className='underline' href={`https://app.storyhunt.xyz/token/${t.address}`}>
            Get {t.symbol} on StoryHunt
        </Link>
    </div>
}