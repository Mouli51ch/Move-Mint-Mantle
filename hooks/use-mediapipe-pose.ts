/**
 * MediaPipe Pose Detection Hook
 * Real-time pose estimation for dance analysis
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { Pose, Results, POSE_CONNECTIONS } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';

export interface PoseKeypoint {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
  name: string;
}

export interface PoseFrame {
  timestamp: number;
  keypoints: PoseKeypoint[];
  confidence: number;
}

export interface UsePoseDetectionOptions {
  onResults?: (results: Results) => void;
  modelComplexity?: 0 | 1 | 2; // 0=lite, 1=full, 2=heavy
  smoothLandmarks?: boolean;
  minDetectionConfidence?: number;
  minTrackingConfidence?: number;
}

export function useMediaPipePose(options: UsePoseDetectionOptions = {}) {
  const {
    onResults,
    modelComplexity = 1,
    smoothLandmarks = true,
    minDetectionConfidence = 0.5,
    minTrackingConfidence = 0.5,
  } = options;

  const poseRef = useRef<Pose | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [poseFrames, setPoseFrames] = useState<PoseFrame[]>([]);

  // Keypoint names (MediaPipe Pose has 33 landmarks)
  const KEYPOINT_NAMES = [
    'nose', 'left_eye_inner', 'left_eye', 'left_eye_outer',
    'right_eye_inner', 'right_eye', 'right_eye_outer',
    'left_ear', 'right_ear', 'mouth_left', 'mouth_right',
    'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
    'left_wrist', 'right_wrist', 'left_pinky', 'right_pinky',
    'left_index', 'right_index', 'left_thumb', 'right_thumb',
    'left_hip', 'right_hip', 'left_knee', 'right_knee',
    'left_ankle', 'right_ankle', 'left_heel', 'right_heel',
    'left_foot_index', 'right_foot_index'
  ];

  // Initialize MediaPipe Pose
  const initializePose = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const pose = new Pose({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        },
      });

      pose.setOptions({
        modelComplexity,
        smoothLandmarks,
        minDetectionConfidence,
        minTrackingConfidence,
      });

      pose.onResults((results: Results) => {
        if (results.poseLandmarks) {
          const frame: PoseFrame = {
            timestamp: Date.now(),
            keypoints: results.poseLandmarks.map((landmark, index) => ({
              x: landmark.x,
              y: landmark.y,
              z: landmark.z,
              visibility: landmark.visibility,
              name: KEYPOINT_NAMES[index] || `landmark_${index}`,
            })),
            confidence: calculateAverageConfidence(results.poseLandmarks),
          };

          setPoseFrames((prev) => [...prev, frame]);
        }

        if (onResults) {
          onResults(results);
        }
      });

      poseRef.current = pose;
      setIsReady(true);
      setIsLoading(false);

      console.log('✅ MediaPipe Pose initialized');
    } catch (err) {
      console.error('❌ Failed to initialize MediaPipe Pose:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize pose detection');
      setIsLoading(false);
    }
  }, [modelComplexity, smoothLandmarks, minDetectionConfidence, minTrackingConfidence, onResults]);

  // Start camera
  const startCamera = useCallback(async (videoElement: HTMLVideoElement) => {
    if (!poseRef.current) {
      console.error('Pose not initialized');
      return;
    }

    try {
      const camera = new Camera(videoElement, {
        onFrame: async () => {
          if (poseRef.current) {
            await poseRef.current.send({ image: videoElement });
          }
        },
        width: 1280,
        height: 720,
      });

      await camera.start();
      cameraRef.current = camera;

      console.log('✅ Camera started for pose detection');
    } catch (err) {
      console.error('❌ Failed to start camera:', err);
      setError(err instanceof Error ? err.message : 'Failed to start camera');
    }
  }, []);

  // Process single frame
  const processFrame = useCallback(async (imageSource: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement) => {
    if (!poseRef.current) {
      console.error('Pose not initialized');
      return;
    }

    try {
      await poseRef.current.send({ image: imageSource });
    } catch (err) {
      console.error('❌ Failed to process frame:', err);
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
      console.log('🛑 Camera stopped');
    }
  }, []);

  // Clear pose frames
  const clearFrames = useCallback(() => {
    setPoseFrames([]);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      stopCamera();
      if (poseRef.current) {
        poseRef.current.close();
      }
    };
  }, [stopCamera]);

  return {
    isLoading,
    isReady,
    error,
    poseFrames,
    initializePose,
    startCamera,
    stopCamera,
    processFrame,
    clearFrames,
    pose: poseRef.current,
  };
}

// Helper function to calculate average confidence
function calculateAverageConfidence(landmarks: any[]): number {
  if (!landmarks || landmarks.length === 0) return 0;

  const totalConfidence = landmarks.reduce((sum, landmark) => {
    return sum + (landmark.visibility || 0);
  }, 0);

  return totalConfidence / landmarks.length;
}
