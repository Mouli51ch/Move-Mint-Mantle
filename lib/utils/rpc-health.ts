/**
 * RPC Health Check Utilities
 * Provides functions to check Story Protocol testnet RPC health
 */

export interface RPCHealthStatus {
  isHealthy: boolean
  responseTime: number | null
  error: string | null
  lastChecked: Date
}

/**
 * Check RPC endpoint health
 */
export async function checkRPCHealth(rpcUrl: string = 'https://aeneid.storyrpc.io'): Promise<RPCHealthStatus> {
  const startTime = Date.now()
  
  try {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1,
      }),
      signal: AbortSignal.timeout(5000), // 5 second timeout
    })

    const responseTime = Date.now() - startTime

    if (!response.ok) {
      return {
        isHealthy: false,
        responseTime,
        error: `HTTP ${response.status}: ${response.statusText}`,
        lastChecked: new Date(),
      }
    }

    const data = await response.json()
    
    if (data.error) {
      return {
        isHealthy: false,
        responseTime,
        error: data.error.message || 'RPC returned error',
        lastChecked: new Date(),
      }
    }

    return {
      isHealthy: true,
      responseTime,
      error: null,
      lastChecked: new Date(),
    }
  } catch (error) {
    return {
      isHealthy: false,
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
      lastChecked: new Date(),
    }
  }
}

/**
 * Get RPC health status with caching
 */
let cachedStatus: RPCHealthStatus | null = null
let lastCheck = 0
const CACHE_DURATION = 30000 // 30 seconds

export async function getRPCHealthStatus(): Promise<RPCHealthStatus> {
  const now = Date.now()
  
  // Return cached status if recent
  if (cachedStatus && (now - lastCheck) < CACHE_DURATION) {
    return cachedStatus
  }
  
  // Check health and cache result
  cachedStatus = await checkRPCHealth()
  lastCheck = now
  
  return cachedStatus
}

/**
 * Get user-friendly status message
 */
export function getStatusMessage(status: RPCHealthStatus): string {
  if (status.isHealthy) {
    if (status.responseTime && status.responseTime > 3000) {
      return 'Network is slow but functional'
    }
    return 'Network is healthy'
  }
  
  if (status.error?.includes('timeout') || status.error?.includes('fetch')) {
    return 'Network is experiencing connectivity issues'
  }
  
  if (status.error?.includes('too many')) {
    return 'Network is experiencing high load'
  }
  
  return 'Network is experiencing issues'
}

/**
 * Get status color for UI
 */
export function getStatusColor(status: RPCHealthStatus): 'green' | 'yellow' | 'red' {
  if (status.isHealthy) {
    if (status.responseTime && status.responseTime > 3000) {
      return 'yellow'
    }
    return 'green'
  }
  
  return 'red'
}