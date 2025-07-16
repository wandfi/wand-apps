import { cn } from '@/lib/utils'
import React from 'react'
import { AiFillNotification } from 'react-icons/ai'


export function Noti({ data, className }: { data: string, className?: string }) {
  return (
    <div className={cn('w-full mt-2 mb-3 md:mt-4 md:mb-6 flex text-[24px] md:text-[14px] text-[#64748B] dark:text-slate-50/60 font-medium leading-[24px] md:leading-[14px]', className)}>
      <div className=''>
        <AiFillNotification size={20} />
      </div>
      <div className='text-sm ml-1 '>{data}</div>
    </div>
  )
}
