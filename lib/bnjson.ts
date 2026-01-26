
export function toJson(obj: any, replacer?: (key: string, value: any) => any, space?: number | string) {
    return JSON.stringify(obj, (_key, value: any) => {
        return typeof value == 'bigint' ? `__bn__${value.toString()}` : replacer ? replacer(_key, value) : value
    }, space)
}

export function fromJson(json: string) {
    return JSON.parse(json, (_k, value: any) => {
        return typeof value == 'string' && value.startsWith("__bn__") ? BigInt(value.slice(6)) : value
    })
}


export function toJsonRES(obj: any) {
    return new Response(toJson(obj), { status: 200, headers: { 'Content-Type': 'application/json', } })
}