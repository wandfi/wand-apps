import { retry } from "es-toolkit"

const cacheMap = new Map<string, { promise: Promise<any>, status: 'pending' | 'fullfild' | 'rejected', createTime: number }>()

export function cacheGet<T>(key: string, getFn: () => Promise<T>, cacheTime: number = 3000) {
    let cache = cacheMap.get(key)
    if (!cache || cache.status == 'rejected' || (Date.now() - cache.createTime) > cacheTime) {
        cache = {
            createTime: Date.now(),
            status: 'pending',
            promise: retry(() => getFn(), { retries: 3, delay: 1000 })
                .then((data) => {
                    cache!.status = 'fullfild';
                    return data
                }).catch(e => {
                    cache!.status = 'rejected';
                    throw e
                }),
        }
        cacheMap.set(key, cache)
    }
    return cache.promise as Promise<T>
}