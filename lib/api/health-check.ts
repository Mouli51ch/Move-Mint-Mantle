/**
 * API Health Check and Monitoring System
 * Monitors Universal Minting Engine API health and performance
 */

import { getDeploymentConfig } from '@/lib/config/deployment';
import { APIClient } from './client';

export interface HealthCheckResult {
  endpoint: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  timestamp: number;
  error?: string;
  details?: Record<string, any>;
}

export interface SystemHealthStatus {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  services: HealthCheckResult[];
  lastChecked: number;
  uptime: number;
}

/**
 * Health Check Manager
 */
export class HealthCheckManager {
  private static instance: HealthCheckManager;
  private apiClient: APIClient;
  private healthStatus: SystemHealthStatus | null = null;
  private checkInterval: NodeJS.Timeout | null = null;
  private listeners: ((status: SystemHealthStatus) => void)[] = [];

  private constructor() {
    this.apiClient = new APIClient();
  }

  static getInstance(): HealthCheckManager {
    if (!HealthCheckManager.instance) {
      HealthCheckManager.instance = new HealthCheckManager();
    }
    return HealthCheckManager.instance;
  }

  /**
   * Start continuous health monitoring
   */
  startMonitoring(intervalMs: number = 30000): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    // Initial check
    this.performHealthCheck();

    // Set up periodic checks
    this.checkInterval = setInterval(() => {
      this.performHealthCheck();
    }, intervalMs);
  }

  /**
   * Stop health monitoring
   */
  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck(): Promise<SystemHealthStatus> {
    const deploymentConfig = getDeploymentConfig();
    const startTime = Date.now();

    const healthChecks = [
      this.checkAPIHealth(),
      this.checkStorageHealth(),
      this.checkBlockchainHealth(),
    ];

    try {
      const results = await Promise.allSettled(healthChecks);
      
      const services: HealthCheckResult[] = results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          return {
            endpoint: this.getEndpointName(index),
            status: 'unhealthy',
            responseTime: Date.now() - startTime,
            timestamp: Date.now(),
            error: result.reason?.message || 'Unknown error',
          };
        }
      });

      // Determine overall health
      const healthyCount = services.filter(s => s.status === 'healthy').length;
      const degradedCount = services.filter(s => s.status === 'degraded').length;
      
      let overall: 'healthy' | 'degraded' | 'unhealthy';
      if (healthyCount === services.length) {
        overall = 'healthy';
      } else if (healthyCount + degradedCount >= services.length / 2) {
        overall = 'degraded';
      } else {
        overall = 'unhealthy';
      }

      const status: SystemHealthStatus = {
        overall,
        services,
        lastChecked: Date.now(),
        uptime: this.calculateUptime(),
      };

      this.healthStatus = status;
      this.notifyListeners(status);

      return status;
    } catch (error) {
      const errorStatus: SystemHealthStatus = {
        overall: 'unhealthy',
        services: [{
          endpoint: 'system',
          status: 'unhealthy',
          responseTime: Date.now() - startTime,
          timestamp: Date.now(),
          error: error instanceof Error ? error.message : 'System check failed',
        }],
        lastChecked: Date.now(),
        uptime: 0,
      };

      this.healthStatus = errorStatus;
      this.notifyListeners(errorStatus);

      return errorStatus;
    }
  }

  /**
   * Check Universal Minting Engine API health
   */
  private async checkAPIHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const response = await this.apiClient.request({
        endpoint: '/health',
        method: 'GET',
        timeout: 5000,
      });

      const responseTime = Date.now() - startTime;
      
      return {
        endpoint: 'Universal Minting Engine API',
        status: response.data?.status === 'healthy' ? 'healthy' : 'degraded',
        responseTime,
        timestamp: Date.now(),
        details: response.data,
      };
    } catch (error) {
      return {
        endpoint: 'Universal Minting Engine API',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'API health check failed',
      };
    }
  }

  /**
   * Check IPFS/Storage health
   */
  private async checkStorageHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Test IPFS gateway connectivity
      const testUrl = 'https://gateway.pinata.cloud/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/readme';
      const response = await fetch(testUrl, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
      });

      const responseTime = Date.now() - startTime;
      
      return {
        endpoint: 'IPFS Storage',
        status: response.ok ? 'healthy' : 'degraded',
        responseTime,
        timestamp: Date.now(),
        details: {
          statusCode: response.status,
          statusText: response.statusText,
        },
      };
    } catch (error) {
      return {
        endpoint: 'IPFS Storage',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'Storage health check failed',
      };
    }
  }

  /**
   * Check Story Protocol blockchain health
   */
  private async checkBlockchainHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const deploymentConfig = getDeploymentConfig();
    
    try {
      // Test RPC endpoint
      const response = await fetch(deploymentConfig.storyProtocolRpcUrl, {
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
        signal: AbortSignal.timeout(5000),
      });

      const responseTime = Date.now() - startTime;
      const data = await response.json();
      
      return {
        endpoint: 'Story Protocol RPC',
        status: response.ok && data.result ? 'healthy' : 'degraded',
        responseTime,
        timestamp: Date.now(),
        details: {
          blockNumber: data.result,
          chainId: deploymentConfig.storyProtocolChainId,
        },
      };
    } catch (error) {
      return {
        endpoint: 'Story Protocol RPC',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'Blockchain health check failed',
      };
    }
  }

  /**
   * Get endpoint name by index
   */
  private getEndpointName(index: number): string {
    const names = ['Universal Minting Engine API', 'IPFS Storage', 'Story Protocol RPC'];
    return names[index] || 'Unknown';
  }

  /**
   * Calculate system uptime percentage
   */
  private calculateUptime(): number {
    // In a real implementation, this would track historical uptime
    // For now, return a mock value based on current health
    if (!this.healthStatus) return 100;
    
    const healthyServices = this.healthStatus.services.filter(s => s.status === 'healthy').length;
    const totalServices = this.healthStatus.services.length;
    
    return (healthyServices / totalServices) * 100;
  }

  /**
   * Subscribe to health status updates
   */
  subscribe(listener: (status: SystemHealthStatus) => void): () => void {
    this.listeners.push(listener);
    
    // Send current status if available
    if (this.healthStatus) {
      listener(this.healthStatus);
    }
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners of status change
   */
  private notifyListeners(status: SystemHealthStatus): void {
    this.listeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        console.error('Health check listener error:', error);
      }
    });
  }

  /**
   * Get current health status
   */
  getCurrentStatus(): SystemHealthStatus | null {
    return this.healthStatus;
  }

  /**
   * Check if system is healthy
   */
  isHealthy(): boolean {
    return this.healthStatus?.overall === 'healthy';
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): {
    averageResponseTime: number;
    slowestService: string;
    fastestService: string;
  } | null {
    if (!this.healthStatus) return null;

    const services = this.healthStatus.services;
    if (services.length === 0) return null;

    const responseTimes = services.map(s => s.responseTime);
    const averageResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;

    const slowestService = services.reduce((slowest, current) => 
      current.responseTime > slowest.responseTime ? current : slowest
    );

    const fastestService = services.reduce((fastest, current) => 
      current.responseTime < fastest.responseTime ? current : fastest
    );

    return {
      averageResponseTime: Math.round(averageResponseTime),
      slowestService: slowestService.endpoint,
      fastestService: fastestService.endpoint,
    };
  }
}

/**
 * React hook for health monitoring
 */
export function useHealthMonitoring() {
  const [healthStatus, setHealthStatus] = React.useState<SystemHealthStatus | null>(null);
  const [isMonitoring, setIsMonitoring] = React.useState(false);

  React.useEffect(() => {
    const healthManager = HealthCheckManager.getInstance();
    
    const unsubscribe = healthManager.subscribe((status) => {
      setHealthStatus(status);
    });

    // Start monitoring if not already started
    if (!isMonitoring) {
      healthManager.startMonitoring();
      setIsMonitoring(true);
    }

    return () => {
      unsubscribe();
      healthManager.stopMonitoring();
      setIsMonitoring(false);
    };
  }, [isMonitoring]);

  const performHealthCheck = React.useCallback(async () => {
    const healthManager = HealthCheckManager.getInstance();
    return await healthManager.performHealthCheck();
  }, []);

  return {
    healthStatus,
    isMonitoring,
    performHealthCheck,
    isHealthy: healthStatus?.overall === 'healthy',
    metrics: HealthCheckManager.getInstance().getPerformanceMetrics(),
  };
}

// Export singleton instance
export const healthCheckManager = HealthCheckManager.getInstance();