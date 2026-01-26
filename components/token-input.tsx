'use client'

import { type Token } from '@/config/tokens'
import { cn, parseEthers } from '@/lib/utils'
import { displayBalance } from '@/utils/display'
import { isNil, round } from 'es-toolkit'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useMeasure } from 'react-use/esm'
import { formatUnits } from 'viem'
import { useBalance } from '../hooks/useToken'
import { CoinIcon } from './icons/coinicon'
import { Spinner } from './spinner'
import { SimpleSelect } from './ui/select'


function TokenSymbol({ token }: { token: Token }) {
  return <div className='flex items-center gap-2'>
    <CoinIcon symbol={token.symbol} size={24} />
    {token.symbol}
  </div>
}

export function TokenInput({
  tokens,
  checkBalance = true,
  balance: showBalance = true,
  balanceTit = 'Balance',
  exchange,
  readonly,
  selected,
  onClick,
  amount,
  setAmount,
  price,
  disable,
  balanceClassName = '',
  loading,
  error = '',
  otherInfo,
  onTokenChange
}: {
  tokens: Token[],
  checkBalance?: boolean
  balance?: boolean
  balanceTit?: string
  exchange?: string | number
  readonly?: boolean
  selected?: boolean
  onClick?: () => void
  amount?: string
  setAmount?: any
  price?: number | string
  disable?: boolean
  loading?: boolean
  balanceClassName?: string
  error?: string
  otherInfo?: React.ReactNode
  onTokenChange?: (token: Token) => void
}) {
  const options = useMemo(() => {
    return tokens.map((item => ({
      key: item.address,
      show: <TokenSymbol token={item} />,
      data: item,
    })))
  }, [JSON.stringify(tokens)])
  const [token, setToken] = useState<Token>(options[0].data)
  useEffect(() => {
    if (!options.some(item => item.data == token)) {
      console.info('tokenChange:')
      setToken(options[0].data)
      onTokenChange?.(options[0].data)
    }
  }, [token, options])
  const mShowBalance = showBalance && !disable
  const mCheckBalance = checkBalance && !disable
  const tokenBalance = useBalance(mCheckBalance ? token : undefined)
  const balance = tokenBalance.result;
  const inputRef = useRef<HTMLInputElement>(null)
  const balanceInsufficient = mCheckBalance && parseEthers(`${amount ?? '0'}`, token.decimals) > balance
  const isError = Boolean(error) || balanceInsufficient
  const [coinSymbolRef, { width: coinSymbolWidth }] = useMeasure<HTMLDivElement>()
  if (options.length == 0) return null
  return (
    <div
      className='relative w-full'
      onClick={() => {
        onClick && !disable && onClick()
      }}
    >
      <div className='relative'>
        <div className='absolute flex items-center h-fit gap-2 left-[48px] bottom-1 w-full  max-w-[calc(100%-56px)]' style={{ pointerEvents: 'none' }}>
          {price && <div className='text-neutral-500 dark:text-slate-50/70 text-xs max-w-full overflow-hidden'>{price}</div>}
          {exchange && <div className='text-slate-500 dark:text-slate-50/70 text-xs max-w-full overflow-hidden'>~${exchange}</div>}
        </div>
        <div className='absolute flex items-center gap-2 w-fit top-1/2 left-4 -translate-y-1/2 z-50' ref={coinSymbolRef}>
          {tokens.length > 1 ? <SimpleSelect className='border-none' options={options} onChange={(n) => {
            console.info('tokenChange:', n)
            setToken(n.data); onTokenChange?.(n.data)
          }} /> : <TokenSymbol token={token} />}
        </div>
        <input
          value={loading ? '' : amount}
          onChange={(e) => {
            if (readonly) return
            const numstr = (e.target.value || '').replaceAll('-', '').replaceAll('+', '')
            setAmount(numstr)
          }}
          ref={inputRef}
          type='number'
          disabled={disable}
          style={{ paddingLeft: `${round((coinSymbolWidth + 32) / 16, 3)}rem` }}
          className={cn(
            readonly ? 'bg-slate-50 cursor-not-allowed dark:bg-slate-800' : 'bg-white dark:bg-transparent',
            {
              'border-green-700 border-2': selected,
              'border-red-400 !border-2 focus:border-red-400': isError,
              'border-slate-400  focus:border-primary': !isError && !selected,
            },
            'w-full h-14 text-right pr-4 font-bold text-lg border-[#4A5546] border focus:border-2 text-slate-700 rounded-lg outline-none dark:text-slate-50',
          )}
          placeholder='0.000'
          maxLength={36}
          pattern='[0-9.]{36}'
          step={0.01}
          title=''
          readOnly={readonly}
        />
        {loading && <Spinner className='absolute right-24 top-[1.125rem]' />}
        {isError && <div className='text-sm text-white bg-red-400 rounded right-0 bottom-0 absolute px-1 translate-y-1/4'>{error || 'Insufficient account balance'}</div>}
      </div>

      {(mShowBalance || !isNil(otherInfo)) && (
        <div className='flex items-center justify-between mt-1 px-1 text-slate-400 dark:text-slate-50/70 text-sm'>
          {mShowBalance && <div className={balanceClassName}>
            <span>
              {balanceTit}: {displayBalance(balance, undefined, token.decimals)}
            </span>
            {!disable && <button
              className='text-primary ml-2'
              onClick={() => {
                const fmtAmount = formatUnits(balance, token.decimals)
                setAmount(fmtAmount)
                onClick && !disable && onClick()
              }}
            >
              Max
            </button>}
          </div>}
          {!isNil(otherInfo) && <div className='ml-auto'>{otherInfo}</div>}
        </div>
      )}

    </div>
  )
}


export function useTokenInputHelper(tokens: Token[]) {
  const [_currentToken, setCurrentToken] = useState(tokens[0])
  const currentToken = tokens.includes(_currentToken) ? _currentToken : tokens[0]
  const [inputAsset, setInputAsset] = useState('')
  const inputAssetBn = parseEthers(inputAsset, currentToken.decimals)
  return {
    currentToken,
    inputAsset,
    inputAssetBn,
    setCurrentToken,
    setInputAsset,
  }
}