export default [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_protocol',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_settings',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_nftStakingPoolFactory',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_ytRewardsPoolFactory',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_nftToken',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_nftVestingToken',
        type: 'address',
      },
      {
        internalType: 'string',
        name: '_vTokenName',
        type: 'string',
      },
      {
        internalType: 'string',
        name: '_vTokenSymbol',
        type: 'string',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'OutOfBounds',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'epochId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'startTime',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'duration',
        type: 'uint256',
      },
    ],
    name: 'EpochStarted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'epochDuration',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'nftVtAmount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'nftVestingEndTime',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'nftVestingDuration',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'ytSwapPaymentToken',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'ytSwapPrice',
        type: 'uint256',
      },
    ],
    name: 'Initialized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'epochId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'NftDeposit',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'epochId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'NftDepositClaimed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'epochId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'NftRedeem',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'epochId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'NftRedeemClaimed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'NftVestingTokenClaimed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'NftVestingTokenDeposite',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'NftVestingTokenWithdrawn',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'epochDuration',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'nftVtAmount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'nftVestingEndTime',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'nftVestingDuration',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'ytSwapPaymentToken',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'ytSwapPrice',
        type: 'uint256',
      },
    ],
    name: 'ReInitialized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'epochId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'ytSwapPaymentAmount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'fees',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'yTokenAmount',
        type: 'uint256',
      },
    ],
    name: 'Swap',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'nftTokenId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'prevClaimableTime',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newClaimableTime',
        type: 'uint256',
      },
    ],
    name: 'UpdateNftDepositClaimableTime',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'nftTokenId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'vTokenBurnAmount',
        type: 'uint256',
      },
    ],
    name: 'VTokenBurned',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'nftTokenId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'vTokenNetAmount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'vTokenFeesAmount',
        type: 'uint256',
      },
    ],
    name: 'VTokenMinted',
    type: 'event',
  },
  {
    inputs: [],
    name: 'Y',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'accruedNftStakingRewards',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'rewardsToken',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        internalType: 'enum Constants.YtRewardsPoolOption',
        name: 'opt',
        type: 'uint8',
      },
    ],
    name: 'addYtRewards',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256[]',
        name: 'nftTokenIds',
        type: 'uint256[]',
      },
    ],
    name: 'batchClaimDepositNft',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256[]',
        name: 'nftTokenIds',
        type: 'uint256[]',
      },
    ],
    name: 'batchClaimRedeemNft',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256[]',
        name: 'nftTokenIds',
        type: 'uint256[]',
      },
    ],
    name: 'batchDepositNft',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256[]',
        name: 'nftTokenIds',
        type: 'uint256[]',
      },
    ],
    name: 'batchRedeemNft',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'ytSwapPaymentAmount',
        type: 'uint256',
      },
    ],
    name: 'calcSwap',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'nftTokenId',
        type: 'uint256',
      },
    ],
    name: 'claimDepositNft',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'claimNftVestingToken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'nftTokenId',
        type: 'uint256',
      },
    ],
    name: 'claimRedeemNft',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'currentEpochId',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'nftTokenId',
        type: 'uint256',
      },
    ],
    name: 'depositNft',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'depositNftVestingToken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'index',
        type: 'uint256',
      },
    ],
    name: 'epochIdAt',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'epochIdCount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'epochId',
        type: 'uint256',
      },
    ],
    name: 'epochInfoById',
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
        ],
        internalType: 'struct Constants.Epoch',
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
        internalType: 'uint256',
        name: 'epochId',
        type: 'uint256',
      },
    ],
    name: 'epochNextSwapK0',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'epochId',
        type: 'uint256',
      },
    ],
    name: 'epochNextSwapX',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_epochDuration',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_nftVtAmount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_nftVestingEndTime',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_nftVestingDuration',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_ytSwapPaymentToken',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_ytSwapPrice',
        type: 'uint256',
      },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'initialized',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'nftDepositIds',
    outputs: [
      {
        internalType: 'uint256[]',
        name: '',
        type: 'uint256[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'nftTokenId',
        type: 'uint256',
      },
    ],
    name: 'nftDepositInfo',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'owner',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'nftTokenId',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'depositTime',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'depositAtEpoch',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'claimableTime',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'claimed',
            type: 'bool',
          },
          {
            internalType: 'uint256',
            name: 'f1OnClaim',
            type: 'uint256',
          },
        ],
        internalType: 'struct Constants.NftDeposit',
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
        internalType: 'uint256',
        name: 'nftTokenId',
        type: 'uint256',
      },
    ],
    name: 'nftRedeemInfo',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'owner',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'nftTokenId',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'redeemTime',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'redeemAtEpoch',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'claimableTime',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'claimed',
            type: 'bool',
          },
        ],
        internalType: 'struct Constants.NftRedeem',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'nftStakingPool',
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
    inputs: [],
    name: 'nftToken',
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
    inputs: [],
    name: 'nftVestingDuration',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'nftVestingEndTime',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'nftVestingToken',
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
    inputs: [],
    name: 'nftVtAmount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
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
        internalType: 'bytes32',
        name: 'param',
        type: 'bytes32',
      },
    ],
    name: 'paramValue',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'protocol',
    outputs: [
      {
        internalType: 'contract IZooProtocol',
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
        internalType: 'uint256',
        name: '_epochDuration',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_nftVtAmount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_nftVestingEndTime',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_nftVestingDuration',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_ytSwapPaymentToken',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_ytSwapPrice',
        type: 'uint256',
      },
    ],
    name: 'reInitialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'nftTokenId',
        type: 'uint256',
      },
    ],
    name: 'redeemNft',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'settings',
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
    inputs: [],
    name: 'startEpoch1',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'swap',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'nftTokenId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'claimableTime',
        type: 'uint256',
      },
    ],
    name: 'updateNftDepositClaimableTime',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'vToken',
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
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'withdrawNftVestingToken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'epochId',
        type: 'uint256',
      },
    ],
    name: 'yTokenTotalSupply',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
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
    name: 'yTokenUserBalance',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'ytDecimals',
    outputs: [
      {
        internalType: 'uint8',
        name: '',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'ytNewEpoch',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'ytRewardsPoolFactory',
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
    inputs: [],
    name: 'ytSwapPaymentToken',
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
    inputs: [],
    name: 'ytSwapPrice',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const
