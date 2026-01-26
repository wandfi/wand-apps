import { createFileRoute } from "@tanstack/react-router";
import YieldVaultPage from '@/app/yield-vault/page';

export const Route = createFileRoute("/")({
  ssr: false,
  component: YieldVaultPage,
});
