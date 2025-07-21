import { parseAbi } from 'viem'

export default parseAbi([
  'function updateYieldSwapHookHelper(address newYieldSwapHookHelper) external',
  'function addPremiumHook(address BT, address hook) external',
  'function transferOwnership(address newOwner) public',
  'function acceptOwnership() public',
])
