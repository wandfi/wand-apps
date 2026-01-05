import { type BVault2Config } from "@/config/bvaults2";
import { Fees } from "../fees";
import { useLogs } from "./useDatas";
import { fmtPercent } from "@/lib/utils";
import { DECIMAL } from "@/src/constants";

export function Bvault2Feerate({ vc }: { vc: BVault2Config }) {
    const logs = useLogs(vc)
    let fee = '-'
    if (logs.result) {
        fee = fmtPercent(logs.result.Feerate - DECIMAL, 18, 3)
    }
    return <Fees fees={fee} />
}