/**
 * Error Boundary Component for MoveMint MVP
 * Provides graceful error handling and recovery options
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { ProcessedError } from '@/lib/utils/error-handler';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: ProcessedError; retry: () => void }>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  processedError: ProcessedError | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, processedError: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Import here to avoid circular dependencies
    const { handleError } = require('@/lib/utils/error-handler');
    
    const processedError = handleError(error, {
      operation: 'component_render',
      component: 'ErrorBoundary',
    });

    return {
      hasError: true,
      processedError,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  retry = () => {
    this.setState({ hasError: false, processedError: null });
  };

  render() {
    if (this.state.hasError && this.state.processedError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.processedError} retry={this.retry} />;
    }

    return this.props.children;
  }
}

/**
 * Default error fallback component
 */
function DefaultErrorFallback({ error, retry }: { error: ProcessedError; retry: () => void }) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-950/20';
      case 'high': return 'border-red-400 bg-red-950/10';
      case 'medium': return 'border-yellow-400 bg-yellow-950/10';
      default: return 'border-gray-400 bg-gray-950/10';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return (
          <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'medium':
        return (
          <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className={`max-w-md w-full rounded-xl border p-6 ${getSeverityColor(error.severity)}`}>
        <div className="flex items-center gap-3 mb-4">
          {getSeverityIcon(error.severity)}
          <div>
            <h2 className="text-lg font-semibold text-white">
              {error.severity === 'critical' ? 'Critical Error' :
               error.severity === 'high' ? 'Error Occurred' :
               error.severity === 'medium' ? 'Something Went Wrong' :
               'Minor Issue'}
            </h2>
            <p className="text-sm text-gray-400 capitalize">{error.type.replace('_', ' ')} Error</p>
          </div>
        </div>

        <p className="text-gray-300 mb-6">{error.userMessage}</p>

        {/* Recovery Actions */}
        <div className="space-y-3">
          {error.recoveryActions.map((action, index) => (
            <Button
              key={index}
              onClick={action.action}
              className={`w-full ${
                action.primary
                  ? 'bg-gradient-to-r from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 text-black'
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
            >
              {action.label}
            </Button>
          ))}
          
          {/* Always provide a retry option */}
          <Button
            onClick={retry}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Try Again
          </Button>
        </div>

        {/* Technical Details (Development Only) */}
        {process.env.NEXT_PUBLIC_APP_ENV === 'development' && (
          <details className="mt-6">
            <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-300">
              Technical Details
            </summary>
            <div className="mt-2 p-3 bg-gray-900/50 rounded text-xs text-gray-400 font-mono">
              <p><strong>Type:</strong> {error.type}</p>
              <p><strong>Severity:</strong> {error.severity}</p>
              <p><strong>Operation:</strong> {error.context.operation}</p>
              {error.context.component && (
                <p><strong>Component:</strong> {error.context.component}</p>
              )}
              <p><strong>Message:</strong> {error.technicalMessage}</p>
              <p><strong>Timestamp:</strong> {new Date(error.context.timestamp).toISOString()}</p>
            </div>
          </details>
        )}
      </div>
    </div>
  );
}

/**
 * Specialized error fallback for API errors
 */
export function APIErrorFallback({ error, retry }: { error: ProcessedError; retry: () => void }) {
  return (
    <div className="bg-black border border-red-900/30 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h3 className="text-lg font-medium text-white">API Connection Error</h3>
          <p className="text-sm text-gray-400">Unable to connect to the server</p>
        </div>
      </div>

      <p className="text-gray-300 mb-4">{error.userMessage}</p>

      <div className="flex gap-3">
        <Button
          onClick={retry}
          className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 text-black"
        >
          Retry Connection
        </Button>
        <Button
          onClick={() => window.location.href = '/app/dashboard'}
          className="bg-gray-700 hover:bg-gray-600 text-white"
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}

/**
 * Specialized error fallback for wallet errors
 */
export function WalletErrorFallback({ error, retry }: { error: ProcessedError; retry: () => void }) {
  return (
    <div className="bg-black border border-yellow-900/30 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <div>
          <h3 className="text-lg font-medium text-white">Wallet Connection Issue</h3>
          <p className="text-sm text-gray-400">Problem connecting to your wallet</p>
        </div>
      </div>

      <p className="text-gray-300 mb-4">{error.userMessage}</p>

      <div className="flex gap-3">
        <Button
          onClick={() => {
            // Trigger wallet connection
            const connectButton = document.querySelector('[data-wallet-connect]') as HTMLElement;
            if (connectButton) {
              connectButton.click();
            }
          }}
          className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 text-black"
        >
          Connect Wallet
        </Button>
        <Button
          onClick={retry}
          className="bg-gray-700 hover:bg-gray-600 text-white"
        >
          Try Again
        </Button>
      </div>
    </div>
  );
}

/**
 * Hook for using error boundary in functional components
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<ProcessedError | null>(null);

  const handleError = React.useCallback((error: Error | any, context: Partial<any> = {}) => {
    const { handleError: processError } = require('@/lib/utils/error-handler');
    const processedError = processError(error, context);
    setError(processedError);
    return processedError;
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError,
    hasError: error !== null,
  };
}