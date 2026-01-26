import { abiBQuery, abiBVault } from "@/config/abi"
import { abiBQuery2, codeBQuery2 } from "@/config/abi/BQuery2"
import type { BVaultConfig } from "@/config/bvaults"
import { getPC } from "@/providers/publicClient"
import { parseAbi, parseAbiItem, zeroAddress, type Address } from "viem"
import { cacheGet } from "./cache"
import { bnRange, promiseAll } from "./utils"

export async function fetBVault(vc: BVaultConfig) {
    const pc = getPC(vc.chain)
    const { vd, ptRebaseRate } = await promiseAll({
        vd: pc.readContract({ abi: abiBQuery2, code: codeBQuery2, functionName: 'queryBVault', args: [vc.vault] }),
        ptRebaseRate: vc.pTokenV2
            ? pc.readContract({ abi: [parseAbiItem('function rebaseRate() view returns (uint256)')], address: vc.pToken, functionName: 'rebaseRate' })
            : Promise.resolve(0n),
    })
    let ytPointsMaxTotalSupply = 0n
    if (vc.pTokenV2 && vd.current.adhocBribesPool !== zeroAddress) {
        ytPointsMaxTotalSupply = await pc.readContract({
            abi: [parseAbiItem('function maxTotalSupply() external view returns (uint256)')],
            address: vd.current.adhocBribesPool,
            functionName: 'maxTotalSupply',
        })
    }
    return { ...vd, ytPointsMaxTotalSupply, ptRebaseRate }
}


export async function fetBVaultEpoches(vc: BVaultConfig) {
    const vd = await cacheGet(`fetBVault:${vc.chain}:${vc.vault}`, () => fetBVault(vc), 60000 * 60)
    if (vd.epochCount == 0n) return []
    const ids = bnRange(vd.epochCount)
    const pc = getPC(vc.chain)
    return Promise.all(ids.map((epochId) => pc.readContract({ abi: abiBQuery, address: vc.bQueryAddres, functionName: 'queryBVaultEpoch', args: [vc.vault, epochId] })))
}

export async function fetUserBVault(vc: BVaultConfig, byUser: Address) {
    const epoches = await cacheGet(`fetBVaultEpoches:${vc.chain}:${vc.vault}`, () => fetBVaultEpoches(vc), 60000 * 60)
    if (epoches.length == 0) return []
    const pc = getPC(vc.chain)
    return await Promise.all(
        epoches.map((e) => pc.readContract({ abi: abiBQuery, address: vc.bQueryAddres, functionName: 'queryBVaultEpochUser', args: [vc.vault, e.epochId, byUser] })),
    )
}



export async function fetBVaultIPAssets(vc: BVaultConfig) {
    const ipAssets = await getPC(vc.chain).readContract({ abi: abiBVault, address: vc.vault, functionName: 'ipAssets' })
    console.info('ipAssets:', ipAssets)
    return ipAssets
}

const abiIPA = parseAbi([
    'struct UserStakeAmountDetail { address stakeTokenAddress; uint256 amount; uint8 lockup; uint256 lastStakeTimestamp;}',
    'function getUserStakeAmountForIP(address _ipAsset, address _user) external view returns (UserStakeAmountDetail[][] memory)',
    'function getTotalStakeWeightedInIPForIP(address _ipAsset) external view returns (uint256)',
    'function getTotalStakeAmountForIP(address _ipAsset, address[] calldata _stakeTokens) external view returns (uint256[] memory)',
    'struct RewardPoolState {address rewardToken;uint8 rewardTokenType;uint8 distributionType;uint256 rewardsPerEpoch;uint256 rewardPerToken;uint256 totalRewards;uint256 totalDistributedRewards;uint256 lastEpochBlock;}',
    'function getRewardPools(address _ipAsset) external view returns (RewardPoolState[][] memory)',
    'function calculateIPWithdrawal(uint256 _vIPToBurn) external view returns (uint256)',
])

export const ipAssetsTit: { [k: Address]: string } = {
    '0xB1D831271A68Db5c18c8F0B69327446f7C8D0A42': 'IPPY',
    '0x0a0466c312687027E2BEa065d4Cca0DCEC19bb2C': 'Globkins',
    '0xCdF104e4F24d593E16B9F6c382cEB1FB5573EEDd': 'Mimboku',
    '0x8c40Ef7408D6036Dca0b69E67D960dd48014cB16': 'Sofamon',
    '0x00e23f81e489E43484B0B8Bc109faD6C1F4c28E7': 'Benjamin',
    '0x42A351E005De1330DeDe69Ca4Ae1B06715a2f4fA': 'WTF',
    '0xf12b7b0858268F9c726f9eea315eDfec161DA552': 'Drip Drip',
    '0xE8b4b3828EA3678F9BA975CBccB5D9f0c3c0cA8b': 'Nub Cat',
    '0x4D31d2417b64597Bf346f278728f3A1C7065907e': 'DaVinci',
    '0xCE11dD7008494B6b4F9DF01213F77B87A4dab579': 'Terra',
    '0x9B438f52a0A94d3D7D1325C80711FF4709571054': 'Oaisis',
    '0x5021F7438ea502b0c346cB59F8E92B749Ecd74B5': 'Variants🧬',
    '0x816453EbC9b9E55b4faF326614BfFf915e5dCc3d': 'DoubleUp',
}

export async function fetBVaultUnderlyingAPY(vc: BVaultConfig) {
    if (vc.assetSymbol !== 'vIP') return { avrageApy: 0n, items: [] }
    const ipAssets = await cacheGet(`fetBVaultIPAssets:${vc.chain}:${vc.vault}`, () => fetBVaultIPAssets(vc), 6000 * 60)
    if (ipAssets.length === 0) return { avrageApy: 0n, items: [] }
    const pc = getPC(vc.chain, 1)
    const stakeed = await Promise.all(
        ipAssets.map((ipAsset) =>
            pc.readContract({
                abi: abiIPA,
                functionName: 'getUserStakeAmountForIP',
                address: vc.ipAssetStaking,
                args: [ipAsset, vc.vault],
            }),
        ),
    )
    const staked = stakeed.map((item) => item.find((s) => s.length)?.find((s) => !!s))
    const apys = await Promise.all(
        ipAssets.map((ipID) =>
            pc
                .readContract({
                    abi: parseAbi(['function ipAssetApy(address ipAsset) public view returns (uint256)']),
                    address: '0xc0685Bb397ECa74763b8B90738ABf868a3502c21',
                    functionName: 'ipAssetApy',
                    args: [ipID],
                })
                .then((apy) => apy / 100n),
        ),
    )
    
    const stakedAll = staked.reduce((sum, s) => sum + (s?.amount || 0n), 0n)
    const avrageApy = stakedAll > 0n ? apys.map((apy, i) => apy * (staked?.[i]?.amount || 0n)).reduce((sum, apy) => sum + apy, 0n) / stakedAll : 0n
    const items = apys
        .map((apy, i) => ({ apy, staked: staked?.[i]?.amount || 0n, ipID: ipAssets[i], tit: ipAssetsTit[ipAssets[i]] }))
        .sort((a, b) => {
            const sub = b.apy - a.apy
            return sub > 0n ? 1 : sub < 0n ? -1 : 0
        })
    // console.info('staked:', vc.vault, staked, avrageApy)
    return { avrageApy, items }
}