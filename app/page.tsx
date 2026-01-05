'use client'
  ; (BigInt.prototype as any).toJSON = function () {
    return this.toString()
  }

import { type IconProps } from '@/components/icons/types';
import React from 'react';
// import LntPage from './lnt-vaults/page'
import BvaultPage from './yield-vault/page';



type CardItemType = {
  icon: React.FunctionComponent<IconProps>
  tit: string
  sub: string
  className?: string
  hoverIconBg?: string
  hoverTextColor?: string
}



export default function Home() {
  // return isLNT ? <LntPage /> : <MainUI />
  return <BvaultPage />
}
