import { cn, parseEthers, promiseT } from '@/lib/utils'
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { Collapse } from 'react-collapse'
import { FiArrowDown, FiArrowUp } from 'react-icons/fi'
import Select from 'react-select'
import { useSetState } from 'react-use'
import { Abi, AbiFunction, AbiParameter, Address, stringToHex } from 'viem'
import { ApproveAndTx, Txs } from './approve-and-tx'
import { useQuery } from '@tanstack/react-query'
import { Spinner } from './spinner'

export const selectClassNames: Parameters<Select>[0]['classNames'] = {
  menu: () => cn('bg-white dark:bg-black dark:border'),
  option: (props) => cn({ '!bg-primary/50': props.isFocused, '!bg-primary': props.isSelected }),
  control: () => 'bg-white dark:bg-black !min-h-[58px] !border-primary/70 !shadow-none',
  singleValue: () => 'dark:text-white',
}
export const inputClassname = 'bg-white dark:bg-transparent border-primary/70 w-full h-14 text-right pr-4 font-bold text-sm border focus:border-2  rounded-md outline-none '

export const defConvertArg = (arg: string, _i: number, param: AbiParameter) => {
  if (param.type == 'uint8') return parseInt((arg || '').replaceAll(' ', ''))
  if (param.type.startsWith('uint')) return BigInt((arg || '').replaceAll(' ', ''))
  if (param.type == 'bytes32') return stringToHex(arg, { size: 32 })
  if (param.type == 'bool') {
    if (arg.toLowerCase() == 'true') return true
    return false
  }
  return arg
}
const convertArgs = (args: string[], inputs: readonly AbiParameter[], ca?: (arg: string, i: number, param: AbiParameter) => any) => {
  try {
    return args.map((arg, i) => {
      const input = inputs[i]
      if (ca) return ca(arg, i, input)
      return defConvertArg(arg, i, input)
    })
  } catch (error) {
    return undefined;
  }
}


export function Expandable({ children, tit, disable }: { tit: string; children?: ReactNode; disable?: boolean }) {
  const [open, setOpen] = useState(false)

  return (
    <div className='flex flex-col w-full bg-white dark:bg-transparent rounded-lg overflow-hidden border border-solid border-primary/40'>
      <div className='px-5 py-2 min-h-[58px] flex justify-between items-center text-sm'>
        <div className='font-medium text-base'>{tit}</div>
        {disable ? (
          children
        ) : (
          <div className='px-2 py-1 rounded-full border border-solid border-primary flex items-center text-xs text-primary cursor-pointer ' onClick={() => setOpen(!open)}>
            <span className='mr-[5px]'>{!open ? 'Expand' : 'Close'}</span>
            {open ? <FiArrowUp /> : <FiArrowDown />}
          </div>
        )}
      </div>
      <Collapse isOpened={open} theme={{ content: 'bg-gray-200 dark:bg-transparent p-4 flex flex-col gap-2 whitespace-break-spaces' }}>
        {children}
      </Collapse>
    </div>
  )
}

export function GeneralAction({
  abi,
  address,
  functionName,
  tit,
  infos,
  convertArg,
  txProps,
  onArgs,
  argsDef
}: {
  abi: Abi
  address: Address
  functionName: string
  tit?: string
  infos?: any | (() => Promise<any>)
  argsDef?: string[]
  convertArg?: (arg: string, i: number, param: AbiParameter) => any
  onArgs?: (args: string[]) => void
  txProps?: Omit<Parameters<typeof Txs>[0], 'txs' | 'className'>
}) {
  const abiItem = abi.find((item) => item.type == 'function' && item.name == functionName) as AbiFunction
  const inputsLength = abiItem?.inputs?.length || 0
  const [{ args, value }, setState] = useSetState({
    value: '',
    args: new Array(inputsLength).fill('') as string[]
  })
  const margs = useMemo(() => args.map((arg, i) => arg || argsDef?.[i] || ''), [argsDef, args])
  const valueBn = parseEthers(value)
  useEffect(() => {
    onArgs && onArgs(args)
  }, [args])
  if (!abiItem) return
  const disableExpand = !abiItem.inputs || abiItem.inputs.length == 0
  const { data: qInfo, isLoading, isError, refetch } = useQuery({
    queryKey: ['queryInfo', address, functionName, infos],
    enabled: Boolean(infos),
    queryFn: async () => promiseT(infos)
  })
  return (
    <Expandable tit={tit || functionName} disable={disableExpand}>
      {abiItem.inputs?.map((item, index) => (
        <div
          className='relative'
          key={`input_${index}`}
        >
          <div className='opacity-60 absolute top-1/2 left-2 -translate-y-1/2 text-xs'>{item.name}</div>
          <input
            type='text'
            value={margs[index]}
            onChange={(e) => setState({ args: args.map((arg, argIndex) => (index == argIndex ? e.target.value : arg)) })}
            className={cn(inputClassname)}
          />

        </div>
      ))}
      {abiItem.stateMutability == 'payable' && <div className='relative'>
        <div className='opacity-60 absolute top-1/2 left-2 -translate-y-1/2 text-xs'>value</div>
        <input
          type='text'
          value={value}
          onChange={(e) => setState({ value: e.target.value })}
          className={cn(inputClassname)}
        />
      </div>}
      {
        Boolean(infos) && <div className={cn('whitespace-normal')}>
          {isLoading && <Spinner />}
          {Boolean(qInfo) && JSON.stringify(qInfo, undefined, 2)}
        </div>
      }
      <Txs
        {...(txProps || {})}
        onTxSuccess={() => {
          Boolean(infos) && refetch()
          txProps?.onTxSuccess?.()
        }}
        tx='Write'
        txs={[
          {
            abi,
            address,
            functionName,
            ...(margs.length ? { args: convertArgs(margs, abiItem.inputs, convertArg) } : {}),
            value: valueBn
          }
        ]}
        className={cn('!mt-0 flex items-center justify-center gap-4', disableExpand ? 'max-w-[100px]' : 'w-full')}
      />
    </Expandable>
  )
}
