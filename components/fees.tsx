import _ from "lodash";
import { Tip } from "./ui/tip";

const roundDecimal = 3
export function Fees({ fees, def = '-' }: { fees: ({ name: string, value: number }[]) | string, def?: string }) {
    const isStr = typeof fees === 'string'
    const total = isStr ? 0 : fees.reduce((sum, item) => sum + item.value, 0)
    return <div className="flex gap-2 text-xs font-medium leading-none">Fees:
        {!isStr && fees.length > 0 ? <Tip className="underline underline-offset-2" contentClassName="whitespace-pre-wrap" node={`$${_.round(total, roundDecimal)}`}>
            {fees.map(item => `${item.name}: ${_.round(item.value, roundDecimal)}`).join("\n\r")}
        </Tip> : <div>{isStr ? (fees || def) : def}</div>}
    </div>
}