import { toBVault } from '@/app/routes'
import { abiAdhocBribesPool, abiBVault, abiStakingBribesPool } from '@/config/abi'
import { BVaultConfig } from '@/config/bvaults'
import { LP_TOKENS } from '@/config/lpTokens'
import { getTokenBy, Token } from '@/config/tokens'
import { DECIMAL } from '@/constants'
import { useBvaultROI, useBVaultUnderlyingAPY } from '@/hooks/useBVaultROI'
import { useCurrentChainId } from '@/hooks/useCurrentChainId'
import { useBalance } from '@/hooks/useToken'
import { useVerioStakeApy } from '@/hooks/useVerioStakeApy'
import { cn, FMT, fmtBn, fmtDate, fmtDuration, fmtPercent, getBigint, handleError, parseEthers } from '@/lib/utils'
import { getPC } from '@/providers/publicClient'
import { useStore } from '@/providers/useBoundStore'
import { useBVault, useBVaultApy, useBvaultTVL, useCalcClaimable, useEpochesData, useUpBVaultForUserAction } from '@/providers/useBVaultsData'
import { displayBalance } from '@/utils/display'
import { useQuery } from '@tanstack/react-query'
import { ProgressBar } from '@tremor/react'
import _, { union } from 'lodash'
import { useRouter } from 'next/navigation'
import { Fragment, ReactNode, useMemo, useState } from 'react'
import { RiLoopLeftFill } from 'react-icons/ri'
import { useDebounce, useToggle } from 'react-use'
import { Address, erc20Abi, erc4626Abi, isAddressEqual, zeroAddress } from 'viem'
import { useAccount, useWalletClient } from 'wagmi'
import { TX, Txs } from './approve-and-tx'
import { AssetInput } from './asset-input'
import { CoinAmount } from './coin-amount'
import { GetvIP } from './get-lp'
import { CoinIcon } from './icons/coinicon'
import STable from './simple-table'
import { SimpleTabs } from './simple-tabs'
import { TokenInput } from './token-input'
import { Tip } from './ui/tip'
import { itemClassname, renderChoseSide, renderStat, renderToken } from './vault-card-ui'


async function wrapIfErc4626({ chainId, vc, token, inputBn, user }: { chainId: number, vc: BVaultConfig, token: Address, inputBn: bigint, user: Address }) {
  let txs: TX[] = []
  let sharesBn = inputBn;
  if (!isAddressEqual(vc.asset, token)) {
    sharesBn = await getPC(chainId).readContract({ abi: erc4626Abi, address: vc.asset, functionName: 'previewDeposit', args: [inputBn] })
    txs = [
      { abi: erc20Abi, address: token, functionName: 'approve', args: [vc.asset, inputBn] },
      { abi: erc4626Abi, address: vc.asset, functionName: 'deposit', args: [inputBn, user] },
    ]
  }
  return { txs, sharesBn }
}
function useTokens(vc: BVaultConfig) {
  const chainId = useCurrentChainId()
  return useMemo(() => {
    const tokenAdds = [...(vc.moreAssets || []), vc.asset]
    const tokens: Token[] = union(tokenAdds.map(item => item.toLowerCase())).map(item => getTokenBy(item as Address, chainId)).filter(Boolean) as any
    return tokens;
  }, [vc])
}
function TupleTxt(p: { tit: string; sub: ReactNode; subClassname?: string }) {
  return (
    <div className='flex items-center gap-5'>
      <div className='text-xs dark:text-white/60 font-medium'>{p.tit}</div>
      <div className={cn('text-lg  font-medium flex items-center', p.subClassname)}>{p.sub}</div>
    </div>
  )
}

const MinumAmount = BigInt(1e16)

export function BVaultApy({ bvc, showTip = false }: { bvc: BVaultConfig, showTip?: boolean }) {
  const [fmtApy, apy] = useBVaultApy(bvc)
  const { data: stakeApy } = useVerioStakeApy()
  const fmtTotal = fmtPercent(apy + stakeApy, 10)
  if (showTip)
    return <Tip className='underline underline-offset-[3px]' node={fmtTotal}>
      <div>vIP Base: {fmtPercent(stakeApy, 10)}</div>
      <div>YT Income: {fmtApy}</div>
    </Tip>
  return <>{fmtTotal}</>
}

export function BVaultCard({ vc }: { vc: BVaultConfig }) {
  const r = useRouter()
  const [token1, token2] = vc.assetSymbol.split('-')
  const bvd = useBVault(vc.vault)
  const [tvl, lpBaseTvlBn, lpQuoteTvlBn] = useBvaultTVL(vc)
  const lp = LP_TOKENS[vc.asset]
  const lpBase = bvd.lpBase || 0n
  const lpQuote = bvd.lpQuote || 0n
  // const [fmtBoost] = useBVaultBoost(vc.vault)
  // const [fmtApy] = useBVaultApy(vc.vault)
  const epochName = `Epoch ${(bvd?.epochCount || 0n).toString()}`
  const settleTime = bvd.epochCount == 0n ? '-- -- --' : fmtDate((bvd.current.startTime + bvd.current.duration) * 1000n, FMT.DATE2)
  const settleDuration = bvd.epochCount == 0n ? '' : fmtDuration((bvd.current.startTime + bvd.current.duration) * 1000n - BigInt(_.now()))
  const { data: { avrageApy: underlyingApy, items } } = useBVaultUnderlyingAPY(vc)
  const { roi } = useBvaultROI(vc)
  return (
    <div className={cn('card !p-0 grid grid-cols-2 overflow-hidden', {})}>
      <div className={cn(itemClassname, 'border-b', 'bg-black/10 dark:bg-white/10 col-span-2 flex-row px-4 md:px-5 py-4 items-center')}>
        <CoinIcon symbol={vc.icon ?? vc.assetSymbol} size={44} />
        <div>
          <div className=' text-lg font-semibold whitespace-nowrap'>{vc.tit ?? vc.assetSymbol}</div>
          <div className=' text-sm font-medium'>{vc.sub ?? (vc.assetSymbol.includes('-') ? 'LP Token' : '')}</div>
        </div>
        <div className='ml-auto'>
          <div className='text-[#64748B] dark:text-slate-50/60 text-xs font-semibold whitespace-nowrap'>{'Total Value Locked'}</div>
          <div className='text-sm font-medium'>${displayBalance(tvl, 2)}</div>
        </div>
      </div>
      {lp && renderToken(token1, lpBase, lpBaseTvlBn)}
      {lp && renderToken(token2, lpQuote, lpQuoteTvlBn, true)}
      {renderStat(
        'Settlement Time',
        bvd.closed ? 'status-red' : 'status-green',
        bvd.closed ? (
          'Closed'
        ) : (
          <div className='relative'>
            <div className='flex gap-2 items-end'>
              <span>{settleTime}</span>
              <span className='text-[#64748B] dark:text-slate-50/60 text-xs font-semibold whitespace-nowrap'>{settleDuration}</span>
            </div>
            {bvd.epochCount > 0n && <div className='absolute top-full mt-1 left-0 text-[#64748B] dark:text-slate-50/60 text-xs font-semibold whitespace-nowrap'>{epochName}</div>}
          </div>
        ),
      )}
      {renderStat('Reward', vc.rewardSymbol || 'vIP', <Fragment>
        <span>{vc.rewardSymbol || 'vIP'}</span>
        {(vc.rewardSymbol || 'vIP') == 'vIP' && <div className='text-xs whitespace-nowrap absolute top-2/3 left-1/2 -translate-x-1/2'>Underlying APY:
          <Tip node={<span className='underline underline-offset-2'>{fmtPercent(underlyingApy, 18, 2)}</span>}>
            <div className='grid grid-cols-3'>
              <div className='p-2'>IP Asset</div>
              <div className='p-2'>Restaked</div>
              <div className='p-2'>APY</div>
              {items.map((item) => <Fragment key={item.tit}>
                <div className='px-2'>{item.tit || '-'}</div>
                <div className='px-2'>{displayBalance(item.staked)}</div>
                <div className='px-2'>{fmtPercent(item.apy, 18, 2)}</div>
              </Fragment>)}
            </div>
          </Tip>
        </div>}
      </Fragment>, true)}
      {renderChoseSide(
        vc.pTokenSymbol,
        'Principal Token',
        <BVaultApy bvc={vc} />,
        vc.yTokenSymbol,
        'Yield Token',
        `${fmtPercent(roi, 18, 2)}`, // `${fmtBoost}x`,
        (e) => {
          e.stopPropagation()
          toBVault(r, vc.vault, 'pt')
        },
        (e) => {
          e.stopPropagation()
          toBVault(r, vc.vault, 'yt')
        },
      )}
    </div>
  )
}



export function BVaultCardComming({ symbol = '' }: { symbol?: string }) {
  return (
    <div className={cn('card cursor-pointer !p-0 grid grid-cols-2 overflow-hidden h-[20rem]', {})}>
      <div className={cn(itemClassname, 'border-b', 'bg-black/10 dark:bg-white/10 col-span-2 flex-row px-4 md:px-5 py-4 items-center h-20')}>
        <CoinIcon symbol={symbol} size={44} />
        <div>
          <div className=' text-lg font-semibold whitespace-nowrap'>{symbol}</div>
          <div className=' text-sm font-medium'>{symbol.includes('-') ? 'LP Token' : ''}</div>
        </div>
        <div className='ml-auto'>
          <div className='text-[#64748B] dark:text-slate-50/60 text-xs font-semibold whitespace-nowrap'>{'Total Value Locked'}</div>
          <div className='text-sm font-medium'>{'$-'}</div>
        </div>
      </div>
      <div className={cn(itemClassname, 'col-span-2')}>
        <div className='text-xs font-semibold leading-[12px] whitespace-nowrap'>New Vault Coming Soon...</div>
      </div>
    </div>
  )
}

export function Info({ vc }: { vc: BVaultConfig }) {
  const chainId = useCurrentChainId()
  const vd = useBVault(vc.vault)
  const epoch = vd.current;
  const [tvl] = useBvaultTVL(vc)
  const calcProgress = (ep: typeof epoch) => {
    const now = BigInt(Math.floor(new Date().getTime() / 1000))
    if (now < ep.startTime) return 0
    if (now - epoch.startTime >= epoch.duration) return 100
    const progress = ((now - epoch.startTime) * 100n) / ep.duration
    return parseInt(progress.toString())
  }
  return <div style={{
    backdropFilter: 'blur(20px)'
  }} className="card bg-white flex flex-col h-full gap-10" >
    <div className="flex flex-wrap gap-5 items-center">
      {/* <NodeLicenseImage icon={nlImages[data.name] ? <img {...nlImages[data.name]} className="invert" /> : null} /> */}
      <CoinIcon symbol={vc.icon ?? vc.assetSymbol} size={35} />
      <div className="flex flex-col whitespace-nowrap font-semibold">
        <div className="text-lg">{vc.tit ?? vc.assetSymbol}</div>
        <div className="text-xs">{vc.sub ?? vc.assetSymbol}</div>
      </div>
      <div className="flex flex-col whitespace-nowrap font-semibold gap-1 ml-auto">
        <div className="text-sm">Underlying Asset</div>
        <CoinAmount token={getTokenBy(vc.asset, chainId, { symbol: vc.assetSymbol || 'vIP', decimals: 18 })!} />
      </div>
      <div className="flex flex-col whitespace-nowrap font-semibold gap-1">
        <div className="text-sm">Total Vaule Locked</div>
        <div className="text-xs opacity-60">${displayBalance(tvl, 2)}</div>
      </div>
    </div >
    <div className="opacity-60 text-sm font-medium leading-normal whitespace-pre-wrap">{vc.des ?? ''}</div>
    {epoch && (
      <div className='dark:text-white/60 text-xs whitespace-nowrap gap-1 flex w-full flex-col'>
        <div className='flex justify-between items-center'>
          <span>Duration</span>
          <span className='scale-90'>~{fmtDuration((epoch.startTime + epoch.duration) * 1000n - BigInt(new Date().getTime()))} remaining</span>
        </div>
        <ProgressBar value={calcProgress(epoch)} className='mt-2 rounded-full overflow-hidden' />
        <div className='flex justify-between items-center'>
          <span className='scale-90'>{fmtDate(epoch.startTime * 1000n, FMT.ALL2)}</span>
          <span className='scale-90'>{fmtDate((epoch.startTime + epoch.duration) * 1000n, FMT.ALL2)}</span>
        </div>
      </div>
    )}
  </div>
}


function PT({ vc }: { vc: BVaultConfig }) {
  const [inputAsset, setInputAsset] = useState('')

  const lp = LP_TOKENS[vc.asset]
  const isLP = !!lp
  const pTokenSymbolShort = isLP ? 'PT' : vc.pTokenSymbol
  const assetSymbolShort = isLP ? 'LP' : vc.assetSymbol
  const vd = useBVault(vc.vault)
  // const [fmtApy] = useBVaultApy(bvc.vault)
  const { data: walletClient } = useWalletClient()
  const chainId = useCurrentChainId()
  const pt = getTokenBy(vc.pToken, chainId)!
  const { address } = useAccount()
  const upForUserAction = useUpBVaultForUserAction(vc)
  const onAddPToken = () => {
    walletClient
      ?.watchAsset({
        type: 'ERC20',
        options: {
          address: vc.pToken,
          symbol: vc.pTokenSymbol,
          decimals: 18,
        },
      })
      .catch(handleError)
  }
  const tokens = useTokens(vc)
  const [currentToken, setCurrentToken] = useState(tokens[0])
  const inputBalance = useBalance(currentToken)
  const inputAssetBn = parseEthers(inputAsset, currentToken.decimals)
  const minumError = inputAssetBn > 0n && vc.assetSymbol === 'vIP' && inputAssetBn < MinumAmount
  const { data: outPt, isFetching: isFetchingSwap } = useQuery({
    queryKey: ['calcPTout', chainId, inputAssetBn, currentToken],
    initialData: 0n,
    queryFn: async () => {
      if (isAddressEqual(vc.asset, currentToken.address)) {
        return inputAssetBn
      }
      return getPC(chainId).readContract({ abi: erc4626Abi, address: vc.asset, functionName: 'previewDeposit', args: [inputAssetBn] })
    }
  })
  return <div className={cn('flex flex-col gap-5 w-full')}>
    <div className='card !p-0 overflow-hidden w-full'>
      <div className='flex p-5 bg-[#10B98126] gap-5'>
        <CoinIcon size={54} symbol={vc.pTokenSymbol} />
        <div className='flex flex-col gap-2'>
          <div className='text-xl text-black dark:text-white font-semibold'>{vc.pTokenSymbol}</div>
          <div className='text-xs text-black/60 dark:text-white/60 font-medium'>1 {vc.pTokenSymbol} is equal to 1 {vc.assetSymbol} deposited in {vc.compney} at maturity</div>
        </div>
      </div>
      <div className='flex items-baseline justify-between px-5 pt-5 gap-5'>
        <TupleTxt tit='APY Est.' sub={<BVaultApy bvc={vc} showTip={vc.assetSymbol === 'vIP'} />} />
        <TupleTxt tit='Total Supply' sub={<>{displayBalance(vd.pTokenTotal)}</>} />
      </div>
      <div className='flex px-2 pb-5'>
        <button className='btn-link ml-auto text-black/60 dark:text-white/60 text-xs' onClick={onAddPToken}>
          Add to wallet
        </button>
      </div>
    </div>
    <div className='flex flex-col gap-1'>
      <TokenInput tokens={tokens} onTokenChange={setCurrentToken} amount={inputAsset} setAmount={setInputAsset} error={minumError ? `Minimum amount is ${displayBalance(MinumAmount)}` : ''} />
      <GetvIP address={vc.asset} />
      <div className='text-base font-bold my-2'>Receive</div>
      <TokenInput tokens={[pt]} balance={false} loading={isFetchingSwap && !!inputAsset} readonly disable checkBalance={false} amount={fmtBn(outPt, pt.decimals)} />
      {/* <div className='text-xs font-medium text-center'>{`Receive 1 ${pTokenSymbolShort} for every ${assetSymbolShort}`}</div> */}
      <Txs
        className='mx-auto mt-4'
        tx='Buy'
        disabled={inputAssetBn <= 0n || inputAssetBn > inputBalance.result || minumError}
        txs={async () => {
          const { txs, sharesBn } = await wrapIfErc4626({ chainId, vc, token: currentToken.address, inputBn: inputAssetBn, user: address! })
          return [
            ...txs,
            { abi: erc20Abi, address: currentToken.address, functionName: 'approve', args: [vc.vault, sharesBn] },
            { abi: abiBVault, address: vc.vault, functionName: 'deposit', args: [sharesBn] }
          ]
        }}
        onTxSuccess={() => {
          setInputAsset('')
          upForUserAction()
        }}
      />
    </div>
  </div>

}

function YT({ vc }: { vc: BVaultConfig }) {
  const tokens = useTokens(vc)
  const [currentToken, setCurrentToken] = useState(tokens[0])
  const isLP = vc.assetSymbol.includes('-')
  const pTokenSymbolShort = isLP ? 'PT' : vc.pTokenSymbol
  const yTokenSymbolShort = isLP ? 'YT' : vc.yTokenSymbol
  const assetSymbolShort = isLP ? 'LP token' : vc.assetSymbol
  const [inputAsset, setInputAsset] = useState('')
  const inputAssetBn = parseEthers(inputAsset, currentToken.decimals)
  const vd = useBVault(vc.vault)

  const chainId = useCurrentChainId()
  const { address } = useAccount()
  const [calcSwapKey, setCalcSwapKey] = useState(['calcSwap', vc.vault, inputAssetBn, chainId])
  useDebounce(() => setCalcSwapKey(['calcSwap', vc.vault, inputAssetBn, chainId]), 300, ['calcSwap', vc.vault, inputAssetBn, chainId])
  const { data: result, isFetching: isFetchingSwap } = useQuery({
    queryKey: calcSwapKey,
    queryFn: () => getPC().readContract({ abi: abiBVault, address: vc.vault, functionName: 'calcSwap', args: [inputAssetBn] }),
  })
  const oneYTYieldOfAsset = vd.current.yTokenAmountForSwapYT > 0n ? (vd.lockedAssetTotal * DECIMAL) / vd.current.yTokenAmountForSwapYT : 0n
  const [priceSwap, togglePriceSwap] = useToggle(false)
  const vualtYTokenBalance = vd.current.vaultYTokenBalance
  const outputYTokenForInput = getBigint(result, '1')
  const ytAssetPriceBn = vualtYTokenBalance > 0n ? (vd.Y * DECIMAL) / vualtYTokenBalance : 0n
  const ytAssetPriceBnReverse = ytAssetPriceBn > 0n ? (DECIMAL * DECIMAL) / ytAssetPriceBn : 0n
  const priceStr = priceSwap
    ? `1 ${assetSymbolShort}=${displayBalance(ytAssetPriceBnReverse)} ${yTokenSymbolShort}`
    : `1 ${yTokenSymbolShort}=${displayBalance(ytAssetPriceBn)} ${assetSymbolShort}`

  const afterYtAssetPrice = vualtYTokenBalance > outputYTokenForInput ? ((vd.Y + inputAssetBn) * DECIMAL) / (vualtYTokenBalance - outputYTokenForInput) : 0n
  const outputYTokenFmt = fmtBn(outputYTokenForInput, undefined, true)
  const priceImpact = afterYtAssetPrice > ytAssetPriceBn && ytAssetPriceBn > 0n ? ((afterYtAssetPrice - ytAssetPriceBn) * BigInt(1e10)) / ytAssetPriceBn : 0n
  // console.info('result:', inputAssetBn, result, fmtBn(afterYtAssetPrice), fmtBn(ytAssetPriceBn))
  const upForUserAction = useUpBVaultForUserAction(vc)
  const { roi, roiChange } = useBvaultROI(vc, outputYTokenForInput, afterYtAssetPrice)
  const inputBalance = useBalance(currentToken)
  const minumError = inputAssetBn > 0n && vc.assetSymbol === 'vIP' && inputAssetBn < MinumAmount

  return (
    <div className='flex flex-col gap-5'>
      <div className='card !p-0 overflow-hidden w-full'>
        <div className='flex p-5 bg-[#10B98126] gap-5'>
          <CoinIcon size={54} symbol={vc.yTokenSymbol} />
          <div className='flex flex-col gap-2'>
            <div className='text-xl text-black dark:text-white font-semibold'>{vc.yTokenSymbol}</div>
            <div className='text-xs text-black/60 dark:text-white/60 font-medium'>YT holder sharing {vc.rewardSymbol || 'vIP'} generated by underlying asset</div>
          </div>
        </div>
        <div className='flex flex-col items-end justify-between px-5 pt-5 gap-1 pb-5'>
          <TupleTxt tit='Circulation amount' sub={<>{displayBalance(vd.current.yTokenAmountForSwapYT)}</>} />
          <span className='text-xs '>
            1{yTokenSymbolShort} = Yield of {displayBalance(oneYTYieldOfAsset, 2)} {assetSymbolShort}
          </span>
        </div>
      </div>
      <div className='card !p-4 flex flex-col h-[24.25rem] gap-1'>
        <TokenInput tokens={tokens} onTokenChange={setCurrentToken} amount={inputAsset} setAmount={setInputAsset} error={minumError ? `Minimum amount is ${displayBalance(MinumAmount)}` : ''} />
        <GetvIP address={vc.asset} />
        <div className='text-base font-bold my-2'>Receive</div>
        <AssetInput asset={vc.yTokenSymbol} decimals={currentToken.decimals} loading={isFetchingSwap && !!inputAsset} readonly disable checkBalance={false} amount={outputYTokenFmt} />
        <div className='text-xs font-medium  flex justify-between select-none'>
          <div className='flex items-center gap-2'>
            <RiLoopLeftFill className='text-sm text-primary cursor-pointer inline-block' onClick={() => togglePriceSwap()} />
            <span>{`Price: ${priceStr}`}</span>
          </div>
          <div className='flex gap-2 items-center'>{`Price Impact: ${fmtPercent(priceImpact, 10, 2)}`}</div>
        </div>
        {outputYTokenForInput > 0n && <div className='text-xs font-medium text-center my-auto text-black/80 dark:text-white/80'>
          Implied ROI Change: {fmtPercent(roi, 18, 2)} {'->'} <span className={cn({ 'text-red-400': (roi - roiChange) >= BigInt(1e17) })}>{fmtPercent(roiChange, 18, 2)}</span>
        </div>}
        <Txs
          className='mx-auto mt-auto'
          tx='Buy'
          disabled={inputAssetBn <= 0n || inputAssetBn > inputBalance.result || minumError}
          txs={async () => {
            const { txs, sharesBn } = await wrapIfErc4626({ chainId, vc, token: currentToken.address, inputBn: inputAssetBn, user: address! })
            return [
              ...txs,
              { abi: erc20Abi, address: vc.asset, functionName: 'approve', args: [vc.vault, sharesBn] },
              { abi: abiBVault, address: vc.vault, functionName: 'swap', args: [sharesBn] }
            ]
          }}
          onTxSuccess={() => {
            setInputAsset('')
            upForUserAction()
          }}
        />
      </div>
    </div>
  )
}
export function PTYT({ vc }: { vc: BVaultConfig, currentTab?: string }) {
  return <div className='card bg-white h-full'>
    <SimpleTabs
      listClassName="p-0 gap-8 mb-4 w-full"
      triggerClassName={(i) => `text-2xl font-semibold leading-none data-[state="active"]:underline underline-offset-2`}
      data={[
        { tab: 'PT', content: <PT vc={vc} /> },
        { tab: 'YT', content: <YT vc={vc} /> },
      ]}
    />
  </div>
}


const MCoinAmount = ({ ...p }: Parameters<typeof CoinAmount>[0]) => {
  return <CoinAmount className="font-bold text-sm" symbolClassName="opacity-100" {...p} />
}
function TokenSymbol({ t, size = 32, className }: { t?: Token, size?: number, className?: string }) {
  if (!t) return null
  return <div className={cn("flex gap-2 items-center font-semibold", className)}>
    <CoinIcon symbol={t.symbol} size={size} />
    {t.symbol}
  </div>
}

const claimColSize = 1.3;
const statuColSize = 1.6
function PositonPT({ vc }: { vc: BVaultConfig }) {
  const chainId = useCurrentChainId()
  const bvd = useBVault(vc.vault)
  const pt = getTokenBy(vc.pToken, chainId)!
  const asset = getTokenBy(vc.asset, chainId)!
  const pTokenBalance = useStore((s) => s.sliceTokenStore.balances[vc.pToken] || 0n, [`sliceTokenStore.balances.${vc.pToken}`])
  const upForUserAction = useUpBVaultForUserAction(vc)
  const { data: wc } = useWalletClient()
  const { ids, claimable } = useCalcClaimable(vc.vault)
  const txs = () => {
    const mtxs: TX[] = []
    if (pTokenBalance > 10n) {
      mtxs.push({ abi: abiBVault, address: vc.vault, functionName: 'redeem', args: [pTokenBalance] })
    }
    if (claimable > 10n) {
      mtxs.push({ abi: abiBVault, address: vc.vault, functionName: 'batchClaimRedeemAssets', args: [ids] })
    }
    return mtxs
  }
  const disableRedeemAll = !Boolean(wc) || bvd.closed !== true || (pTokenBalance + claimable) <= 100n
  const header = ['PT', 'Value', 'Status', 'Redeemable', '']
  return <div className="card !p-4 bg-white overflow-x-auto">
    <STable
      className='min-w-[750px] w-full'
      headerClassName='text-left font-semibold border-b-0'
      headerItemClassName='py-1 px-0 text-base'
      rowClassName='text-left text-black text-sm leading-none font-medium'
      cellClassName='py-2 px-0'
      header={header}
      span={{ 2: statuColSize, 3: 2, [header.length - 1]: claimColSize }}
      data={[
        [
          <TokenSymbol key="token" t={pt} />,
          displayBalance(pTokenBalance, undefined, pt.decimals),
          bvd.closed ? 'Mature' : 'Active',
          !disableRedeemAll ? <MCoinAmount token={asset} amount={pTokenBalance + claimable} /> : '',
          !disableRedeemAll ? <Txs tx='Redeem' className='w-32' txs={txs} onTxSuccess={upForUserAction} /> : ''
        ]
      ]}
    />
  </div>
}
function PositonYT({ vc }: { vc: BVaultConfig }) {
  const chainId = useCurrentChainId()
  const epochesData = useEpochesData(vc.vault)
  const vd = useBVault(vc.vault)
  const upForUserAction = useUpBVaultForUserAction(vc)
  const data = useMemo(() => {
    // const myFilter = (item: (typeof epochesData)[number]) => item.userClaimableYTokenSyntyetic > 0n || item.sBribes.reduce((sum, b) => sum + b.bribeAmount, 0n) > 0n || item.aBribes.reduce((sum, b) => sum + b.bribeAmount, 0n) > 0n
    const yBalance = epochesData.length > 0 ? epochesData[0].userBalanceYToken : 0n
    const ytPoints = epochesData.length > 0 ? epochesData[0].userClaimableYTokenSyntyetic : 0n
    const txs = (epochs: typeof epochesData, includeYtPoints?: boolean): TX[] => {
      return epochs.map((item) =>
        ([
          item.userClaimableYTokenSyntyetic > 0n && includeYtPoints ? { abi: abiAdhocBribesPool, functionName: 'collectYT', address: item.adhocBribesPool } : null,
          item.aBribes.reduce((sum, b) => sum + b.bribeAmount, 0n) > 0n ? { abi: abiAdhocBribesPool, functionName: 'getBribes', address: item.adhocBribesPool } : null,
          item.sBribes.reduce((sum, b) => sum + b.bribeAmount, 0n) > 0n ? { abi: abiStakingBribesPool, functionName: 'getBribes', address: item.stakingBribesPool } : null,
        ] as TX[]).filter(Boolean)
      ).flat()
    }
    const bribes = (epochs: typeof epochesData, type: 'sBribes' | 'aBribes') => {
      const items: { token: Token, amount: bigint }[] = []
      epochs.forEach((item) => {
        item[type].forEach(item => {
          if (item.bribeAmount > 0n) {
            const other = items.find(y => isAddressEqual(y.token.address, item.bribeToken))
            if (other) {
              other.amount += item.bribeAmount
            } else {
              items.push({ token: getTokenBy(item.bribeToken, chainId, { address: item.bribeToken, symbol: item.bribeSymbol, decimals: 18 })!, amount: item.bribeAmount })
            }
          }
        })
      })
      return items
    }

    const ones = epochesData.length > 0 ? vd.closed === true ? epochesData : [epochesData[0]] : []
    const txsOne = txs(ones, true)
    const yieldsOne = bribes(ones, 'sBribes')
    const airdropsOne = bribes(ones, 'aBribes')

    const matures = epochesData.length > 1 && vd.closed !== true ? epochesData.slice(1) : []
    const txsMatures = txs(matures)
    const showMatures = txsMatures.length > 0;
    const maturesYields = bribes(epochesData.slice(1), 'sBribes')
    const maturesAirdrops = bribes(epochesData.slice(1), 'aBribes')

    return [
      [
        <TokenSymbol key={'token'} t={{ address: zeroAddress, symbol: vc.yTokenSymbol, decimals: 18, chain: [chainId] }} />,
        displayBalance(yBalance),
        vd.closed ? 'Mature' : 'Active',
        <div key={'yields'}>
          {ytPoints > 0n && <div className='flex gap-3 items-center'>{'YT Points'} <span>{displayBalance(ytPoints, undefined, 23)}</span></div>}
          {yieldsOne.map((item, i) => <MCoinAmount key={`yields_${i}`} token={item.token} amount={item.amount} />)}
        </div>,
        <div key={'airdrops'}>
          {airdropsOne.map((item, i) => <MCoinAmount key={`airdrops_${i}`} token={item.token} amount={item.amount} />)}
        </div>,
        <Txs key="redeem" tx='Redeem' className='w-32' txs={txsOne} onTxSuccess={upForUserAction} />
      ],
      ...(showMatures ? [[
        '', '', 'Rewards for mature YT',
        <div key={'yields'}>
          {maturesYields.map((item, i) => <MCoinAmount key={`yields_${i}`} token={item.token} amount={item.amount} />)}
        </div>,
        <div key={'airdrops'}>
          {maturesAirdrops.map((item, i) => <MCoinAmount key={`airdrops_${i}`} token={item.token} amount={item.amount} />)}
        </div>,
        <Txs key="redeem" tx='Redeem' className='w-32' txs={txsMatures} onTxSuccess={upForUserAction} />
      ]] : [])
    ]
  }, [epochesData, vd])

  const header = ['YT', 'Value', 'Status', 'Yield', 'Airdrops', '']
  return <div className="card !p-4 bg-white overflow-x-auto">
    <STable
      className='min-w-[750px] w-full'
      headerClassName='text-left font-semibold border-b-0'
      headerItemClassName='py-1 px-0 text-base'
      rowClassName='text-left text-black text-sm leading-none font-medium'
      cellClassName='py-2 px-0'
      header={header}
      span={{ 2: statuColSize, [header.length - 1]: claimColSize }}
      data={data}
    />
  </div>
}
export function MyPositions({ vc }: { vc: BVaultConfig }) {
  return <div className='mt-4 lg:mt-6 flex flex-col gap-4'>
    <div className='text-left w-full font-semibold text-2xl'>My Positions</div>
    <PositonPT vc={vc} />
    <PositonYT vc={vc} />
  </div>
}