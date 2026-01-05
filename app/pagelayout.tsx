'use client'
  ; (BigInt.prototype as any).toJSON = function () {
    return this.toString()
  }
import { TxsStat } from '@/components/approve-and-tx';
import { Header } from '@/components/header';
import { useInitAnimRoot } from '@/hooks/useAnim';
import { useConfigDomain } from '@/hooks/useConfigDomain';
import { useIsClient } from '@/hooks/useIsClient';
import { type ReactNode } from 'react';
import { Toaster } from 'sonner';
import { Providers } from './providers';
// background: linear-gradient(105.67deg, #02050E 14.41%, #1D2F23 98.84%);

export default function PageLayout({ children }: { children: ReactNode }) {
  useConfigDomain()
  const root = useInitAnimRoot()
  const isClient = useIsClient()
  return (
    <div ref={root}>
      {
        isClient && <>
          <Providers>
            <Header />
            {children}
          </Providers>
          <Toaster position='top-right' offset={70} />
          <TxsStat />
        </>
      }
    </div>
  )
}
