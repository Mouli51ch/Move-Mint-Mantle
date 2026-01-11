import { createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'

// Mantle Testnet configuration
export const mantleTestnet = {
  id: 5003,
  name: 'Mantle Sepolia Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MNT',
    symbol: 'MNT',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.sepolia.mantle.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Mantle Explorer',
      url: 'https://explorer.sepolia.mantle.xyz',
    },
  },
  testnet: true,
} as const

// Wagmi configuration
export const wagmiConfig = createConfig({
  chains: [mantleTestnet, sepolia, mainnet],
  transports: {
    [mantleTestnet.id]: http(),
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
})

// Contract addresses
export const CONTRACTS = {
  MOVEMINT_NFT: process.env.NEXT_PUBLIC_MOVEMINT_CONTRACT_ADDRESS || '0x2CD0f925B6d2DDEA0D3FE3e0F6b3Ba5d87e17073',
  CASHFLOW_PROTOCOL: process.env.NEXT_PUBLIC_CASHFLOW_PROTOCOL_ADDRESS || '',
  REVENUE_ORACLE: process.env.NEXT_PUBLIC_REVENUE_ORACLE_ADDRESS || '',
  DISTRIBUTION_ENGINE: process.env.NEXT_PUBLIC_DISTRIBUTION_ENGINE_ADDRESS || '',
} as const

// Network configuration
export const NETWORK_CONFIG = {
  MANTLE_TESTNET: {
    chainId: 5003,
    name: 'Mantle Sepolia Testnet',
    rpcUrl: 'https://rpc.sepolia.mantle.xyz',
    explorerUrl: 'https://explorer.sepolia.mantle.xyz',
    currency: {
      name: 'MNT',
      symbol: 'MNT',
      decimals: 18,
    },
  },
} as const