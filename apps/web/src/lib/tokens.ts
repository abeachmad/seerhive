export const SUPPORTED_TOKENS = {
  tBUSD: {
    address: '0xaB1a4d4f1D656d2450692D237fdD6C7f9146e814',
    symbol: 'tBUSD',
    decimals: 18,
  },
  tUSDT: {
    address: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
    symbol: 'tUSDT',
    decimals: 18,
  },
  tUSDC: {
    address: '0x64544969ed7EBf5f083679233325356EbE738930',
    symbol: 'tUSDC',
    decimals: 18,
  },
  tDAI: {
    address: '0xEC5dCb5Dbf4B114C9d0F65BcCAb49EC54F6A0867',
    symbol: 'tDAI',
    decimals: 18,
  },
  tBTC: {
    address: '0x6ce8dA28E2f864420840cF74474eFf5fD80E65B8',
    symbol: 'tBTC',
    decimals: 18,
  },
} as const;

export const ERC20_ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
