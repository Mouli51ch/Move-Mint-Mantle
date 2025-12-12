"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  LicenseTemplate, 
  CustomLicenseParams, 
  LicenseResponse,
  LicenseConfiguration as LicenseConfigType 
} from "@/lib/types/api"
import { universalMintingEngineService } from "@/lib/api/service"

interface LicenseConfigurationProps {
  onLicenseChange: (config: LicenseConfigType) => void
  initialConfig?: LicenseConfigType
  className?: string
}

export function LicenseConfiguration({ 
  onLicenseChange, 
  initialConfig,
  className = "" 
}: LicenseConfigurationProps) {
  const [useTemplate, setUseTemplate] = useState(initialConfig?.useTemplate ?? true)
  const [templates, setTemplates] = useState<LicenseTemplate[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(initialConfig?.templateId || '')
  const [customParams, setCustomParams] = useState<CustomLicenseParams>(
    initialConfig?.customParams || {
      commercialUse: false,
      derivativesAllowed: false,
      revenueSharePercentage: 0,
      prohibitedUses: [],
      territory: 'Worldwide',
      duration: 'Perpetual'
    }
  )
  const [generatedLicense, setGeneratedLicense] = useState<LicenseResponse | undefined>(
    initialConfig?.generatedLicense
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [prohibitedUseInput, setProhibitedUseInput] = useState('')

  // Load license templates on mount
  useEffect(() => {
    loadLicenseTemplates()
  }, [])

  // Notify parent of configuration changes
  useEffect(() => {
    const config: LicenseConfigType = {
      useTemplate,
      templateId: selectedTemplateId,
      customParams,
      generatedLicense
    }
    onLicenseChange(config)
  }, [useTemplate, selectedTemplateId, customParams, generatedLicense, onLicenseChange])

  const loadLicenseTemplates = async () => {
    try {
      setLoading(true)
      const templateList = await universalMintingEngineService.getLicenseTemplates()
      setTemplates(templateList)
      
      // Auto-select first template if none selected
      if (!selectedTemplateId && templateList.length > 0) {
        setSelectedTemplateId(templateList[0].id)
      }
    } catch (err) {
      console.error('Failed to load license templates:', err)
      setError('Failed to load license templates. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const generateCustomLicense = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await universalMintingEngineService.createCustomLicense(customParams)
      setGeneratedLicense(response)
    } catch (err) {
      console.error('Failed to generate custom license:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate custom license')
    } finally {
      setLoading(false)
    }
  }

  const addProhibitedUse = () => {
    if (prohibitedUseInput.trim() && !customParams.prohibitedUses.includes(prohibitedUseInput.trim())) {
      setCustomParams(prev => ({
        ...prev,
        prohibitedUses: [...prev.prohibitedUses, prohibitedUseInput.trim()]
      }))
      setProhibitedUseInput('')
    }
  }

  const removeProhibitedUse = (use: string) => {
    setCustomParams(prev => ({
      ...prev,
      prohibitedUses: prev.prohibitedUses.filter(u => u !== use)
    }))
  }

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId)

  return (
    <div className={`space-y-6 ${className}`}>
      {/* License Type Selection */}
      <div className="bg-black border border-green-900/30 rounded-xl p-6">
        <h3 className="text-lg font-medium text-white mb-4">License Configuration</h3>
        
        <div className="space-y-4">
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={useTemplate}
                onChange={() => setUseTemplate(true)}
                className="text-green-400 focus:ring-green-400"
              />
              <span className="text-gray-300">Use Pre-built Template</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={!useTemplate}
                onChange={() => setUseTemplate(false)}
                className="text-green-400 focus:ring-green-400"
              />
              <span className="text-gray-300">Create Custom License</span>
            </label>
          </div>

          {error && (
            <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-red-300 hover:text-red-200 text-xs mt-1"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Template Selection */}
      {useTemplate && (
        <div className="bg-black border border-green-900/30 rounded-xl p-6">
          <h4 className="text-md font-medium text-white mb-4">Select License Template</h4>
          
          {loading ? (
            <div className="flex items-center gap-2 text-gray-400">
              <div className="animate-spin w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full"></div>
              <span>Loading templates...</span>
            </div>
          ) : (
            <div className="space-y-3">
              {templates.map((template) => (
                <label
                  key={template.id}
                  className={`block p-4 border rounded-lg cursor-pointer transition duration-300 ${
                    selectedTemplateId === template.id
                      ? 'border-green-600 bg-green-950/20'
                      : 'border-green-900/30 hover:border-green-600/50'
                  }`}
                >
                  <input
                    type="radio"
                    value={template.id}
                    checked={selectedTemplateId === template.id}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-white font-medium">{template.name}</h5>
                      <p className="text-gray-400 text-sm mt-1">{template.description}</p>
                      <span className="inline-block mt-2 px-2 py-1 bg-blue-950/30 text-blue-400 text-xs rounded">
                        {template.category}
                      </span>
                    </div>
                    {selectedTemplateId === template.id && (
                      <div className="text-green-400">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}

          {selectedTemplate && (
            <div className="mt-4 p-4 bg-green-950/10 border border-green-900/30 rounded-lg">
              <h6 className="text-green-400 font-medium mb-2">Template Details</h6>
              <div className="space-y-2 text-sm">
                {selectedTemplate.features && selectedTemplate.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
                <div className="mt-3 pt-3 border-t border-green-900/30">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Commercial Use:</span>
                    <span className="text-white">{selectedTemplate.commercial ? 'Allowed' : 'Not Allowed'}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-gray-400">Derivatives:</span>
                    <span className="text-white">{selectedTemplate.derivatives ? 'Allowed' : 'Not Allowed'}</span>
                  </div>
                  {selectedTemplate.royaltyPercentage > 0 && (
                    <div className="flex justify-between mt-1">
                      <span className="text-gray-400">Royalty:</span>
                      <span className="text-white">{selectedTemplate.royaltyPercentage}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Custom License Configuration */}
      {!useTemplate && (
        <div className="bg-black border border-green-900/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-white">Custom License Parameters</h4>
            <Button
              onClick={generateCustomLicense}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2"
            >
              {loading ? 'Generating...' : 'Generate License'}
            </Button>
          </div>

          <div className="space-y-4">
            {/* Commercial Use */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={customParams.commercialUse}
                onChange={(e) => setCustomParams(prev => ({ ...prev, commercialUse: e.target.checked }))}
                className="rounded border-green-600/50 bg-black text-green-400"
              />
              <div>
                <span className="text-gray-300">Allow Commercial Use</span>
                <p className="text-gray-500 text-xs">Others can use this work for commercial purposes</p>
              </div>
            </label>

            {/* Derivatives */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={customParams.derivativesAllowed}
                onChange={(e) => setCustomParams(prev => ({ ...prev, derivativesAllowed: e.target.checked }))}
                className="rounded border-green-600/50 bg-black text-green-400"
              />
              <div>
                <span className="text-gray-300">Allow Derivative Works</span>
                <p className="text-gray-500 text-xs">Others can modify, remix, or build upon this work</p>
              </div>
            </label>

            {/* Revenue Share */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Revenue Share Percentage
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={customParams.revenueSharePercentage}
                  onChange={(e) => setCustomParams(prev => ({ 
                    ...prev, 
                    revenueSharePercentage: Number(e.target.value) 
                  }))}
                  className="bg-black border-green-900/30 text-white w-24"
                />
                <span className="text-gray-400">%</span>
              </div>
              <p className="text-gray-500 text-xs mt-1">
                Percentage of revenue you receive from derivative works
              </p>
            </div>

            {/* Territory */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Territory</label>
              <select
                value={customParams.territory}
                onChange={(e) => setCustomParams(prev => ({ ...prev, territory: e.target.value }))}
                className="w-full bg-black border border-green-900/30 rounded-lg text-white p-2"
              >
                <option value="Worldwide">Worldwide</option>
                <option value="North America">North America</option>
                <option value="Europe">Europe</option>
                <option value="Asia">Asia</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">License Duration</label>
              <select
                value={customParams.duration}
                onChange={(e) => setCustomParams(prev => ({ ...prev, duration: e.target.value }))}
                className="w-full bg-black border border-green-900/30 rounded-lg text-white p-2"
              >
                <option value="Perpetual">Perpetual</option>
                <option value="1 Year">1 Year</option>
                <option value="5 Years">5 Years</option>
                <option value="10 Years">10 Years</option>
              </select>
            </div>

            {/* Prohibited Uses */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Prohibited Uses</label>
              <div className="flex gap-2 mb-2">
                <Input
                  type="text"
                  placeholder="e.g., Adult content, Political campaigns"
                  value={prohibitedUseInput}
                  onChange={(e) => setProhibitedUseInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addProhibitedUse())}
                  className="bg-black border-green-900/30 text-white flex-1"
                />
                <Button
                  type="button"
                  onClick={addProhibitedUse}
                  className="bg-green-600 hover:bg-green-700 text-white px-4"
                >
                  Add
                </Button>
              </div>
              {customParams.prohibitedUses.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {customParams.prohibitedUses.map((use, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-red-950/30 text-red-400 text-xs rounded border border-red-900/50"
                    >
                      {use}
                      <button
                        onClick={() => removeProhibitedUse(use)}
                        className="hover:text-red-300"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Generated License Preview */}
      {generatedLicense && (
        <div className="bg-black border border-green-900/30 rounded-xl p-6">
          <h4 className="text-md font-medium text-white mb-4">Generated License</h4>
          
          <div className="space-y-4">
            <div className="bg-green-950/10 border border-green-900/30 rounded-lg p-4">
              <h5 className="text-green-400 font-medium mb-2">License Document</h5>
              <p className="text-gray-300 text-sm mb-2">{generatedLicense.data.licenseDocument.title}</p>
              <div className="bg-black/50 rounded p-3 max-h-40 overflow-y-auto">
                <pre className="text-xs text-gray-400 whitespace-pre-wrap">
                  {generatedLicense.data.markdown}
                </pre>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-950/10 border border-blue-900/30 rounded-lg p-4">
                <h5 className="text-blue-400 font-medium mb-2">Story Protocol</h5>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Template:</span>
                    <span className="text-white">{generatedLicense.data.storyProtocolParameters.licenseTemplate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Royalty Policy:</span>
                    <span className="text-white">{generatedLicense.data.storyProtocolParameters.royaltyPolicy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Minting Fee:</span>
                    <span className="text-white">{generatedLicense.data.storyProtocolParameters.mintingFee}</span>
                  </div>
                </div>
              </div>

              <div className="bg-purple-950/10 border border-purple-900/30 rounded-lg p-4">
                <h5 className="text-purple-400 font-medium mb-2">IPFS Storage</h5>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Hash:</span>
                    <span className="text-white font-mono text-xs">
                      {generatedLicense.data.ipfs.hash.substring(0, 12)}...
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Gateway:</span>
                    <a 
                      href={generatedLicense.data.ipfs.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300"
                    >
                      View on IPFS
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}