import { erc20Abi } from 'viem'

export default [
  ...erc20Abi,
  {
    type: 'function',
    name: 'getActualSupply',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      {
        type: 'uint256',
      },
    ],
  }
] as const
