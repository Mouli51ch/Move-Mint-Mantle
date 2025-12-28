"use client"

import { useEffect, useRef } from "react"
import { PoseFrame } from "@/lib/types/api"

interface DancePoseVisualizationProps {
  poseFrames: PoseFrame[]
  currentFrameIndex: number
  videoRef?: React.RefObject<HTMLVideoElement>
  className?: string
}

export function DancePoseVisualization({ 
  poseFrames, 
  currentFrameIndex, 
  videoRef,
  className = "" 
}: DancePoseVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Dance-specific keypoint connections for better visualization
  const danceConnections = [
    // Head and neck
    [0, 1], [0, 2], [1, 3], [2, 4],
    // Torso - emphasize core for dance
    [5, 6], [5, 11], [6, 12], [11, 12],
    // Arms - important for dance expression
    [5, 7], [7, 9], [6, 8], [8, 10],
    // Legs - critical for dance movements
    [11, 13], [13, 15], [12, 14], [14, 16]
  ]

  // Dance-specific keypoint colors
  const getDanceKeypointColor = (index: number): string => {
    if (index <= 4) return '#ff6b6b' // Head - red for expression
    if (index >= 5 && index <= 10) return '#4ecdc4' // Arms - teal for grace
    if (index >= 11 && index <= 16) return '#45b7d1' // Legs - blue for movement
    return '#95e1d3' // Default - mint green
  }

  // Enhanced skeleton drawing for dance visualization
  const drawDanceSkeleton = (canvas: HTMLCanvasElement, poseFrame: PoseFrame) => {
    if (!canvas || !poseFrame || !poseFrame.keypoints) {
      // Only log errors, not every missing frame
      return
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: false })
    if (!ctx) {
      return
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set up drawing style
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // Draw connections with dance-specific styling
    ctx.lineWidth = 3
    ctx.globalAlpha = 0.8

    danceConnections.forEach(([i, j]) => {
      const pointA = poseFrame.keypoints[i]
      const pointB = poseFrame.keypoints[j]

      if (pointA && pointB && 
          (pointA.confidence || pointA.visibility || 0) > 0.3 && 
          (pointB.confidence || pointB.visibility || 0) > 0.3) {
        // Use gradient for more elegant lines
        const gradient = ctx.createLinearGradient(pointA.x, pointA.y, pointB.x, pointB.y)
        gradient.addColorStop(0, getDanceKeypointColor(i))
        gradient.addColorStop(1, getDanceKeypointColor(j))
        
        ctx.strokeStyle = gradient
        ctx.beginPath()
        ctx.moveTo(pointA.x, pointA.y)
        ctx.lineTo(pointB.x, pointB.y)
        ctx.stroke()
      }
    })

    // Draw keypoints with enhanced styling
    ctx.globalAlpha = 1.0
    poseFrame.keypoints.forEach((point, index) => {
      const confidence = point.confidence || point.visibility || 0
      if (point && confidence > 0.3) {
        const color = getDanceKeypointColor(index)
        
        // Draw outer glow
        ctx.shadowColor = color
        ctx.shadowBlur = 8
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI)
        ctx.fill()

        // Draw inner highlight
        ctx.shadowBlur = 0
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI)
        ctx.fill()

        // Add confidence indicator
        if (confidence > 0.8) {
          ctx.strokeStyle = '#00ff00'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(point.x, point.y, 10, 0, 2 * Math.PI)
          ctx.stroke()
        }
      }
    })

    // Reset shadow
    ctx.shadowBlur = 0
  }

  // Update visualization when frame changes
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !poseFrames || poseFrames.length === 0) {
      // Only log once when no data is available
      if (poseFrames?.length === 0) {
        console.log('🎨 [DancePoseVisualization] No pose frames available')
      }
      return
    }

    const frameIndex = Math.max(0, Math.min(currentFrameIndex, poseFrames.length - 1))
    const currentFrame = poseFrames[frameIndex]
    
    // Only log occasionally to reduce console spam
    if (frameIndex % 15 === 0) {
      console.log('🎨 [DancePoseVisualization] Drawing frame:', frameIndex, 'keypoints:', currentFrame?.keypoints?.length)
    }
    
    if (currentFrame) {
      drawDanceSkeleton(canvas, currentFrame)
    }
  }, [currentFrameIndex, poseFrames])

  // Sync with video if provided
  useEffect(() => {
    const video = videoRef?.current
    const canvas = canvasRef.current

    if (!video || !canvas || !poseFrames || poseFrames.length === 0) {
      return
    }

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime
      const videoDuration = video.duration || 1
      const totalFrames = poseFrames.length

      // Calculate frame index based on video time
      const frameIndex = Math.floor((currentTime / videoDuration) * totalFrames)
      const clampedIndex = Math.max(0, Math.min(frameIndex, totalFrames - 1))

      const currentFrame = poseFrames[clampedIndex]
      if (currentFrame) {
        drawDanceSkeleton(canvas, currentFrame)
      }
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('seeked', handleTimeUpdate)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('seeked', handleTimeUpdate)
    }
  }, [poseFrames, videoRef])

  if (!poseFrames || poseFrames.length === 0) {
    return (
      <div className={`bg-gradient-to-br from-green-950/10 to-black rounded-xl border-2 border-green-900/30 aspect-video flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="text-6xl mb-4">🩰</div>
          <p className="text-green-400 font-medium">Dance Analysis Pending</p>
          <p className="text-gray-500 text-sm mt-2">
            Pose detection will appear here after analysis
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gradient-to-br from-green-950/10 to-black rounded-xl border-2 border-green-900/30 aspect-video relative overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className="w-full h-full object-contain"
      />
      
      {/* Frame info overlay */}
      <div className="absolute bottom-4 left-4 bg-black/70 px-3 py-1 rounded-lg">
        <p className="text-xs text-green-400">
          Dance Pose Analysis - Frame {currentFrameIndex + 1} / {poseFrames.length}
        </p>
        <p className="text-xs text-gray-400">
          Confidence: {poseFrames[currentFrameIndex]?.confidence ? Math.round(poseFrames[currentFrameIndex].confidence * 100) : 0}%
        </p>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-black/70 px-3 py-2 rounded-lg">
        <div className="text-xs space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <span className="text-gray-300">Head</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-teal-400"></div>
            <span className="text-gray-300">Arms</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
            <span className="text-gray-300">Legs</span>
          </div>
        </div>
      </div>
    </div>
  )
}