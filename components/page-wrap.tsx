import { cn } from '@/lib/utils';
import React from 'react';
// background: radial-gradient(76.25% 76.25% at 50.3% 23.75%, rgba(27, 205, 89, 0.2) 0%, rgba(179, 232, 84, 0.2) 100%)
export function PageWrap({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn('min-h-[calc(100vh+1px)] h-auto pt-[90px] pb-6', className)}
    >
      {children}
    </div>
  )
}
