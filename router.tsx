import { QueryClient } from '@tanstack/react-query';
import { createRouter } from '@tanstack/react-router';
import { isPlainObject } from 'es-toolkit';
import { DefaultCatchBoundary } from './components/ui/deferrorboutry';
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { NotFound } from './components/ui/not-found';
import { routeTree } from './routeTree.gen';
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

export function getRouter() {
    const context = getContext()
    const router = createRouter({
        routeTree,
        context,
        defaultPreload: 'intent',
        defaultErrorComponent: DefaultCatchBoundary,
        defaultNotFoundComponent: () => <NotFound />,
        scrollRestoration: true,
    })
    setupRouterSsrQueryIntegration({
        router,
        queryClient: context.queryClient,
    })
    return router
}

declare module '@tanstack/react-router' {
    interface Register {
        router: ReturnType<typeof getRouter>
    }
}