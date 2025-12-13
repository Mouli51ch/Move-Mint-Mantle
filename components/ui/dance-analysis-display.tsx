"use client"

import { DanceMovement, AnalysisQuality } from "@/lib/types/api"

interface DanceAnalysisDisplayProps {
  movements: DanceMovement[]
  qualityMetrics: AnalysisQuality
  recommendations: string[]
  onReanalyze?: () => void
}

export function DanceAnalysisDisplay({ 
  movements, 
  qualityMetrics, 
  recommendations, 
  onReanalyze 
}: DanceAnalysisDisplayProps) {
  
  // Transform movement names to dance terminology
  const getDanceTerminology = (movementName: string): string => {
    const danceTerms: Record<string, string> = {
      'arm_raise': 'Port de Bras',
      'leg_lift': 'Développé',
      'jump': 'Sauté',
      'turn': 'Pirouette',
      'balance': 'Arabesque',
      'step': 'Chassé',
      'reach': 'Allongé',
      'bend': 'Plié',
      'stretch': 'Tendu',
      'spin': 'Tour',
      'leap': 'Grand Jeté',
      'slide': 'Glissade',
      'kick': 'Battement',
      'pose': 'Attitude'
    }
    
    return danceTerms[movementName.toLowerCase()] || movementName
  }

  // Get difficulty color
  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'text-green-400'
      case 'intermediate': return 'text-yellow-400'
      case 'advanced': return 'text-orange-400'
      case 'professional': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  // Get confidence color
  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 90) return 'from-green-400 to-green-600'
    if (confidence >= 75) return 'from-yellow-400 to-yellow-600'
    if (confidence >= 60) return 'from-orange-400 to-orange-600'
    return 'from-red-400 to-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Quality Metrics Overview */}
      <div className="bg-black border border-green-900/30 rounded-xl p-6">
        <h3 className="text-lg font-medium text-white mb-4">Analysis Quality</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{Math.round(qualityMetrics.overall)}%</div>
            <div className="text-xs text-gray-500">Overall</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{Math.round(qualityMetrics.lighting)}%</div>
            <div className="text-xs text-gray-500">Lighting</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{Math.round(qualityMetrics.clarity)}%</div>
            <div className="text-xs text-gray-500">Clarity</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{Math.round(qualityMetrics.stability)}%</div>
            <div className="text-xs text-gray-500">Stability</div>
          </div>
        </div>
      </div>

      {/* Detected Dance Movements */}
      <div className="bg-black border border-green-900/30 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-green-900/30">
          <h3 className="text-lg font-medium text-white">Detected Dance Movements</h3>
          <p className="text-sm text-gray-400 mt-1">
            {movements.length} movements identified using dance terminology
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-green-900/30">
                <th className="px-6 py-4 text-left text-sm font-medium text-green-400">Movement</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-green-400">Style</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-green-400">Difficulty</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-green-400">Confidence</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-green-400">Duration</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((movement, index) => (
                <tr
                  key={index}
                  className="border-b border-green-900/20 last:border-b-0 hover:bg-green-950/20 transition duration-300"
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm text-white font-medium">
                        {getDanceTerminology(movement.name)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {movement.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-950/30 text-blue-400 border border-blue-900/50">
                      {movement.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${getDifficultyColor(movement.difficulty)}`}>
                      {movement.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-green-950/50 rounded-full h-2 overflow-hidden border border-green-900/50">
                        <div
                          className={`bg-gradient-to-r ${getConfidenceColor(movement.confidence)} h-full shadow-lg transition-all duration-500`}
                          style={{ width: `${movement.confidence}%` }}
                        />
                      </div>
                      <span className="text-xs text-green-400">{Math.round(movement.confidence)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {movement.timeRange?.end && movement.timeRange?.start
                      ? (movement.timeRange.end - movement.timeRange.start).toFixed(1) + 's'
                      : movement.duration
                      ? (movement.duration / 1000).toFixed(1) + 's'
                      : (movement.endTime - movement.startTime).toFixed(1) + 's'
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-black border border-green-900/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">Analysis Recommendations</h3>
            {onReanalyze && (
              <button
                onClick={onReanalyze}
                className="text-sm text-green-400 hover:text-green-300 transition duration-300"
              >
                Re-analyze Video
              </button>
            )}
          </div>
          <ul className="space-y-2">
            {recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-400">
                <span className="text-green-400 mt-0.5">→</span>
                {recommendation}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}