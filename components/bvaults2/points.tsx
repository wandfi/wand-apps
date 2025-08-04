import { BVault2Config } from "@/config/bvaults2";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { CoinIcon } from "../icons/coinicon";
import { getTokenBy } from "@/config/tokens";

export function Points({ vc, className, size }: { vc: BVault2Config, className?: string, size?: number }) {
    if (!vc.points) return null
    if (vc.points.link) return <Link href={vc.points.link} target="_blank" className={cn("flex gap-2 items-center underline underline-offset-2", className)}>
        <CoinIcon size={size} symbol={getTokenBy(vc.asset, vc.chain)?.symbol ?? 'Points'} />
        {'Points'}
    </Link>
    return <div className={cn("flex gap-2 items-center", className)}>
        <CoinIcon size={size} symbol={getTokenBy(vc.asset, vc.chain)?.symbol ?? 'Points'} />
        {'Points'}
    </div>
}