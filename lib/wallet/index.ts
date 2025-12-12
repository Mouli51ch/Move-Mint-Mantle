// Wallet Integration Module
export { WalletService, walletService, WalletError } from './wallet-service'
export type {
  WalletConnection,
  WalletProvider,
  TransactionRequest,
  TransactionStatus,
  WalletError as WalletErrorType,
  WalletEvent,
  WalletEventType,
  StoryProtocolConfig
} from './types'
export { 
  SUPPORTED_WALLETS, 
  STORY_PROTOCOL_CONFIG 
} from './types'