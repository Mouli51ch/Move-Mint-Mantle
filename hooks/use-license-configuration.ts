"use client"

import { useState, useCallback } from 'react'
import { LicenseConfiguration, LicenseResponse, CustomLicenseParams } from '@/lib/types/api'
import { universalMintingEngineService } from '@/lib/api/service'

interface UseLicenseConfigurationReturn {
  config: LicenseConfiguration
  updateConfig: (newConfig: Partial<LicenseConfiguration>) => void
  generateLicense: () => Promise<LicenseResponse | null>
  validateConfiguration: () => { isValid: boolean; errors: string[] }
  isLoading: boolean
  error: string | null
  clearError: () => void
}

export function useLicenseConfiguration(
  initialConfig?: LicenseConfiguration
): UseLicenseConfigurationReturn {
  const [config, setConfig] = useState<LicenseConfiguration>(
    initialConfig || {
      useTemplate: true,
      templateId: undefined,
      customParams: {
        commercialUse: false,
        derivativesAllowed: false,
        revenueSharePercentage: 0,
        prohibitedUses: [],
        territory: 'Worldwide',
        duration: 'Perpetual'
      },
      generatedLicense: undefined
    }
  )
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateConfig = useCallback((newConfig: Partial<LicenseConfiguration>) => {
    setConfig(prev => ({ ...prev, ...newConfig }))
    setError(null) // Clear errors when config changes
  }, [])

  const generateLicense = useCallback(async (): Promise<LicenseResponse | null> => {
    if (!config.customParams) {
      setError('Custom license parameters are required')
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await universalMintingEngineService.createCustomLicense(config.customParams)
      
      // Update config with generated license
      setConfig(prev => ({
        ...prev,
        generatedLicense: response
      }))

      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate license'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [config.customParams])

  const validateConfiguration = useCallback((): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []

    if (config.useTemplate) {
      if (!config.templateId) {
        errors.push('Please select a license template')
      }
    } else {
      // Validate custom license parameters
      if (!config.customParams) {
        errors.push('Custom license parameters are required')
      } else {
        if (config.customParams.revenueSharePercentage < 0 || config.customParams.revenueSharePercentage > 100) {
          errors.push('Revenue share percentage must be between 0 and 100')
        }

        if (!config.customParams.territory) {
          errors.push('Territory is required')
        }

        if (!config.customParams.duration) {
          errors.push('License duration is required')
        }

        // Validate prohibited uses
        if (config.customParams.prohibitedUses.some(use => use.trim().length === 0)) {
          errors.push('Prohibited uses cannot be empty')
        }
      }

      // For custom licenses, we need a generated license
      if (!config.generatedLicense) {
        errors.push('Please generate the custom license before proceeding')
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }, [config])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    config,
    updateConfig,
    generateLicense,
    validateConfiguration,
    isLoading,
    error,
    clearError
  }
}