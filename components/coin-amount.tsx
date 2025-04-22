import { Token } from "@/config/tokens";
import { CoinIcon } from "./icons/coinicon";
import { displayBalance } from "@/utils/display";
import { cn } from "@/lib/utils";

export function CoinAmount({ token, amount, size, className }: { token: Token, amount?: bigint, size?: number, className?: string }) {
    return <div className={cn("flex gap-2 items-center font-medium text-xs", className)}>
        <CoinIcon size={size || 16} symbol={token.symbol} />
        <span className="opacity-60">{token.symbol}</span>
        <span className="ml-1">{displayBalance(amount, undefined, token.decimals)}</span>
    </div>
}