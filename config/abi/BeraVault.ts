export default [
  {
    type: 'function',
    name: 'getPoolTokens',
    inputs: [
      {
        name: 'poolId',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [
      {
        name: 'tokens',
        type: 'address[]',
        internalType: 'contract IERC20[]',
      },
      {
        name: 'balances',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
      {
        name: 'lastChangeBlock',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
] as const
