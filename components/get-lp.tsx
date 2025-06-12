import { LP_TOKENS } from "@/config/lpTokens"
import { getBexPoolURL } from "@/config/network"
import { Address } from "viem"
import Link from 'next/link'
import { CoinIcon } from "./icons/coinicon"
import { getTokenBy } from "@/lib/utils"

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
    const token = getTokenBy(address)
    if(token.symbol !== 'vIP')
    return <div className='text-xs font-medium flex gap-2 justify-end items-center'>
        <CoinIcon symbol="verio" size={18} />
        <Link target='_blank' className='underline' href={getBexPoolURL(address)}>
            Get vIP on Verio
        </Link>
    </div>
}