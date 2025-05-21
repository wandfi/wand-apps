import { sleep } from '@/lib/utils'
import EventEmitter from 'events'
import { useEffect, useReducer, useRef } from 'react'
/******************************************************** types *********************************************************************** */
export type Conifg = {
  cacheTime?: number // default 1000
  retry?: number // default 3
  retryInterval?: number // default 500
}

export type FetFN<RES> = () => Promise<RES>

export type FetBase<RES> = Conifg & {
  key: string
  fetfn: FetFN<RES>
  onError?: (err: Error) => void
}

export type FetWithInit<RES> = FetBase<RES> & { initResult: RES }
export type Fet<RES> = FetBase<RES> | FetWithInit<RES>
type FetRes<FET = Fet<any>> = FET extends FetWithInit<infer RES1> ? RES1 : FET extends FetBase<infer RES2> ? RES2 | undefined : never

export type FetStatus = 'idle' | 'fetching' | 'success' | 'error'
export type FetStat<FET = Fet<any>> = {
  key: string
  status: FetStatus
  result: FetRes<FET>
  lastUpDate: number
  error?: Error
}

export type MergeFetStat<RES extends {}> = Omit<FetStat<Fet<RES>>, 'key'> & { key: string[] }
export type AllFetStat<RES extends {}> = FetStat<Fet<RES>> | MergeFetStat<RES>

/******************************************************** impl *********************************************************************** */

// Manager all fets
const fets: {
  [k: string]: {
    fet: Fet<any>
    fs: FetStat<Fet<any>>
    runId: number
  }
} = {}
let mocks: { [key: string]: (() => any) | any } = {}

function initFS<FET extends Fet<any>>(fet: FET): FetStat<FET> {
  return {
    key: fet.key,
    status: 'idle',
    result: (fet as FetWithInit<any>).initResult,
    lastUpDate: 0,
  }
}

function isOldFetStat(fet: Fet<any>) {
  const fs = fets[fet.key]?.fs
  const cacheTime = fet.cacheTime ?? 1000
  if (fet.key && fs && fs.status !== 'fetching' && now() - fs.lastUpDate > cacheTime) {
    return true
  }
  return false
}

const emiter = new EventEmitter()
function sub<T>(fet: Fet<T>, onChange: (fs: FetStat<Fet<T>>) => void) {
  if (fet.key) {
    emiter.on(fet.key, onChange)
    return () => {
      emiter.off(fet.key, onChange)
    }
  } else {
    return () => {}
  }
}

async function runFetImpl<T>(fet: Fet<T>) {
  const runId = fets[fet.key].runId
  const isMock = Object.hasOwn(mocks, fet.key)
  let retryCount = fet.retry ?? 3
  while (retryCount > 0) {
    retryCount--
    try {
      if (runId !== fets[fet.key].runId) break
      const res = await (isMock ? (typeof mocks[fet.key] == 'function' ? mocks[fet.key]() : mocks[fet.key]) : fet.fetfn())
      if (runId !== fets[fet.key].runId) break
      fets[fet.key].fs.result = res as any
      fets[fet.key].fs.lastUpDate = now()
      fets[fet.key].fs.status = 'success'
      emiter.emit(fet.key, fets[fet.key].fs)
      return res
    } catch (err: any) {
      if (retryCount == 0) {
        if (runId !== fets[fet.key].runId) break
        fets[fet.key].fs.status = 'error'
        fets[fet.key].fs.error = err
        emiter.emit(fet.key, fets[fet.key].fs)
      }
      console.error(`RunFetError: fetKey:${fet.key} retryCount:${retryCount}`, err)
      await sleep(fet.retryInterval ?? 500)
      if (retryCount == 0) {
        throw err
      }
    }
  }
}

function nextRunId(key: string) {
  if (key) {
    if (fets[key].runId > 999999) {
      fets[key].runId = 0
    } else {
      fets[key].runId++
    }
  }
}
export function runFet<T>(fet: Fet<T>, emit: boolean = false): FetStat<Fet<T>> {
  if (fets[fet.key]) {
    nextRunId(fet.key)
    runFetImpl(fet)
  } else {
    fets[fet.key] = {
      fet,
      runId: 0,
      fs: initFS(fet),
    }
    runFetImpl(fet)
  }
  fets[fet.key].fs.status = 'fetching'
  fets[fet.key].fs.error = undefined
  emit && emiter.emit(fet.key, fets[fet.key].fs)
  return fets[fet.key].fs
}

function now() {
  return new Date().getTime()
}

const updateReducer = (num: number) => (num + 1) % 1_000_000
export function useUpdate() {
  const [, update] = useReducer(updateReducer, 0)
  return update
}

export function useFet<T, FET extends Fet<T>>(fet: FET): FetStat<FET> {
  const update = useUpdate()
  let fetStat = fets[fet.key]?.fs || initFS(fet)
  const needRunFet = Boolean(fet.key) && (!fetStat || fetStat.status == 'idle')
  if (needRunFet) {
    fetStat = runFet(fet)
  }
  useEffect(() => {
    const unSub = sub(fet, (fs) => {
      // console.info('onSub:', fet.key, fs)
      update()
    })
    // check need fresh
    if (isOldFetStat(fet)) {
      runFet(fet)
      update()
    }
    return unSub
  }, [fet.key])
  // console.info('fetStat:', fet.key, fetStat.status)
  return fetStat
}

export function isFetching(...status: AllFetStat<any>[]) {
  if (status.length == 0) return false
  if (status.find((item) => item.status === 'fetching')) return true
  return false
}
export function isLoading(...status: AllFetStat<any>[]) {
  if (status.length == 0) return false
  if (status.find((item) => item.status === 'fetching' && item.lastUpDate == 0)) return true
  return false
}
export function isSuccess(...status: AllFetStat<any>[]) {
  if (status.length == 0) return false
  if (status.find((item) => item.lastUpDate == 0)) return false
  return true
}

export function isError(...status: AllFetStat<any>[]) {
  if (status.length == 0) return false
  if (status.find((item) => item.status === 'error')) return true
  return false
}

export function reFet(...keyOrFets: (string | Fet<any>)[]) {
  for (const keyOrFet of keyOrFets) {
    const fet = typeof keyOrFet == 'string' ? fets[keyOrFet]?.fet : keyOrFet
    if (fet) runFet(fet, true)
  }
}

// export type MergeFS<T extends FetStat<Fet<{}>>[]> =

export function useMerge<RES extends {}>(...status: AllFetStat<{}>[]) {
  const mStatus = status.filter((item) => Boolean(item))
  const ref = useRef<MergeFetStat<RES>>({ key: [], status: 'idle', result: undefined, lastUpDate: 0 })
  ref.current.key = mStatus.flatMap((item) => item.key)
  let SuccessCount = 0
  for (const item of mStatus) {
    if (item.status === 'fetching') {
      ref.current.status = 'fetching'
    } else if (item.status == 'error' && ref.current.status !== 'fetching') {
      ref.current.status = 'error'
    } else if (item.status == 'success') {
      SuccessCount++
    }
    if (item.result !== undefined) {
      ref.current.result = Object.assign(ref.current.result || {}, item.result) as any
    }
  }
  if (SuccessCount > 0 && SuccessCount == mStatus.length) {
    ref.current.status = 'success'
  }
  ref.current.error = mStatus.find((item) => item.error)?.error
  ref.current.lastUpDate = Math.min(...mStatus.map((item) => item.lastUpDate))
  return ref.current
}
export function setMocks(_mocks: { [key: string]: (() => any) | any }) {
  Object.keys(_mocks).forEach((key) => {
    mocks[key] = _mocks[key]
  })
}

/******************************************************** examples *********************************************************************** */

function useGETDATA() {
  const s1 = useFet({ key: '123', fetfn: async () => ({ a: 10 }) })
  const s2 = useFet({ key: '123', fetfn: async () => ({ b: '123' }), initResult: { b: '123' } })

  const m1 = useMerge<{ a: number; b: string }>(s1, s2)
}
