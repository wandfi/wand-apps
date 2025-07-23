import { parseAbi } from 'viem'

export const abiStakingAPL = parseAbi([
    'function stake(uint256 _amount) external',
    'function stIPRWAperIPRWA() external view returns (uint256)'
])


export const abiAriaLegal = parseAbi([
    'function hasSignedCurrentLicense(address account) external view returns (bool)',
    'function licenseURI() external view returns (string memory)',
    'function contentURIHash() external view returns (bytes32)',
    'function signLicense(bytes calldata signature) external'
])