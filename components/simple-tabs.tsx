import { cn, tabToSearchParams } from '@/lib/utils'
import * as Tabs from '@radix-ui/react-tabs'
import { useState } from 'react'

export function SimpleTabs({
  currentTab,
  className,
  listClassName,
  triggerClassName,
  contentClassName,
  hiddenConetent = false,
  data,
  onTabChange,
}: {
  className?: string
  listClassName?: string
  triggerClassName?: string | ((i: number) => string)
  contentClassName?: string
  hiddenConetent?: boolean
  currentTab?: string
  data: { tab: string; content: React.ReactNode }[]
  onTabChange?: (tab: string) => void
}) {
  const [_tab, setTab] = useState(currentTab || data[0].tab)
  const mtab = currentTab ?? _tab
  const tab = data.find(item => tabToSearchParams(item.tab) == tabToSearchParams(mtab))?.tab ?? data[0].tab
  return (
    <Tabs.Root
      value={tab}
      className={cn('w-full', className)}
      onValueChange={(e) => {
        setTab(e)
        onTabChange?.(e)
      }}
    >
      <Tabs.List className={cn('p-1 w-fit rounded-md gap-5 flex bg-transparent', listClassName)}>
        {data.map((item, i) => (
          <Tabs.Trigger
            key={item.tab}
            className={cn(
              'rounded-[3px] text-sm py-1.5 px-0 text-black/50 font-medium data-[state="active"]:bg-black data-[state="active"]:text-slate-900 !bg-transparent dark:text-white/50 dark:data-[state="active"]:text-white',
              typeof triggerClassName == 'function' ? triggerClassName(i) : triggerClassName,
            )}
            value={item.tab}
          >
            {item.tab}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {!hiddenConetent &&
        data.map((item) => (
          <Tabs.Content key={item.tab} value={item.tab} className={cn('flex flex-col gap-6 outline-none', contentClassName)}>
            {item.content}
          </Tabs.Content>
        ))}
    </Tabs.Root>
  )
}
