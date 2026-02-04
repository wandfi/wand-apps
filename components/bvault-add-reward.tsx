import { abiBVault } from '@/config/abi'
import { type BVaultConfig } from '@/config/bvaults'
import { useBalance } from '@/hooks/useToken'
import { cn, handleError, parseEthers } from '@/lib/utils'
import { getPC } from '@/providers/publicClient'
import { useBVault } from '@/providers/useBVaultsData'
import { displayBalance } from '@/utils/display'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo, useRef, useState } from 'react'
import { FiArrowDown } from 'react-icons/fi'
import { useDebounce } from 'react-use/esm'
import { toast } from 'sonner'
import { type Address, erc20Abi, isAddress, zeroAddress } from 'viem'
import { useAccount, useWalletClient } from 'wagmi'
import { AssetInput } from './asset-input'
import { CoinIcon } from './icons/coinicon'
import { PulseTokenItem } from './pulse-ui'
import { SimpleDialog } from './simple-dialog'
import { BBtn } from './ui/bbtn'

type TokenItem = {
  symbol: string,
  name: string,
  address: Address,
  decimals: number
}
const defTokens: TokenItem[] = [
  { symbol: 'vIP', name: 'Verio IP', address: '0x5267F7eE069CEB3D8F1c760c215569b79d0685aD', decimals: 18, },
  { symbol: 'WIP', name: 'Wrapped IP', address: '0x1514000000000000000000000000000000000000', decimals: 18, },
]


function TokenBalance({ chain, address, decimals }: { chain: number, address: Address, decimals?: number }) {
  const balance = useBalance({ chain, address } as any).result
  return <>
    {displayBalance(balance, undefined, decimals)}
  </>

}
function TokenSelect({ tokens, onSelect, hiddenNative, chainId }: { chainId: number, tokens?: TokenItem[]; hiddenNative?: boolean; onSelect?: (item: TokenItem) => void }) {
  const originTokens = useMemo(() => {
    const list = defTokens
    if (hiddenNative) return list.filter((item) => item.address !== zeroAddress)
    return list
  }, [tokens, hiddenNative])

  const [input, setInput] = useState('')
  const [queryKey, updateQueryKey] = useState(['searchTokens', input, originTokens, chainId])
  useDebounce(() => updateQueryKey(['searchTokens', input, originTokens, chainId]), 300, [input, originTokens, chainId])
  const { data: searchdTokens, isFetching } = useQuery({
    initialData: originTokens,
    queryFn: async () => {
      if (isAddress(input)) {
        const t = originTokens.find((item) => item.address == input)
        if (t) return [t]
        const pc = getPC(chainId)
        const address = input as Address
        const [symbol, decimals] = await Promise.all([
          pc.readContract({ abi: erc20Abi, address, functionName: 'symbol' }),
          pc.readContract({ abi: erc20Abi, address, functionName: 'decimals' }),
        ])
        return [{ symbol, address, decimals }] as TokenItem[]
      } else {
        if (!input) return originTokens
        return originTokens.filter((item) => {
          const inputLow = input.toLowerCase()
          const symbolMatched = !!item.symbol.toLowerCase().match(inputLow)
          const nameMatched = !!item.name && !!item.name.toLowerCase().match(inputLow)
          return symbolMatched || nameMatched
        })
      }
    },
    queryKey: queryKey,
  })
  const showTokens = searchdTokens || originTokens

  return (
    <div className='flex flex-col gap-4 p-5'>
      <div className='page-sub text-center'>Select a token</div>
      <input
        className={cn(
          'bg-white dark:bg-transparent',
          'border-slate-400  focus:border-primary',
          'w-full h-14 text-right px-4 font-bold text-base border-[#4A5546] border focus:border-2 text-slate-700 rounded-lg outline-none dark:text-slate-50',
        )}
        placeholder='Search by name, symbol or address'
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <div className='flex flex-col overflow-y-auto h-[18.75rem]'>
        {isFetching ? (
          <>
            <PulseTokenItem />
            <PulseTokenItem />
            <PulseTokenItem />
          </>
        ) : (
          <>
            {showTokens.map((t) => (
              <div
                key={t.address}
                className='flex px-4 py-2 items-center gap-4 rounded-lg cursor-pointer hover:bg-primary/20'
                onClick={() => {
                  onSelect?.(t)
                }}
              >
                <CoinIcon className='rounded-full' size={40} symbol={t.symbol} />
                <span>{t.symbol}</span>
                <span className='ml-auto'><TokenBalance chain={chainId} address={t.address} decimals={t.decimals} /></span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

export function BVaultAddReward({ bvc }: { bvc: BVaultConfig }) {
  const bvd = useBVault(bvc)
  const [stoken, setStoken] = useState(defTokens[0])
  const [input, setInput] = useState('')
  const balance = useBalance({ chain: bvc.chain, address: stoken.address } as any).result
  const inputBn = parseEthers(input, stoken.decimals)
  const triggerRef = useRef<HTMLDivElement>(null)
  const wc = useWalletClient()
  const { address } = useAccount()
  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (disableAdd) return
      const pc = getPC(bvc.chain)
      if (bvc.isOld) {
        const tokens = await pc.readContract({ abi: abiBVault, address: bvc.vault, functionName: 'bribeTokens', args: [bvd.epochCount] })
        console.info('tokens:', tokens, stoken.address)
        if (!tokens.find((item) => item.toLowerCase() == stoken.address.toLowerCase())) {
          const hash = await wc.data.writeContract({ abi: abiBVault, address: bvc.vault, functionName: 'addBribeToken', args: [stoken.address] })
          await pc.waitForTransactionReceipt({ hash, confirmations: 3 })
        }
        const allownce = await pc.readContract({ abi: erc20Abi, address: stoken.address, functionName: 'allowance', args: [address, bvc.vault] })
        if (allownce < inputBn) {
          const hash = await wc.data.writeContract({ abi: erc20Abi, address: stoken.address, functionName: 'approve', args: [bvc.vault, inputBn] })
          await pc.waitForTransactionReceipt({ hash, confirmations: 3 })
        }
        const hash = await wc.data.writeContract({ abi: abiBVault, address: bvc.vault, functionName: 'addBribes', args: [stoken.address, inputBn] })
        await pc.waitForTransactionReceipt({ hash, confirmations: 3 })
      } else {
        const allownce = await pc.readContract({ abi: erc20Abi, address: stoken.address, functionName: 'allowance', args: [address, bvc.vault] })
        if (allownce < inputBn) {
          const hash = await wc.data.writeContract({ abi: erc20Abi, address: stoken.address, functionName: 'approve', args: [bvc.vault, inputBn] })
          await pc.waitForTransactionReceipt({ hash, confirmations: 3 })
        }
        const hash = await wc.data.writeContract({ abi: abiBVault, address: bvc.vault, functionName: 'addAdhocBribes', args: [stoken.address, inputBn] })
        await pc.waitForTransactionReceipt({ hash, confirmations: 3 })
      }

      setInput('')
      toast.success('Transaction success')
    },
    onError: handleError,
  })
  const disableAdd = !wc.data || !address || inputBn == 0n || inputBn > balance || isPending || bvd.epochCount == 0n
  return (
    <div className='animitem max-w-[500px] w-full mx-auto mt-8 card'>
      <div className='relative'>
        <AssetInput decimals={stoken.decimals} asset={stoken.symbol} balance={balance} amount={input} setAmount={setInput} />
        <SimpleDialog
          trigger={
            <div ref={triggerRef} className='absolute left-0 top-0 flex cursor-pointer justify-end items-center py-4'>
              <span className='invisible pl-12'>{stoken.symbol}</span>
              <FiArrowDown className='ml-2' />
            </div>
          }
        >
          <TokenSelect
            chainId={bvc.chain}
            hiddenNative
            onSelect={(t) => {
              setStoken(t)
              triggerRef.current?.click()
            }}
          />
        </SimpleDialog>
      </div>
      <BBtn busy={isPending} className='w-full flex justify-center items-center gap-2' disabled={disableAdd} onClick={() => mutate()}>
        Add
      </BBtn>
    </div>
  )
}
