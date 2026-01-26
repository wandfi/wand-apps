import { createFileRoute } from '@tanstack/react-router';

import { fromJson, toJsonRES } from "@/lib/bnjson";
import { cacheGet } from "@/lib/cache";
import { fetBalance, fetTotalSupply, fetTokenPrices } from "@/lib/fetsToken";

const fetMap = {
    fetBalance,
    fetTotalSupply,
    fetTokenPrices,
}


async function fetData(fet: keyof typeof fetMap, sp: Record<string, string>) {
    switch (fet) {
        case "fetBalance": {
            const args = [fromJson(sp.token), sp.byUser] as Parameters<typeof fetBalance>
            return cacheGet(`fetBalance:${args[0].chain}:${args[0].address}:${args[1]}`, () => fetBalance(...args))
        }
        case "fetTotalSupply": {
            const args = [fromJson(sp.token)] as Parameters<typeof fetTotalSupply>
            return cacheGet(`fetTotalSupply:${args[0].chain}:${args[0].address}`, () => fetTotalSupply(...args), 60000 * 60)
        }
        case 'fetTokenPrices': {
            return cacheGet('fetTokenPrices:', () => fetTokenPrices(), 60000 * 60)
        }
    }
}

export const Route = createFileRoute('/api/token')({
    server: {
        handlers: {
            GET: async ({ request }) => {
                const sp = Object.fromEntries(new URL(request.url).searchParams)
                const fet = sp.fet as keyof typeof fetMap
                const data = await fetData(fet, sp)
                return toJsonRES(data)
            }
        }
    }
})
