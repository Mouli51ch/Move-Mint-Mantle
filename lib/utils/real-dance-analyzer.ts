/**
 * Real Dance Movement Analyzer
 * Analyzes MediaPipe pose data to detect actual dance movements
 */

import { PoseFrame, PoseKeypoint } from '@/hooks/use-mediapipe-pose';
import { DanceAnalysisResults, DanceMovement } from '@/lib/types/api';

interface MovementDetection {
  name: string;
  startFrame: number;
  endFrame: number;
  confidence: number;
  characteristics: string[];
}

export class RealDanceAnalyzer {
  private poseFrames: PoseFrame[];
  private movements: MovementDetection[] = [];

  constructor(poseFrames: PoseFrame[]) {
    this.poseFrames = poseFrames;
  }

  /**
   * Analyze all pose frames and detect dance movements
   */
  analyze(): DanceAnalysisResults {
    console.log(`🎭 Analyzing ${this.poseFrames.length} pose frames...`);

    // Detect movements
    this.detectArmRaises();
    this.detectSquats();
    this.detectJumps();
    this.detectSpins();
    this.detectLegLifts();

    // Convert to DanceMovement format
    const detectedMovements = this.convertToDanceMovements();

    // Calculate metrics
    const duration = this.calculateDuration();
    const qualityMetrics = this.calculateQualityMetrics();
    const styleDistribution = this.detectDanceStyles(detectedMovements);
    const primaryStyle = styleDistribution[0]?.style || 'freestyle';

    const result: DanceAnalysisResults = {
      videoId: `video-${Date.now()}`,
      duration,
      detectedMovements,
      qualityMetrics,
      poseData: this.poseFrames.slice(0, 100), // Limit to 100 frames for performance
      primaryStyle,
      styleDistribution,
      movementsByStyle: this.groupByStyle(detectedMovements),
      danceMetrics: {
        totalMovements: detectedMovements.length,
        uniqueStyles: styleDistribution.length,
        averageDifficulty: this.calculateAverageDifficulty(detectedMovements),
        technicalComplexity: this.calculateTechnicalComplexity(),
        artisticExpression: this.calculateArtisticExpression(),
      },
      recommendations: this.generateRecommendations(detectedMovements, primaryStyle),
    };

    console.log('✅ Dance analysis complete:', result);
    return result;
  }

  /**
   * Detect arm raises (Port de bras)
   */
  private detectArmRaises() {
    for (let i = 10; i < this.poseFrames.length - 10; i++) {
      const frame = this.poseFrames[i];
      const leftWrist = this.getKeypoint(frame, 'left_wrist');
      const rightWrist = this.getKeypoint(frame, 'right_wrist');
      const leftShoulder = this.getKeypoint(frame, 'left_shoulder');
      const rightShoulder = this.getKeypoint(frame, 'right_shoulder');

      if (!leftWrist || !rightWrist || !leftShoulder || !rightShoulder) continue;

      // Check if arms are raised above shoulders
      const leftRaised = leftWrist.y < leftShoulder.y - 0.1;
      const rightRaised = rightWrist.y < rightShoulder.y - 0.1;

      if (leftRaised && rightRaised) {
        this.movements.push({
          name: 'Arm Raise',
          startFrame: i,
          endFrame: i + 10,
          confidence: 0.85,
          characteristics: ['controlled', 'extended'],
        });
        i += 20; // Skip ahead to avoid duplicates
      }
    }
  }

  /**
   * Detect squats (Plié)
   */
  private detectSquats() {
    for (let i = 10; i < this.poseFrames.length - 10; i++) {
      const frame = this.poseFrames[i];
      const leftHip = this.getKeypoint(frame, 'left_hip');
      const leftKnee = this.getKeypoint(frame, 'left_knee');
      const leftAnkle = this.getKeypoint(frame, 'left_ankle');

      if (!leftHip || !leftKnee || !leftAnkle) continue;

      // Calculate knee angle
      const kneeAngle = this.calculateAngle(leftHip, leftKnee, leftAnkle);

      // Squat detected if knee angle < 140 degrees
      if (kneeAngle < 140) {
        this.movements.push({
          name: 'Squat',
          startFrame: i,
          endFrame: i + 15,
          confidence: 0.9,
          characteristics: ['controlled', 'precise'],
        });
        i += 20;
      }
    }
  }

  /**
   * Detect jumps (Sauté)
   */
  private detectJumps() {
    for (let i = 5; i < this.poseFrames.length - 5; i++) {
      const prevFrame = this.poseFrames[i - 5];
      const currFrame = this.poseFrames[i];

      const prevAnkle = this.getKeypoint(prevFrame, 'left_ankle');
      const currAnkle = this.getKeypoint(currFrame, 'left_ankle');

      if (!prevAnkle || !currAnkle) continue;

      // Jump detected if feet move up significantly
      const verticalMovement = prevAnkle.y - currAnkle.y;

      if (verticalMovement > 0.15) {
        this.movements.push({
          name: 'Jump',
          startFrame: i - 5,
          endFrame: i + 5,
          confidence: 0.88,
          characteristics: ['explosive', 'energetic'],
        });
        i += 15;
      }
    }
  }

  /**
   * Detect spins (Pirouette)
   */
  private detectSpins() {
    for (let i = 10; i < this.poseFrames.length - 10; i++) {
      const frame = this.poseFrames[i];
      const prevFrame = this.poseFrames[i - 10];

      const currShoulder = this.getKeypoint(frame, 'left_shoulder');
      const prevShoulder = this.getKeypoint(prevFrame, 'left_shoulder');

      if (!currShoulder || !prevShoulder) continue;

      // Detect rotation by shoulder position change
      const horizontalMovement = Math.abs(currShoulder.x - prevShoulder.x);

      if (horizontalMovement > 0.3) {
        this.movements.push({
          name: 'Spin',
          startFrame: i - 10,
          endFrame: i,
          confidence: 0.82,
          characteristics: ['rotational', 'controlled'],
        });
        i += 15;
      }
    }
  }

  /**
   * Detect leg lifts (Développé)
   */
  private detectLegLifts() {
    for (let i = 10; i < this.poseFrames.length - 10; i++) {
      const frame = this.poseFrames[i];
      const leftKnee = this.getKeypoint(frame, 'left_knee');
      const leftHip = this.getKeypoint(frame, 'left_hip');

      if (!leftKnee || !leftHip) continue;

      // Leg lift detected if knee is above hip
      if (leftKnee.y < leftHip.y - 0.1) {
        this.movements.push({
          name: 'Leg Lift',
          startFrame: i,
          endFrame: i + 12,
          confidence: 0.86,
          characteristics: ['extended', 'balanced'],
        });
        i += 20;
      }
    }
  }

  /**
   * Convert detected movements to DanceMovement format
   */
  private convertToDanceMovements(): DanceMovement[] {
    const frameDuration = this.poseFrames.length > 0
      ? (this.poseFrames[this.poseFrames.length - 1].timestamp - this.poseFrames[0].timestamp) / this.poseFrames.length
      : 33; // Default 30fps

    return this.movements.map((movement, index) => {
      const startTime = (movement.startFrame * frameDuration) / 1000;
      const endTime = (movement.endFrame * frameDuration) / 1000;
      const danceStyle = this.inferDanceStyle(movement);
      const difficulty = this.inferDifficulty(movement);

      return {
        id: `movement_${index + 1}`,
        name: this.mapToDanceName(movement.name, danceStyle),
        danceStyle,
        difficulty,
        confidence: movement.confidence,
        timestamp: movement.startFrame * frameDuration,
        duration: (movement.endFrame - movement.startFrame) * frameDuration,
        startTime,
        endTime,
        timeRange: { start: startTime, end: endTime },
        bodyParts: this.inferBodyParts(movement.name),
        technique: this.inferTechnique(movement.name, danceStyle),
        description: `${difficulty} level ${this.mapToDanceName(movement.name, danceStyle)} from ${danceStyle} dance style`,
      };
    });
  }

  /**
   * Map generic movement to dance terminology
   */
  private mapToDanceName(movementName: string, style: string): string {
    const danceNames: Record<string, Record<string, string>> = {
      'Arm Raise': { ballet: 'Port de bras', contemporary: 'Reach', default: 'Arm Extension' },
      'Squat': { ballet: 'Plié', hiphop: 'Drop', default: 'Knee Bend' },
      'Jump': { ballet: 'Sauté', hiphop: 'Bounce', jazz: 'Leap', default: 'Jump' },
      'Spin': { ballet: 'Pirouette', contemporary: 'Turn', default: 'Rotation' },
      'Leg Lift': { ballet: 'Développé', contemporary: 'Extension', default: 'Leg Raise' },
    };

    return danceNames[movementName]?.[style] || danceNames[movementName]?.default || movementName;
  }

  /**
   * Infer dance style from movement characteristics
   */
  private inferDanceStyle(movement: MovementDetection): string {
    if (movement.characteristics.includes('controlled') && movement.characteristics.includes('precise')) {
      return 'ballet';
    }
    if (movement.characteristics.includes('explosive') || movement.characteristics.includes('sharp')) {
      return 'hiphop';
    }
    if (movement.characteristics.includes('fluid') || movement.characteristics.includes('expressive')) {
      return 'contemporary';
    }
    if (movement.characteristics.includes('energetic')) {
      return 'jazz';
    }
    return 'freestyle';
  }

  /**
   * Infer difficulty level
   */
  private inferDifficulty(movement: MovementDetection): 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional' {
    const confidence = movement.confidence;
    const duration = movement.endFrame - movement.startFrame;

    if (movement.name === 'Spin' || movement.name === 'Leg Lift') return 'Intermediate';
    if (movement.name === 'Jump' && duration > 20) return 'Advanced';
    if (confidence < 0.7) return 'Beginner';
    if (confidence > 0.9 && duration > 15) return 'Advanced';

    return 'Intermediate';
  }

  /**
   * Calculate metrics and style distribution
   */
  private calculateDuration(): number {
    if (this.poseFrames.length === 0) return 0;
    return (this.poseFrames[this.poseFrames.length - 1].timestamp - this.poseFrames[0].timestamp) / 1000;
  }

  private calculateQualityMetrics() {
    const avgConfidence = this.poseFrames.reduce((sum, frame) => sum + frame.confidence, 0) / this.poseFrames.length;

    return {
      overall: Math.round(avgConfidence * 100),
      technique: Math.round(avgConfidence * 95),
      timing: Math.round(avgConfidence * 98),
      expression: Math.round(avgConfidence * 92),
      clarity: Math.round(avgConfidence * 97),
    };
  }

  private detectDanceStyles(movements: DanceMovement[]) {
    const styleCounts: Record<string, number> = {};

    movements.forEach(m => {
      styleCounts[m.danceStyle] = (styleCounts[m.danceStyle] || 0) + 1;
    });

    const total = movements.length || 1;

    return Object.entries(styleCounts)
      .map(([style, count]) => ({
        style,
        displayName: style.charAt(0).toUpperCase() + style.slice(1),
        count,
        percentage: (count / total) * 100,
        averageDifficulty: 'Intermediate' as const,
      }))
      .sort((a, b) => b.count - a.count);
  }

  private groupByStyle(movements: DanceMovement[]) {
    const grouped: Record<string, DanceMovement[]> = {};

    movements.forEach(m => {
      if (!grouped[m.danceStyle]) grouped[m.danceStyle] = [];
      grouped[m.danceStyle].push(m);
    });

    return grouped;
  }

  private calculateAverageDifficulty(movements: DanceMovement[]): string {
    const levels = { Beginner: 1, Intermediate: 2, Advanced: 3, Professional: 4 };
    const avg = movements.reduce((sum, m) => sum + levels[m.difficulty], 0) / (movements.length || 1);

    if (avg < 1.5) return 'Beginner';
    if (avg < 2.5) return 'Intermediate';
    if (avg < 3.5) return 'Advanced';
    return 'Professional';
  }

  private calculateTechnicalComplexity(): number {
    return Math.min(1, this.movements.length / 10 + 0.3);
  }

  private calculateArtisticExpression(): number {
    const styleVariety = new Set(this.movements.map(m => this.inferDanceStyle(m))).size;
    return Math.min(1, styleVariety / 3 + 0.4);
  }

  private generateRecommendations(movements: DanceMovement[], primaryStyle: string): string[] {
    const recs = [];

    if (movements.length < 5) {
      recs.push('Try incorporating more varied movements to showcase your range');
    }
    if (primaryStyle === 'ballet') {
      recs.push('Excellent ballet technique! Consider exploring Arabesque and Grand Jeté');
    }
    if (movements.length > 10) {
      recs.push('Great variety in your movements! Your versatility really shows');
    }

    recs.push(`Keep practicing ${primaryStyle} to further refine your technique`);

    return recs;
  }

  // Helper methods
  private getKeypoint(frame: PoseFrame, name: string): PoseKeypoint | null {
    return frame.keypoints.find(kp => kp.name === name) || null;
  }

  private calculateAngle(a: PoseKeypoint, b: PoseKeypoint, c: PoseKeypoint): number {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    if (angle > 180.0) angle = 360 - angle;
    return angle;
  }

  private inferBodyParts(movementName: string): string[] {
    const bodyPartMap: Record<string, string[]> = {
      'Arm Raise': ['Arms', 'Shoulders'],
      'Squat': ['Legs', 'Core'],
      'Jump': ['Legs', 'Core', 'Full Body'],
      'Spin': ['Core', 'Legs', 'Balance'],
      'Leg Lift': ['Legs', 'Core', 'Balance'],
    };
    return bodyPartMap[movementName] || ['Full Body'];
  }

  private inferTechnique(movementName: string, style: string): string {
    const techniqueMap: Record<string, Record<string, string>> = {
      'Arm Raise': {
        ballet: 'Graceful port de bras with extended arms',
        default: 'Controlled arm extension with proper form',
      },
      'Squat': {
        ballet: 'Bent knee position with turnout and proper alignment',
        default: 'Controlled knee bend maintaining balance',
      },
      'Jump': {
        ballet: 'Explosive upward movement with pointed toes',
        hiphop: 'Dynamic bounce with rhythm and style',
        default: 'Vertical jump with control',
      },
      'Spin': {
        ballet: 'Controlled spinning turn with proper spotting',
        default: 'Rotational movement maintaining balance',
      },
      'Leg Lift': {
        ballet: 'Extended leg with pointed toes and turnout',
        default: 'Controlled leg elevation with balance',
      },
    };

    return techniqueMap[movementName]?.[style] || techniqueMap[movementName]?.default || 'Standard technique';
  }
}
