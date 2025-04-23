'use client'
import { BVault2Info, BVault2Init, BVault2Swaps } from "@/components/bvaults2"
import { MyPositions } from "@/components/bvaults2/positions"
import { BVault2Chart } from "@/components/bvaut2-chart"
import { Noti } from "@/components/noti"
import { PageWrap } from "@/components/page-wrap"
import { BVAULTS2CONIG } from "@/config/bvaults2"
import { getCurrentChainId } from "@/config/network"
import { useMemo } from "react"

export default function BootstrapPage() {
    const { data: inited } = useMemo(() => ({ data: true }), [])
    const vc = BVAULTS2CONIG[getCurrentChainId()]
    return (
        <PageWrap>
            <div className='w-full max-w-[1368px] px-4 mx-auto md:pb-8'>
                {!inited ? <>
                    <div className='page-title'>Bootstrap</div>
                    <Noti data='Deposit underlying assets to earn rewards. The Vault will launch once the target value is reached.' />
                    <BVault2Init vc={vc} />
                </> : <>
                    <div className="grid gap-5 lg:grid-cols-[8fr_5fr] mb-5">
                        <BVault2Info vc={vc} />
                        <div className="row-span-2">
                            <BVault2Swaps vc={vc} />
                        </div>
                        <BVault2Chart vc={vc} />
                    </div>
                    <MyPositions vc={vc} />
                </>}
            </div>
        </PageWrap>
    )
}