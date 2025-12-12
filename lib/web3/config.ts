import { createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'

// Story Protocol Testnet configuration
export const storyProtocolTestnet = {
  id: 1513,
  name: 'Story Protocol Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'IP',
    symbol: 'IP',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet.storyrpc.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Story Protocol Explorer',
      url: 'https://testnet.storyscan.xyz',
    },
  },
  testnet: true,
} as const

// Wagmi configuration
export const wagmiConfig = createConfig({
  chains: [storyProtocolTestnet, sepolia, mainnet],
  transports: {
    [storyProtocolTestnet.id]: http(),
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
})

// Contract addresses
export const CONTRACTS = {
  STORY_PROTOCOL_NFT: process.env.NEXT_PUBLIC_STORY_PROTOCOL_CONTRACT_ADDRESS || '0x742d35Cc6634C0532925a3b8D4C9db96590e4265',
  LICENSE_REGISTRY: '0x1234567890123456789012345678901234567890', // Replace with actual address
  ROYALTY_MODULE: '0x1234567890123456789012345678901234567890', // Replace with actual address
} as const

// Network configuration
export const NETWORK_CONFIG = {
  STORY_PROTOCOL_TESTNET: {
    chainId: 1513,
    name: 'Story Protocol Testnet',
    rpcUrl: 'https://testnet.storyrpc.io',
    explorerUrl: 'https://testnet.storyscan.xyz',
    currency: {
      name: 'IP',
      symbol: 'IP',
      decimals: 18,
    },
  },
} as const