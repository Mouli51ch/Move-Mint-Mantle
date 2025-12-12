/**
 * Dance-specific content transformation utilities
 * Transforms fitness/generic movement data into dance-focused terminology
 */

export interface DanceMovement {
  id: string;
  name: string;
  danceStyle: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional';
  confidence: number;
  timestamp: number;
  duration: number;
  bodyParts: string[];
  technique: string;
  description: string;
}

export interface DanceStyleInfo {
  name: string;
  displayName: string;
  description: string;
  characteristics: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional';
  origin: string;
  popularMoves: string[];
}

/**
 * Dance style mappings and information
 */
export const DANCE_STYLES: Record<string, DanceStyleInfo> = {
  ballet: {
    name: 'ballet',
    displayName: 'Ballet',
    description: 'Classical dance form emphasizing grace, precision, and technique',
    characteristics: ['Pointed feet', 'Extended lines', 'Controlled movements', 'Turnout'],
    difficulty: 'Intermediate',
    origin: 'France/Italy',
    popularMoves: ['Plié', 'Tendu', 'Arabesque', 'Pirouette', 'Grand Jeté'],
  },
  contemporary: {
    name: 'contemporary',
    displayName: 'Contemporary',
    description: 'Modern dance style combining elements of ballet, jazz, and modern dance',
    characteristics: ['Floor work', 'Emotional expression', 'Fluid movements', 'Improvisation'],
    difficulty: 'Intermediate',
    origin: 'United States',
    popularMoves: ['Spiral', 'Contraction', 'Release', 'Floor roll', 'Leap'],
  },
  hiphop: {
    name: 'hiphop',
    displayName: 'Hip Hop',
    description: 'Street dance style with rhythmic movements and urban culture influence',
    characteristics: ['Isolation', 'Popping', 'Locking', 'Breaking', 'Freestyle'],
    difficulty: 'Beginner',
    origin: 'United States',
    popularMoves: ['Pop', 'Lock', 'Windmill', 'Freeze', 'Top rock'],
  },
  jazz: {
    name: 'jazz',
    displayName: 'Jazz',
    description: 'Energetic dance style with sharp movements and syncopated rhythms',
    characteristics: ['Sharp movements', 'Syncopation', 'Isolations', 'High energy'],
    difficulty: 'Intermediate',
    origin: 'United States',
    popularMoves: ['Jazz square', 'Kick ball change', 'Chassé', 'Leap', 'Turn'],
  },
  latin: {
    name: 'latin',
    displayName: 'Latin',
    description: 'Passionate dance styles from Latin America with rhythmic hip movements',
    characteristics: ['Hip movements', 'Rhythmic patterns', 'Partner work', 'Passion'],
    difficulty: 'Intermediate',
    origin: 'Latin America',
    popularMoves: ['Cha-cha', 'Rumba', 'Samba', 'Salsa', 'Bachata'],
  },
  ballroom: {
    name: 'ballroom',
    displayName: 'Ballroom',
    description: 'Elegant partner dances performed in formal settings',
    characteristics: ['Partner connection', 'Frame', 'Rise and fall', 'Elegance'],
    difficulty: 'Advanced',
    origin: 'Europe',
    popularMoves: ['Waltz', 'Foxtrot', 'Tango', 'Quickstep', 'Viennese Waltz'],
  },
  freestyle: {
    name: 'freestyle',
    displayName: 'Freestyle',
    description: 'Improvisational dance allowing personal expression and creativity',
    characteristics: ['Improvisation', 'Personal style', 'Creativity', 'Freedom'],
    difficulty: 'Beginner',
    origin: 'Global',
    popularMoves: ['Personal interpretation', 'Mixed styles', 'Creative expression'],
  },
};

/**
 * Movement terminology mappings from fitness/generic to dance-specific
 */
export const MOVEMENT_MAPPINGS: Record<string, { danceName: string; danceStyle: string; technique: string }> = {
  // Upper body movements
  'arm_raise': { danceName: 'Port de bras', danceStyle: 'ballet', technique: 'Graceful arm movement' },
  'arm_circle': { danceName: 'Arm circles', danceStyle: 'contemporary', technique: 'Flowing circular motion' },
  'shoulder_roll': { danceName: 'Shoulder isolation', danceStyle: 'jazz', technique: 'Isolated shoulder movement' },
  'chest_pop': { danceName: 'Chest pop', danceStyle: 'hiphop', technique: 'Sharp chest isolation' },
  
  // Lower body movements
  'squat': { danceName: 'Plié', danceStyle: 'ballet', technique: 'Bent knee position' },
  'lunge': { danceName: 'Lunge', danceStyle: 'contemporary', technique: 'Extended leg position' },
  'jump': { danceName: 'Sauté', danceStyle: 'ballet', technique: 'Vertical jump with pointed feet' },
  'hop': { danceName: 'Échappé sauté', danceStyle: 'ballet', technique: 'Small jumping movement' },
  'step': { danceName: 'Chassé', danceStyle: 'jazz', technique: 'Sliding step movement' },
  
  // Full body movements
  'turn': { danceName: 'Pirouette', danceStyle: 'ballet', technique: 'Controlled spinning turn' },
  'spin': { danceName: 'Fouetté', danceStyle: 'ballet', technique: 'Whipping turn movement' },
  'lean': { danceName: 'Tilt', danceStyle: 'contemporary', technique: 'Off-balance position' },
  'reach': { danceName: 'Extension', danceStyle: 'contemporary', technique: 'Reaching through space' },
  
  // Hip hop specific
  'isolation': { danceName: 'Body isolation', danceStyle: 'hiphop', technique: 'Moving one body part independently' },
  'wave': { danceName: 'Body wave', danceStyle: 'hiphop', technique: 'Fluid wave through the body' },
  'pop': { danceName: 'Pop', danceStyle: 'hiphop', technique: 'Sharp muscle contraction' },
  'lock': { danceName: 'Lock', danceStyle: 'hiphop', technique: 'Freeze in position' },
  
  // Latin movements
  'hip_circle': { danceName: 'Hip circle', danceStyle: 'latin', technique: 'Circular hip movement' },
  'hip_drop': { danceName: 'Hip drop', danceStyle: 'latin', technique: 'Sharp hip accent' },
  'body_roll': { danceName: 'Body roll', danceStyle: 'latin', technique: 'Undulating body movement' },
};

/**
 * Transform generic movement data to dance-specific terminology
 */
export function transformMovementToDance(
  genericMovement: any,
  detectedStyle?: string
): DanceMovement {
  const movementKey = genericMovement.type?.toLowerCase() || 'unknown';
  const mapping = MOVEMENT_MAPPINGS[movementKey];
  
  // Determine dance style
  let danceStyle = detectedStyle || mapping?.danceStyle || 'freestyle';
  
  // Auto-detect style based on movement patterns if not provided
  if (!detectedStyle) {
    danceStyle = detectDanceStyle(genericMovement);
  }

  // Get dance-specific name
  const danceName = mapping?.danceName || transformGenericName(genericMovement.name || movementKey);
  
  // Determine difficulty based on movement complexity
  const difficulty = determineDifficulty(genericMovement, danceStyle);

  return {
    id: genericMovement.id || `movement_${Date.now()}`,
    name: danceName,
    danceStyle,
    difficulty,
    confidence: genericMovement.confidence || 0.8,
    timestamp: genericMovement.timestamp || Date.now(),
    duration: genericMovement.duration || 1000,
    bodyParts: transformBodyParts(genericMovement.bodyParts || []),
    technique: mapping?.technique || generateTechniqueDescription(danceName, danceStyle),
    description: generateMovementDescription(danceName, danceStyle, difficulty),
  };
}

/**
 * Auto-detect dance style based on movement characteristics
 */
function detectDanceStyle(movement: any): string {
  const characteristics = movement.characteristics || [];
  const bodyParts = movement.bodyParts || [];
  const intensity = movement.intensity || 0.5;

  // Ballet indicators
  if (characteristics.includes('controlled') || characteristics.includes('precise') || 
      bodyParts.includes('feet') && characteristics.includes('extended')) {
    return 'ballet';
  }

  // Hip hop indicators
  if (characteristics.includes('sharp') || characteristics.includes('isolated') ||
      intensity > 0.8 || characteristics.includes('rhythmic')) {
    return 'hiphop';
  }

  // Contemporary indicators
  if (characteristics.includes('fluid') || characteristics.includes('expressive') ||
      bodyParts.includes('floor') || characteristics.includes('emotional')) {
    return 'contemporary';
  }

  // Jazz indicators
  if (characteristics.includes('energetic') || characteristics.includes('syncopated') ||
      intensity > 0.7) {
    return 'jazz';
  }

  // Latin indicators
  if (bodyParts.includes('hips') || characteristics.includes('rhythmic') ||
      characteristics.includes('passionate')) {
    return 'latin';
  }

  return 'freestyle';
}

/**
 * Transform generic movement names to dance terminology
 */
function transformGenericName(genericName: string): string {
  const name = genericName.toLowerCase();
  
  // Common transformations
  const transformations: Record<string, string> = {
    'arm_movement': 'Port de bras',
    'leg_lift': 'Développé',
    'body_bend': 'Cambré',
    'weight_shift': 'Transfer',
    'balance': 'Équilibre',
    'stretch': 'Extension',
    'contract': 'Contraction',
    'release': 'Release',
    'flow': 'Adagio',
    'quick_step': 'Allegro',
  };

  return transformations[name] || toTitleCase(name.replace(/_/g, ' '));
}

/**
 * Transform body parts to dance-specific terminology
 */
function transformBodyParts(genericBodyParts: string[]): string[] {
  const transformations: Record<string, string> = {
    'arms': 'Arms',
    'legs': 'Legs',
    'torso': 'Core',
    'head': 'Head',
    'hands': 'Hands',
    'feet': 'Feet',
    'hips': 'Hips',
    'shoulders': 'Shoulders',
    'spine': 'Spine',
    'chest': 'Chest',
  };

  return genericBodyParts.map(part => 
    transformations[part.toLowerCase()] || toTitleCase(part)
  );
}

/**
 * Determine movement difficulty based on complexity
 */
function determineDifficulty(
  movement: any, 
  danceStyle: string
): 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional' {
  const complexity = movement.complexity || 0.5;
  const coordination = movement.coordination || 0.5;
  const technique = movement.technique || 0.5;
  
  const averageScore = (complexity + coordination + technique) / 3;
  
  // Adjust based on dance style
  const styleModifier = DANCE_STYLES[danceStyle]?.difficulty === 'Advanced' ? 0.1 : 0;
  const adjustedScore = averageScore + styleModifier;

  if (adjustedScore < 0.3) return 'Beginner';
  if (adjustedScore < 0.6) return 'Intermediate';
  if (adjustedScore < 0.8) return 'Advanced';
  return 'Professional';
}

/**
 * Generate technique description for a movement
 */
function generateTechniqueDescription(movementName: string, danceStyle: string): string {
  const styleInfo = DANCE_STYLES[danceStyle];
  if (!styleInfo) return `${movementName} technique`;

  const characteristics = styleInfo.characteristics.slice(0, 2).join(' and ');
  return `${movementName} with ${characteristics.toLowerCase()}`;
}

/**
 * Generate movement description
 */
function generateMovementDescription(
  movementName: string, 
  danceStyle: string, 
  difficulty: string
): string {
  const styleInfo = DANCE_STYLES[danceStyle];
  const styleName = styleInfo?.displayName || toTitleCase(danceStyle);
  
  return `${difficulty} level ${movementName} from ${styleName} dance style`;
}

/**
 * Transform analysis results to dance-focused content
 */
export function transformAnalysisResults(genericResults: any): any {
  const transformedMovements = (genericResults.detectedMovements || []).map((movement: any) =>
    transformMovementToDance(movement, genericResults.primaryStyle)
  );

  // Categorize movements by dance style
  const movementsByStyle = transformedMovements.reduce((acc: any, movement: DanceMovement) => {
    if (!acc[movement.danceStyle]) {
      acc[movement.danceStyle] = [];
    }
    acc[movement.danceStyle].push(movement);
    return acc;
  }, {});

  // Calculate style distribution
  const styleDistribution = Object.entries(movementsByStyle).map(([style, movements]: [string, any]) => ({
    style,
    displayName: DANCE_STYLES[style]?.displayName || toTitleCase(style),
    count: movements.length,
    percentage: (movements.length / transformedMovements.length) * 100,
    averageDifficulty: calculateAverageDifficulty(movements),
  }));

  return {
    ...genericResults,
    detectedMovements: transformedMovements,
    movementsByStyle,
    styleDistribution,
    primaryStyle: determinePrimaryStyle(styleDistribution),
    danceMetrics: {
      totalMovements: transformedMovements.length,
      uniqueStyles: Object.keys(movementsByStyle).length,
      averageDifficulty: calculateAverageDifficulty(transformedMovements),
      technicalComplexity: calculateTechnicalComplexity(transformedMovements),
      artisticExpression: calculateArtisticExpression(transformedMovements),
    },
    recommendations: generateDanceRecommendations(transformedMovements, styleDistribution),
  };
}

/**
 * Calculate average difficulty for movements
 */
function calculateAverageDifficulty(movements: DanceMovement[]): string {
  if (movements.length === 0) return 'Beginner';

  const difficultyScores = movements.map(m => {
    switch (m.difficulty) {
      case 'Beginner': return 1;
      case 'Intermediate': return 2;
      case 'Advanced': return 3;
      case 'Professional': return 4;
      default: return 1;
    }
  });

  const average = difficultyScores.reduce((sum, score) => sum + score, 0) / difficultyScores.length;

  if (average < 1.5) return 'Beginner';
  if (average < 2.5) return 'Intermediate';
  if (average < 3.5) return 'Advanced';
  return 'Professional';
}

/**
 * Determine primary dance style
 */
function determinePrimaryStyle(styleDistribution: any[]): string {
  if (styleDistribution.length === 0) return 'freestyle';
  
  return styleDistribution.reduce((primary, current) => 
    current.count > primary.count ? current : primary
  ).style;
}

/**
 * Calculate technical complexity score
 */
function calculateTechnicalComplexity(movements: DanceMovement[]): number {
  if (movements.length === 0) return 0;

  const complexityScore = movements.reduce((sum, movement) => {
    let score = 0;
    switch (movement.difficulty) {
      case 'Professional': score += 4; break;
      case 'Advanced': score += 3; break;
      case 'Intermediate': score += 2; break;
      case 'Beginner': score += 1; break;
    }
    return sum + score;
  }, 0);

  return Math.min(complexityScore / (movements.length * 4), 1); // Normalize to 0-1
}

/**
 * Calculate artistic expression score
 */
function calculateArtisticExpression(movements: DanceMovement[]): number {
  if (movements.length === 0) return 0;

  // Higher score for more diverse styles and fluid movements
  const uniqueStyles = new Set(movements.map(m => m.danceStyle)).size;
  const styleVariety = Math.min(uniqueStyles / 3, 1); // Normalize to 0-1

  const averageConfidence = movements.reduce((sum, m) => sum + m.confidence, 0) / movements.length;

  return (styleVariety + averageConfidence) / 2;
}

/**
 * Generate dance-specific recommendations
 */
function generateDanceRecommendations(
  movements: DanceMovement[], 
  styleDistribution: any[]
): string[] {
  const recommendations: string[] = [];
  
  if (movements.length === 0) {
    return ['Try adding more movement to showcase your dance skills!'];
  }

  const primaryStyle = styleDistribution[0]?.style || 'freestyle';
  const styleInfo = DANCE_STYLES[primaryStyle];

  // Style-specific recommendations
  if (styleInfo) {
    recommendations.push(`Great ${styleInfo.displayName} technique! Consider exploring ${styleInfo.popularMoves.slice(0, 2).join(' and ')}.`);
  }

  // Difficulty recommendations
  const avgDifficulty = calculateAverageDifficulty(movements);
  if (avgDifficulty === 'Beginner') {
    recommendations.push('Try incorporating more complex movements to challenge yourself.');
  } else if (avgDifficulty === 'Professional') {
    recommendations.push('Excellent technical skill! Your advanced movements are impressive.');
  }

  // Style diversity recommendations
  if (styleDistribution.length === 1) {
    recommendations.push('Consider mixing in elements from other dance styles for variety.');
  } else if (styleDistribution.length > 3) {
    recommendations.push('Great style diversity! Your versatility really shows.');
  }

  return recommendations;
}

/**
 * Utility function to convert string to title case
 */
function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}