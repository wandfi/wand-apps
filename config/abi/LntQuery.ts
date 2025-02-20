export default [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
    ],
    name: 'queryVault',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'epochCount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'nftVtAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'nftVestingEndTime',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'nftVestingDuration',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'initialized',
            type: 'bool',
          },
          {
            internalType: 'uint256',
            name: 'yTokenTotalSupply',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'f2',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'Y',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'NftDepositLeadingTime',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'NftRedeemWaitingPeriod',
            type: 'uint256',
          },
          {
            components: [
              {
                internalType: 'uint256',
                name: 'epochId',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'startTime',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'duration',
                type: 'uint256',
              },
              {
                internalType: 'address',
                name: 'ytSwapPaymentToken',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'ytSwapPrice',
                type: 'uint256',
              },
              {
                internalType: 'address',
                name: 'ytRewardsPoolOpt1',
                type: 'address',
              },
              {
                internalType: 'address',
                name: 'ytRewardsPoolOpt2',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'yTokenTotalSupply',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'vaultYTokenBalance',
                type: 'uint256',
              },
            ],
            internalType: 'struct Query.VaultEpoch',
            name: 'current',
            type: 'tuple',
          },
        ],
        internalType: 'struct Query.Vault',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'epochId',
        type: 'uint256',
      },
    ],
    name: 'queryVaultEpoch',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'epochId',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'startTime',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'duration',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'ytSwapPaymentToken',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'ytSwapPrice',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'ytRewardsPoolOpt1',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'ytRewardsPoolOpt2',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'yTokenTotalSupply',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'vaultYTokenBalance',
            type: 'uint256',
          },
        ],
        internalType: 'struct Query.VaultEpoch',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'epochId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    name: 'queryVaultEpochUser',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'epochId',
            type: 'uint256',
          },
          {
            components: [
              {
                internalType: 'uint256',
                name: 'epochId',
                type: 'uint256',
              },
              {
                internalType: 'address',
                name: 'token',
                type: 'address',
              },
              {
                internalType: 'string',
                name: 'symbol',
                type: 'string',
              },
              {
                internalType: 'uint8',
                name: 'decimals',
                type: 'uint8',
              },
              {
                internalType: 'uint256',
                name: 'earned',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'total',
                type: 'uint256',
              },
            ],
            internalType: 'struct Query.RewardInfo[]',
            name: 'opt1',
            type: 'tuple[]',
          },
          {
            components: [
              {
                internalType: 'uint256',
                name: 'epochId',
                type: 'uint256',
              },
              {
                internalType: 'address',
                name: 'token',
                type: 'address',
              },
              {
                internalType: 'string',
                name: 'symbol',
                type: 'string',
              },
              {
                internalType: 'uint8',
                name: 'decimals',
                type: 'uint8',
              },
              {
                internalType: 'uint256',
                name: 'earned',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'total',
                type: 'uint256',
              },
            ],
            internalType: 'struct Query.RewardInfo[]',
            name: 'opt2',
            type: 'tuple[]',
          },
          {
            internalType: 'uint256',
            name: 'userBalanceYToken',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'userYTPoints',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'userClaimableYTPoints',
            type: 'uint256',
          },
        ],
        internalType: 'struct Query.VaultEpochUser',
        name: 'veu',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const
