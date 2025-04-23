import _ from "lodash";
import { Tip } from "./ui/tip";

const roundDecimal = 3
export function Fees({ fees }: { fees: { name: string, value: number }[] }) {
    const total = fees.reduce((sum, item) => sum + item.value, 0)
    return <div className="flex gap-2 text-xs font-medium leading-none">Fees:
        <Tip className="underline underline-offset-2" node={`$${_.round(total, roundDecimal)}`}>
            {fees.map(item => `${item.name}: ${_.round(item.value, roundDecimal)}`).join("\n\r")}
        </Tip>
    </div>
}