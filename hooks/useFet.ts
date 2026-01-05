import { isLOCL, isTEST } from '@/src/constants'
import { sleep } from '@/lib/utils'
import EventEmitter from 'events'
import { useEffect, useReducer, useRef } from 'react'
/******************************************************** types *********************************************************************** */
export type Config = {
  cacheTime?: number // default 1000
  retry?: number // default 3
  retryInterval?: number // default 500
}

export type FetFN<RES> = () => Promise<RES>

export type FetBase<RES> = Config & {
  key: string
  fetfn: FetFN<RES>
  onError?: (err: Error) => void
}

export type FetWithInit<RES> = FetBase<RES> & { initResult: RES }

export type Fet<RES> = FetBase<RES> | FetWithInit<RES>
type FetRes<FET extends Fet<any>> = FET extends FetWithInit<infer RES1> ? RES1 : FET extends FetBase<infer RES2> ? RES2 | undefined : never

export type FetStatus = 'idle' | 'fetching' | 'success' | 'error'
export type FetStat<FET extends Fet<any>> = {
  key: string
  status: FetStatus
  result: FetRes<FET>
  lastUpDate: number
  error?: Error
}
export type FetsStat<FETS extends [...Fet<any>[]]> = {
  key: string[]
  status: FetStatus
  result: FetRes<FETS[number]>[]
  lastUpDate: number
  error?: Error
}

export type AllFetStat<RES extends {}> = FetStat<Fet<RES>> | FetsStat<Fet<RES>[]>

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

function initFSS<FET extends Fet<any>>(..._fet: FET[]): FetsStat<FET[]> {
  return {
    key: _fet.map((f) => f.key),
    status: 'idle',
    result: _fet.map((f) => (f as FetWithInit<any>).initResult),
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
      console.error(`RunFetError: fetKey:${fet.key} retryCount:${retryCount}`, err)
      if (retryCount == 0) {
        if (runId !== fets[fet.key].runId) break
        fets[fet.key].fs.status = 'error'
        fets[fet.key].fs.error = err
        emiter.emit(fet.key, fets[fet.key].fs)
        break
      }
      await sleep(fet.retryInterval ?? 500)
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

export function useFet<FET extends Fet<any>>(fet: FET): FetStat<FET> {
  const update = useUpdate()
  let fetStat = fets[fet.key]?.fs || initFS(fet)
  const needRunFet = Boolean(fet.key) && (!fetStat || fetStat.status == 'idle')
  if (needRunFet) {
    fetStat = runFet(fet)
  }
  useEffect(() => {
    if (isLOCL || isTEST) {
      ;(window as any).fets = fets
    }
    const unSub = sub(fet, (fs) => {
      console.info('onSub:', fet.key, fs)
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

export function useFets<FET extends Fet<any>>(..._fets: FET[]) {
  const update = useUpdate()
  const refFetsStat = useRef<FetsStat<FET[]>>()
  if (!refFetsStat.current || _fets.map((item) => item.key).join(',') !== refFetsStat.current.key.join(',')) {
    refFetsStat.current = initFSS(..._fets)
  }
  const fetsStat = refFetsStat.current
  let index = 0
  for (const fet of _fets) {
    let fetStat = fets[fet.key]?.fs || initFS(fet)
    const needRunFet = Boolean(fet.key) && (!fetStat || fetStat.status == 'idle')
    if (needRunFet) {
      fetStat = runFet(fet)
    }
    fetsStat.result[index] = fetStat.result
    index++
  }
  const stats = _fets.map((item) => fets[item.key]?.fs).filter(Boolean)
  if (isSuccess(...stats)) {
    fetsStat.lastUpDate = now()
  }
  if (isFetching(...stats)) {
    fetsStat.status = 'fetching'
  } else if (isError(...stats)) {
    fetsStat.status = 'error'
    fetsStat.error = stats.find((item) => item.error)?.error
  }
  useEffect(() => {
    const onUpdate = () => {
      const fss = _fets.map((item) => fets[item.key]?.fs).filter(Boolean)
      if (isError(...fss) || isSuccess(...fss)) {
        if (refFetsStat.current?.result) {
          refFetsStat.current.result = [...refFetsStat.current.result]
        }
        update()
      }
    }
    const unsubs: (() => void)[] = []
    for (const fet of _fets) {
      unsubs.push(sub(fet, onUpdate))
      // check need fresh
      if (isOldFetStat(fet)) {
        runFet(fet)
        onUpdate()
      }
    }
    return () => unsubs.forEach((unsub) => unsub())
  }, [_fets.map((item) => item.key).join(',')])
  return fetsStat
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
  if (status.find((item) => item.lastUpDate === 0)) return false
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
export function setMocks(_mocks: { [key: string]: (() => any) | any }) {
  Object.keys(_mocks).forEach((key) => {
    mocks[key] = _mocks[key]
  })
}

/******************************************************** examples *********************************************************************** */

function useGETDATA() {
  const { result: r1 } = useFet({ key: '123', fetfn: async () => ({ a: 10 }) })
  const { result: r2 } = useFet({ key: '123', fetfn: async () => ({ b: '123' }), initResult: { b: '1233' } })
}
