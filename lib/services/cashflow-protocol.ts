/**
 * Cashflow Protocol Service
 * Handles interaction with the deployed cashflow protocol contracts
 */

import { ethers } from 'ethers'
import { NETWORK_CONFIG } from '@/lib/web3/config'

// Contract addresses (deployed on Mantle Sepolia Testnet)
const CONTRACTS = {
  SIMPLE_CASHFLOW_PROTOCOL: process.env.NEXT_PUBLIC_CASHFLOW_PROTOCOL_ADDRESS || '0x54Fb33115B4b39A40A7267aEB69d2aBBA103Be1c',
  CASHFLOW_TOKEN: process.env.NEXT_PUBLIC_CASHFLOW_TOKEN_ADDRESS || '0xBf994E5Ad6EDcF29F528D9d7c489e260Af6fBDC7',
  REVENUE_ORACLE: process.env.NEXT_PUBLIC_REVENUE_ORACLE_ADDRESS || '0x4Ba705320F4c048BC89C8761d33e0Fbba9E659D8',
  DISTRIBUTION_ENGINE: process.env.NEXT_PUBLIC_DISTRIBUTION_ENGINE_ADDRESS || '0x94C32DF077BdF0053D39E70B8A4044e2403b7400'
}

// Simplified ABI for the deployed contracts
const SIMPLE_CASHFLOW_PROTOCOL_ABI = [
  'function registerStream(string memory title, uint256 projectedMonthlyRevenue, uint256 durationMonths) external returns (uint256)',
  'function markStreamTokenized(uint256 streamId, address tokenAddress) external',
  'function investInStream(uint256 streamId) external payable',
  'function getStreamInfo(uint256 streamId) external view returns (tuple(address creator, string title, uint256 projectedMonthlyRevenue, uint256 durationMonths, address tokenAddress, uint256 totalInvestment, bool isActive, bool isTokenized))',
  'function getCreatorStreams(address creator) external view returns (uint256[])',
  'function streamExists(uint256 streamId) external view returns (bool)',
  'function protocolFee() external view returns (uint256)',
  'function minimumInvestment() external view returns (uint256)',
  'event StreamRegistered(uint256 indexed streamId, address indexed creator, string title)',
  'event StreamTokenized(uint256 indexed streamId, address indexed tokenAddress)',
  'event InvestmentMade(uint256 indexed streamId, address indexed investor, uint256 amount)'
]

const REVENUE_ORACLE_ABI = [
  'function registerOracle(address oracle) external',
  'function verifyRevenue(uint256 streamId, uint256 period, uint256 verifiedAmount, bytes32 proofHash, tuple(string platform, string accountId, uint256 amount, bytes32 dataHash, uint256 timestamp)[] sourceData) external',
  'function confirmVerification(uint256 streamId, uint256 period, bytes32 proofHash) external',
  'function getVerifiedRevenue(uint256 streamId, uint256 period) external view returns (uint256 verifiedAmount, bytes32 proofHash, bool isConfirmed)',
  'function updateProjections(uint256 streamId, uint256[] historicalData) external returns (uint256 updatedProjection)',
  'function disputeVerification(uint256 streamId, uint256 period, string reason) external',
  'function getSupportedPlatforms() external view returns (string[])',
  'function getOracleInfo(address oracle) external view returns (tuple(address oracleAddress, uint256 reputation, uint256 totalSubmissions, uint256 successfulSubmissions, uint256 slashCount, bool isActive, uint256 registeredAt))',
  'event RevenueVerified(uint256 indexed streamId, uint256 period, uint256 amount, bytes32 proofHash, address oracle)',
  'event RevenueDisputed(uint256 indexed streamId, uint256 period, address disputer)'
]

const DISTRIBUTION_ENGINE_ABI = [
  'function calculateDistribution(uint256 streamId, uint256 period) external view returns (tuple(uint256 totalAmount, uint256 protocolFee, uint256 creatorShare, uint256 investorShare, uint256 distributionPerToken))',
  'function executeDistribution(uint256 streamId, uint256 period, address tokenAddress, address creatorAddress) external',
  'function batchDistribute(tuple(uint256[] streamIds, uint256 period, uint256 maxGasPerDistribution, bool forceExecution) params) external',
  'function getDistributionRecord(uint256 streamId, uint256 period) external view returns (tuple(uint256 streamId, uint256 period, uint256 totalRevenue, uint256 verifiedRevenue, uint256 distributedAmount, uint256 protocolFee, uint256 creatorShare, uint256 investorShare, bytes32 proofHash, uint256 distributedAt, address distributor, bool isCompleted))',
  'function isDistributionDue(uint256 streamId, uint256 period) external view returns (bool)',
  'function updateProtocolFee(uint256 newFeeRate) external',
  'function protocolFeeRate() external view returns (uint256)',
  'event DistributionCalculated(uint256 indexed streamId, uint256 period, uint256 totalAmount, uint256 protocolFee, uint256 investorShare)',
  'event DistributionExecuted(uint256 indexed streamId, uint256 period, uint256 distributedAmount, uint256 recipientCount)',
  'event BatchDistributionCompleted(uint256[] streamIds, uint256 period, uint256 totalDistributed, uint256 successCount)'
]

const CASHFLOW_TOKEN_ABI = [
  'function name() external view returns (string)',
  'function symbol() external view returns (string)',
  'function totalSupply() external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
  'function transfer(address to, uint256 amount) external returns (bool)',
  'function distributeDividends(uint256 amount, uint256 period, bytes32 proofHash) external',
  'function claimDividends() external',
  'function getUnclaimedDividends(address holder) external view returns (uint256)',
  'function getYieldRate() external view returns (uint256)',
  'function getRemainingDuration() external view returns (uint256)',
  'function getProjectedReturns(address holder) external view returns (uint256)',
  'event DividendsDistributed(uint256 amount, uint256 dividendPerToken, uint256 period)',
  'event DividendsClaimed(address indexed holder, uint256 amount)'
]

export interface StreamInfo {
  creator: string
  title: string
  projectedMonthlyRevenue: string
  durationMonths: number
  tokenAddress: string
  totalInvestment: string
  isActive: boolean
  isTokenized: boolean
}

export interface CashflowTokenInfo {
  name: string
  symbol: string
  totalSupply: string
  balance: string
  unclaimedDividends: string
  yieldRate: number
  remainingDuration: number
  projectedReturns: string
}

export interface CreateStreamParams {
  title: string
  projectedMonthlyRevenue: string // in MNT
  durationMonths: number
}

export interface InvestmentParams {
  streamId: number
  amount: string // in MNT
}

export interface RevenueSourceData {
  platform: string
  accountId: string
  amount: string
  dataHash: string
  timestamp: number
}

export interface VerifyRevenueParams {
  streamId: number
  period: number
  verifiedAmount: string
  proofHash: string
  sourceData: RevenueSourceData[]
}

export interface DistributionCalculation {
  totalAmount: string
  protocolFee: string
  creatorShare: string
  investorShare: string
  distributionPerToken: string
}

class CashflowProtocolService {
  private provider: ethers.BrowserProvider | null = null
  private signer: ethers.Signer | null = null
  private protocolContract: ethers.Contract | null = null
  private revenueOracleContract: ethers.Contract | null = null
  private distributionEngineContract: ethers.Contract | null = null

  /**
   * Initialize the service with Web3 provider
   */
  async initialize(): Promise<boolean> {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        this.provider = new ethers.BrowserProvider(window.ethereum)
        this.signer = await this.provider.getSigner()
        
        this.protocolContract = new ethers.Contract(
          CONTRACTS.SIMPLE_CASHFLOW_PROTOCOL,
          SIMPLE_CASHFLOW_PROTOCOL_ABI,
          this.signer
        )
        
        this.revenueOracleContract = new ethers.Contract(
          CONTRACTS.REVENUE_ORACLE,
          REVENUE_ORACLE_ABI,
          this.signer
        )
        
        this.distributionEngineContract = new ethers.Contract(
          CONTRACTS.DISTRIBUTION_ENGINE,
          DISTRIBUTION_ENGINE_ABI,
          this.signer
        )
        
        console.log('✅ [CashflowProtocol] Service initialized successfully')
        return true
      } else {
        console.log('❌ [CashflowProtocol] No Web3 provider found')
        return false
      }
    } catch (error) {
      console.error('❌ [CashflowProtocol] Initialization failed:', error)
      return false
    }
  }

  /**
   * Check if contracts are deployed and accessible
   */
  async isDeployed(): Promise<boolean> {
    try {
      if (!this.protocolContract) {
        await this.initialize()
      }
      
      if (!this.protocolContract) return false
      
      // Try to call a view function to check if contract exists
      await this.protocolContract.protocolFee()
      return true
    } catch (error) {
      console.error('Contract not deployed or accessible:', error)
      return false
    }
  }

  /**
   * Get supported platforms from Revenue Oracle
   */
  async getSupportedPlatforms(): Promise<string[]> {
    try {
      if (!this.revenueOracleContract) {
        await this.initialize()
      }
      
      return await this.revenueOracleContract!.getSupportedPlatforms()
    } catch (error) {
      console.error('Error fetching supported platforms:', error)
      return []
    }
  }

  /**
   * Verify revenue for a stream (Oracle functionality)
   */
  async verifyRevenue(params: {
    streamId: number
    period: number
    verifiedAmount: string
    proofHash: string
    sourceData: Array<{
      platform: string
      accountId: string
      amount: string
      dataHash: string
      timestamp: number
    }>
  }): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    try {
      if (!this.revenueOracleContract) {
        await this.initialize()
      }

      const verifiedAmountWei = ethers.parseEther(params.verifiedAmount)
      const sourceDataFormatted = params.sourceData.map(data => ({
        platform: data.platform,
        accountId: data.accountId,
        amount: ethers.parseEther(data.amount),
        dataHash: data.dataHash,
        timestamp: data.timestamp
      }))

      const tx = await this.revenueOracleContract!.verifyRevenue(
        params.streamId,
        params.period,
        verifiedAmountWei,
        params.proofHash,
        sourceDataFormatted
      )

      const receipt = await tx.wait()
      return { success: true, transactionHash: receipt.hash }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to verify revenue' }
    }
  }

  /**
   * Get verified revenue for a stream and period
   */
  async getVerifiedRevenue(streamId: number, period: number): Promise<{
    verifiedAmount: string
    proofHash: string
    isConfirmed: boolean
  } | null> {
    try {
      if (!this.revenueOracleContract) {
        await this.initialize()
      }

      const result = await this.revenueOracleContract!.getVerifiedRevenue(streamId, period)
      
      return {
        verifiedAmount: ethers.formatEther(result.verifiedAmount),
        proofHash: result.proofHash,
        isConfirmed: result.isConfirmed
      }
    } catch (error) {
      console.error('Error fetching verified revenue:', error)
      return null
    }
  }

  /**
   * Calculate distribution for a stream and period
   */
  async calculateDistribution(streamId: number, period: number): Promise<{
    totalAmount: string
    protocolFee: string
    creatorShare: string
    investorShare: string
    distributionPerToken: string
  } | null> {
    try {
      if (!this.distributionEngineContract) {
        await this.initialize()
      }

      const result = await this.distributionEngineContract!.calculateDistribution(streamId, period)
      
      return {
        totalAmount: ethers.formatEther(result.totalAmount),
        protocolFee: ethers.formatEther(result.protocolFee),
        creatorShare: ethers.formatEther(result.creatorShare),
        investorShare: ethers.formatEther(result.investorShare),
        distributionPerToken: ethers.formatEther(result.distributionPerToken)
      }
    } catch (error) {
      console.error('Error calculating distribution:', error)
      return null
    }
  }

  /**
   * Execute distribution for a stream
   */
  async executeDistribution(params: {
    streamId: number
    period: number
    tokenAddress: string
    creatorAddress: string
  }): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    try {
      if (!this.distributionEngineContract) {
        await this.initialize()
      }

      const tx = await this.distributionEngineContract!.executeDistribution(
        params.streamId,
        params.period,
        params.tokenAddress,
        params.creatorAddress
      )

      const receipt = await tx.wait()
      return { success: true, transactionHash: receipt.hash }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to execute distribution' }
    }
  }

  /**
   * Check if distribution is due for a stream
   */
  async isDistributionDue(streamId: number, period: number): Promise<boolean> {
    try {
      if (!this.distributionEngineContract) {
        await this.initialize()
      }

      return await this.distributionEngineContract!.isDistributionDue(streamId, period)
    } catch (error) {
      console.error('Error checking distribution status:', error)
      return false
    }
  }

  /**
   * Get protocol information
   */
  async getProtocolInfo(): Promise<{ protocolFee: number; minimumInvestment: string }> {
    if (!this.protocolContract) {
      await this.initialize()
    }

    const protocolFee = await this.protocolContract!.protocolFee()
    const minimumInvestment = await this.protocolContract!.minimumInvestment()

    return {
      protocolFee: Number(protocolFee),
      minimumInvestment: ethers.formatEther(minimumInvestment)
    }
  }

  /**
   * Register a new cashflow stream
   */
  async registerStream(params: CreateStreamParams): Promise<{ success: boolean; streamId?: number; error?: string }> {
    try {
      if (!this.protocolContract) {
        await this.initialize()
      }

      const projectedRevenueWei = ethers.parseEther(params.projectedMonthlyRevenue)
      
      const tx = await this.protocolContract!.registerStream(
        params.title,
        projectedRevenueWei,
        params.durationMonths
      )

      const receipt = await tx.wait()
      
      // Extract stream ID from event
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = this.protocolContract!.interface.parseLog(log)
          return parsed?.name === 'StreamRegistered'
        } catch {
          return false
        }
      })

      if (event) {
        const parsed = this.protocolContract!.interface.parseLog(event)
        const streamId = Number(parsed?.args[0])
        return { success: true, streamId }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to register stream' }
    }
  }

  /**
   * Get stream information
   */
  async getStreamInfo(streamId: number): Promise<StreamInfo | null> {
    try {
      if (!this.protocolContract) {
        await this.initialize()
      }

      const streamInfo = await this.protocolContract!.getStreamInfo(streamId)
      
      return {
        creator: streamInfo.creator,
        title: streamInfo.title,
        projectedMonthlyRevenue: ethers.formatEther(streamInfo.projectedMonthlyRevenue),
        durationMonths: Number(streamInfo.durationMonths),
        tokenAddress: streamInfo.tokenAddress,
        totalInvestment: ethers.formatEther(streamInfo.totalInvestment),
        isActive: streamInfo.isActive,
        isTokenized: streamInfo.isTokenized
      }
    } catch (error) {
      console.error('Error fetching stream info:', error)
      return null
    }
  }

  /**
   * Get streams created by an address
   */
  async getCreatorStreams(creator: string): Promise<number[]> {
    try {
      if (!this.protocolContract) {
        await this.initialize()
      }

      const streamIds = await this.protocolContract!.getCreatorStreams(creator)
      return streamIds.map((id: any) => Number(id))
    } catch (error) {
      console.error('Error fetching creator streams:', error)
      return []
    }
  }

  /**
   * Invest in a stream
   */
  async investInStream(params: InvestmentParams): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    try {
      console.log('💰 [Investment] Starting investment:', params)
      
      if (!this.protocolContract) {
        await this.initialize()
      }

      // Validate inputs
      if (!params.streamId || params.streamId <= 0) {
        return { success: false, error: 'Invalid stream ID' }
      }

      if (!params.amount || parseFloat(params.amount) <= 0) {
        return { success: false, error: 'Invalid investment amount' }
      }

      const amountWei = ethers.parseEther(params.amount)
      console.log('💰 [Investment] Amount in wei:', amountWei.toString())

      // Check minimum investment
      const protocolInfo = await this.getProtocolInfo()
      const minimumInvestmentWei = ethers.parseEther(protocolInfo.minimumInvestment)
      
      if (amountWei < minimumInvestmentWei) {
        return { 
          success: false, 
          error: `Investment amount must be at least ${protocolInfo.minimumInvestment} MNT` 
        }
      }

      // Check if stream exists and is tokenized
      const streamInfo = await this.getStreamInfo(params.streamId)
      if (!streamInfo) {
        return { success: false, error: 'Stream does not exist' }
      }

      if (!streamInfo.isTokenized) {
        return { success: false, error: 'Stream is not tokenized yet' }
      }

      console.log('💰 [Investment] Calling contract function...')
      
      // Call the contract function with correct parameters
      const tx = await this.protocolContract!.investInStream(params.streamId, {
        value: amountWei
      })

      console.log('💰 [Investment] Transaction sent:', tx.hash)
      const receipt = await tx.wait()
      console.log('💰 [Investment] Transaction confirmed:', receipt.hash)
      
      return { success: true, transactionHash: receipt.hash }
    } catch (error: any) {
      console.error('💰 [Investment] Error:', error)
      
      // Parse common error messages
      let errorMessage = error.message || 'Failed to invest in stream'
      
      if (errorMessage.includes('Stream does not exist')) {
        errorMessage = 'Stream does not exist'
      } else if (errorMessage.includes('Stream not tokenized')) {
        errorMessage = 'Stream is not tokenized yet'
      } else if (errorMessage.includes('Investment below minimum')) {
        errorMessage = 'Investment amount is below minimum requirement'
      } else if (errorMessage.includes('Creator cannot invest')) {
        errorMessage = 'Stream creators cannot invest in their own streams'
      } else if (errorMessage.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for this investment'
      } else if (errorMessage.includes('user rejected')) {
        errorMessage = 'Transaction was rejected by user'
      }
      
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Get cashflow token information
   */
  async getCashflowTokenInfo(tokenAddress: string, holderAddress: string): Promise<CashflowTokenInfo | null> {
    try {
      if (!this.signer) {
        await this.initialize()
      }

      const tokenContract = new ethers.Contract(tokenAddress, CASHFLOW_TOKEN_ABI, this.signer!)
      
      const [name, symbol, totalSupply, balance, unclaimedDividends, yieldRate, remainingDuration, projectedReturns] = 
        await Promise.all([
          tokenContract.name(),
          tokenContract.symbol(),
          tokenContract.totalSupply(),
          tokenContract.balanceOf(holderAddress),
          tokenContract.getUnclaimedDividends(holderAddress),
          tokenContract.getYieldRate(),
          tokenContract.getRemainingDuration(),
          tokenContract.getProjectedReturns(holderAddress)
        ])

      return {
        name,
        symbol,
        totalSupply: ethers.formatEther(totalSupply),
        balance: ethers.formatEther(balance),
        unclaimedDividends: ethers.formatEther(unclaimedDividends),
        yieldRate: Number(yieldRate),
        remainingDuration: Number(remainingDuration),
        projectedReturns: ethers.formatEther(projectedReturns)
      }
    } catch (error) {
      console.error('Error fetching token info:', error)
      return null
    }
  }

  /**
   * Claim dividends from a cashflow token
   */
  async claimDividends(tokenAddress: string): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    try {
      if (!this.signer) {
        await this.initialize()
      }

      const tokenContract = new ethers.Contract(tokenAddress, CASHFLOW_TOKEN_ABI, this.signer!)
      
      const tx = await tokenContract.claimDividends()
      const receipt = await tx.wait()
      
      return { success: true, transactionHash: receipt.hash }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to claim dividends' }
    }
  }

  /**
   * Check wallet connection and network
   */
  async checkWalletConnection(): Promise<{ connected: boolean; correctNetwork: boolean; address?: string }> {
    try {
      // Check if we're in browser environment
      if (typeof window === 'undefined' || !window.ethereum) {
        return { connected: false, correctNetwork: false }
      }

      if (!this.provider) {
        await this.initialize()
      }

      if (!this.provider) {
        return { connected: false, correctNetwork: false }
      }

      // Check if accounts are connected
      const accounts = await window.ethereum.request({ method: 'eth_accounts' })
      if (!accounts || accounts.length === 0) {
        return { connected: false, correctNetwork: false }
      }

      // Check network
      const network = await this.provider.getNetwork()
      const correctNetwork = Number(network.chainId) === 5003 // Mantle Sepolia

      return {
        connected: true,
        correctNetwork,
        address: accounts[0]
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error)
      return { connected: false, correctNetwork: false }
    }
  }
}

export const cashflowProtocolService = new CashflowProtocolService()