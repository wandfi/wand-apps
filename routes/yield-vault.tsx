import { createFileRoute } from "@tanstack/react-router";
import YieldVaultPage from '@/app/yield-vault/page';
import type { Address } from "viem";

export const Route = createFileRoute("/yield-vault")({
    component: YieldVaultPage,
    validateSearch: (search: Record<string, unknown>) => ({
        vault: search.vault as Address,
        tab: search.tab,
        subtab: search.subtab,
    } as {
        vault?: Address,
        tab?: string,
        subtab?: string
    })
});