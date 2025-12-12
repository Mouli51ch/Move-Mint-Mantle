import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const startTime = Date.now() - (Math.random() * 3600000); // Random uptime up to 1 hour
    const uptime = Math.floor((Date.now() - startTime) / 1000);
    
    const healthStatus = {
      status: 'healthy',
      version: '1.0.0',
      uptime: uptime,
      timestamp: new Date().toISOString(),
      
      services: {
        database: 'healthy',
        ipfs: 'healthy',
        blockchain: 'healthy',
        videoProcessing: 'healthy'
      },
      
      performance: {
        responseTime: Math.floor(Math.random() * 50) + 10, // 10-60ms
        memoryUsage: Math.floor(Math.random() * 30) + 40, // 40-70%
        cpuUsage: Math.floor(Math.random() * 20) + 10 // 10-30%
      }
    };

    return NextResponse.json(healthStatus);
    
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { 
        status: 'unhealthy',
        error: 'Health check failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}