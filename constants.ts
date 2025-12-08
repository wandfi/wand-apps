import { TypeENV } from './config/env'
import { DomainRef } from './hooks/useConfigDomain'

const TWITTER_LINK = 'https://twitter.com/WandProtocol'
const DISCORD_LINK = 'https://discord.gg/fy6A7JCE5N'

const DECIMAL = BigInt(1e18)
const DECIMAL_PRICE = BigInt(1e8)
const DECIMAL_10 = BigInt(1e10)
const YEAR_SECONDS = BigInt('31536000')

const Day1 = 24 * 60 * 60 * 1000

const DOC_LINK = () => `https://docs.wandfi.io/`

const ENV: TypeENV = (process.env.NEXT_PUBLIC_ENV as any) || 'prod'

const isTEST = ENV == 'test'
const isBETA = ENV.includes('beta')
const isLNT = ENV.includes('lnt')
const isPROD = !ENV || ENV == 'prod'
const isLOCL = process.env.NODE_ENV == 'development'
console.info(process.env.NODE_ENV)
export { TWITTER_LINK, DISCORD_LINK, DOC_LINK, DECIMAL, DECIMAL_PRICE,DECIMAL_10, Day1, ENV, isTEST, isBETA, isPROD, isLNT, isLOCL, YEAR_SECONDS }
