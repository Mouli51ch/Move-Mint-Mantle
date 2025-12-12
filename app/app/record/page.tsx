"use client"

import { AppNavbar } from "@/components/app-navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"

import Link from "next/link"
import { useRef, useState, useEffect } from "react"

export default function Record() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null)
  const splitCanvasRef = useRef<HTMLCanvasElement>(null)
  const playbackVideoRef = useRef<HTMLVideoElement>(null)
  const playbackCanvasRef = useRef<HTMLCanvasElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  
  const [isRecording, setIsRecording] = useState(false)
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([])
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [viewMode, setViewMode] = useState<'overlay' | 'split'>('overlay')
  const [showPlayback, setShowPlayback] = useState(false)
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string>('')
  const [poseData, setPoseData] = useState<any[]>([])

  const streamRef = useRef<MediaStream | null>(null)
  const [browserSupported, setBrowserSupported] = useState(true)
  const [poseDetectionReady, setPoseDetectionReady] = useState(false)
  const poseRef = useRef<any>(null)

  // Initialize TensorFlow.js Pose Detection
  useEffect(() => {
    const initializePose = async () => {
      // Only run on client side
      if (typeof window === 'undefined') {
        console.log('🤖 [POSE] Skipping pose detection initialization on server')
        return
      }

      try {
        console.log('🤖 [POSE] Loading Pose Detection API...')

        // Dynamic import to avoid SSR issues - use new unified API
        const [tf, poseDetection] = await Promise.all([
          import('@tensorflow/tfjs-core'),
          import('@tensorflow-models/pose-detection')
        ])

        // Register WebGL backend - must be imported before tf.ready()
        await import('@tensorflow/tfjs-backend-webgl')

        // Initialize TensorFlow.js backend
        await tf.ready()
        console.log('🤖 [POSE] TensorFlow.js backend ready')

        // Create MoveNet detector (faster and more accurate than PoseNet)
        console.log('🤖 [POSE] Creating MoveNet detector...')

        // Use MoveNet SinglePose Lightning model for real-time detection
        const detectorConfig = {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING
        }

        console.log('🤖 [POSE] MoveNet config:', detectorConfig)

        const detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          detectorConfig
        )

        poseRef.current = detector
        setPoseDetectionReady(true)
        console.log('🤖 [POSE] Pose Detection ready!')

      } catch (error) {
        console.error('🤖 [POSE] Failed to initialize Pose Detection:', error)
        console.error('🤖 [POSE] Error details:', error instanceof Error ? error.message : String(error), error instanceof Error ? error.stack : '')
        setPoseDetectionReady(false)
      }
    }
    
    const checkBrowserSupport = () => {
      const isSupported = 
        typeof window !== 'undefined' &&
        !!navigator?.mediaDevices?.getUserMedia &&
        typeof window.MediaRecorder !== 'undefined'
      
      setBrowserSupported(isSupported)
      
      if (!isSupported) {
        console.warn('Browser does not support required APIs for camera recording')
      } else {
        initializePose()
      }
    }
    
    checkBrowserSupport()
  }, [])

  const startCamera = async () => {
    console.log('🎥 [CAMERA] Starting camera...')
    try {
      // Check if we're in a browser environment and if MediaDevices API is supported
      if (typeof window === 'undefined' || !navigator?.mediaDevices?.getUserMedia) {
        throw new Error('Camera access is not supported in this environment. Please use HTTPS and a modern browser.')
      }

      console.log('🎥 [CAMERA] Requesting user media...')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: true,
      })
      console.log('🎥 [CAMERA] Stream obtained:', stream.getTracks().map(t => `${t.kind}: ${t.label}`))
      streamRef.current = stream
      
      // Set up video element with the stream
      if (videoRef.current) {
        console.log('🎥 [CAMERA] Setting video srcObject...')
        videoRef.current.srcObject = stream
        
        videoRef.current.onloadedmetadata = () => {
          console.log('🎥 [CAMERA] Video metadata loaded')
          if (videoRef.current) {
            const video = videoRef.current
            console.log('🎥 [CAMERA] Video dimensions:', video.videoWidth, 'x', video.videoHeight)
            
            // Set canvas dimensions for both overlay and split canvases
            if (overlayCanvasRef.current) {
              overlayCanvasRef.current.width = video.videoWidth
              overlayCanvasRef.current.height = video.videoHeight
              overlayCanvasRef.current.style.width = '100%'
              overlayCanvasRef.current.style.height = '100%'
              console.log('🎨 [CANVAS] Overlay canvas dimensions set to:', overlayCanvasRef.current.width, 'x', overlayCanvasRef.current.height)
            }
            
            if (splitCanvasRef.current) {
              splitCanvasRef.current.width = video.videoWidth
              splitCanvasRef.current.height = video.videoHeight
              console.log('🎨 [CANVAS] Split canvas dimensions set to:', splitCanvasRef.current.width, 'x', splitCanvasRef.current.height)
            }
          }
        }
        
        // Add a playing event listener to ensure video is actually playing
        videoRef.current.onplaying = () => {
          console.log('🎥 [CAMERA] Video is playing, pose detection ready:', poseDetectionReady)
          if (poseDetectionReady) {
            // Add a small delay to ensure video is fully ready
            setTimeout(() => {
              console.log('🤖 [POSE] Starting pose detection from video playing event')
              startPoseDetection()
            }, 100)
          }
        }
        
        // Add more event listeners to track video state
        videoRef.current.onloadstart = () => console.log('🎥 [CAMERA] Video load start')
        videoRef.current.onloadeddata = () => console.log('🎥 [CAMERA] Video data loaded')
        videoRef.current.oncanplaythrough = () => console.log('🎥 [CAMERA] Video can play through')
        videoRef.current.ontimeupdate = () => {
          // Only log occasionally to avoid spam and check if video still exists
          if (videoRef.current && Math.floor(videoRef.current.currentTime * 10) % 10 === 0) {
            console.log('🎥 [CAMERA] Video time update:', videoRef.current.currentTime)
          }
        }

        // Add more video event listeners for debugging
        videoRef.current.oncanplay = () => {
          console.log('🎥 [CAMERA] Video can play')
        }
        
        videoRef.current.oncanplaythrough = () => {
          console.log('🎥 [CAMERA] Video can play through')
        }
        
        videoRef.current.onerror = (e) => {
          console.error('🎥 [CAMERA] Video error:', e)
        }
      }
      console.log('🎥 [CAMERA] Setting camera active state to true')
      setIsCameraActive(true)
    } catch (err) {
      console.error("🎥 [CAMERA] Error accessing camera:", err)
      const errorMessage = err instanceof Error ? err.message : "Unable to access camera. Please check permissions and ensure you're using HTTPS."
      alert(errorMessage)
    }
  }

  const stopCamera = () => {
    console.log('🎥 [CAMERA] Stopping camera...')
    if (streamRef.current) {
      console.log('🎥 [CAMERA] Stopping all tracks:', streamRef.current.getTracks().length)
      streamRef.current.getTracks().forEach((track) => {
        console.log('🎥 [CAMERA] Stopping track:', track.kind, track.label)
        track.stop()
      })
      if (animationFrameRef.current) {
        console.log('🤖 [POSE] Canceling animation frame:', animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      console.log('🎥 [CAMERA] Clearing video srcObject')
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
      streamRef.current = null
      setIsCameraActive(false)
      setIsRecording(false)
      setRecordingTime(0)
      setShowPlayback(false)
      console.log('🎥 [CAMERA] Camera stopped successfully')
    }
  }

  const startRecording = () => {
    if (!streamRef.current) return

    // Check if MediaRecorder is supported
    if (typeof window.MediaRecorder === 'undefined') {
      alert('Video recording is not supported in this browser.')
      return
    }

    const options = { mimeType: "video/webm" }
    const chunks: Blob[] = []

    mediaRecorderRef.current = new MediaRecorder(streamRef.current, options)

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data)
      }
    }

    mediaRecorderRef.current.onstop = () => {
      setRecordedChunks(chunks)
      const blob = new Blob(chunks, { type: "video/webm" })
      const url = URL.createObjectURL(blob)
      setRecordedVideoUrl(url)
      setShowPlayback(true)
      setViewMode('split')
    }

    mediaRecorderRef.current.start()
    setIsRecording(true)
    setRecordingTime(0)
    setPoseData([]) // Reset pose data for new recording

    // Store recording start time for proper pose data timestamps
    // const recordingStartTime = Date.now() // TODO: Use this for proper timestamp calculation

    const interval = setInterval(() => {
      setRecordingTime((prev) => prev + 1)
    }, 1000)

    const originalStop = mediaRecorderRef.current.stop.bind(mediaRecorderRef.current)
    mediaRecorderRef.current.stop = () => {
      clearInterval(interval)
      originalStop()
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const downloadRecording = () => {
    if (recordedChunks.length === 0) return

    const blob = new Blob(recordedChunks, { type: "video/webm" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "movement-recording.webm"
    a.click()
  }

  const proceedWithRecording = async () => {
    // Store pose data for analysis on results page
    if (poseData.length > 0 && recordedChunks.length > 0) {
      const blob = new Blob(recordedChunks, { type: "video/webm" })

      // Convert blob to base64 for storage
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64data = reader.result as string
        const recordingData = {
          poseFrames: poseData.length,
          duration: recordingTime,
          recordedAt: new Date().toISOString(),
          videoData: base64data, // Store base64 instead of blob URL
          poseKeypoints: poseData // Store all pose keypoints for skeleton visualization
        }
        sessionStorage.setItem('moveMintRecording', JSON.stringify(recordingData))
        window.location.href = "/app/results"
      }
      reader.readAsDataURL(blob)
    } else {
      window.location.href = "/app/results"
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Real pose detection using TensorFlow.js Pose Detection API
  const detectPose = async (video: HTMLVideoElement) => {
    if (!poseRef.current || !poseDetectionReady) {
      console.log('🤖 [POSE] Cannot detect pose - model not ready:', { hasModel: !!poseRef.current, ready: poseDetectionReady })
      return
    }

    // Check if video has valid dimensions
    if (!video.videoWidth || !video.videoHeight || video.videoWidth === 0 || video.videoHeight === 0) {
      console.log('🤖 [POSE] Video dimensions invalid:', video.videoWidth, 'x', video.videoHeight)
      return
    }

    // Check if video is actually playing
    if (video.paused || video.ended || video.readyState < 2) {
      console.log('🤖 [POSE] Video not ready for pose detection:', {
        paused: video.paused,
        ended: video.ended,
        readyState: video.readyState,
        currentTime: video.currentTime
      })
      return
    }

    try {
      console.log('🤖 [POSE] Running pose estimation on video:', video.videoWidth, 'x', video.videoHeight, 'readyState:', video.readyState)

      // Use the new Pose Detection API
      let poses = null

      try {
        console.log('🤖 [POSE] Running pose estimation with MoveNet...')

        // Use new unified Pose Detection API
        poses = await poseRef.current.estimatePoses(video)

        console.log('🤖 [POSE] Pose estimation result:', poses ? `${poses.length} pose(s) detected` : 'no poses detected')

        if (poses && poses.length > 0) {
          const pose = poses[0] // Get the first detected pose
          console.log('🤖 [POSE] Full pose structure:', {
            score: pose.score,
            keypointCount: pose.keypoints?.length,
            sampleKeypoint: pose.keypoints?.[0],
            keypointKeys: pose.keypoints?.[0] ? Object.keys(pose.keypoints[0]) : [],
            allKeypoints: pose.keypoints?.slice(0, 3).map((kp: any, i: number) => ({
              index: i,
              name: kp.name,
              x: kp.x,
              y: kp.y,
              score: kp.score
            }))
          })
        }

      } catch (error) {
        console.error('🤖 [POSE] Pose estimation failed:', error)
        return
      }

      // Process the first detected pose
      if (poses && poses.length > 0) {
        const pose = poses[0]

        console.log('🤖 [POSE] Processing pose with', pose.keypoints?.length, 'keypoints, score:', pose.score)

        // Debug: Log raw pose data
        if (pose.keypoints && pose.keypoints.length > 0) {
          console.log('🤖 [POSE] Raw keypoint sample:', {
            keypoint0: pose.keypoints[0],
            keypoint5: pose.keypoints[5],
            structure: Object.keys(pose.keypoints[0]),
            fullKeypoint0: JSON.stringify(pose.keypoints[0], null, 2)
          })
        }

        const poseData = {
          keypoints: pose.keypoints.map((keypoint: any) => ({
            // New Pose Detection API structure: keypoint has x, y, score, name directly
            x: keypoint.x ?? 0,
            y: keypoint.y ?? 0,
            confidence: keypoint.score ?? 0,
            name: keypoint.name ?? 'unknown'
          })),
          timestamp: Date.now(),
          overallScore: pose.score ?? 0
        }
        
        console.log('🤖 [POSE] Processed pose data:', poseData.keypoints.length, 'keypoints')
        
        // Verify we have valid coordinates
        const validKeypoints = poseData.keypoints.filter((kp: any) => kp.x > 0 || kp.y > 0)
        const highConfidenceKeypoints = poseData.keypoints.filter((kp: any) => kp.confidence > 0.5)
        
        console.log('🤖 [POSE] Coordinate validation:', {
          totalKeypoints: poseData.keypoints.length,
          validCoordinates: validKeypoints.length,
          highConfidence: highConfidenceKeypoints.length,
          overallScore: poseData.overallScore,
          sampleValid: validKeypoints.slice(0, 2),
          sampleProcessed: poseData.keypoints.slice(0, 2)
        })
        
        if (isRecording) {
          console.log('📹 [RECORD] Recording pose data, frame count:', poseData.keypoints.length, 'time:', recordingTime)
          setPoseData(prev => {
            const newData = [...prev, { ...poseData, timestamp: Date.now() }]
            console.log('📹 [RECORD] Total recorded frames:', newData.length)
            return newData
          })
        }
        
        // Draw skeleton on the appropriate canvas based on view mode
        console.log('🎨 [CANVAS] Current view mode:', viewMode, 'overlay canvas exists:', !!overlayCanvasRef.current, 'split canvas exists:', !!splitCanvasRef.current)
        
        if (viewMode === 'overlay' && overlayCanvasRef.current) {
          console.log('🎨 [CANVAS] Drawing skeleton in overlay mode')
          drawSkeleton(overlayCanvasRef.current, poseData)
        } else if (viewMode === 'split' && splitCanvasRef.current) {
          console.log('🎨 [CANVAS] Drawing skeleton in split mode')
          drawSkeleton(splitCanvasRef.current, poseData)
        } else {
          console.log('🎨 [CANVAS] Skipping skeleton draw - mode:', viewMode, 'overlay canvas:', !!overlayCanvasRef.current, 'split canvas:', !!splitCanvasRef.current)
        }
      }
    } catch (error) {
      console.error('🤖 [POSE] Pose detection error:', error)
    }
  }

  const drawSkeleton = (canvas: HTMLCanvasElement | null, pose: any) => {
    if (!canvas || !pose || !pose.keypoints) {
      return
    }

    // Get context once with performance hints
    const ctx = canvas.getContext('2d', {
      alpha: true,
      desynchronized: true,  // Reduce flickering by allowing async rendering
      willReadFrequently: false
    })
    if (!ctx) return

    // Save context state
    ctx.save()

    // Clear canvas without flickering - use faster method
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set drawing style
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.imageSmoothingEnabled = false  // Disable for better performance
    ctx.imageSmoothingQuality = 'low'

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

    // Draw connections with single path - reduced opacity to minimize flicker visibility
    ctx.strokeStyle = '#00ff00'
    ctx.lineWidth = 3
    ctx.globalAlpha = 0.6  // Reduced from 0.8
    ctx.beginPath()

    connections.forEach(([i, j]) => {
      const pointA = pose.keypoints[i]
      const pointB = pose.keypoints[j]

      if (pointA && pointB && pointA.confidence > 0.4 && pointB.confidence > 0.4) {
        ctx.moveTo(pointA.x, pointA.y)
        ctx.lineTo(pointB.x, pointB.y)
      }
    })

    ctx.stroke()

    // Draw keypoints with reduced opacity
    ctx.globalAlpha = 0.8  // Reduced from 1.0
    pose.keypoints.forEach((point: any, index: number) => {
      if (point && point.confidence > 0.4) {
        // Different colors for different body parts
        if (index <= 4) ctx.fillStyle = '#ff3333' // head - red
        else if (index <= 10) ctx.fillStyle = '#00ff00' // arms - green
        else ctx.fillStyle = '#3333ff' // legs - blue

        ctx.beginPath()
        ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI)  // Smaller radius
        ctx.fill()

        // Remove white border to reduce drawing operations
      }
    })

    // Restore context state
    ctx.restore()
  }

  const startPoseDetection = () => {
    console.log('🤖 [POSE] startPoseDetection called')
    console.log('🤖 [POSE] Checking prerequisites:', {
      hasVideo: !!videoRef.current,
      hasOverlayCanvas: !!overlayCanvasRef.current,
      hasSplitCanvas: !!splitCanvasRef.current,
      ready: poseDetectionReady,
      cameraActive: isCameraActive
    })
    
    if (!videoRef.current || (!overlayCanvasRef.current && !splitCanvasRef.current) || !poseDetectionReady) {
      console.log('🤖 [POSE] Cannot start pose detection - missing prerequisites')
      return
    }

    // Ensure canvas dimensions match video for both canvases
    const video = videoRef.current
    
    console.log('🤖 [POSE] Video dimensions:', video.videoWidth, 'x', video.videoHeight)
    
    if (video.videoWidth > 0 && video.videoHeight > 0) {
      if (overlayCanvasRef.current) {
        overlayCanvasRef.current.width = video.videoWidth
        overlayCanvasRef.current.height = video.videoHeight
        overlayCanvasRef.current.style.width = '100%'
        overlayCanvasRef.current.style.height = '100%'
        console.log('🎨 [CANVAS] Overlay canvas sized to:', overlayCanvasRef.current.width, 'x', overlayCanvasRef.current.height)
      }
      
      if (splitCanvasRef.current) {
        splitCanvasRef.current.width = video.videoWidth
        splitCanvasRef.current.height = video.videoHeight
        console.log('🎨 [CANVAS] Split canvas sized to:', splitCanvasRef.current.width, 'x', splitCanvasRef.current.height)
      }
    }

    // Cancel any existing animation frame
    if (animationFrameRef.current) {
      console.log('🤖 [POSE] Canceling existing animation frame:', animationFrameRef.current)
      cancelAnimationFrame(animationFrameRef.current)
    }

    // Throttle pose detection to reduce flickering (target 15 FPS for maximum stability)
    const targetFPS = 15
    const frameDelay = 1000 / targetFPS
    let lastFrameTime = 0
    let previousPose: any = null  // Store previous pose for smoothing

    const detectFrame = async (currentTime: number) => {
      // Throttle to target FPS to reduce flickering
      const elapsed = currentTime - lastFrameTime

      // Always get fresh reference to video element
      const currentVideo = videoRef.current

      // More detailed video state checking
      const videoReady = currentVideo &&
                        currentVideo.videoWidth > 0 &&
                        currentVideo.videoHeight > 0 &&
                        currentVideo.readyState >= 2 &&
                        !currentVideo.paused &&
                        !currentVideo.ended

      // Only run detection if enough time has passed (throttling)
      if (elapsed > frameDelay) {
        lastFrameTime = currentTime - (elapsed % frameDelay)

        // Reduce console logging to improve performance
        if (Math.random() < 0.1) {  // Only log 10% of frames
          console.log('🤖 [POSE] detectFrame - FPS:', Math.round(1000 / elapsed))
        }

        if (isCameraActive && poseDetectionReady && currentVideo && videoReady && !showPlayback) {
          // Use try-catch to prevent errors from stopping the loop
          try {
            await detectPose(currentVideo)
          } catch (error) {
            console.error('🤖 [POSE] Detection error in loop:', error)
          }
        }
      }

      // Continue loop
      if (isCameraActive && !showPlayback && videoRef.current) {
        animationFrameRef.current = requestAnimationFrame(detectFrame)
      } else {
        console.log('🤖 [POSE] Stopping detection loop - camera not active, in playback mode, or no video element')
        // If we're stopping the loop, make sure to clear any existing animation frame
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
          animationFrameRef.current = null
        }
      }
    }

    console.log('🤖 [POSE] Starting detection loop at', targetFPS, 'FPS')
    animationFrameRef.current = requestAnimationFrame(detectFrame)
  }

  const playbackPoseAnimation = () => {
    if (!playbackCanvasRef.current || !playbackVideoRef.current || poseData.length === 0) return

    const video = playbackVideoRef.current
    const currentTime = video.currentTime
    
    // Find the closest pose data for current playback time
    const closestPose = poseData.reduce((prev, curr) => {
      return Math.abs(curr.timestamp - currentTime) < Math.abs(prev.timestamp - currentTime) ? curr : prev
    })
    
    drawSkeleton(playbackCanvasRef.current, closestPose)
  }

  useEffect(() => {
    if (showPlayback && playbackVideoRef.current) {
      const video = playbackVideoRef.current
      
      const handleTimeUpdate = () => {
        playbackPoseAnimation()
      }
      
      const handleLoadedMetadata = () => {
        if (playbackCanvasRef.current && video) {
          playbackCanvasRef.current.width = video.videoWidth
          playbackCanvasRef.current.height = video.videoHeight
        }
      }
      
      video.addEventListener('timeupdate', handleTimeUpdate)
      video.addEventListener('loadedmetadata', handleLoadedMetadata)
      
      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate)
        video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      }
    }
  }, [showPlayback, poseData])

  // Monitor video ref changes and state
  useEffect(() => {
    console.log('🎥 [VIDEO] Video ref monitor - exists:', !!videoRef.current, 'camera active:', isCameraActive, 'showPlayback:', showPlayback)
    
    if (videoRef.current) {
      console.log('🎥 [VIDEO] Video element details:', {
        dimensions: `${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`,
        readyState: videoRef.current.readyState,
        paused: videoRef.current.paused,
        ended: videoRef.current.ended,
        hasStream: !!videoRef.current.srcObject,
        streamTracks: videoRef.current.srcObject ? (videoRef.current.srcObject as MediaStream).getTracks().length : 0
      })
    }
    
    // Set up interval to monitor video state when camera is active
    let videoMonitor: NodeJS.Timeout | null = null
    
    if (isCameraActive && videoRef.current && !showPlayback) {
      videoMonitor = setInterval(() => {
        const video = videoRef.current
        if (video) {
          console.log('🎥 [MONITOR] Video state:', {
            exists: !!video,
            dimensions: `${video.videoWidth}x${video.videoHeight}`,
            readyState: video.readyState,
            paused: video.paused,
            ended: video.ended,
            currentTime: video.currentTime.toFixed(2),
            hasStream: !!video.srcObject,
            streamActive: video.srcObject ? (video.srcObject as MediaStream).active : false
          })
        } else {
          console.log('🎥 [MONITOR] Video element is null!')
        }
      }, 3000) // Check every 3 seconds
    }
    
    return () => {
      if (videoMonitor) {
        clearInterval(videoMonitor)
      }
    }
  }, [isCameraActive, showPlayback])

  // Separate effect to monitor videoRef changes
  useEffect(() => {
    console.log('🎥 [VIDEO] videoRef.current changed:', !!videoRef.current)
    if (videoRef.current) {
      console.log('🎥 [VIDEO] New video element mounted')
    } else {
      console.log('🎥 [VIDEO] Video element unmounted or null')
    }
  }, [videoRef.current])

  // Start pose detection when it becomes ready and camera is active
  useEffect(() => {
    console.log('🤖 [POSE] useEffect triggered - poseReady:', poseDetectionReady, 'cameraActive:', isCameraActive, 'hasVideo:', !!videoRef.current)
    if (poseDetectionReady && isCameraActive && videoRef.current) {
      // Add a small delay to ensure video is fully ready
      const timer = setTimeout(() => {
        if (videoRef.current && videoRef.current.videoWidth > 0) {
          console.log('🤖 [POSE] Starting pose detection from useEffect')
          startPoseDetection()
        } else {
          console.log('🤖 [POSE] Video not ready in useEffect timeout - video:', !!videoRef.current, 'dimensions:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight)
        }
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [poseDetectionReady, isCameraActive])

  // Handle canvas sizing when view mode changes
  useEffect(() => {
    console.log('🔄 [MODE] View mode changed to:', viewMode)
    console.log('🔄 [MODE] Camera active:', isCameraActive)
    console.log('🔄 [MODE] Video element exists:', !!videoRef.current)
    
    // Ensure video stream is maintained when switching modes
    if (isCameraActive && videoRef.current && streamRef.current && !showPlayback) {
      if (videoRef.current.srcObject !== streamRef.current) {
        console.log('🔄 [MODE] Restoring video stream after mode change')
        videoRef.current.srcObject = streamRef.current
        videoRef.current.play().catch(e => console.log('🎥 [VIDEO] Play failed after mode change:', e.message))
      }
      
      // Restart pose detection after mode change
      if (poseDetectionReady) {
        setTimeout(() => {
          console.log('🔄 [MODE] Restarting pose detection after mode change')
          startPoseDetection()
        }, 200)
      }
    }
  }, [viewMode, isCameraActive, poseDetectionReady, showPlayback])

  // Handle playback mode changes
  useEffect(() => {
    console.log('🔄 [PLAYBACK] Playback mode changed to:', showPlayback)
    
    if (showPlayback) {
      // Stop pose detection when entering playback mode
      if (animationFrameRef.current) {
        console.log('🔄 [PLAYBACK] Stopping pose detection for playback mode')
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    } else {
      // Restart pose detection when returning to live mode
      if (isCameraActive && poseDetectionReady && videoRef.current) {
        setTimeout(() => {
          console.log('🔄 [PLAYBACK] Restarting pose detection after returning to live mode')
          startPoseDetection()
        }, 200)
      }
    }
  }, [showPlayback, isCameraActive, poseDetectionReady])

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (recordedVideoUrl) {
        URL.revokeObjectURL(recordedVideoUrl)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-black">
      <AppNavbar />

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden min-h-[calc(100vh-200px)]">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-green-600/5 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative max-w-3xl mx-auto">
          <div className="mb-12 animate-fade-in-down">
            <Link
              href="/app/upload"
              className="text-gray-400 hover:text-green-400 text-sm mb-6 inline-block transition duration-300"
            >
              ← Back
            </Link>
            <h1 className="font-medium text-5xl text-white mb-3">Recording Studio</h1>
            <p className="text-gray-400">Record your moves live</p>
          </div>

          {/* Live Recording View - always mounted but hidden during playback */}
          <div className={`mb-8 ${showPlayback ? 'hidden' : ''}`}>
              {/* View Mode Toggle */}
              {isCameraActive && (
                <div className="flex justify-center mb-4">
                  <div className="bg-black border border-green-900/30 rounded-lg p-1 flex">
                    <button
                      onClick={() => setViewMode('overlay')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        viewMode === 'overlay'
                          ? 'bg-green-600 text-black'
                          : 'text-green-400 hover:text-green-300'
                      }`}
                    >
                      Overlay Mode
                    </button>
                    <button
                      onClick={() => setViewMode('split')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        viewMode === 'split'
                          ? 'bg-green-600 text-black'
                          : 'text-green-400 hover:text-green-300'
                      }`}
                    >
                      Split View
                    </button>
                  </div>
                </div>
              )}

              {/* Single video container that doesn't move between modes */}
              <div className={`${viewMode === 'overlay' ? '' : 'grid md:grid-cols-2 gap-4'}`}>
                {/* Video container */}
                <div className={`relative bg-black rounded-xl overflow-hidden aspect-video border-2 border-green-900/30 hover:border-green-600/50 transition duration-300 animate-scale-in ${viewMode === 'split' ? '' : ''}`}>
                  <video 
                    key="main-video" // Prevent React from unmounting
                    ref={(el) => {
                      console.log('🎥 [VIDEO] Video ref callback called with:', el ? 'video element' : 'null', 'current mode:', viewMode, 'showPlayback:', showPlayback)
                      videoRef.current = el
                      
                      // If video element is mounted and we have a stream, set it
                      if (el && streamRef.current) {
                        console.log('🎥 [VIDEO] Setting stream on newly mounted video element')
                        console.log('🎥 [VIDEO] Stream details:', {
                          streamExists: !!streamRef.current,
                          streamActive: streamRef.current.active,
                          trackCount: streamRef.current.getTracks().length,
                          tracks: streamRef.current.getTracks().map(t => `${t.kind}: ${t.label}`)
                        })
                        el.srcObject = streamRef.current
                        
                        // Ensure video plays after setting stream
                        el.play().catch(e => console.log('🎥 [VIDEO] Play failed (expected):', e.message))
                      } else if (el && !streamRef.current) {
                        console.log('🎥 [VIDEO] Video element mounted but no stream available')
                      }
                    }}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{
                      willChange: 'auto',
                      transform: 'translateZ(0)',
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden'
                    }}
                    onLoadedMetadata={() => {
                      console.log('🎥 [VIDEO] Metadata loaded in DOM')
                      // Trigger pose detection when video is ready
                      if (poseDetectionReady && isCameraActive) {
                        setTimeout(() => {
                          console.log('🤖 [POSE] Starting pose detection from metadata loaded')
                          startPoseDetection()
                        }, 100)
                      }
                    }}
                    onPlay={() => {
                      console.log('🎥 [VIDEO] Playing in DOM')
                      // Ensure pose detection starts when video plays
                      if (poseDetectionReady && isCameraActive) {
                        setTimeout(() => {
                          console.log('🤖 [POSE] Starting pose detection from video play event')
                          startPoseDetection()
                        }, 100)
                      }
                    }}
                    onPause={() => console.log('🎥 [VIDEO] Paused in DOM')}
                  />
                  
                  {/* Overlay canvas - always rendered but only visible in overlay mode */}
                  <canvas
                    key="overlay-canvas"
                    ref={overlayCanvasRef}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    style={{
                      mixBlendMode: 'normal',
                      zIndex: 10,
                      opacity: viewMode === 'overlay' ? 0.85 : 0,
                      display: viewMode === 'overlay' ? 'block' : 'none',
                      willChange: 'transform, opacity',
                      transform: 'translateZ(0) translate3d(0, 0, 0)',
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      imageRendering: 'auto',
                      transition: 'opacity 0.2s ease-out'
                    }}
                  />
                  
                  {/* Status indicator */}
                  {isCameraActive && (
                    <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full z-20">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${poseDetectionReady ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`} />
                        <span className={`text-sm font-medium ${poseDetectionReady ? 'text-green-400' : 'text-yellow-400'}`}>
                          {poseDetectionReady ? 'Live Pose Detection' : 'Loading AI Model...'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Skeleton canvas - always rendered but only visible in split mode */}
                <div
                  className="bg-black rounded-xl overflow-hidden aspect-video border-2 border-green-900/30 hover:border-green-600/50 transition duration-300 flex items-center justify-center"
                  style={{ display: viewMode === 'split' ? 'block' : 'none' }}
                >
                  <canvas
                    key="split-canvas"
                    ref={splitCanvasRef}
                    className="max-w-full max-h-full object-contain"
                    style={{
                      backgroundColor: '#111',
                      opacity: 0.9,
                      willChange: 'transform',
                      transform: 'translateZ(0) translate3d(0, 0, 0)',
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      imageRendering: 'auto'
                    }}
                  />
                </div>
              </div>
            </div>

          {/* Playback View - Side by Side */}
          {showPlayback && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium text-white">Recording Analysis</h2>
                <button
                  onClick={() => {
                    setShowPlayback(false)
                    setViewMode('overlay')
                  }}
                  className="text-green-400 hover:text-green-300 text-sm transition-colors"
                >
                  ← Back to Live
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                {/* Recorded Video */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-400">Original Recording</h3>
                  <div className="bg-black rounded-xl overflow-hidden aspect-video border-2 border-green-900/30">
                    <video
                      ref={playbackVideoRef}
                      src={recordedVideoUrl}
                      controls
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                {/* Skeleton Animation */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-400">Pose Analysis</h3>
                  <div className="bg-black rounded-xl overflow-hidden aspect-video border-2 border-green-900/30 flex items-center justify-center">
                    <canvas
                      ref={playbackCanvasRef}
                      className="max-w-full max-h-full"
                      style={{ backgroundColor: '#000' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {!browserSupported && (
            <div className="bg-red-950/20 border border-red-900/30 p-4 rounded-xl mb-6 animate-fade-in-up">
              <h3 className="font-medium text-red-400 mb-2">Browser Compatibility Issue</h3>
              <p className="text-red-300 text-sm mb-3">
                Your browser doesn't support camera recording or you're not using HTTPS. Please:
              </p>
              <ul className="text-red-300 text-sm space-y-1 ml-4">
                <li>• Use a modern browser (Chrome, Firefox, Safari, Edge)</li>
                <li>• Ensure you're accessing the site via HTTPS</li>
                <li>• Grant camera permissions when prompted</li>
              </ul>
            </div>
          )}

          {browserSupported && !poseDetectionReady && (
            <div className="bg-yellow-950/20 border border-yellow-900/30 p-4 rounded-xl mb-6 animate-fade-in-up">
              <h3 className="font-medium text-yellow-400 mb-2">Loading AI Pose Detection</h3>
              <p className="text-yellow-300 text-sm">
                Initializing TensorFlow.js pose detection model. This may take a few moments...
              </p>
            </div>
          )}

          {!isCameraActive ? (
            <Button
              onClick={startCamera}
              disabled={!browserSupported || !poseDetectionReady}
              className="w-full bg-gradient-to-r from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 text-black font-medium py-3 h-auto text-base mb-6 shadow-lg shadow-green-500/30 transition duration-300 animate-fade-in-up disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!browserSupported ? 'Camera Not Supported' : 
               !poseDetectionReady ? 'Loading AI Model...' : 
               'Start Camera'}
            </Button>
          ) : (
            <div className="space-y-4 mb-8 animate-fade-in-up">
              {isRecording && (
                <div className="text-center animate-scale-in">
                  <div className="inline-block bg-black border border-green-900/50 px-6 py-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="font-bold text-2xl text-white transition-all duration-300">
                        {formatTime(recordingTime)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                {!isRecording ? (
                  <Button
                    onClick={startRecording}
                    className="flex-1 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 text-black font-medium py-3 h-auto text-base shadow-lg shadow-green-500/30 transition duration-300"
                  >
                    Start Recording
                  </Button>
                ) : (
                  <Button
                    onClick={stopRecording}
                    className="flex-1 bg-red-600 hover:bg-red-500 text-white font-medium py-3 h-auto text-base transition duration-300"
                  >
                    Stop Recording
                  </Button>
                )}
                {isCameraActive && !isRecording && (
                  <Button
                    onClick={stopCamera}
                    variant="outline"
                    className="flex-1 border-green-600/50 text-green-400 hover:bg-green-950/30 bg-transparent transition duration-300"
                  >
                    Close Camera
                  </Button>
                )}
              </div>
            </div>
          )}

          {recordedChunks.length > 0 && !isRecording && showPlayback && (
            <div className="bg-black border border-green-900/30 p-6 rounded-xl space-y-4 animate-fade-in-up">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-medium text-xl text-white">Recording Complete</h2>
                  <p className="text-gray-400 text-sm">Duration: {formatTime(recordingTime)} • {poseData.length} pose frames captured</p>
                </div>
                <div className="flex items-center gap-2 text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-sm font-medium">Analysis Ready</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={downloadRecording}
                  variant="outline"
                  className="flex-1 border-green-600/50 text-green-400 hover:bg-green-950/30 bg-transparent transition duration-300"
                >
                  Download Video
                </Button>
                <Button
                  onClick={() => {
                    setShowPlayback(false)
                    setRecordedChunks([])
                    setPoseData([])
                    setRecordedVideoUrl('')
                  }}
                  variant="outline"
                  className="border-gray-600/50 text-gray-400 hover:bg-gray-950/30 bg-transparent transition duration-300"
                >
                  Record New
                </Button>
                <Button
                  onClick={proceedWithRecording}
                  className="flex-1 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 text-black font-medium shadow-lg shadow-green-500/30 transition duration-300"
                >
                  Proceed to Analysis
                </Button>
              </div>
            </div>
          )}

          <div
            className="mt-12 bg-black border border-green-900/30 p-6 rounded-xl animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            <h3 className="font-medium text-lg text-white mb-4">Recording & Visualization Tips</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              {[
                "Make sure you have good lighting for better pose detection",
                "Record in a clear space with enough room to move",
                "Keep movements smooth and deliberate",
                "Use Overlay Mode for real-time AR-like skeleton feedback",
                "Switch to Split View to see detailed pose analysis",
                "Record for at least 10 seconds for comprehensive analysis",
              ].map((tip, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 animate-fade-in-up"
                  style={{ animationDelay: `${0.3 + i * 0.1}s` }}
                >
                  <span className="text-green-400">✓</span> {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}