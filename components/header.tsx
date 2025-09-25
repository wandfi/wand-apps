'use client'

import { DISCORD_LINK, DOC_LINK, isLOCL, isTEST, TWITTER_LINK } from '@/constants'

import { abiVault } from '@/config/abi'
import { BvcsByEnv } from '@/config/bvaults'
import { DomainRef } from '@/hooks/useConfigDomain'
import { getPC } from '@/providers/publicClient'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo } from 'react'
import { LuBox, LuChartLine, LuSettings, LuCircleUser, LuSquareSquare } from 'react-icons/lu'
import { TbBook2, TbBrandDiscordFilled, TbBrandX, TbChevronDown } from 'react-icons/tb'
import { useWindowSize } from 'react-use'
import { isAddressEqual } from 'viem'
import { useAccount } from 'wagmi'
import ConnectBtn from './connet-btn'
import { CoinIcon } from './icons/coinicon'
import { SwitchChain } from './switch-chain'
import { ThemeMode } from './theme-mode'
import { Tip } from './ui/tip'
import { cn } from '@/lib/utils'

export function useShowAdmin() {
  const { address } = useAccount()
  const { data: owners } = useQuery({
    queryKey: [BvcsByEnv],
    enabled: !!address,
    initialData: [],
    queryFn: async () => Promise.all(BvcsByEnv.map((vc) => getPC(vc.chain).readContract({ abi: abiVault, address: vc.vault, functionName: 'owner' })))
  })
  return !!address && !!owners.find(item => isAddressEqual(item, address))
}


export function Header() {
  const pathname = usePathname()
  const { width } = useWindowSize(window.innerWidth, window.innerHeight)
  const hiddenTitle = width < 1024
  const showAdmin = useShowAdmin()
  const links = useMemo(() => {
    const links = [
      // ...(isLOCL || isTEST ? [] : []),
      { href: '/bootstrap', label: 'Bootstrap', icon: LuSquareSquare, disable: false },
      { href: '/yield-vault', label: 'Yield-Vault', icon: LuBox, disable: false },
      // { href: '/l-vaults', label: 'L-Vaults', icon: LuBox, disable: true },
      { href: '/portfolio', label: 'Portfolio', icon: LuCircleUser },
      { href: '/dashboard', label: 'Dashboard', icon: LuChartLine },
    ]
    showAdmin && links.push({ href: '/admin', label: 'Admin', icon: LuSettings })

    return links
  }, [showAdmin])
  const social_networks = useMemo(
    () => [
      { name: 'doc', url: DOC_LINK(), icon: TbBook2 },
      { name: 'Twitter', url: TWITTER_LINK, icon: TbBrandX },
      { name: 'Discord', url: DISCORD_LINK, icon: TbBrandDiscordFilled },
    ],
    [DomainRef.value],
  )
  return (
    <div className='h-[72px] fixed w-full flex bg-slate-50/30 backdrop-blur-lg dark:text-slate-50 dark:bg-slate-900/30 z-[100]'>
      <header className='h-[72px] w-full max-w-[1300px] inset-0 mx-auto flex items-center justify-between px-4   z-30 ml-[calc(100vw - 100%)] '>
        <div className='flex items-center'>
          <Link href={'/'} className='font-semibold flex pr-1 items-center text-base leading-7'>
            <CoinIcon symbol='logo-alt' size={52} />
            <span className='font-poppins' style={{ display: hiddenTitle ? 'none' : 'inline-block' }}>
              Wand
            </span>
          </Link>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger
              className={cn('flex text-slate-500 dark:text-slate-50 font-medium items-center capitalize text-sm whitespace-nowrap', {
                hidden: !hiddenTitle,
              })}
            >
              {pathname.split('/')[1] || 'Yield-Vault'}
              <TbChevronDown />
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content className='z-50 bg-white p-1 border border-slate-200 shadow-lg rounded-md dark:bg-gray-800 dark:border-gray-700'>
                {links.map(({ href, label, icon, disable }) => {
                  const Icon = icon
                  return (
                    <DropdownMenu.Item key={label}>
                      {disable ?
                        <Tip node={
                          <Link
                            className='flex items-center text-slate-500 text-sm font-medium gap-1 px-3 py-2 rounded-sm hover:bg-slate-50 dark:text-slate-50 dark:hover:bg-gray-700/30'
                            href={'javascript:void(0);'}
                          >
                            <Icon />
                            {label}
                          </Link>
                        }>
                          Coming Soon
                        </Tip>
                        : <Link
                          className='flex items-center text-slate-500 text-sm font-medium gap-1 px-3 py-2 rounded-sm hover:bg-slate-50 dark:text-slate-50 dark:hover:bg-gray-700/30'
                          href={href}
                        >
                          <Icon />
                          {label}
                        </Link>}
                    </DropdownMenu.Item>
                  )
                })}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>

        {/* Render App routes */}
        {(
          <div className='hidden lg:flex flex-1 px-5 items-center gap-10'>
            {links.map(({ href, label, icon, disable }) => {
              const Icon = icon
              if (disable) return <Tip node={
                <Link
                  className='text-sm font-medium flex gap-1 items-center transition-all active:translate-y-1 text-slate-700 dark:text-slate-50 opacity-50'
                  href={'javascript:void(0);'}
                >
                  <Icon />
                  {label}
                </Link>
              }>
                Coming Soon
              </Tip>

              return (
                <Link
                  className={cn(
                    'text-sm font-medium flex gap-1 items-center transition-all active:translate-y-1',
                    pathname === href ? 'text-slate-700 dark:text-slate-50' : 'text-slate-500 dark:text-slate-50/50',
                  )}
                  key={href}
                  href={href}
                >
                  <Icon />
                  {label}
                </Link>
              )
            })}
          </div>
        )}

        <div className='flex items-center gap-1 md:gap-4'>
          {/* Social networks */}
          <ThemeMode />
          <div className='hidden lg:flex items-center gap-3'>
            {social_networks.map(({ url, icon, name }) => {
              const Icon = icon
              return (
                <Link key={name} href={url} className='text-slate-300 hover:text-primary'>
                  <Icon />
                </Link>
              )
            })}
          </div>
          <SwitchChain />
          <ConnectBtn />
        </div>
      </header>
    </div>
  )
}
