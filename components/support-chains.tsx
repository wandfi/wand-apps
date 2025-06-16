import { SUPPORT_CHAINS } from "@/config/network";
import React, { useContext, useState } from "react";
import { Chain } from "viem";

export const ConfigChainsCTX = React.createContext<{ chains: readonly [Chain, ...(Chain[])], def: number, setDef: (id: number) => void }>({ chains: SUPPORT_CHAINS, def: SUPPORT_CHAINS[0].id, setDef: () => { } })


export function ConfigChainsProvider({ children, chains }: { chains: readonly [Chain, ...(Chain[])], children: React.ReactNode }) {
    const [def, setDef] = useState(chains[0].id)
    return <ConfigChainsCTX.Provider value={{ chains, def, setDef }}>
        {children}
    </ConfigChainsCTX.Provider>
}
export function useConfigChains() {
    return useContext(ConfigChainsCTX)
}