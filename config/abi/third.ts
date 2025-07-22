import { parseAbi } from 'viem'
import { getEip712Domain } from 'viem/actions'

export const abiStakingAPL = parseAbi(['function stake(uint256 _amount) external'])


export const abiAriaLegal = parseAbi([
    'function hasSignedCurrentLicense(address account) external view returns (bool)',
    'function licenseURI() external view returns (string memory)',
    'function contentURIHash() external view returns (bytes32)',
    'function signLicense(bytes calldata signature) external'
])