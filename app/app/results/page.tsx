"use client"

import { AppNavbar } from "@/components/app-navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState, useRef } from "react"
import { universalMintingEngineService } from "@/lib/api/service"
import { DanceAnalysisResults, DanceMovement, AnalysisQuality } from "@/lib/types/api"
import { DanceAnalysisDisplay } from "@/components/ui/dance-analysis-display"
import { DancePoseVisualization } from "@/components/ui/dance-pose-visualization"
import { useSession } from "@/hooks/use-session"
import { transformAnalysisResults } from "@/lib/utils/dance-content-transformer"

export default function Results() {
  const [recordingData, setRecordingData] = useState<{
    poseFrames: number
    duration: number
    recordedAt: string
    videoData?: string
    poseKeypoints?: any[]
  } | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [uploadingFile, setUploadingFile] = useState(false)
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0)
  
  // New API integration state
  const [analysisResults, setAnalysisResults] = useState<DanceAnalysisResults | null>(null)
  const [loadingAnalysis, setLoadingAnalysis] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [videoId, setVideoId] = useState<string | null>(null)

  // Session management
  const { 
    saveAnalysis, 
    analysisSession, 
    getCurrentVideoId,
    updateWorkflowStep 
  } = useSession()

  const videoRef = useRef<HTMLVideoElement>(null)
  const skeletonCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // Load recording data from sessionStorage
    const stored = sessionStorage.getItem('moveMintRecording')
    if (stored) {
      const data = JSON.parse(stored)
      setRecordingData(data)
      // Convert base64 back to blob URL
      if (data.videoData) {
        setVideoUrl(data.videoData)
      }
    }

    // Load video ID from session service
    const storedVideoId = getCurrentVideoId()
    if (storedVideoId) {
      setVideoId(storedVideoId)
      
      // Check if we already have analysis results in session
      if (analysisSession && analysisSession.videoId === storedVideoId) {
        // Transform existing results if they haven't been transformed yet
        const results = analysisSession.analysisResults.danceMetrics 
          ? analysisSession.analysisResults 
          : transformAnalysisResults(analysisSession.analysisResults)
        
        setAnalysisResults(results)
        updateWorkflowStep('results')
      } else {
        fetchAnalysisResults(storedVideoId)
      }
    }
  }, [])

  // Fetch analysis results from Universal Minting Engine API
  const fetchAnalysisResults = async (videoId: string) => {
    setLoadingAnalysis(true)
    setAnalysisError(null)

    try {
      const rawResults = await universalMintingEngineService.getAnalysisResults(videoId)
      
      // Transform generic movement data to dance-specific terminology
      const transformedResults = transformAnalysisResults(rawResults)
      
      setAnalysisResults(transformedResults)
      
      // Save transformed analysis results to session
      saveAnalysis({
        videoId,
        analysisResults: transformedResults,
        analysisCompletedAt: Date.now(),
        qualityScore: transformedResults.qualityMetrics.overall,
      })
      
      // Update workflow step
      updateWorkflowStep('results')
      
      // Update local recording data with API results
      if (results.poseData && results.poseData.length > 0) {
        const updatedRecordingData = {
          ...recordingData,
          poseFrames: results.poseData.length,
          duration: results.duration,
          poseKeypoints: results.poseData.map(frame => ({
            keypoints: frame.keypoints,
            confidence: frame.confidence
          }))
        }
        setRecordingData(updatedRecordingData)
        sessionStorage.setItem('moveMintRecording', JSON.stringify(updatedRecordingData))
      }
    } catch (error) {
      console.error('Failed to fetch analysis results:', error)
      setAnalysisError(error instanceof Error ? error.message : 'Failed to load analysis results')
    } finally {
      setLoadingAnalysis(false)
    }
  }

  // Retry analysis fetch
  const retryAnalysis = () => {
    if (videoId) {
      fetchAnalysisResults(videoId)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingFile(true)

    try {
      // Read video file
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64data = reader.result as string
        setVideoUrl(base64data)

        // Extract video metadata
        const video = document.createElement('video')
        video.preload = 'metadata'
        video.onloadedmetadata = () => {
          const duration = Math.round(video.duration)
          const newRecordingData = {
            poseFrames: 0, // Will be analyzed when pose detection is added
            duration: duration,
            recordedAt: new Date().toISOString(),
            videoData: base64data
          }
          setRecordingData(newRecordingData)
          sessionStorage.setItem('moveMintRecording', JSON.stringify(newRecordingData))
          setUploadingFile(false)
        }
        video.src = base64data
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('File upload error:', error)
      alert('Failed to upload video file')
      setUploadingFile(false)
    }
  }

  const handleUploadToAPI = async () => {
    if (!recordingData) {
      alert('No recording data to upload')
      return
    }

    setUploading(true)
    setUploadStatus('idle')

    try {
      const payload = {
        poseFrames: recordingData.poseFrames,
        duration: recordingData.duration,
        recordedAt: recordingData.recordedAt,
        // Video URL is a blob URL, can't be sent directly
        // In production, you'd upload the actual video file
        metadata: {
          frameRate: recordingData.poseFrames > 0 ? Math.round(recordingData.poseFrames / recordingData.duration) : 0,
          quality: recordingData.poseFrames > 300 ? 'Excellent' :
                   recordingData.poseFrames > 150 ? 'Good' :
                   recordingData.poseFrames > 50 ? 'Fair' : 'Low'
        }
      }

      const response = await fetch('/api/upload-recording', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const result = await response.json()
      console.log('Upload successful:', result)
      setUploadStatus('success')
    } catch (error) {
      console.error('Upload error:', error)
      setUploadStatus('error')
    } finally {
      setUploading(false)
    }
  }

  // Draw skeleton on canvas
  const drawSkeleton = (canvas: HTMLCanvasElement, pose: any) => {
    if (!canvas || !pose || !pose.keypoints) {
      return
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: false })
    if (!ctx) {
      return
    }

    // Clear the canvas efficiently
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set drawing style - remove shadow for performance
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // COCO Pose connections (17 keypoints)
    const connections = [
      // Head
      [0, 1], [0, 2], [1, 3], [2, 4],
      // Torso
      [5, 6], [5, 11], [6, 12], [11, 12],
      // Left arm
      [5, 7], [7, 9],
      // Right arm
      [6, 8], [8, 10],
      // Left leg
      [11, 13], [13, 15],
      // Right leg
      [12, 14], [14, 16]
    ]

    // Draw connections first with optimized rendering
    ctx.strokeStyle = '#00ff00'
    ctx.lineWidth = 4
    ctx.globalAlpha = 0.8
    ctx.beginPath()

    connections.forEach(([i, j]) => {
      const pointA = pose.keypoints[i]
      const pointB = pose.keypoints[j]

      if (pointA && pointB && pointA.confidence > 0.3 && pointB.confidence > 0.3) {
        ctx.moveTo(pointA.x, pointA.y)
        ctx.lineTo(pointB.x, pointB.y)
      }
    })

    ctx.stroke()

    // Draw keypoints on top with batch rendering
    ctx.globalAlpha = 1.0
    pose.keypoints.forEach((point: any, index: number) => {
      if (point && point.confidence > 0.3) {
        // Different colors for different body parts
        if (index <= 4) ctx.fillStyle = '#ff3333' // head - red
        else if (index <= 10) ctx.fillStyle = '#00ff00' // arms - green
        else ctx.fillStyle = '#3333ff' // legs - blue

        ctx.beginPath()
        ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI)
        ctx.fill()

        // White border for visibility
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2
        ctx.stroke()
      }
    })

    // Reset alpha
    ctx.globalAlpha = 1.0
  }

  // Sync skeleton with video playback
  useEffect(() => {
    const video = videoRef.current
    const canvas = skeletonCanvasRef.current

    if (!video || !canvas || !recordingData?.poseKeypoints) {
      return
    }

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime
      const totalDuration = recordingData.duration
      const totalFrames = recordingData.poseKeypoints?.length || 0

      if (totalFrames === 0) return

      // Calculate which pose frame to display based on video time
      const frameIndex = Math.floor((currentTime / totalDuration) * totalFrames)
      const clampedIndex = Math.max(0, Math.min(frameIndex, totalFrames - 1))

      setCurrentPoseIndex(clampedIndex)

      // Draw the skeleton for this frame
      const poseFrame = recordingData.poseKeypoints[clampedIndex]
      if (poseFrame) {
        drawSkeleton(canvas, poseFrame)
      }
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('seeked', handleTimeUpdate)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('seeked', handleTimeUpdate)
    }
  }, [recordingData])

  // Calculate stats from actual recording
  const stats = recordingData ? {
    totalFrames: recordingData.poseFrames,
    duration: recordingData.duration,
    frameRate: recordingData.poseFrames > 0 ? Math.round(recordingData.poseFrames / recordingData.duration) : 0,
    quality: recordingData.poseFrames === 0 ? 'Pending Analysis' :
             recordingData.poseFrames > 300 ? 'Excellent' :
             recordingData.poseFrames > 150 ? 'Good' :
             recordingData.poseFrames > 50 ? 'Fair' : 'Low',
    qualityScore: recordingData.poseFrames > 0 ? Math.min(100, Math.round((recordingData.poseFrames / 500) * 100)) : 0
  } : null

  // Show actual detected data instead of mock movements
  const detectedMovements = stats ? [
    {
      name: "Move Detection",
      confidence: stats.qualityScore,
      reps: stats.totalFrames > 0 ? `${stats.totalFrames} frames` : "Awaiting analysis",
      description: stats.totalFrames > 0 ? `${stats.quality} quality - ${stats.frameRate} FPS` : `${stats.quality} - Upload recorded to analyze`
    },
    {
      name: "Body Tracking",
      confidence: stats.totalFrames > 0 ? (stats.qualityScore > 70 ? 95 : stats.qualityScore) : 0,
      reps: `${stats.duration}s`,
      description: stats.totalFrames > 0 ? "Full body skeleton detected" : "Will detect skeleton on analysis"
    },
    {
      name: "Move Analysis",
      confidence: stats.totalFrames > 0 ? 100 : 0,
      reps: stats.totalFrames > 0 ? "Ready" : "Pending",
      description: stats.totalFrames > 0 ? "AI analysis pipeline active" : "Analyze video to begin"
    },
  ] : [
    { name: "No recording data", confidence: 0, reps: "0", description: "Please record a video first" }
  ]

  // Determine if we should show API results or fallback data
  const shouldShowAPIResults = analysisResults && analysisResults.detectedMovements.length > 0
  const hasAnalysisData = shouldShowAPIResults || (stats && stats.totalFrames > 0)

  return (
    <div className="min-h-screen bg-black">
      <AppNavbar />

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 -right-40 w-80 h-80 bg-green-600/5 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative max-w-5xl mx-auto">
          <div className="mb-12 animate-fade-in-down">
            <Link
              href="/app/record"
              className="text-gray-400 hover:text-green-400 text-sm mb-6 inline-block transition duration-300"
            >
              ← Record Another Video
            </Link>
            <h1 className="font-medium text-5xl text-white mb-3">Detection Results</h1>
            <p className="text-gray-400">
              {loadingAnalysis
                ? "Analyzing your dance video with AI-powered movement detection..."
                : shouldShowAPIResults
                ? `Dance analysis complete: ${analysisResults.detectedMovements.length} movements detected in ${analysisResults.duration}s video`
                : stats
                ? stats.totalFrames > 0
                  ? `Local pose detection complete: ${stats.totalFrames} frames captured in ${stats.duration}s`
                  : `Video uploaded (${stats.duration}s duration). Connect to API for full dance analysis.`
                : "No recording data available. Please record a video first."
              }
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Original Video */}
            <div
              className="bg-black rounded-xl overflow-hidden border-2 border-green-900/30 aspect-video flex items-center justify-center animate-fade-in-up relative"
              style={{ animationDelay: "0.1s" }}
            >
              {videoUrl ? (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  controls
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                >
                  Your browser does not support video playback.
                </video>
              ) : (
                <div className="text-center p-8">
                  <svg
                    className="w-16 h-16 text-green-500/30 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-gray-500 text-sm mb-4">No video available</p>
                  <label
                    htmlFor="video-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-950/30 border border-green-600/50 text-green-400 rounded-lg cursor-pointer hover:bg-green-950/50 transition duration-300 text-sm"
                  >
                    {uploadingFile ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span>Upload Video</span>
                      </>
                    )}
                  </label>
                  <input
                    id="video-upload"
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploadingFile}
                  />
                </div>
              )}
            </div>

            {/* Enhanced Dance Pose Visualization */}
            <div
              className="animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              <DancePoseVisualization
                poseFrames={analysisResults?.poseData || []}
                currentFrameIndex={currentPoseIndex}
                videoRef={videoRef}
              />
            </div>
          </div>

          {/* Analysis Results Display */}
          <div
            className="mb-12 animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            {loadingAnalysis ? (
              <div className="bg-black border border-green-900/30 rounded-xl p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-green-400">Loading dance analysis results...</p>
              </div>
            ) : analysisError ? (
              <div className="bg-black border border-red-900/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-red-400">Analysis Error</h3>
                  <button
                    onClick={retryAnalysis}
                    className="text-sm text-green-400 hover:text-green-300 transition duration-300"
                  >
                    Retry Analysis
                  </button>
                </div>
                <p className="text-gray-400">{analysisError}</p>
              </div>
            ) : shouldShowAPIResults ? (
              <DanceAnalysisDisplay
                movements={analysisResults.detectedMovements}
                qualityMetrics={analysisResults.qualityMetrics}
                recommendations={analysisResults.recommendations}
                onReanalyze={videoId ? () => fetchAnalysisResults(videoId) : undefined}
              />
            ) : (
              // Fallback to original table for local data
              <div className="bg-black rounded-xl border border-green-900/30 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-green-900/30">
                        <th className="px-6 py-4 text-left text-sm font-medium text-green-400">Detection Type</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-green-400">Accuracy</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-green-400">Data Captured</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detectedMovements.map((movement, i) => (
                        <tr
                          key={i}
                          className="border-b border-green-900/20 last:border-b-0 hover:bg-green-950/20 transition duration-300"
                        >
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm text-white font-medium">{movement.name}</div>
                              <div className="text-xs text-gray-500 mt-1">{(movement as any).description}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-green-950/50 rounded-full h-2 overflow-hidden border border-green-900/50">
                                <div
                                  className="bg-gradient-to-r from-green-400 to-green-600 h-full shadow-lg shadow-green-500/50 transition-all duration-500"
                                  style={{ width: `${movement.confidence}%` }}
                                />
                              </div>
                              <span className="text-xs text-green-400">{movement.confidence}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-300">{movement.reps}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <Button
              onClick={handleUploadToAPI}
              disabled={!recordingData || uploading}
              className="flex-1 bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-300 hover:to-blue-500 text-black font-medium py-3 h-auto text-base shadow-lg shadow-blue-500/30 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : uploadStatus === 'success' ? '✓ Uploaded' : uploadStatus === 'error' ? 'Upload Failed' : 'Upload to API'}
            </Button>
            <Link href="/app/mint" className="flex-1">
              <Button className="w-full bg-gradient-to-r from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 text-black font-medium py-3 h-auto text-base shadow-lg shadow-green-500/30 transition duration-300">
                Continue to Minting
              </Button>
            </Link>
            <Link href="/app/upload" className="flex-1">
              <Button className="w-full border-green-600/50 text-green-400 hover:bg-green-950/30 bg-black border transition duration-300">
                Analyze Another Video
              </Button>
            </Link>
          </div>

          <div
            className="mt-12 bg-black border border-green-900/30 p-6 rounded-xl animate-fade-in-up"
            style={{ animationDelay: "0.5s" }}
          >
            <h3 className="font-medium text-lg text-white mb-4">
              {stats ? "Real-Time Pose Detection Results" : "Getting Started"}
            </h3>
            {stats ? (
              <div className="space-y-3 text-sm">
                <p className="text-gray-400">
                  Your recording was analyzed using MoveNet AI, capturing{" "}
                  <span className="text-green-400 font-medium">{stats.totalFrames} pose frames</span> over{" "}
                  <span className="text-green-400 font-medium">{stats.duration} seconds</span>.
                </p>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-green-950/20 border border-green-900/30 p-3 rounded">
                    <div className="text-xs text-gray-500">Frame Rate</div>
                    <div className="text-xl text-green-400 font-bold">{stats.frameRate} FPS</div>
                  </div>
                  <div className="bg-green-950/20 border border-green-900/30 p-3 rounded">
                    <div className="text-xs text-gray-500">Quality</div>
                    <div className="text-xl text-green-400 font-bold">{stats.quality}</div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  💡 Advanced move recognition (pirouettes, grand jetés, etc.) coming soon!
                </p>
              </div>
            ) : (
              <ul className="space-y-2 text-sm text-gray-400">
                {[
                  "Record a video on the record page to see results",
                  "Ensure good lighting for best detection quality",
                  "Keep your full body in frame during recording",
                  "Move deliberately for accurate tracking",
                ].map((tip, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2"
                  >
                    <span className="text-green-400">→</span> {tip}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
