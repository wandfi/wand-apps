import { monad, story } from "@/config/network"
import { getTokenBy, type Token } from "@/config/tokens"
import { useCurrentChainId } from "@/hooks/useCurrentChainId"
import { Link } from "@tanstack/react-router"
import { type Address } from "viem"
import { CoinIcon } from "./icons/coinicon"


export function GetvIP({ address }: { address: Address }) {
    const chainId = useCurrentChainId()
    const token = getTokenBy(address, chainId)
    if (token?.symbol !== 'vIP') return null
    return <div className='text-xs font-medium flex gap-2 justify-end items-center'>
        <CoinIcon symbol="verio" size={18} />
        <Link to={'https://www.verio.network/staking' as string} target='_blank' className='underline text-primary' >
            Get vIP on Verio
        </Link>
    </div>
}

export function GetByThird({ t }: { t: Token }) {
    if (!t) return null
    if (t.chain == story.id) return <div className='text-xs text-primary font-medium flex gap-1 justify-end items-center'>
        Get {t.symbol} on
        <Link target="_blank" className="underline" to={`https://app.piperx.xyz/#/swap?token1=0xF1815bd50389c46847f0Bda824eC8da914045D14&token2=${t.address}` as string}>
            Piperx
        </Link>
        /
        <Link target='_blank' className='underline' to={`https://app.storyhunt.xyz/token/${t.address}` as string}>
            StoryHunt
        </Link>
    </div>
    if (t.chain == monad.id) return <div className='text-xs text-primary font-medium flex gap-1 justify-end items-center'>
        Get {t.symbol} on
        <Link target='_blank' className='underline' to={`https://stake.apr.io/` as string}>
            aPriori
        </Link>
    </div>
    return null
}
