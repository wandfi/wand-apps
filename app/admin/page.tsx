'use client'

import { ApproveAndTx } from '@/components/approve-and-tx'
import { Expandable, GeneralAction, inputClassname, selectClassNames } from '@/components/general-action'
import { PageWrap } from '@/components/page-wrap'
import { abiBVault, abiMockERC20, abiProtocolSettings, abiZooProtocol } from '@/config/abi'
import { abiBVault2, abiHook, abiMockInfraredVault, abiProtocol } from '@/config/abi/BVault2'
import { getCurrentChain } from '@/config/network'
import { getTokenBy } from '@/config/tokens'
import { ipAssetsTit } from '@/hooks/useBVaultROI'
import { useCurrentChainId } from '@/hooks/useCurrentChainId'
import { useVaultsConfigs } from '@/hooks/useVaultsConfigs'
import { cn, parseEthers, promiseAll } from '@/lib/utils'
import { getPC } from '@/providers/publicClient'
import { useMemo } from 'react'
import Select from 'react-select'
import { useMeasure, useSetState } from 'react-use'
import { Address, erc20Abi, formatUnits, isAddress, parseUnits, stringToHex } from 'viem'
import { useReadContracts } from 'wagmi'

type ParamItem = { label: string; value: string; units?: number /** def 10 */ }

const BVaultParams: ParamItem[] = [
  { label: '产品周期', value: 'D', units: 0 },
  { label: '初始定价', value: 'APRi' },
  { label: '赎回手续费', value: 'f1' },
  { label: '利息佣金', value: 'f2' },
]

const BVault2Params: ParamItem[] = [
  { label: '产品周期', value: 'ED', units: 0 },
  { label: 'initialAnchor', value: 'initialAnchor', units: 18 },
  { label: 'scalarRoot', value: 'scalarRoot', units: 18 },
  { label: '赎回手续费', value: 'f1', units: 18 },
  { label: '交易手续费', value: 'f2', units: 18 },
]
function UpdateVaultParams({ paramList, vault, protocoSettingAddress }: { paramList: ParamItem[]; vault: Address; protocoSettingAddress: Address }) {
  const params = useMemo(() => paramList.map((p) => ({ ...p, label: `${p.label}(${p.value})` })), [paramList])
  const [{ value, param }, setState] = useSetState({
    value: '',
    param: params[0],
  })
  const { data, refetch } = useReadContracts({
    contracts: paramList.map((p) => ({
      abi: abiProtocolSettings,
      address: protocoSettingAddress,
      functionName: 'vaultParamValue',
      args: [vault, stringToHex(p.value, { size: 32 })],
    })),
  })
  const infos = useMemo(
    () =>
      (data || []).map((d, index) => {
        const p = paramList[index]
        return `${p.label}(${p.value}): ${formatUnits((d.result as unknown as bigint) || 0n, typeof p.units == 'number' ? p.units : 10)}`
      }),
    [data],
  )
  const currentUnits = typeof param.units == 'number' ? param.units : 10
  const [infoRef, infoMeasure] = useMeasure<HTMLDivElement>()

  return (
    <Expandable tit='Vault Param Vaule'>
      <Select classNames={selectClassNames} maxMenuHeight={infoMeasure.height + 110} value={param} options={params} onChange={(e) => setState({ param: e as any })} />
      <input
        value={value.toString()}
        onChange={(e) => {
          const numstr = (e.target.value || '').replaceAll('-', '').replaceAll('+', '')
          setState({ value: numstr })
        }}
        type='number'
        className={cn(inputClassname)}
        pattern='[0-9.]{36}'
        step={1}
        placeholder='0'
      />
      <ApproveAndTx
        tx='Write'
        config={{
          abi: abiProtocolSettings,
          address: protocoSettingAddress,
          functionName: 'updateVaultParamValue',
          args: [vault, stringToHex(param.value, { size: 32 }), parseUnits(value, currentUnits)],
        }}
        onTxSuccess={() => {
          setState({ value: '' })
          refetch()
        }}
        className=' w-full flex items-center justify-center gap-4'
      />
      <div className='text-sm flex flex-col items-start' ref={infoRef}>
        {infos.map((info, index) => (
          <div key={`info_${index}`}>{info}</div>
        ))}
      </div>
    </Expandable>
  )
}


function Erc20Approve() {
  const [stat, setStat] = useSetState({
    token: '',
    spender: '',
    amount: 0n
  })
  return <Expandable tit='Erc20Approve'>
    <input type='text' placeholder='token' value={stat.token} onChange={(e) => setStat({ token: e.target.value })} className={cn(inputClassname)} />
    <input type='text' placeholder='spender' value={stat.spender} onChange={(e) => setStat({ spender: e.target.value })} className={cn(inputClassname)} />
    <input type='text' placeholder='amount' value={stat.amount.toString()} onChange={(e) => {
      try {
        setStat({ amount: parseEthers(e.target.value, 0) })
      } catch (error) {
      }
    }} className={cn(inputClassname)} />
    <ApproveAndTx
      tx='Write'
      disabled={!isAddress(stat.token) || !isAddress(stat.spender) || stat.amount <= 0n}
      config={{
        abi: erc20Abi,
        address: stat.token as Address,
        functionName: 'approve',
        args: [stat.spender as Address, stat.amount],
      }}
      className='!mt-0 w-full flex items-center justify-center gap-4'
    />
  </Expandable>
}

function DeleteIpAssets(props: { vault: Address }) {
  const chainId = useCurrentChainId()
  const getInfos = async () => {
    const data = await getPC(chainId).readContract({ abi: abiBVault, address: props.vault, functionName: 'ipAssets' })
    const infos: any = {}
    data.forEach(ipID => { infos[ipID] = ipAssetsTit[ipID] })
    return infos
  }
  return <GeneralAction key={`b-vault-removeIpAsset`} abi={abiBVault} functionName={'removeIpAsset'} address={props.vault} infos={getInfos} />
}

export default function AdminPage() {
  const chainId = useCurrentChainId()
  const { current, setState, options } = useVaultsConfigs()
  const chain = getCurrentChain()
  return (
    <PageWrap>
      <div className='w-full flex'>
        <div className='flex flex-col gap-4 w-full max-w-[840px] mx-auto px-5'>
          <div className="text-lg whitespace-pre-wrap p-2 bg-primary/20 rounded-xl">
            {JSON.stringify({
              'Decimal18': '000000000000000000'
            }, undefined, 2)}
          </div>
          <Select classNames={selectClassNames} defaultValue={options[0]} options={options} onChange={(e) => e && setState({ current: e as any })} />


          {current?.type == 'B-Vault' && (
            <>
              <UpdateVaultParams vault={current.data.vault} paramList={BVaultParams} protocoSettingAddress={current.data.protocolSettingsAddress} />
              <DeleteIpAssets vault={current.data.vault} />
              {['addIpAsset', 'updateMaxIpAssets', 'updateC', 'close', 'pause', 'unpause', 'pauseRedeemPool', 'unpauseRedeemPool', 'addBribeToken', 'addBribes', 'setBriber'].map((functionName) => (
                <GeneralAction key={`b-vault-${functionName}`} abi={abiBVault} functionName={functionName} address={current.data.vault} />
              ))}
              <GeneralAction tit='transferOwnership' abi={abiZooProtocol} functionName='transferOwnership' address={current.data.protocolAddress} />
              <GeneralAction tit='transferOwnership' abi={abiZooProtocol} functionName='transferOwnership' address={current.data.protocolAddress} />
              <GeneralAction tit='upsertParamConfig' abi={abiProtocolSettings} functionName='upsertParamConfig' address={current.data.protocolSettingsAddress} />
            </>
          )}
          {current?.type == 'B-Vault2' && (<>
            <UpdateVaultParams vault={current.data.vault} paramList={BVault2Params} protocoSettingAddress={current.data.protocalSettings} />
            <GeneralAction abi={abiBVault2} functionName="setAutoStartNewEpoch" address={current.data.vault}
              infos={() => promiseAll({ AutoStartNewEpoch: getPC(current.data.chain).readContract({ abi: abiBVault2, address: current.data.vault, functionName: 'autoStartNewEpoch' }) })} />
            <GeneralAction abi={abiBVault2} functionName="updateThreshold" address={current.data.vault} />
            <GeneralAction abi={abiBVault2} functionName="updateBootstrapDuration" address={current.data.vault} />
            <GeneralAction abi={abiBVault2} functionName="pause" address={current.data.vault} />
            <GeneralAction abi={abiBVault2} functionName="unpause" address={current.data.vault} />
            <GeneralAction abi={abiProtocol} functionName='addPremiumHook' argsDef={[current.data.bt, current.data.hook]} address={current.data.protocal}
              infos={() => promiseAll({ hookBT: getPC(current.data.chain).readContract({ abi: abiHook, address: current.data.hook, functionName: 'getBTAddress' }) })} />
            <GeneralAction tit='updateYieldSwapHookHelper' abi={abiZooProtocol} functionName='updateYieldSwapHookHelper' address={current.data.protocal} />
            <GeneralAction tit='protocal (transferOwnership)' abi={abiZooProtocol} functionName='transferOwnership' address={current.data.protocal} />
            <GeneralAction tit='protocal (acceptOwnership)' abi={abiZooProtocol} functionName='acceptOwnership' address={current.data.protocal} />
            <GeneralAction tit='vault (transferOwnership)' abi={abiZooProtocol} functionName='transferOwnership' address={current.data.vault} />
            <GeneralAction tit='vault (acceptOwnership)' abi={abiZooProtocol} functionName='acceptOwnership' address={current.data.vault} />
            <GeneralAction tit='upsertParamConfig' abi={abiProtocolSettings} functionName='upsertParamConfig' address={current.data.protocalSettings} />
            {chain?.testnet && <>
              <GeneralAction tit={`mint (${getTokenBy(current.data.asset, chainId)!.symbol})`} abi={abiMockERC20} functionName='mint' address={current.data.asset} />
              <GeneralAction tit={`setTester (${getTokenBy(current.data.asset, chainId)!.symbol})`} abi={abiMockERC20} functionName='setTester' address={current.data.asset} />
            </>}

            {current.data.mockInfraredVault && <GeneralAction tit={`MockInfraredVault addReward ${current.data.mockInfraredVault}`} abi={abiMockInfraredVault} functionName='addReward' address={current.data.mockInfraredVault} />}
          </>)}
          <Erc20Approve />
        </div>
      </div>
    </PageWrap>
  )
}
