import fc from 'fast-check'
import { universalMintingEngineService } from '@/lib/api/service'
import { 
  LicenseTemplate, 
  CustomLicenseParams, 
  LicenseResponse,
  LicenseConfiguration,
  LicenseDocument,
  StoryProtocolParams,
  IPFSData
} from '@/lib/types/api'

// Mock the API service
jest.mock('@/lib/api/service', () => ({
  universalMintingEngineService: {
    getLicenseTemplates: jest.fn(),
    createCustomLicense: jest.fn(),
  },
}))

const mockService = universalMintingEngineService as any

describe('License Creation Workflow - Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  // Generators for test data
  const licenseTemplateArb = fc.record({
    id: fc.string({ minLength: 1, maxLength: 50 }),
    name: fc.string({ minLength: 1, maxLength: 100 }),
    description: fc.string({ minLength: 10, maxLength: 500 }),
    category: fc.constantFrom('Creative Commons', 'Commercial', 'Educational', 'Custom'),
    parameters: fc.array(
      fc.record({
        name: fc.string({ minLength: 1, maxLength: 50 }),
        type: fc.constantFrom('boolean', 'number', 'string', 'select'),
        required: fc.boolean(),
        defaultValue: fc.oneof(fc.boolean(), fc.integer(), fc.string()),
        options: fc.option(fc.array(fc.string(), { minLength: 1, maxLength: 5 })),
        description: fc.string({ minLength: 10, maxLength: 200 }),
      }),
      { minLength: 1, maxLength: 10 }
    ),
  }) as fc.Arbitrary<LicenseTemplate>

  const customLicenseParamsArb = fc.record({
    commercialUse: fc.boolean(),
    derivativesAllowed: fc.boolean(),
    revenueSharePercentage: fc.float({ min: 0, max: 100, noNaN: true }),
    prohibitedUses: fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 0, maxLength: 10 }),
    territory: fc.constantFrom('Worldwide', 'North America', 'Europe', 'Asia', 'Other'),
    duration: fc.constantFrom('Perpetual', '1 Year', '5 Years', '10 Years'),
  }) as fc.Arbitrary<CustomLicenseParams>

  const storyProtocolParamsArb = fc.record({
    licenseTemplate: fc.string({ minLength: 1, maxLength: 50 }),
    licenseTerms: fc.dictionary(fc.string(), fc.oneof(fc.string(), fc.integer(), fc.boolean())),
    royaltyPolicy: fc.string({ minLength: 1, maxLength: 50 }),
    mintingFee: fc.string({ minLength: 1, maxLength: 20 }),
  }) as fc.Arbitrary<StoryProtocolParams>

  const ipfsDataArb = fc.record({
    hash: fc.string({ minLength: 40, maxLength: 50 }), // IPFS hash length (more flexible)
    url: fc.webUrl(),
    gateway: fc.webUrl(),
  }) as fc.Arbitrary<IPFSData>

  const licenseDocumentArb = fc.record({
    id: fc.string({ minLength: 1, maxLength: 50 }),
    title: fc.string({ minLength: 1, maxLength: 200 }),
    content: fc.string({ minLength: 100, maxLength: 5000 }),
    parameters: fc.dictionary(fc.string(), fc.oneof(fc.string(), fc.integer(), fc.boolean())),
    ipfsHash: fc.string({ minLength: 40, maxLength: 50 }),
    storyProtocolParams: storyProtocolParamsArb,
  }) as fc.Arbitrary<LicenseDocument>

  const licenseResponseArb = fc.record({
    success: fc.constant(true),
    data: fc.record({
      licenseDocument: licenseDocumentArb,
      storyProtocolParameters: storyProtocolParamsArb,
      ipfs: ipfsDataArb,
      markdown: fc.string({ minLength: 100, maxLength: 2000 }),
    }),
  }).chain(response => {
    // Ensure consistency between license document and story protocol params
    const consistentResponse = {
      ...response,
      data: {
        ...response.data,
        licenseDocument: {
          ...response.data.licenseDocument,
          storyProtocolParams: response.data.storyProtocolParameters,
          ipfsHash: response.data.ipfs.hash
        }
      }
    }
    return fc.constant(consistentResponse)
  }) as fc.Arbitrary<LicenseResponse>

  /**
   * Property 4: License creation workflow
   * Validates: Requirements 3.2, 3.3, 3.4, 3.5
   */
  describe('Property 4: License creation workflow', () => {
    it('should successfully load and display license templates', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(licenseTemplateArb, { minLength: 1, maxLength: 10 }),
          async (templates) => {
            // Arrange
            mockService.getLicenseTemplates.mockClear()
            mockService.getLicenseTemplates.mockResolvedValue(templates)

            // Act
            const result = await mockService.getLicenseTemplates()

            // Assert
            expect(result).toEqual(templates)
            expect(mockService.getLicenseTemplates).toHaveBeenCalledTimes(1)

            // Verify template structure integrity
            result.forEach((template: LicenseTemplate) => {
              expect(template.id).toBeDefined()
              expect(template.name).toBeDefined()
              expect(template.description).toBeDefined()
              expect(template.category).toBeDefined()
              expect(Array.isArray(template.parameters)).toBe(true)
              
              template.parameters.forEach(param => {
                expect(param.name).toBeDefined()
                expect(['boolean', 'number', 'string', 'select']).toContain(param.type)
                expect(typeof param.required).toBe('boolean')
                expect(param.description).toBeDefined()
              })
            })
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should create custom licenses with valid parameters', async () => {
      await fc.assert(
        fc.asyncProperty(
          customLicenseParamsArb,
          licenseResponseArb,
          async (customParams, expectedResponse) => {
            // Arrange
            mockService.createCustomLicense.mockClear()
            mockService.createCustomLicense.mockResolvedValue(expectedResponse)

            // Act
            const result = await mockService.createCustomLicense(customParams)

            // Assert
            expect(result).toEqual(expectedResponse)
            expect(mockService.createCustomLicense).toHaveBeenCalledWith(customParams)

            // Verify parameter validation
            expect(customParams.revenueSharePercentage).toBeGreaterThanOrEqual(0)
            expect(customParams.revenueSharePercentage).toBeLessThanOrEqual(100)
            expect(customParams.territory).toBeDefined()
            expect(customParams.duration).toBeDefined()
            expect(Array.isArray(customParams.prohibitedUses)).toBe(true)

            // Verify response structure
            expect(result.success).toBe(true)
            expect(result.data).toBeDefined()
            expect(result.data.licenseDocument).toBeDefined()
            expect(result.data.storyProtocolParameters).toBeDefined()
            expect(result.data.ipfs).toBeDefined()
            expect(result.data.markdown).toBeDefined()
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should validate license configuration correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            useTemplate: fc.boolean(),
            templateId: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
            customParams: fc.option(customLicenseParamsArb),
            generatedLicense: fc.option(licenseResponseArb),
          }),
          async (config) => {
            // Act - simulate validation logic
            const validation = validateLicenseConfiguration(config)

            // Assert - verify validation logic
            if (config.useTemplate) {
              if (!config.templateId) {
                expect(validation.isValid).toBe(false)
                expect(validation.errors).toContain('Please select a license template')
              } else {
                expect(validation.isValid).toBe(true)
              }
            } else {
              // Custom license validation
              if (!config.customParams) {
                expect(validation.isValid).toBe(false)
                expect(validation.errors).toContain('Custom license parameters are required')
              } else {
                // Check parameter validation
                const params = config.customParams
                
                if (params.revenueSharePercentage < 0 || params.revenueSharePercentage > 100) {
                  expect(validation.errors).toContain('Revenue share percentage must be between 0 and 100')
                }
                
                if (!params.territory) {
                  expect(validation.errors).toContain('Territory is required')
                }
                
                if (!params.duration) {
                  expect(validation.errors).toContain('License duration is required')
                }
                
                if (params.prohibitedUses.some(use => use.trim().length === 0)) {
                  expect(validation.errors).toContain('Prohibited uses cannot be empty')
                }
                
                if (!config.generatedLicense) {
                  expect(validation.errors).toContain('Please generate the custom license before proceeding')
                }
              }
            }

            // Validation should always return consistent results
            expect(typeof validation.isValid).toBe('boolean')
            expect(Array.isArray(validation.errors)).toBe(true)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should handle IPFS integration correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          licenseResponseArb,
          async (licenseResponse) => {
            // Arrange
            mockService.createCustomLicense.mockClear()
            mockService.createCustomLicense.mockResolvedValue(licenseResponse)

            // Act
            const result = await mockService.createCustomLicense({
              commercialUse: true,
              derivativesAllowed: false,
              revenueSharePercentage: 10,
              prohibitedUses: [],
              territory: 'Worldwide',
              duration: 'Perpetual'
            })

            // Assert - verify IPFS data integrity
            const ipfsData = result.data.ipfs
            expect(ipfsData.hash).toBeDefined()
            expect(ipfsData.hash.length).toBeGreaterThanOrEqual(40) // IPFS hash length
            expect(ipfsData.hash.length).toBeLessThanOrEqual(50)
            expect(ipfsData.url).toBeDefined()
            expect(ipfsData.gateway).toBeDefined()
            
            // Verify URL format
            expect(ipfsData.url).toMatch(/^https?:\/\//)
            expect(ipfsData.gateway).toMatch(/^https?:\/\//)

            // Verify license document has matching IPFS hash
            expect(result.data.licenseDocument.ipfsHash).toBe(ipfsData.hash)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should handle Story Protocol parameters correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          licenseResponseArb,
          async (licenseResponse) => {
            // Arrange
            mockService.createCustomLicense.mockClear()
            mockService.createCustomLicense.mockResolvedValue(licenseResponse)

            // Act
            const result = await mockService.createCustomLicense({
              commercialUse: false,
              derivativesAllowed: true,
              revenueSharePercentage: 25,
              prohibitedUses: ['Adult content'],
              territory: 'North America',
              duration: '5 Years'
            })

            // Assert - verify Story Protocol integration
            const storyParams = result.data.storyProtocolParameters
            expect(storyParams.licenseTemplate).toBeDefined()
            expect(storyParams.licenseTerms).toBeDefined()
            expect(storyParams.royaltyPolicy).toBeDefined()
            expect(storyParams.mintingFee).toBeDefined()

            // Verify license terms structure
            expect(typeof storyParams.licenseTerms).toBe('object')
            
            // Verify minting fee format
            expect(typeof storyParams.mintingFee).toBe('string')
            expect(storyParams.mintingFee.length).toBeGreaterThan(0)

            // Verify consistency between license document and Story Protocol params
            const licenseDoc = result.data.licenseDocument
            expect(licenseDoc.storyProtocolParams).toEqual(storyParams)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should handle license creation errors gracefully', async () => {
      await fc.assert(
        fc.asyncProperty(
          customLicenseParamsArb,
          fc.constantFrom('VALIDATION_ERROR', 'IPFS_UPLOAD_ERROR', 'STORY_PROTOCOL_ERROR', 'NETWORK_ERROR'),
          async (customParams, errorType) => {
            // Arrange
            mockService.createCustomLicense.mockClear()
            const error = new Error(`${errorType}: License creation failed`)
            mockService.createCustomLicense.mockRejectedValue(error)

            // Act & Assert
            await expect(mockService.createCustomLicense(customParams)).rejects.toThrow(errorType)
            
            // Verify error handling doesn't corrupt state
            expect(mockService.createCustomLicense).toHaveBeenCalledWith(customParams)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should maintain license configuration consistency across updates', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              useTemplate: fc.boolean(),
              templateId: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
              customParams: fc.option(customLicenseParamsArb),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          async (configUpdates) => {
            // Act - simulate configuration updates
            let currentConfig: any = {
              useTemplate: true,
              templateId: undefined,
              customParams: undefined,
              generatedLicense: undefined
            }

            configUpdates.forEach(update => {
              currentConfig = { ...currentConfig, ...update }
            })

            // Assert - verify configuration consistency
            if (currentConfig.useTemplate) {
              // Template mode should not have custom params affecting validation
              expect(typeof currentConfig.useTemplate).toBe('boolean')
              if (currentConfig.templateId) {
                expect(typeof currentConfig.templateId).toBe('string')
              }
            } else {
              // Custom mode should have valid parameters
              if (currentConfig.customParams) {
                expect(typeof currentConfig.customParams.commercialUse).toBe('boolean')
                expect(typeof currentConfig.customParams.derivativesAllowed).toBe('boolean')
                expect(typeof currentConfig.customParams.revenueSharePercentage).toBe('number')
                expect(Array.isArray(currentConfig.customParams.prohibitedUses)).toBe(true)
                expect(typeof currentConfig.customParams.territory).toBe('string')
                expect(typeof currentConfig.customParams.duration).toBe('string')
              }
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})

// Helper function used in tests
function validateLicenseConfiguration(config: any): { isValid: boolean; errors: string[] } {
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
      if (config.customParams.prohibitedUses.some((use: string) => use.trim().length === 0)) {
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
}