# MoveMint NFT Frontend Integration Guide

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Installation & Setup](#installation--setup)
4. [Contract Configuration](#contract-configuration)
5. [Core Integration](#core-integration)
6. [API Reference](#api-reference)
7. [React Integration](#react-integration)
8. [Error Handling](#error-handling)
9. [Testing](#testing)
10. [Production Deployment](#production-deployment)

---

## Overview

This guide provides complete technical documentation for integrating the MoveMint NFT smart contract into your frontend application. The contract enables decentralized minting of dance performance NFTs with rich metadata on Mantle Sepolia Testnet.

### Contract Details
- **Contract Address:** `0x2CD0f925B6d2DDEA0D3FE3e0F6b3Ba5d87e17073`
- **Network:** Mantle Sepolia Testnet
- **Chain ID:** `5003`
- **Standard:** ERC721 + ERC2981 (Royalties) + Enumerable + URI Storage

---

## Prerequisites

### Required Dependencies
```bash
npm install ethers@^6.0.0
# or
yarn add ethers@^6.0.0
```

### Optional Dependencies (for React)
```bash
npm install @tanstack/react-query wagmi viem
```

### Browser Requirements
- MetaMask or compatible Web3 wallet
- Modern browser with ES2020+ support

---

## Installation & Setup

### 1. Install Dependencies

```bash
npm install ethers
```

### 2. Copy Contract ABI

Extract the ABI from the compiled contract:

```bash
# From your Hardhat project
cp artifacts/contracts/MoveMintNFT.sol/MoveMintNFT.json src/contracts/
```

### 3. Environment Configuration

Create environment variables for your frontend:

```typescript
// config/contracts.ts
export const CONTRACTS = {
  MOVEMINT_NFT: {
    address: "0x2CD0f925B6d2DDEA0D3FE3e0F6b3Ba5d87e17073",
    abi: MoveMintNFTABI, // Import from artifacts
  }
} as const;

export const NETWORKS = {
  MANTLE_SEPOLIA: {
    chainId: 5003,
    name: "Mantle Sepolia Testnet",
    rpcUrl: "https://rpc.sepolia.mantle.xyz",
    explorerUrl: "https://explorer.sepolia.mantle.xyz",
    currency: {
      name: "MNT",
      symbol: "MNT",
      decimals: 18
    }
  }
} as const;
```

---

## Contract Configuration

### Network Setup

```typescript
// utils/network.ts
import { ethers } from 'ethers';

export async function addMantleSepolia() {
  if (!window.ethereum) {
    throw new Error('MetaMask not found');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: '0x138B', // 5003 in hex
        chainName: 'Mantle Sepolia Testnet',
        rpcUrls: ['https://rpc.sepolia.mantle.xyz'],
        blockExplorerUrls: ['https://explorer.sepolia.mantle.xyz'],
        nativeCurrency: {
          name: 'MNT',
          symbol: 'MNT',
          decimals: 18
        }
      }]
    });
  } catch (error) {
    console.error('Failed to add Mantle Sepolia:', error);
    throw error;
  }
}

export async function switchToMantleSepolia() {
  if (!window.ethereum) {
    throw new Error('MetaMask not found');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x138B' }]
    });
  } catch (error: any) {
    if (error.code === 4902) {
      await addMantleSepolia();
    } else {
      throw error;
    }
  }
}
```

---

## Core Integration

### MoveMint Service Class

```typescript
// services/MoveMintNFTService.ts
import { ethers } from 'ethers';
import { CONTRACTS, NETWORKS } from '../config/contracts';

export interface DanceMetadata {
  title: string;
  danceStyle: string;
  choreographer: string;
  duration: number; // seconds
  ipfsHash: string;
}

export interface MintedNFT extends DanceMetadata {
  tokenId: string;
  creator: string;
  owner: string;
  mintedAt: Date;
  tokenURI: string;
  explorerUrl: string;
}

export interface MintResult {
  tokenId: string;
  transactionHash: string;
  explorerUrl: string;
}

export class MoveMintNFTService {
  private provider: ethers.BrowserProvider;
  private contract: ethers.Contract;
  private signer: ethers.Signer | null = null;

  constructor() {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('Web3 provider not found. Please install MetaMask.');
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);
    this.contract = new ethers.Contract(
      CONTRACTS.MOVEMINT_NFT.address,
      CONTRACTS.MOVEMINT_NFT.abi,
      this.provider
    );
  }

  /**
   * Connect wallet and ensure correct network
   */
  async connect(): Promise<string> {
    try {
      // Request account access
      await this.provider.send("eth_requestAccounts", []);
      this.signer = await this.provider.getSigner();
      const address = await this.signer.getAddress();

      // Check network
      const network = await this.provider.getNetwork();
      if (Number(network.chainId) !== NETWORKS.MANTLE_SEPOLIA.chainId) {
        await this.switchNetwork();
      }

      return address;
    } catch (error) {
      console.error('Connection failed:', error);
      throw new Error(`Failed to connect wallet: ${error.message}`);
    }
  }

  /**
   * Switch to Mantle Sepolia network
   */
  async switchNetwork(): Promise<void> {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${NETWORKS.MANTLE_SEPOLIA.chainId.toString(16)}` }]
      });
    } catch (error: any) {
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${NETWORKS.MANTLE_SEPOLIA.chainId.toString(16)}`,
            chainName: NETWORKS.MANTLE_SEPOLIA.name,
            rpcUrls: [NETWORKS.MANTLE_SEPOLIA.rpcUrl],
            blockExplorerUrls: [NETWORKS.MANTLE_SEPOLIA.explorerUrl],
            nativeCurrency: NETWORKS.MANTLE_SEPOLIA.currency
          }]
        });
      } else {
        throw error;
      }
    }
  }

  /**
   * Mint a new dance NFT
   */
  async mintDance(metadata: DanceMetadata): Promise<MintResult> {
    if (!this.signer) {
      throw new Error('Wallet not connected. Call connect() first.');
    }

    // Validate inputs
    this.validateMintInputs(metadata);

    try {
      const contractWithSigner = this.contract.connect(this.signer);

      // Estimate gas
      const gasEstimate = await contractWithSigner.mintDance.estimateGas(
        metadata.title,
        metadata.danceStyle,
        metadata.choreographer,
        metadata.duration,
        metadata.ipfsHash
      );

      // Send transaction with 20% gas buffer
      const tx = await contractWithSigner.mintDance(
        metadata.title,
        metadata.danceStyle,
        metadata.choreographer,
        metadata.duration,
        metadata.ipfsHash,
        {
          gasLimit: gasEstimate * 120n / 100n
        }
      );

      // Wait for confirmation
      const receipt = await tx.wait();
      
      // Extract token ID from events
      const tokenId = this.extractTokenIdFromReceipt(receipt);

      return {
        tokenId,
        transactionHash: receipt.hash,
        explorerUrl: `${NETWORKS.MANTLE_SEPOLIA.explorerUrl}/tx/${receipt.hash}`
      };

    } catch (error: any) {
      throw this.handleMintError(error);
    }
  }

  /**
   * Get all NFTs owned by an address
   */
  async getUserNFTs(userAddress: string): Promise<MintedNFT[]> {
    try {
      const tokenIds = await this.contract.getCreatorTokens(userAddress);
      
      const nfts = await Promise.all(
        tokenIds.map(async (tokenId: bigint) => {
          const [metadata, tokenURI, owner] = await Promise.all([
            this.contract.getDanceMetadata(tokenId),
            this.contract.tokenURI(tokenId),
            this.contract.ownerOf(tokenId)
          ]);

          return {
            tokenId: tokenId.toString(),
            title: metadata.title,
            danceStyle: metadata.danceStyle,
            choreographer: metadata.choreographer,
            duration: Number(metadata.duration),
            ipfsHash: metadata.ipfsMetadataHash,
            creator: metadata.creator,
            owner: owner,
            mintedAt: new Date(Number(metadata.mintedAt) * 1000),
            tokenURI: tokenURI,
            explorerUrl: `${NETWORKS.MANTLE_SEPOLIA.explorerUrl}/token/${CONTRACTS.MOVEMINT_NFT.address}?a=${tokenId}`
          };
        })
      );

      return nfts;
    } catch (error) {
      console.error('Failed to fetch user NFTs:', error);
      throw new Error(`Failed to fetch NFTs: ${error.message}`);
    }
  }

  /**
   * Get metadata for a specific token
   */
  async getTokenMetadata(tokenId: string): Promise<MintedNFT> {
    try {
      const [metadata, tokenURI, owner] = await Promise.all([
        this.contract.getDanceMetadata(tokenId),
        this.contract.tokenURI(tokenId),
        this.contract.ownerOf(tokenId)
      ]);

      return {
        tokenId,
        title: metadata.title,
        danceStyle: metadata.danceStyle,
        choreographer: metadata.choreographer,
        duration: Number(metadata.duration),
        ipfsHash: metadata.ipfsMetadataHash,
        creator: metadata.creator,
        owner: owner,
        mintedAt: new Date(Number(metadata.mintedAt) * 1000),
        tokenURI: tokenURI,
        explorerUrl: `${NETWORKS.MANTLE_SEPOLIA.explorerUrl}/token/${CONTRACTS.MOVEMINT_NFT.address}?a=${tokenId}`
      };
    } catch (error) {
      throw new Error(`Failed to fetch token metadata: ${error.message}`);
    }
  }

  /**
   * Listen for mint events
   */
  onDanceMinted(callback: (event: {
    tokenId: string;
    creator: string;
    title: string;
    danceStyle: string;
    ipfsHash: string;
    transactionHash: string;
  }) => void): () => void {
    const eventFilter = this.contract.filters.DanceMinted();
    
    const listener = (tokenId: any, creator: string, title: string, danceStyle: string, ipfsHash: string, event: any) => {
      callback({
        tokenId: tokenId.toString(),
        creator,
        title,
        danceStyle,
        ipfsHash,
        transactionHash: event.transactionHash
      });
    };

    this.contract.on(eventFilter, listener);

    // Return cleanup function
    return () => {
      this.contract.off(eventFilter, listener);
    };
  }

  /**
   * Get contract statistics
   */
  async getContractStats() {
    try {
      const totalMinted = await this.contract.getTotalMinted();
      
      return {
        totalMinted: Number(totalMinted),
        contractAddress: CONTRACTS.MOVEMINT_NFT.address,
        explorerUrl: `${NETWORKS.MANTLE_SEPOLIA.explorerUrl}/address/${CONTRACTS.MOVEMINT_NFT.address}`
      };
    } catch (error) {
      throw new Error(`Failed to fetch contract stats: ${error.message}`);
    }
  }

  // Private helper methods
  private validateMintInputs(metadata: DanceMetadata): void {
    if (!metadata.title?.trim()) {
      throw new Error('Title is required');
    }
    if (!metadata.danceStyle?.trim()) {
      throw new Error('Dance style is required');
    }
    if (!metadata.choreographer?.trim()) {
      throw new Error('Choreographer is required');
    }
    if (!metadata.duration || metadata.duration <= 0) {
      throw new Error('Duration must be greater than 0');
    }
    if (!metadata.ipfsHash?.trim()) {
      throw new Error('IPFS hash is required');
    }
  }

  private extractTokenIdFromReceipt(receipt: any): string {
    const mintEvent = receipt.logs.find((log: any) => {
      try {
        const parsed = this.contract.interface.parseLog(log);
        return parsed?.name === 'DanceMinted';
      } catch {
        return false;
      }
    });

    if (mintEvent) {
      const parsed = this.contract.interface.parseLog(mintEvent);
      return parsed?.args[0].toString() || '0';
    }
    
    return '0';
  }

  private handleMintError(error: any): Error {
    if (error.code === 'INSUFFICIENT_FUNDS') {
      return new Error('Insufficient MNT tokens for gas fees. Please get testnet tokens from the faucet.');
    } else if (error.code === 'USER_REJECTED') {
      return new Error('Transaction was rejected by user.');
    } else if (error.message?.includes('Title cannot be empty')) {
      return new Error('Title cannot be empty.');
    } else if (error.message?.includes('IPFS hash cannot be empty')) {
      return new Error('IPFS hash cannot be empty.');
    } else if (error.message?.includes('Duration must be greater than 0')) {
      return new Error('Duration must be greater than 0.');
    } else {
      return new Error(`Minting failed: ${error.message || 'Unknown error'}`);
    }
  }
}
```

---

## API Reference

### Core Methods

#### `connect(): Promise<string>`
Connects to user's wallet and ensures correct network.

**Returns:** Connected wallet address

**Throws:** 
- `Error` if MetaMask not found
- `Error` if connection fails

#### `mintDance(metadata: DanceMetadata): Promise<MintResult>`
Mints a new dance performance NFT.

**Parameters:**
```typescript
interface DanceMetadata {
  title: string;        // Dance performance title
  danceStyle: string;   // Genre/style (e.g., "Hip Hop", "Ballet")
  choreographer: string; // Choreographer name
  duration: number;     // Duration in seconds
  ipfsHash: string;     // IPFS hash of metadata JSON
}
```

**Returns:**
```typescript
interface MintResult {
  tokenId: string;
  transactionHash: string;
  explorerUrl: string;
}
```

#### `getUserNFTs(userAddress: string): Promise<MintedNFT[]>`
Retrieves all NFTs minted by a specific address.

**Parameters:**
- `userAddress`: Ethereum address to query

**Returns:** Array of `MintedNFT` objects

#### `getTokenMetadata(tokenId: string): Promise<MintedNFT>`
Gets detailed metadata for a specific token.

**Parameters:**
- `tokenId`: Token ID to query

**Returns:** `MintedNFT` object

#### `onDanceMinted(callback): () => void`
Listens for new mint events.

**Parameters:**
- `callback`: Function to call when mint event occurs

**Returns:** Cleanup function to stop listening

---

## React Integration

### Custom Hook

```typescript
// hooks/useMoveMintNFT.ts
import { useState, useEffect, useCallback } from 'react';
import { MoveMintNFTService, DanceMetadata, MintedNFT } from '../services/MoveMintNFTService';

export function useMoveMintNFT() {
  const [service] = useState(() => new MoveMintNFTService());
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState<string>('');
  const [userNFTs, setUserNFTs] = useState<MintedNFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const address = await service.connect();
      setUserAddress(address);
      setIsConnected(true);
      await loadUserNFTs(address);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  const loadUserNFTs = useCallback(async (address?: string) => {
    if (!address && !userAddress) return;
    
    try {
      setLoading(true);
      setError(null);
      const nfts = await service.getUserNFTs(address || userAddress);
      setUserNFTs(nfts);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [service, userAddress]);

  const mintDance = useCallback(async (metadata: DanceMetadata) => {
    try {
      setLoading(true);
      setError(null);
      const result = await service.mintDance(metadata);
      await loadUserNFTs(); // Refresh user's NFTs
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service, loadUserNFTs]);

  // Listen for mint events
  useEffect(() => {
    const cleanup = service.onDanceMinted((event) => {
      console.log('New dance minted:', event);
      if (event.creator.toLowerCase() === userAddress.toLowerCase()) {
        loadUserNFTs(); // Refresh if user minted
      }
    });

    return cleanup;
  }, [service, userAddress, loadUserNFTs]);

  return {
    service,
    isConnected,
    userAddress,
    userNFTs,
    loading,
    error,
    connect,
    loadUserNFTs,
    mintDance
  };
}
```

### React Components

```typescript
// components/MintDanceForm.tsx
import React, { useState } from 'react';
import { useMoveMintNFT } from '../hooks/useMoveMintNFT';
import { DanceMetadata } from '../services/MoveMintNFTService';

export function MintDanceForm() {
  const { mintDance, loading, error, isConnected, connect } = useMoveMintNFT();
  const [formData, setFormData] = useState<DanceMetadata>({
    title: '',
    danceStyle: '',
    choreographer: '',
    duration: 0,
    ipfsHash: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      await connect();
      return;
    }

    try {
      const result = await mintDance(formData);
      alert(`NFT minted successfully! Token ID: ${result.tokenId}`);
      
      // Reset form
      setFormData({
        title: '',
        danceStyle: '',
        choreographer: '',
        duration: 0,
        ipfsHash: ''
      });
    } catch (err) {
      console.error('Mint failed:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium">
          Dance Title *
        </label>
        <input
          id="title"
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          placeholder="Enter dance performance title"
        />
      </div>

      <div>
        <label htmlFor="danceStyle" className="block text-sm font-medium">
          Dance Style *
        </label>
        <select
          id="danceStyle"
          required
          value={formData.danceStyle}
          onChange={(e) => setFormData(prev => ({ ...prev, danceStyle: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        >
          <option value="">Select a style</option>
          <option value="Hip Hop">Hip Hop</option>
          <option value="Ballet">Ballet</option>
          <option value="Contemporary">Contemporary</option>
          <option value="Jazz">Jazz</option>
          <option value="Breakdancing">Breakdancing</option>
          <option value="Salsa">Salsa</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="choreographer" className="block text-sm font-medium">
          Choreographer *
        </label>
        <input
          id="choreographer"
          type="text"
          required
          value={formData.choreographer}
          onChange={(e) => setFormData(prev => ({ ...prev, choreographer: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          placeholder="Enter choreographer name"
        />
      </div>

      <div>
        <label htmlFor="duration" className="block text-sm font-medium">
          Duration (seconds) *
        </label>
        <input
          id="duration"
          type="number"
          required
          min="1"
          value={formData.duration || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          placeholder="Duration in seconds"
        />
      </div>

      <div>
        <label htmlFor="ipfsHash" className="block text-sm font-medium">
          IPFS Hash *
        </label>
        <input
          id="ipfsHash"
          type="text"
          required
          value={formData.ipfsHash}
          onChange={(e) => setFormData(prev => ({ ...prev, ipfsHash: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          placeholder="QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx"
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {loading ? 'Processing...' : isConnected ? 'Mint Dance NFT' : 'Connect Wallet'}
      </button>
    </form>
  );
}
```

```typescript
// components/UserNFTList.tsx
import React, { useEffect } from 'react';
import { useMoveMintNFT } from '../hooks/useMoveMintNFT';

export function UserNFTList() {
  const { userNFTs, loading, error, isConnected, userAddress, loadUserNFTs } = useMoveMintNFT();

  useEffect(() => {
    if (isConnected && userAddress) {
      loadUserNFTs();
    }
  }, [isConnected, userAddress, loadUserNFTs]);

  if (!isConnected) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Connect your wallet to view your NFTs</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading your NFTs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading NFTs: {error}</p>
        <button 
          onClick={() => loadUserNFTs()}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (userNFTs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">You haven't minted any dance NFTs yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {userNFTs.map((nft) => (
        <div key={nft.tokenId} className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">{nft.title}</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p><span className="font-medium">Style:</span> {nft.danceStyle}</p>
            <p><span className="font-medium">Choreographer:</span> {nft.choreographer}</p>
            <p><span className="font-medium">Duration:</span> {Math.floor(nft.duration / 60)}:{(nft.duration % 60).toString().padStart(2, '0')}</p>
            <p><span className="font-medium">Token ID:</span> {nft.tokenId}</p>
            <p><span className="font-medium">Minted:</span> {nft.mintedAt.toLocaleDateString()}</p>
          </div>
          <div className="mt-4 flex space-x-2">
            <a
              href={nft.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              View on Explorer
            </a>
            <a
              href={nft.tokenURI}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-800 text-sm"
            >
              View Metadata
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## Error Handling

### Common Errors and Solutions

```typescript
// utils/errorHandling.ts
export function handleWeb3Error(error: any): string {
  if (error.code === 4001) {
    return 'Transaction was rejected by user';
  }
  
  if (error.code === -32002) {
    return 'MetaMask is already processing a request. Please wait.';
  }
  
  if (error.message?.includes('insufficient funds')) {
    return 'Insufficient MNT tokens for gas fees. Get testnet tokens from https://faucet.sepolia.mantle.xyz/';
  }
  
  if (error.message?.includes('Title cannot be empty')) {
    return 'Dance title is required';
  }
  
  if (error.message?.includes('IPFS hash cannot be empty')) {
    return 'IPFS hash is required';
  }
  
  if (error.message?.includes('Duration must be greater than 0')) {
    return 'Duration must be greater than 0 seconds';
  }
  
  if (error.message?.includes('network')) {
    return 'Network error. Please check your connection and try again.';
  }
  
  return error.message || 'An unexpected error occurred';
}
```

### Error Boundary Component

```typescript
// components/ErrorBoundary.tsx
import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('MoveMint NFT Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## Testing

### Unit Tests

```typescript
// __tests__/MoveMintNFTService.test.ts
import { MoveMintNFTService } from '../services/MoveMintNFTService';

// Mock ethers
jest.mock('ethers');

describe('MoveMintNFTService', () => {
  let service: MoveMintNFTService;

  beforeEach(() => {
    // Mock window.ethereum
    (global as any).window = {
      ethereum: {
        request: jest.fn(),
        on: jest.fn(),
        removeListener: jest.fn()
      }
    };

    service = new MoveMintNFTService();
  });

  describe('mintDance', () => {
    it('should validate required fields', async () => {
      const invalidMetadata = {
        title: '',
        danceStyle: 'Hip Hop',
        choreographer: 'Test',
        duration: 120,
        ipfsHash: 'QmTest'
      };

      await expect(service.mintDance(invalidMetadata))
        .rejects
        .toThrow('Title is required');
    });

    it('should validate duration is positive', async () => {
      const invalidMetadata = {
        title: 'Test Dance',
        danceStyle: 'Hip Hop',
        choreographer: 'Test',
        duration: 0,
        ipfsHash: 'QmTest'
      };

      await expect(service.mintDance(invalidMetadata))
        .rejects
        .toThrow('Duration must be greater than 0');
    });
  });
});
```

### Integration Tests

```typescript
// __tests__/integration.test.ts
import { ethers } from 'ethers';
import { MoveMintNFTService } from '../services/MoveMintNFTService';

describe('MoveMint Integration Tests', () => {
  let service: MoveMintNFTService;
  
  beforeAll(async () => {
    // Setup test environment
    // This would require a test network setup
  });

  it('should mint and retrieve NFT', async () => {
    const metadata = {
      title: 'Test Dance',
      danceStyle: 'Hip Hop',
      choreographer: 'Test Choreographer',
      duration: 120,
      ipfsHash: 'QmTestHash123'
    };

    // This test would require actual network interaction
    // Implement based on your testing strategy
  });
});
```

---

## Production Deployment

### Environment Configuration

```typescript
// config/production.ts
export const PRODUCTION_CONFIG = {
  CONTRACTS: {
    MOVEMINT_NFT: {
      // Update with mainnet address when deploying to production
      address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x2CD0f925B6d2DDEA0D3FE3e0F6b3Ba5d87e17073",
      abi: MoveMintNFTABI,
    }
  },
  NETWORKS: {
    MANTLE_MAINNET: {
      chainId: 5000,
      name: "Mantle",
      rpcUrl: "https://rpc.mantle.xyz",
      explorerUrl: "https://explorer.mantle.xyz",
      currency: {
        name: "MNT",
        symbol: "MNT",
        decimals: 18
      }
    }
  }
};
```

### Security Checklist

- [ ] **Contract Audit**: Ensure smart contract is audited before mainnet
- [ ] **Environment Variables**: Use environment variables for sensitive config
- [ ] **Error Handling**: Implement comprehensive error handling
- [ ] **Rate Limiting**: Implement rate limiting for API calls
- [ ] **Input Validation**: Validate all user inputs on frontend and backend
- [ ] **HTTPS**: Ensure all connections use HTTPS
- [ ] **CSP Headers**: Implement Content Security Policy headers
- [ ] **Wallet Security**: Never store private keys in frontend code

### Performance Optimization

```typescript
// utils/performance.ts
import { ethers } from 'ethers';

// Cache contract instances
const contractCache = new Map<string, ethers.Contract>();

export function getCachedContract(address: string, abi: any, provider: ethers.Provider): ethers.Contract {
  const key = `${address}-${provider.network?.chainId}`;
  
  if (!contractCache.has(key)) {
    contractCache.set(key, new ethers.Contract(address, abi, provider));
  }
  
  return contractCache.get(key)!;
}

// Batch multiple contract calls
export async function batchContractCalls<T>(
  calls: (() => Promise<T>)[]
): Promise<T[]> {
  return Promise.all(calls);
}
```

### Monitoring and Analytics

```typescript
// utils/analytics.ts
export function trackMintEvent(tokenId: string, userAddress: string) {
  // Implement your analytics tracking
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'nft_minted', {
      token_id: tokenId,
      user_address: userAddress,
      contract_address: CONTRACTS.MOVEMINT_NFT.address
    });
  }
}

export function trackError(error: string, context: string) {
  // Implement error tracking
  console.error(`[${context}] ${error}`);
  
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'exception', {
      description: error,
      fatal: false
    });
  }
}
```

---

## Troubleshooting

### Common Issues

1. **"MetaMask not found"**
   - Ensure MetaMask is installed
   - Check if user is using a supported browser

2. **"Wrong network"**
   - Implement automatic network switching
   - Provide clear instructions to users

3. **"Insufficient funds"**
   - Check user has enough MNT for gas
   - Provide link to testnet faucet

4. **"Transaction failed"**
   - Check gas limits
   - Verify contract inputs
   - Check network congestion

### Debug Mode

```typescript
// utils/debug.ts
export const DEBUG = process.env.NODE_ENV === 'development';

export function debugLog(message: string, data?: any) {
  if (DEBUG) {
    console.log(`[MoveMint Debug] ${message}`, data);
  }
}

export function debugError(message: string, error?: any) {
  if (DEBUG) {
    console.error(`[MoveMint Error] ${message}`, error);
  }
}
```

---

## Support and Resources

### Useful Links
- **Contract Explorer**: https://explorer.sepolia.mantle.xyz/address/0x2CD0f925B6d2DDEA0D3FE3e0F6b3Ba5d87e17073
- **Mantle Docs**: https://docs.mantle.xyz
- **Testnet Faucet**: https://faucet.sepolia.mantle.xyz/
- **ethers.js Docs**: https://docs.ethers.org/

### Getting Help
- Check the troubleshooting section above
- Review error messages carefully
- Test on local network first
- Use browser developer tools for debugging

---

This documentation provides a complete guide for integrating the MoveMint NFT contract into your frontend application. Follow the examples and best practices outlined here for a robust, production-ready implementation.