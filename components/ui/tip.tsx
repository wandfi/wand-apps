'use client'

import { cn } from '@/lib/utils'
import * as Tooltip from '@radix-ui/react-tooltip'
import { type ReactNode, useRef, useState } from 'react'
import { RxQuestionMarkCircled } from 'react-icons/rx'
import { useClickAway } from 'react-use'
export function Tip({
  children,
  node,
  className,
  inFlex,
  contentClassName
}: {
  children?: ReactNode
  node?: ReactNode
  className?: string
  inFlex?: boolean
  contentClassName?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useClickAway(ref, (e) => {
    if (open) {
      e.preventDefault()
      e.stopPropagation()
      setOpen(false)
    }
  })
  const tooltipRoot = document.getElementById('tooltip-root')
  if (!children) return node
  return (
    <Tooltip.Provider>
      <Tooltip.Root open={open} delayDuration={100}>
        <Tooltip.Trigger asChild onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} onClickCapture={() => !open && setOpen(true)}>
          {node ? (
            <div className={cn('inline-block cursor-default', className)} style={{ verticalAlign: 'text-bottom' }}>
              {node}
            </div>
          ) : (
            <div
              className={cn(
                inFlex ? 'flex' : 'translate-y-[-6%] inline-block',
                ' px-[3px] cursor-default relative',
                className,
              )}
            >
              <RxQuestionMarkCircled className='inline-block stroke-slate-500' />
            </div>
          )}
        </Tooltip.Trigger>

        <Tooltip.Portal container={tooltipRoot}>
          <Tooltip.Content className={cn('max-w-xs text-sm text-white bg-slate-900 shadow-lg dark:bg-[#333333] rounded-md p-4', contentClassName)}>
            {children}
            <Tooltip.Arrow />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}
