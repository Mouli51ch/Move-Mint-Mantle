// Wallet Integration Types
export interface WalletConnection {
  address: string;
  chainId: number;
  isConnected: boolean;
  provider: any;
  signer: any;
  balance?: string;
}

export interface WalletProvider {
  name: string;
  icon: string;
  connector: string;
  installed: boolean;
}

export interface TransactionRequest {
  to: string;
  data: string;
  value: string;
  gasLimit?: string;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
}

export interface TransactionStatus {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  gasUsed?: string;
  confirmations: number;
  receipt?: any;
}

export interface WalletError {
  code: number;
  message: string;
  data?: any;
}

export type WalletEventType = 
  | 'accountsChanged'
  | 'chainChanged'
  | 'connect'
  | 'disconnect';

export interface WalletEvent {
  type: WalletEventType;
  data: any;
}

// Story Protocol specific types
export interface StoryProtocolConfig {
  chainId: number;
  rpcUrl: string;
  contractAddresses: {
    ipAssetRegistry: string;
    licensingModule: string;
    royaltyModule: string;
  };
}

// Supported wallet providers
export const SUPPORTED_WALLETS: WalletProvider[] = [
  {
    name: 'MetaMask',
    icon: '🦊',
    connector: 'injected',
    installed: typeof window !== 'undefined' && !!window.ethereum?.isMetaMask
  },
  {
    name: 'WalletConnect',
    icon: '🔗',
    connector: 'walletconnect',
    installed: true // Always available
  },
  {
    name: 'Coinbase Wallet',
    icon: '🔵',
    connector: 'coinbase',
    installed: typeof window !== 'undefined' && !!window.ethereum?.isCoinbaseWallet
  }
];

// Story Protocol testnet configuration
export const STORY_PROTOCOL_CONFIG: StoryProtocolConfig = {
  chainId: 1513, // Story Protocol testnet
  rpcUrl: 'https://testnet.story.foundation',
  contractAddresses: {
    ipAssetRegistry: '0x1a9d0d28a0422F26D31Be72Edc6f13ea4371E11B',
    licensingModule: '0x5a7D9Fa17DE09350F481A53B470D798c1c1aabae',
    royaltyModule: '0x16eF58e959522727588921A92e9084d36E5d3855'
  }
};