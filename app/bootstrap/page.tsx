'use client'
import { BVault2Bootstrap } from "@/components/bvaults2/bootstrap"
import { Noti } from "@/components/noti"
import { PageWrap } from "@/components/page-wrap"
import { ConfigChainsProvider } from "@/components/support-chains"
import { bvcs2ByEnv } from "@/config/bvaults2"


export default function BootstrapPage() {
    const vcs = bvcs2ByEnv
    return (
        <PageWrap>
            <div className='w-full max-w-[1368px] p-4 flex flex-col gap-5 mx-auto md:pb-8'>
                <div className='page-title animitem'>Bootstrap</div>
                <Noti className="animitem" data='Deposit underlying assets to earn rewards. The Vault will launch once the target value is reached.' />
                {vcs.map((item, index) => (
                    <ConfigChainsProvider key={`b_vault2_item_${index}`} chains={[item.chain]}>
                        <BVault2Bootstrap vc={item} />
                    </ConfigChainsProvider>
                ))}
            </div>
        </PageWrap>
    )
}