import { parseAbi } from 'viem'

export const abiStakingAPL = parseAbi([
  'function stake(uint256 _amount, uint256 minOut) external',
  'function unstake(uint256 _amount, uint256 minOut) external',
  'function stIPRWAperIPRWA() external view returns (uint256)',
])

export const abiAriaLegal = parseAbi([
  'function hasSignedCurrentLicense(address account) external view returns (bool)',
  'function nonce(address account) external view returns (uint256)',
  'function licenseURI() external view returns (string memory)',
  'function contentURIHash() external view returns (bytes32)',
  'function signLicense(bytes calldata signature) external',
])

export const abiAprStakingMON = parseAbi([
  'function previewDeposit(uint256 amount) external view returns(uint256)',
  'function deposit(uint256 assets,address receiver) external payable',
])
