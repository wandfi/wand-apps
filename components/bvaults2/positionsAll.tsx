import { BVault2Config } from "@/config/bvaults2";
import { reFet } from "@/hooks/useFet";
import { flatten } from "lodash";
import { useMemo } from "react";
import { useAccount } from "wagmi";
import { CoinIcon } from "../icons/coinicon";
import STable from "../simple-table";
import { getLPBTPositons, getPTPositions, getYtPositions } from "./positions";
import { useBvault2sLPBTRewards, useBvault2sYTRewards, useBvualt2sPTRedeems } from "./useFets";


function IconTitle(p: { icon?: string; tit: string }) {
    // const Micon = IconMap[p.icon]
    return (
        <div className='flex text-2xl leading-none font-semibold items-center gap-4'>
            {p.icon && <CoinIcon symbol={p.icon} size={32} />}
            <span>{p.tit}</span>
        </div>
    )
}

const claimColSize = 1.3;
const statuColSize = 1.6

export function PTs({ vcs }: { vcs: BVault2Config[] }) {
    const redeems = useBvualt2sPTRedeems(vcs)
    const data = useMemo(() => flatten(vcs.map((vc, i) => getPTPositions(vc, redeems.result[i], () => reFet(redeems.key[i])))), [vcs, redeems.result])
    const header = ['PT', 'Value', 'Status', 'Redeemable', '']
    return <div className="animitem card !p-4 bg-white">
        <IconTitle tit='Principal Token (v2)' icon='PToken' />
        <div className='my-4 h-[1px] bg-border/60 dark:bg-border'></div>
        <div className='w-full overflow-x-auto'>
            <STable
                headerClassName='text-left font-semibold border-b-0'
                headerItemClassName='py-1 px-4 text-base'
                rowClassName='text-left text-black text-sm leading-none font-medium'
                cellClassName='py-2 px-4'
                header={header}
                span={{ 2: statuColSize, 3: 2, [header.length - 1]: claimColSize }}
                data={data}
            />
        </div>
    </div>
}


export function YTs({ vcs }: { vcs: BVault2Config[] }) {
    const rewards = useBvault2sYTRewards(vcs)
    const { address } = useAccount()
    const data = useMemo(() => !address ? [] : flatten(vcs.map((vc, i) => getYtPositions(vc, rewards.result[i], address, () => reFet(rewards.key[i])))), [rewards.result, address])
    const header = ['YT', 'Value', 'Status', 'Yield', 'Airdrops', '']
    return <div className="animitem card !p-4 bg-white">
        <IconTitle tit='Yield Token (v2)' icon='YToken' />
        <div className='my-4 h-[1px] bg-border/60 dark:bg-border'></div>
        <div className='w-full overflow-x-auto'>
            <STable
                headerClassName='text-left font-semibold border-b-0'
                headerItemClassName='py-1 px-4 text-base'
                rowClassName='text-left text-black text-sm leading-none font-medium'
                cellClassName='py-2 px-4'
                header={header}
                span={{ 2: statuColSize, [header.length - 1]: claimColSize }}
                data={data}
            />
        </div>
    </div>
}

export function LPBTs({ vcs }: { vcs: BVault2Config[] }) {
    const rewards = useBvault2sLPBTRewards(vcs)
    const { address } = useAccount()
    const data = useMemo(() => !address ? [] : flatten(vcs.map((vc, i) => getLPBTPositons(vc, rewards.result[i], address, () => reFet(rewards.key[i])))), [rewards.result, address])
    const header = ['LP/BT', 'Value', '', 'Yield', 'Airdrops', '']
    return <div className="animitem card !p-4 bg-white">
        <IconTitle tit='LP/BT' />
        <div className='my-4 h-[1px] bg-border/60 dark:bg-border'></div>
        <div className='w-full overflow-x-auto'>
            <STable
                headerClassName='text-left font-semibold border-b-0'
                headerItemClassName='py-1 px-4 text-base'
                rowClassName='text-left text-black text-sm leading-none font-medium'
                cellClassName='py-2 px-4'
                header={header}
                span={{ 2: statuColSize, [header.length - 1]: claimColSize }}
                data={data}
            />
        </div>
    </div>
}