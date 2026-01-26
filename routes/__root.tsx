
import appCss from '@/globals.css?url';
import rainCss from '@rainbow-me/rainbowkit/styles.css?url';

import { Providers } from "@/app/providers";
import { TxsStat } from "@/components/approve-and-tx";
import { Header } from "@/components/header";
import { DefaultCatchBoundary } from "@/components/ui/deferrorboutry";
import { NotFound } from "@/components/ui/not-found";

import { TanStackDevtools } from "@tanstack/react-devtools";
import { QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools';
import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { isPlainObject } from 'es-toolkit';
import { ENV } from '@/config/env';
import { AnimRoot } from '@/components/ui/anim-root';


export function getContext() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 3, refetchOnMount: 'always', staleTime: 1000, queryKeyHashFn: (queryKey) => {
          return JSON.stringify(
            queryKey,
            (_, val) => isPlainObject(val) ? Object.keys(val).sort().reduce((result, key) => {
              result[key] = val[key];
              return result;
            }, {} as any) : typeof val == 'bigint' ? val.toString() : val
          )
        }
      }
    }
  })
  return {
    queryClient,
  }
}
export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'WandFi' },
      { name: 'meta_env', content: ENV }
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'stylesheet', href: rainCss },
      { rel: 'icon', href: '/logo-alt.svg' },
    ]
  }),
  ssr: false,
  shellComponent: RootComponent,
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: () => <NotFound />,
})

function RootComponent() {
  return (
    <Root>
      <Outlet />
    </Root>
  )
}

function Devtools() {
  return <>
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
}
function Root({ children }: Readonly<{ children: ReactNode }>) {
  // useInitAnimRoot()
  return (
    <html className='bg-white dark:bg-stone-950 text-black dark:text-white'>
      <head>
        <HeadContent />
      </head>
      <body>
        <Scripts />
        <AnimRoot />
        <Providers>
          <Header />
          {children}
          <TxsStat />
        </Providers>
        <Toaster position='top-right' offset={70} />
        <Devtools />
      </body>
    </html>
  );
}
