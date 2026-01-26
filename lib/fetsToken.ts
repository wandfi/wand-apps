import { ALCHEMY_API_KEY } from '@/config/env'
import { type Token } from '@/config/tokens'

import { getPC } from '@/providers/publicClient'
import { DECIMAL } from '@/src/constants'
import { type Address, erc20Abi, parseEther } from 'viem'



export async function fetBalance(token: Token, byUser: Address) {
    return token!.isNative
        ? getPC(token!.chain).getBalance({ address: byUser! })
        : getPC(token!.chain).readContract({ abi: erc20Abi, functionName: 'balanceOf', address: token!.address, args: [byUser!] })
}

export async function fetTotalSupply(token: Token) {
    return (token!.isNative ? 0n : getPC(token!.chain).readContract({ abi: erc20Abi, functionName: 'totalSupply', address: token!.address }))
}

const symbols = ['IP', 'MON'].map((symbol) => 'symbols=' + symbol).join('&')

export type PriceItem = { symbol: string, bn: bigint, num: number }

export const initialTokenPrices: Record<string, PriceItem> = {
    'AIDaUSDC': { symbol: 'AIDaUSDC', bn: DECIMAL, num: 1 },
    'USDC': { symbol: 'USDC', bn: DECIMAL, num: 1 },
    'APL': { symbol: 'APL', bn: DECIMAL, num: 1 },
    'bAPL': { symbol: 'bAPL', bn: DECIMAL, num: 1 },
}
export async function fetTokenPrices() {
    const res = await fetch(`https://api.g.alchemy.com/prices/v1/${ALCHEMY_API_KEY}/tokens/by-symbol?${symbols}`)
    const { data } = (await res.json()) as { data: { symbol: string; prices: { currency: string; value: string; lastUpdatedAt: string }[] }[] }
    const prices = data.filter((item) => item.prices.length).map<PriceItem>(item => ({ symbol: item.symbol, bn: parseEther(item.prices[0].value), num: Number(item.prices[0].value) }))
    const priceMap = prices.reduce((map, item) => {
        map[item.symbol] = item
        return map
    }, initialTokenPrices)
    return priceMap
}