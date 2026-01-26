import { BVAULTS_CONFIG, type BVaultConfig } from "@/config/bvaults";
import { toJsonRES } from "@/lib/bnjson";
import { cacheGet } from "@/lib/cache";
import { fetBVault, fetBVaultEpoches, fetBVaultUnderlyingAPY, fetUserBVault } from "@/lib/fetsBVault";
import { createFileRoute } from "@tanstack/react-router";
import { isAddress, isAddressEqual, type Address } from "viem";


const fetMap = {
    fetBVault,
    fetBVaultEpoches,
    fetUserBVault,
    // fetBVaultIPAssets,
    fetBVaultUnderlyingAPY,
}

async function fetData(fet: keyof typeof fetMap, vc: BVaultConfig, sp: Record<string, string>) {
    switch (fet) {
        case "fetUserBVault": {
            return cacheGet(`${fet}:${vc.chain}:${vc.vault}:${sp.byUser}`, () => fetMap[fet](vc, sp.byUser as Address))
        }
        default: {
            return cacheGet(`${fet}:${vc.chain}:${vc.vault}`, () => fetMap[fet](vc) as Promise<any>, 60000 * 60)
        }
    }
}



export const Route = createFileRoute("/api/bvault")({
    server: {
        handlers: {
            GET: async ({ request }) => {
                const sp = Object.fromEntries(new URL(request.url).searchParams)
                const chain = sp.chain
                const vault = sp.vault
                if (!chain || !vault || !isAddress(vault)) return Response.json({ message: 'Invalid request' }, { status: 400 })
                const vc = BVAULTS_CONFIG.find(vc => `${vc.chain}` == chain && isAddressEqual(vault, vc.vault))
                if (!vc) return Response.json({ message: 'Invalid request' }, { status: 400 })
                const fet = sp.fet as keyof typeof fetMap
                const fetFn = fetMap[fet]
                if (fet || !fetFn) Response.json({ message: 'Invalid request' }, { status: 400 })
                const data = await fetData(fet, vc, sp)
                return toJsonRES(data)
            },
        },
    },
})