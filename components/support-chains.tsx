import { SUPPORT_CHAINS } from "@/config/network";
import React, { useContext, useState } from "react";
import { Chain } from "viem";

export const ConfigChainsCTX = React.createContext<{ chains: readonly [Chain, ...(Chain[])], def: number, setDef: (id: number) => void }>({ chains: SUPPORT_CHAINS, def: SUPPORT_CHAINS[0].id, setDef: () => { } })
export function ConfigChainsProvider({ children, chains }: { chains: number[], children: React.ReactNode }) {
    const mChains = chains.map(cid => SUPPORT_CHAINS.find(c => c.id === cid)!).filter(Boolean)
    if (mChains.length == 0) throw new Error("ConfigChains Error")
    const [_def, setDef] = useState(mChains[0].id)
    const def = mChains.map(item => item.id).includes(_def) ? _def : mChains[0].id
    return <ConfigChainsCTX.Provider value={{ chains: mChains as any, def, setDef }}>
        {children}
    </ConfigChainsCTX.Provider>
}
export function useConfigChains() {
    return useContext(ConfigChainsCTX)
}