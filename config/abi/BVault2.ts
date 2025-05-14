import { parseAbi } from 'viem'

export const abiBVault2 = parseAbi([
  'function initialized() view returns (bool)',
  'function BT() external view returns (address)',
  'function Points() external view returns (address)',
  'function bootstrapStartTime() external view returns (uint256)',
  'function bootstrapDuration() external view returns (uint256)',
  'function bootstrapThreshold() external view returns (uint256)',
  'function totalDeposits() external view returns (uint256)',
  'function bootstrapSucceeded() public view returns (bool)',
  'function bootstrapStarted() public view returns (bool)',
  'function bootstrapEnded() public view returns (bool)',
  'function bootstrapFailed() public view returns (bool)',
  'function bootstrapping() public view returns (bool)',
  'function currentEpochId() public view returns (uint256)',
  'function epochIdCount() public view returns (uint256)',
  'function epochIdAt(uint256 index) public view returns (uint256)',
  'function epochInfoById(uint256 epochId) public view returns (Epoch memory)',
  'struct Epoch {uint256 epochId;uint256 startTime;uint256 duration;address PT;address YT;}',

  'function addLiquidity(uint256 amountBT, uint256 deadline) external returns (uint256 amountShares, uint256 amountPT, uint256 amountYT)',
  'function removeLiquidity(uint256 shares, uint256 minAmountBT, uint256 deadline) external returns (uint256 amountBT, uint256 amountPT, uint256 amountYT)',
  'function swapExactBTForPT(uint256 amountBT, uint256 minAmountPT, uint256 deadline) external returns (uint256 amountPT)',
  'function swapExactPTForBT(uint256 amountPT, uint256 minAmountBT, uint256 deadline) external returns (uint256 amountBT)',
  'function swapExactBTForYT(uint256 amountBT, uint256 amountBT1, uint256 minRefundBT, uint256 deadline) external returns (uint256 amountYT, uint256 refundBT)',
  'function swapExactYTForBT(uint256 amountYT, uint256 minAmountBT, uint256 deadline) external returns (uint256 amountBT)',

  'function initialize(uint256 _bootstrapStartTime, uint256 _bootstrapDuration, uint256 _bootstrapThreshold) external',
  'function updateThreshold(uint256 _threshold) external',
  'function pause() external',
  'function unpause() external',
])

export const abiBT = parseAbi([
  'function deposit(address receiver,address tokenIn,uint256 amountTokenToDeposit,uint256 minSharesOut) external payable returns (uint256 amountSharesOut)',
  'function redeem(address receiver,uint256 amountSharesToRedeem,address tokenOut,uint256 minTokenOut) external payable returns (uint256 amountTokenOut)',
  'function previewDeposit(address tokenIn,uint256 amountTokenToDeposit) external view returns (uint256 amountSharesOut)',
  'function previewRedeem(address tokenOut,uint256 amountSharesToRedeem) external view returns (uint256 amountTokenOut)',
  'function getTokensIn() public view returns (address[] memory res)',
  'function getTokensOut() public view returns (address[] memory res)',
  'function exchangeRate() public view returns (uint256 res)',
])

export const abiMarket = parseAbi(['function getYieldSwapHook(address bt) public view returns (address)'])

export const abiMintPool = parseAbi(['function mint(address BT, uint256 amount) external', 'function redeem(address BT, uint256 amount) external'])

export const abiMaturityPool = parseAbi(['function redeem(address PT, uint256 amount) external'])

export const abiHook = parseAbi([
  'function getAmountOutBTToVPT(uint256 amountBT) external view returns (uint256 amountVPT)',
  'function getAmountOutVPTToBT(uint256 amountVPT) external view returns (uint256 amountBT)',
])

export const abiBvault2Query = parseAbi([
  'function quoteExactBTforYT(address hook,uint256 amountBT,uint256 amountBT1) external view returns (uint256 amountYT, uint256 expectedRefundBT)',
  'function quoteExactYTforBT(address hook,uint256 amountYT) external view returns (uint256 amountBT)',
  'function calcBT1ForSwapBTForYT(address hook,uint256 amountBT) external view returns (uint256 bestAmountBT1)',
  'struct LogData { uint256 BTtp;uint256 BTnet;uint256 Anet;uint256 PTc;uint256 YTc;uint256 vPT;uint256 pt;uint256 Feerate;uint256 ShareTotal;uint256 rateScalar;uint256 rateAnchor;}',
  'function getLog(address protocol, address BT) external view returns(LogData memory log)',
  'function calcRemoveLP(address protocol,address hook,address BT,uint256 shares) external view returns(uint256 amountBT, uint256 amountPT, uint256 amountYT)',
  'function calcAddLP(address protocol,address hook,address BT,uint256 amountBT) external view returns(uint256 amountPT, uint256 amountYT, uint256 amountShares)',
])

export const abiRewardManager = parseAbi([
  'function getUserRewards(address user) external view returns (uint256[] memory rewardAmounts)',
  'function getRewardTokens() public view returns (address[] memory rewardTokens)',
  'function claimRewards(address user) external',
  'function updateRewardIndexes() external',
  'function updateUserRewards(address user) external'
])

export const abiMockInfraredVault = parseAbi([
  'function addReward(address _rewardsToken, uint256 reward, uint256 rewardsDuration) external payable'
])