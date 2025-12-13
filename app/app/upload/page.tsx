"use client"

import type React from "react"

import { AppNavbar } from "@/components/app-navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { UploadProgress } from "@/components/ui/upload-progress"
import { RealTimeProgress } from "@/components/ui/real-time-progress"
import { VideoMetadataForm } from "@/components/ui/video-metadata-form"
import { useVideoUpload } from "@/hooks/use-video-upload"
import { useRealTimeProgress } from "@/hooks/use-real-time-progress"
import { universalMintingEngineService } from "@/lib/api"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

type UploadStep = 'select' | 'metadata' | 'uploading' | 'complete'

export default function Upload() {
  const router = useRouter()
  const [isDragging, setIsDragging] = useState(false)
  const [currentStep, setCurrentStep] = useState<UploadStep>('select')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [operationId, setOperationId] = useState<string>('')

  // Enhanced real-time progress tracking
  const realTimeProgress = useRealTimeProgress({
    operationId,
    onComplete: (id) => {
      setCurrentStep('complete')
      setTimeout(() => {
        router.push(`/app/results?videoId=${id}`)
      }, 2000)
    },
    onError: (id, error) => {
      console.error('Upload error:', error)
    }
  })

  const {
    selectedFile,
    isUploading,
    uploadProgress,
    error,
    setSelectedFile,
    uploadVideo,
    clearError,
    validateFile,
  } = useVideoUpload({
    onUploadComplete: (videoId) => {
      realTimeProgress.complete('Video uploaded and processed successfully!')
      setCurrentStep('complete')
      // Redirect to results page after a short delay
      setTimeout(() => {
        router.push(`/app/results?videoId=${videoId}`)
      }, 2000)
    },
    onError: (error) => {
      realTimeProgress.fail(error)
      console.error('Upload error:', error)
      // Stay on current step to allow retry
    }
  })

  // Generate operation ID when upload starts
  useEffect(() => {
    if (isUploading && !operationId) {
      const newOperationId = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      setOperationId(newOperationId)
    }
  }, [isUploading, operationId])

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelection(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelection(files[0])
    }
  }

  const handleFileSelection = (file: File) => {
    setValidationError(null)
    clearError()
    
    // Validate the file
    const validation = validateFile(file)
    if (!validation.valid) {
      setValidationError(validation.error || 'Invalid file')
      return
    }

    setSelectedFile(file)
    setCurrentStep('metadata')
  }

  const handleMetadataSubmit = async (metadata: any) => {
    console.log('📋 [Upload Page] handleMetadataSubmit called');
    console.log('  - Metadata:', metadata);
    console.log('  - Selected file:', selectedFile?.name, selectedFile?.size);
    
    setCurrentStep('uploading')
    
    // Generate operation ID for real-time progress tracking
    const newOperationId = `upload-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    console.log('🆔 [Upload Page] Generated operation ID:', newOperationId);
    setOperationId(newOperationId)
    
    // Start real-time progress tracking
    console.log('📊 [Upload Page] Starting real-time progress tracking...');
    realTimeProgress.start('validating', 'Preparing to upload video...', {
      totalItems: 1,
      canCancel: true,
      canPause: false,
      subStages: [
        { name: 'File Validation', status: 'pending', percentage: 0 },
        { name: 'Upload to Server', status: 'pending', percentage: 0 },
        { name: 'Frame Extraction', status: 'pending', percentage: 0 },
        { name: 'Pose Detection', status: 'pending', percentage: 0 },
        { name: 'Analysis Complete', status: 'pending', percentage: 0 },
      ]
    })
    
    console.log('🚀 [Upload Page] Calling uploadVideo...');
    try {
      await uploadVideo(metadata, newOperationId)
      console.log('✅ [Upload Page] uploadVideo completed successfully');
    } catch (error) {
      console.error('❌ [Upload Page] uploadVideo failed:', error);
    }
  }

  const handleCancel = () => {
    setSelectedFile(null)
    setCurrentStep('select')
    setValidationError(null)
    clearError()
  }

  const formatFileSize = (bytes: number) => {
    return universalMintingEngineService.formatFileSize(bytes)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'select':
        return (
          <>
            <div className="mb-12 animate-fade-in-down">
              <h1 className="font-medium text-5xl md:text-6xl text-white mb-4 text-center">Upload or Record</h1>
              <p className="text-gray-400 text-center">
                Choose to upload a video of your routine or record one live with your webcam
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Upload Card */}
              <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`group relative rounded-xl border-2 border-dashed transition duration-300 cursor-pointer p-12 text-center animate-fade-in-up ${
                  isDragging
                    ? "border-green-400 bg-green-950/20"
                    : "border-green-900/30 hover:border-green-600/50 bg-black"
                }`}
                style={{ animationDelay: "0.1s" }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-green-400/5 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-green-500/50 transition-all duration-300">
                    <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-lg text-white mb-2">Upload Video</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Drag and drop your dance video here or click to browse
                  </p>
                  <p className="text-gray-500 text-xs">
                    Supports MP4, WebM, MOV, AVI • Max 500MB
                  </p>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                    onChange={handleFileSelect}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Record Card */}
              <Link href="/app/record">
                <div
                  className="group relative rounded-xl border border-green-900/30 hover:border-green-600/50 transition duration-300 cursor-pointer p-12 text-center bg-black h-full flex flex-col items-center justify-center animate-fade-in-up"
                  style={{ animationDelay: "0.2s" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-green-400/5 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-green-500/50 transition-all duration-300">
                      <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    </div>
                    <h3 className="font-medium text-lg text-white mb-2">Record Live</h3>
                    <p className="text-gray-400 text-sm">Use your webcam to record your moves</p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Validation Error */}
            {validationError && (
              <div className="mb-6 p-4 bg-red-950/30 border border-red-900/50 rounded-lg animate-scale-in">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-400 font-medium">Upload Error</p>
                </div>
                <p className="text-red-300 text-sm mt-1">{validationError}</p>
              </div>
            )}
          </>
        )

      case 'metadata':
        return (
          <>
            <div className="mb-8 animate-fade-in-down">
              <h1 className="font-medium text-4xl md:text-5xl text-white mb-4 text-center">Video Details</h1>
              <p className="text-gray-400 text-center">
                Tell us about your dance video to improve analysis accuracy
              </p>
            </div>

            {selectedFile && (
              <div className="mb-8">
                <div className="flex items-center gap-4 p-4 bg-gray-900/30 rounded-lg border border-green-900/30">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{selectedFile.name}</p>
                    <p className="text-gray-400 text-sm">{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>
              </div>
            )}

            <VideoMetadataForm
              onSubmit={handleMetadataSubmit}
              onCancel={handleCancel}
              isLoading={isUploading}
              fileName={selectedFile?.name}
            />
          </>
        )

      case 'uploading':
        return (
          <>
            <div className="mb-8 animate-fade-in-down">
              <h1 className="font-medium text-4xl md:text-5xl text-white mb-4 text-center">Analyzing Your Dance</h1>
              <p className="text-gray-400 text-center">
                Our AI is processing your video and analyzing your movements
              </p>
            </div>

            {/* Enhanced Real-Time Progress */}
            {operationId && (
              <RealTimeProgress
                operationId={operationId}
                title="Video Analysis"
                showNotifications={true}
                showSubStages={true}
                showTimeRemaining={true}
                allowCancel={true}
                onCancel={handleCancel}
                className="animate-fade-in-up mb-6"
              />
            )}

            {/* Fallback to original progress if real-time not available */}
            {!operationId && uploadProgress && (
              <UploadProgress
                progress={uploadProgress}
                fileName={selectedFile?.name}
                className="animate-fade-in-up"
              />
            )}

            {error && (
              <div className="mt-6 p-4 bg-red-950/30 border border-red-900/50 rounded-lg animate-scale-in">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-400 font-medium">Processing Error</p>
                </div>
                <p className="text-red-300 text-sm">{error}</p>
                <div className="mt-4 flex gap-3">
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="border-red-600/50 text-red-400 hover:bg-red-950/30 bg-transparent"
                  >
                    Start Over
                  </Button>
                  <Button
                    onClick={() => selectedFile && handleMetadataSubmit({})}
                    className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 text-black font-medium"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            )}
          </>
        )

      case 'complete':
        return (
          <>
            <div className="mb-8 animate-fade-in-down text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto mb-6 flex items-center justify-center animate-scale-in">
                <svg className="w-10 h-10 text-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="font-medium text-4xl md:text-5xl text-white mb-4">Analysis Complete!</h1>
              <p className="text-gray-400">
                Your dance video has been successfully analyzed. Redirecting to results...
              </p>
            </div>
          </>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <AppNavbar />

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden min-h-[calc(100vh-120px)]">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500/5 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative max-w-2xl mx-auto">
          {renderStepContent()}
        </div>
      </section>

      <Footer />
    </div>
  )
}
