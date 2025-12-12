import { 
  WalletConnection, 
  TransactionRequest, 
  TransactionStatus, 
  WalletError,
  WalletEvent,
  WalletEventType,
  STORY_PROTOCOL_CONFIG 
} from './types';

/**
 * Wallet Service for Web3 integration
 * Handles wallet connection, transaction signing, and blockchain interaction
 */
export class WalletService {
  private provider: any = null;
  private signer: any = null;
  private connection: WalletConnection | null = null;
  private eventListeners: Map<WalletEventType, ((event: WalletEvent) => void)[]> = new Map();

  constructor() {
    this.initializeEventListeners();
  }

  // ========================================
  // Connection Management
  // ========================================

  /**
   * Connect to user's wallet
   */
  async connect(): Promise<WalletConnection> {
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new WalletError(
          4001,
          'No Web3 wallet detected. Please install MetaMask or another Web3 wallet.'
        );
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (!accounts || accounts.length === 0) {
        throw new WalletError(
          4001,
          'No accounts found. Please unlock your wallet and try again.'
        );
      }

      // Get network information
      const chainId = await window.ethereum.request({
        method: 'eth_chainId'
      });

      // Initialize provider and signer (using ethers.js pattern)
      this.provider = window.ethereum;
      
      // Get balance
      const balance = await this.getBalance(accounts[0]);

      this.connection = {
        address: accounts[0],
        chainId: parseInt(chainId, 16),
        isConnected: true,
        provider: this.provider,
        signer: this.provider, // For direct ethereum provider usage
        balance
      };

      // Emit connect event
      this.emitEvent('connect', this.connection);

      return this.connection;
    } catch (error: any) {
      console.error('Wallet connection failed:', error);
      throw new WalletError(
        error.code || 4001,
        error.message || 'Failed to connect wallet'
      );
    }
  }

  /**
   * Disconnect wallet
   */
  async disconnect(): Promise<void> {
    this.provider = null;
    this.signer = null;
    
    const wasConnected = this.connection?.isConnected || false;
    this.connection = null;

    if (wasConnected) {
      this.emitEvent('disconnect', null);
    }
  }

  /**
   * Get current connection status
   */
  getConnection(): WalletConnection | null {
    return this.connection;
  }

  /**
   * Check if wallet is connected
   */
  isConnected(): boolean {
    return this.connection?.isConnected || false;
  }

  // ========================================
  // Network Management
  // ========================================

  /**
   * Switch to Story Protocol network
   */
  async switchToStoryProtocol(): Promise<void> {
    if (!this.provider) {
      throw new WalletError(4100, 'Wallet not connected');
    }

    try {
      await this.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${STORY_PROTOCOL_CONFIG.chainId.toString(16)}` }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await this.provider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${STORY_PROTOCOL_CONFIG.chainId.toString(16)}`,
                chainName: 'Story Protocol Testnet',
                nativeCurrency: {
                  name: 'IP',
                  symbol: 'IP',
                  decimals: 18,
                },
                rpcUrls: [STORY_PROTOCOL_CONFIG.rpcUrl],
                blockExplorerUrls: ['https://testnet.storyscan.xyz/'],
              },
            ],
          });
        } catch (addError) {
          throw new WalletError(
            4902,
            'Failed to add Story Protocol network to wallet'
          );
        }
      } else {
        throw new WalletError(
          switchError.code,
          'Failed to switch to Story Protocol network'
        );
      }
    }

    // Update connection with new chain ID
    if (this.connection) {
      this.connection.chainId = STORY_PROTOCOL_CONFIG.chainId;
    }
  }

  /**
   * Get current network chain ID
   */
  async getChainId(): Promise<number> {
    if (!this.provider) {
      throw new WalletError(4100, 'Wallet not connected');
    }

    const chainId = await this.provider.request({
      method: 'eth_chainId'
    });

    return parseInt(chainId, 16);
  }

  // ========================================
  // Transaction Management
  // ========================================

  /**
   * Sign and send transaction
   */
  async signTransaction(transaction: TransactionRequest): Promise<string> {
    if (!this.provider || !this.connection) {
      throw new WalletError(4100, 'Wallet not connected');
    }

    try {
      // Ensure we're on the correct network
      const currentChainId = await this.getChainId();
      if (currentChainId !== STORY_PROTOCOL_CONFIG.chainId) {
        await this.switchToStoryProtocol();
      }

      // Prepare transaction parameters
      const txParams = {
        from: this.connection.address,
        to: transaction.to,
        data: transaction.data,
        value: transaction.value,
        gas: transaction.gasLimit,
        gasPrice: transaction.gasPrice,
        maxFeePerGas: transaction.maxFeePerGas,
        maxPriorityFeePerGas: transaction.maxPriorityFeePerGas,
      };

      // Remove undefined values
      Object.keys(txParams).forEach(key => {
        if (txParams[key as keyof typeof txParams] === undefined) {
          delete txParams[key as keyof typeof txParams];
        }
      });

      // Send transaction
      const txHash = await this.provider.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      });

      return txHash;
    } catch (error: any) {
      console.error('Transaction signing failed:', error);
      
      // Handle user rejection
      if (error.code === 4001) {
        throw new WalletError(4001, 'Transaction was rejected by user');
      }
      
      // Handle insufficient funds
      if (error.code === -32000 || error.message?.includes('insufficient funds')) {
        throw new WalletError(-32000, 'Insufficient funds for transaction');
      }

      throw new WalletError(
        error.code || -32603,
        error.message || 'Transaction failed'
      );
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(txHash: string): Promise<TransactionStatus> {
    if (!this.provider) {
      throw new WalletError(4100, 'Wallet not connected');
    }

    try {
      const receipt = await this.provider.request({
        method: 'eth_getTransactionReceipt',
        params: [txHash],
      });

      if (!receipt) {
        return {
          hash: txHash,
          status: 'pending',
          confirmations: 0
        };
      }

      const currentBlock = await this.provider.request({
        method: 'eth_blockNumber',
        params: [],
      });

      const confirmations = parseInt(currentBlock, 16) - parseInt(receipt.blockNumber, 16);

      return {
        hash: txHash,
        status: receipt.status === '0x1' ? 'confirmed' : 'failed',
        blockNumber: parseInt(receipt.blockNumber, 16),
        gasUsed: parseInt(receipt.gasUsed, 16).toString(),
        confirmations,
        receipt
      };
    } catch (error: any) {
      console.error('Failed to get transaction status:', error);
      throw new WalletError(
        error.code || -32603,
        'Failed to get transaction status'
      );
    }
  }

  /**
   * Wait for transaction confirmation
   */
  async waitForTransaction(
    txHash: string, 
    confirmations: number = 1,
    timeout: number = 300000 // 5 minutes
  ): Promise<TransactionStatus> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        const status = await this.getTransactionStatus(txHash);
        
        if (status.status === 'failed') {
          throw new WalletError(-32603, 'Transaction failed');
        }
        
        if (status.status === 'confirmed' && status.confirmations >= confirmations) {
          return status;
        }
        
        // Wait 2 seconds before checking again
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        if (error instanceof WalletError) {
          throw error;
        }
        // Continue waiting for other errors
      }
    }
    
    throw new WalletError(-32603, 'Transaction confirmation timeout');
  }

  // ========================================
  // Utility Methods
  // ========================================

  /**
   * Get wallet balance
   */
  async getBalance(address?: string): Promise<string> {
    if (!this.provider) {
      throw new WalletError(4100, 'Wallet not connected');
    }

    const targetAddress = address || this.connection?.address;
    if (!targetAddress) {
      throw new WalletError(4100, 'No address provided');
    }

    try {
      const balance = await this.provider.request({
        method: 'eth_getBalance',
        params: [targetAddress, 'latest'],
      });

      // Convert from wei to ether (simplified)
      const balanceInEther = parseInt(balance, 16) / Math.pow(10, 18);
      return balanceInEther.toFixed(6);
    } catch (error: any) {
      console.error('Failed to get balance:', error);
      throw new WalletError(
        error.code || -32603,
        'Failed to get wallet balance'
      );
    }
  }

  /**
   * Sign message
   */
  async signMessage(message: string): Promise<string> {
    if (!this.provider || !this.connection) {
      throw new WalletError(4100, 'Wallet not connected');
    }

    try {
      const signature = await this.provider.request({
        method: 'personal_sign',
        params: [message, this.connection.address],
      });

      return signature;
    } catch (error: any) {
      console.error('Message signing failed:', error);
      
      if (error.code === 4001) {
        throw new WalletError(4001, 'Message signing was rejected by user');
      }

      throw new WalletError(
        error.code || -32603,
        error.message || 'Failed to sign message'
      );
    }
  }

  // ========================================
  // Event Management
  // ========================================

  /**
   * Add event listener
   */
  addEventListener(eventType: WalletEventType, callback: (event: WalletEvent) => void): void {
    const listeners = this.eventListeners.get(eventType) || [];
    listeners.push(callback);
    this.eventListeners.set(eventType, listeners);
  }

  /**
   * Remove event listener
   */
  removeEventListener(eventType: WalletEventType, callback: (event: WalletEvent) => void): void {
    const listeners = this.eventListeners.get(eventType) || [];
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
      this.eventListeners.set(eventType, listeners);
    }
  }

  /**
   * Emit event to listeners
   */
  private emitEvent(eventType: WalletEventType, data: any): void {
    const listeners = this.eventListeners.get(eventType) || [];
    const event: WalletEvent = { type: eventType, data };
    
    listeners.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in wallet event listener:', error);
      }
    });
  }

  /**
   * Initialize wallet event listeners
   */
  private initializeEventListeners(): void {
    if (typeof window === 'undefined' || !window.ethereum) {
      return;
    }

    // Account changes
    window.ethereum.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length === 0) {
        this.disconnect();
      } else if (this.connection) {
        this.connection.address = accounts[0];
        this.emitEvent('accountsChanged', accounts);
      }
    });

    // Chain changes
    window.ethereum.on('chainChanged', (chainId: string) => {
      if (this.connection) {
        this.connection.chainId = parseInt(chainId, 16);
        this.emitEvent('chainChanged', parseInt(chainId, 16));
      }
    });

    // Connection events
    window.ethereum.on('connect', (connectInfo: any) => {
      this.emitEvent('connect', connectInfo);
    });

    window.ethereum.on('disconnect', (error: any) => {
      this.disconnect();
      this.emitEvent('disconnect', error);
    });
  }
}

// Create default service instance
export const walletService = new WalletService();

// Custom error class
class WalletError extends Error {
  code: number;
  data?: any;

  constructor(code: number, message: string, data?: any) {
    super(message);
    this.name = 'WalletError';
    this.code = code;
    this.data = data;
  }
}

export { WalletError };