import { cn } from '@/lib/utils'
import { displayBalance } from '@/utils/display'
import { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from 'react'
import { CoinIcon } from './icons/coinicon'
import { BBtn } from './ui/bbtn'

export const itemClassname = 'py-5 flex flex-col items-center gap-2 relative dark:border-border border-solid'
export const renderToken = (symbol: string, amount: bigint, usd: bigint, decimals: number = 18, borderL: boolean = false) => {
  return (
    <div className={cn(itemClassname, 'border-b', { 'border-l': borderL })}>
      <div>
        <div className='text-[#64748B] dark:text-slate-50/60 text-xs font-semibold leading-[12px] whitespace-nowrap flex gap-2 items-center'>
          <CoinIcon symbol={symbol} size={14} />
          {symbol}
        </div>
        <div className='flex mt-2 flex-col gap-1 pl-[1.375rem] text-xs font-medium'>
          <span className=''>{displayBalance(amount, undefined, decimals)}</span>
          <span className=' text-[#64748B] dark:text-slate-50/60'>{`$${displayBalance(usd, 2, decimals)}`}</span>
        </div>
      </div>
    </div>
  )
}
export const renderStat = (tit: string, icon: string, sub: ReactNode, borderL: boolean = false) => (
  <div className={cn(itemClassname, 'border-b pb-10', { 'border-l': borderL })}>
    <div>
      <div className='text-[#64748B] dark:text-slate-50/60 text-xs font-semibold leading-[12px] whitespace-nowrap text-center'>{tit}</div>
      <div className='flex mt-2 items-center gap-2 text-sm font-medium'>
        <CoinIcon symbol={icon} size={14} />
        {typeof sub == 'string' ? <span>{sub}</span> : sub}
      </div>
    </div>
  </div>
)

const BtnWrap = (p: ButtonHTMLAttributes<HTMLButtonElement>) => {
  const { children, onClick, ...props } = p
  return (
    <BBtn hiddenBorder {...props} disabled={!Boolean(p.onClick)} onClick={onClick}>
      {children}
    </BBtn>
  )
}
export const renderChoseSide = (
  leftSymbol: string,
  leftTitle: string,
  leftSub: ReactNode,
  rightSymbol: string,
  rightTitle: string,
  rightSub: string,
  onClickLeft?: MouseEventHandler<HTMLDivElement>,
  onClickRight?: MouseEventHandler<HTMLDivElement>,
) => {


  return (
    <div className={cn(itemClassname, 'col-span-2 gap-4')}>
      <div className='text-[#64748B] dark:text-slate-50/60 text-xs font-semibold leading-[12px] whitespace-nowrap'>Choose your side</div>
      <div className='grid grid-cols-2 gap-4 w-full px-4'>
        <BtnWrap className={cn('h-[4.25rem] w-full relative disabled:opacity-100 disabled:cursor-default')} onClick={onClickLeft as any}>
          <div className='flex gap-2 items-center p-4 w-full h-[4.25rem] absolute left-0 top-0'>
            <CoinIcon symbol={leftSymbol} size={36} />
            <div className='flex flex-col items-start gap-2'>
              <div className='text-white/60 text-xs font-semibold leading-[12px] whitespace-nowrap'>{leftTitle}</div>
              {Boolean(leftSub) && <span className=' text-[14px] leading-[14px] font-medium'>{leftSub}</span>}
            </div>
          </div>
        </BtnWrap>
        <BtnWrap className={cn('h-[4.25rem] w-full relative disabled:opacity-100 disabled:cursor-default')} onClick={onClickRight as any}>
          <div className='flex flex-row-reverse gap-2 items-center p-4 w-full h-[4.25rem] absolute left-0 top-0'>
            <CoinIcon symbol={rightSymbol} size={36} />
            <div className='flex flex-col items-end gap-2'>
              <div className='text-white/60 text-xs font-semibold leading-[12px] whitespace-nowrap'>{rightTitle}</div>
              {Boolean(rightSub) && <span className=' text-[14px] leading-[14px] font-medium'>{rightSub}</span>}
            </div>
          </div>
        </BtnWrap>
      </div>
    </div>
  )
}
