import { Token } from "@/config/tokens";
import { CoinIcon } from "./icons/coinicon";
import { displayBalance } from "@/utils/display";
import { cn } from "@/lib/utils";

export function CoinAmount({ token, amount, size, className, symbolClassName, amountClassName }: { token: Token, amount?: bigint, size?: number, className?: string, symbolClassName?: string, amountClassName?: string }) {
    if (!token) return null
    return <div className={cn("flex gap-2 items-center font-medium text-xs", className)}>
        <CoinIcon size={size || 16} symbol={token.symbol} />
        <span className={cn("opacity-60", symbolClassName)}>{token.symbol}</span>
        <span className={cn("ml-1", amountClassName)}>{displayBalance(amount, undefined, token.decimals)}</span>
    </div>
}