import { SUPPORT_CHAINS } from "@/config/network"
import { DomainRef } from "@/hooks/useConfigDomain"
import { useCurrentChainId } from "@/hooks/useCurrentChainId"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useMemo, useRef, useState } from "react"
import { FiX } from "react-icons/fi"
import { useClickAway } from "react-use"
import { Chain } from "viem"
import { useAccount, useChainId, useSwitchChain } from "wagmi"


type ItemType = { name: string, icon: string, chain?: Chain, toUrl?: string }
// const types: ItemType[] = 
export function SwitchChain() {
    const types: ItemType[] = useMemo(() => {
        return [
            ...SUPPORT_CHAINS.map(item => ({
                name: item.name,
                icon: (item as any).iconUrl || '/ETH.svg',
                chain: item,
            })),
            {
                name: 'Blast',
                icon: 'blast.png',
                toUrl: `https://${DomainRef.value}/vaults`
            },

        ]
    }, [DomainRef.value])
    const chainId = useCurrentChainId()
    const ct = types.find(item => item.chain?.id == chainId)
    const [show, setShow] = useState(false)
    const { switchChain } = useSwitchChain()
    const r = useRouter()
    const onClickItem = (item: ItemType) => {
        if (item.chain && (item !== ct || chainError)) {
            switchChain({ chainId: item.chain.id })
        } else if (item.toUrl) {
            r.push(item.toUrl)
        }
    }
    const modalRef = useRef<HTMLDivElement>(null)
    useClickAway(modalRef, () => { setShow(false) })
    const { chainId: connectedChainId, isConnected } = useAccount()
    const supportChain = SUPPORT_CHAINS.find(item => item.id == connectedChainId)
    const chainError = !supportChain && isConnected
    if (!ct) return null
    return <>
        {
            chainError ? <div
                className='flex items-center gap-2 text-sm font-bold rounded-lg cursor-pointer relative px-2 h-10 bg-red-500 text-white'
                onClick={() => setShow(true)}
            >
                Wrong network
            </div> : <div
                className='flex items-center gap-2 text-sm font-medium rounded-lg cursor-pointer relative px-2 h-10'
                onClick={() => setShow(true)}
            >
                <Image width={24} height={24} src={ct.icon} alt='' />
                <div className='hidden sm:block'>{ct.name}</div>
            </div>
        }

        {
            show && <div className="fixed bg-black/30 w-screen h-screen left-0 top-0 flex">
                <div ref={modalRef} className="bg-white shadow-sm dark:bg-slate-800 rounded-2xl m-auto w-full max-w-sm p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-lg font-extrabold">Switch Networks</span>
                        <div className="w-7 h-7 flex justify-center items-center rounded-full border border-slate-400 bg-black/5 hover:bg-black/20 cursor-pointer" onClick={() => setShow(false)}>
                            <FiX />
                        </div>
                    </div>
                    <div className="mt-4">
                        {types.map(item => <div key={item.name} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer ${(item == ct && !chainError) ? "bg-indigo-400" : ''}`} onClick={() => onClickItem(item)}>
                            <Image width={24} height={24} src={item.icon} alt='' />
                            <div className=''>{item.name}</div>
                        </div>)}
                    </div>
                </div>
            </div>
        }
    </>

}