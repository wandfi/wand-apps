
import { TanStackDevtools } from "@tanstack/react-devtools";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'


import type { QueryClient } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Toaster } from "sonner";
import { TxsStat } from "@/components/approve-and-tx";
import { useInitAnimRoot } from "@/hooks/useAnim";

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: Root,
});

function Root() {
  useInitAnimRoot()
  return (
    <>
      <Header />
      <Outlet />
      <Toaster position='top-right' offset={70} />
      <TxsStat />
      {import.meta.env.DEV && (
        <TanStackDevtools
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
            {
              name: 'Tanstack Query',
              render: <ReactQueryDevtoolsPanel />
            },
          ]}
        />
      )}
    </>
  );
}
