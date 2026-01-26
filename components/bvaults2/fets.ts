import { abiBVault2, abiBvault2Query } from "@/config/abi/BVault2"
import { codeBvualt2Query } from "@/config/abi/codes"
import type { BVault2Config } from "@/config/bvaults2"
import { cacheGet } from "@/lib/cache"
import { bnRange, promiseAll } from "@/lib/utils"
import { getPC } from "@/providers/publicClient"
import { parseUnits, type Address, type PublicClient } from "viem"

export async function getBvault2Epoch(vc: BVault2Config, id: bigint, pc: PublicClient = getPC(vc.chain)) {
    return await pc.readContract({ abi: abiBVault2, address: vc.vault, functionName: 'epochInfoById', args: [id] })
}

export async function fetBvaut2Data(vc: BVault2Config) {
    const pc = getPC(vc.chain)
    const res = await promiseAll({
        initialized: pc.readContract({ abi: abiBVault2, address: vc.vault, functionName: 'initialized' }),
        BT: pc.readContract({ abi: abiBVault2, address: vc.vault, functionName: 'BT' }),
        mintPoolTokenPot: pc.readContract({ abi: abiBVault2, address: vc.vault, functionName: 'mintPoolTokenPot' }),
        Points: pc.readContract({ abi: abiBVault2, address: vc.vault, functionName: 'points' }),
        bootstrapStartTime: pc.readContract({ abi: abiBVault2, address: vc.vault, functionName: 'bootstrapStartTime' }),
        bootstrapDuration: pc.readContract({ abi: abiBVault2, address: vc.vault, functionName: 'bootstrapDuration' }),
        bootstrapThreshold: pc.readContract({ abi: abiBVault2, address: vc.vault, functionName: 'bootstrapThreshold' }),
        epochIdCount: pc.readContract({ abi: abiBVault2, address: vc.vault, functionName: 'epochIdCount' }),
        totalDeposits: pc.readContract({ abi: abiBVault2, address: vc.vault, functionName: 'bootstrapTotalDeposits' }),
    })

    return { ...res, current: res.epochIdCount > 0n ? await getBvault2Epoch(vc, res.epochIdCount, pc) : undefined }
}

export async function fetBvault2Epochs(vc: BVault2Config) {
    const vd = await cacheGet(`fetBvaut2Data:${vc.chain}:${vc.vault}`, () => fetBvaut2Data(vc), 60000)
    if (vd.epochIdCount <= 0n) return []
    const pc = getPC(vc.chain)
    const epochs = await Promise.all(bnRange(vd.epochIdCount).map((id) => getBvault2Epoch(vc, id, pc)))
    return epochs.reverse()
}


export async function fetRewardsBy(rewradManager: Address, user: Address, chain: number) {
    return getPC(chain)
        .readContract({ abi: abiBvault2Query, code: codeBvualt2Query, functionName: 'earned', args: [rewradManager, user, parseUnits('1', 28)] })
        .then((item) => item.map((r) => [r.token, r.value] as [Address, bigint]))
}