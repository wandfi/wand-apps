import { fetBvault2Epochs, fetBvaut2Data, fetRewardsBy } from "@/components/bvaults2/fets";
import { BVAULTS2CONIG } from "@/config/bvaults2";
import { toJsonRES } from "@/lib/bnjson";
import { cacheGet } from "@/lib/cache";
import { createFileRoute } from "@tanstack/react-router";
import { isAddress, isAddressEqual } from "viem";


const fetMap = {
    fetBvaut2Data,
    fetBvault2Epochs,
    fetRewardsBy,
}

async function fetData(fet: keyof typeof fetMap, sp: Record<string, string>) {
    switch (fet) {
        case 'fetBvault2Epochs':
        case "fetBvaut2Data": {
            const chain = sp.chain
            const vault = sp.vault
            if (!chain || !vault || !isAddress(vault)) throw new Error('Invalid request')
            const vc = BVAULTS2CONIG.find(vc => `${vc.chain}` == chain && isAddressEqual(vault, vc.vault))
            if (!vc) throw new Error('Invalid request')
            return cacheGet(`${fet}:${vc.chain}:${vc.vault}`, () => fetMap[fet](vc) as Promise<any>)
        }
        case "fetRewardsBy": {
            const args = [sp.rewradManager, sp.user, Number(sp.chain)] as Parameters<typeof fetRewardsBy>
            return cacheGet(`${fet}:${args.join(':')}`, () => fetMap[fet](...args) as Promise<any>, 60000 * 60)
        }
    }
}

export const Route = createFileRoute("/api/bvault2")({
    server: {
        handlers: {
            GET: async ({ request }) => {
                const sp = Object.fromEntries(new URL(request.url).searchParams)
                const data = await fetData(sp.fet as any, sp)
                return toJsonRES(data)
            },
        },
    },
})