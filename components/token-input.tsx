'use client'

import { Token } from '@/config/tokens'
import { parseEthers } from '@/lib/utils'
import { displayBalance } from '@/utils/display'
import clsx from 'clsx'
import _ from 'lodash'
import { useMemo, useRef, useState } from 'react'
import { useMeasure } from 'react-use'
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
  onTokenChange?: (token: Token) => void
}) {
  const options = useMemo(() => {
    return tokens.map((item => ({
      key: item.address,
      show: <TokenSymbol token={item} />,
      data: item,
    })))
  }, [tokens])
  const [token, setToken] = useState<Token>(tokens[0])
  const tokenBalance = useBalance(checkBalance ? token : undefined)
  const balance = tokenBalance.result;
  const inputRef = useRef<HTMLInputElement>(null)
  const balanceInsufficient =
    checkBalance && typeof balance !== 'undefined' && parseEthers(typeof amount == 'number' ? amount + '' : amount || '', token.decimals) > (typeof balance == 'bigint' ? balance : 0n)
  const isError = Boolean(error) || balanceInsufficient
  const [coinSymbolRef, { width: coinSymbolWidth }] = useMeasure<HTMLDivElement>()
  if (tokens.length == 0) return null
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
          {tokens.length > 1 ? <SimpleSelect className='border-none' options={options} onChange={(n) => { setToken(n.data); onTokenChange?.(n.data) }} /> : <TokenSymbol token={token} />}
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
          style={{ paddingLeft: `${_.round((coinSymbolWidth + 32) / 16, 3)}rem` }}
          className={clsx(
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
      </div>

      <div className='flex items-center justify-between mt-1 px-1 text-slate-400 dark:text-slate-50/70 text-sm'>
        {showBalance && <div className={balanceClassName}>
          <span>
            {balanceTit}: {displayBalance(balance, undefined, token.decimals)}
          </span>
          <button
            className='text-primary ml-2'
            onClick={() => {
              const fmtAmount = formatUnits(balance, token.decimals)
              setAmount(fmtAmount)
              onClick && !disable && onClick()
            }}
          >
            Max
          </button>
        </div>}
        {isError && <div className='text-sm text-red-400'>{error || 'Insufficient account balance'}</div>}
      </div>

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