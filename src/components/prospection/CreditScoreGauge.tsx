// src/components/prospection/CreditScoreGauge.tsx

interface CreditScoreGaugeProps {
  score: number; // 0-100
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

/**
 * Composant de visualisation du score de crédit (0-100) sous forme de jauge circulaire
 * 
 * Code couleur pour évaluation rapide de solvabilité:
 * - 0-49: Rouge (risque élevé)
 * - 50-69: Orange (risque modéré)
 * - 70-84: Jaune (risque acceptable)
 * - 85-100: Vert (excellent)
 */
export function CreditScoreGauge({ score, size = 'medium', showLabel = true }: CreditScoreGaugeProps) {
  // Validation du score
  const validScore = Math.max(0, Math.min(100, score));
  
  // Déterminer la couleur selon le score
  const getScoreColor = (s: number): string => {
    if (s < 50) return '#ef4444'; // red-500
    if (s < 70) return '#f97316'; // orange-500
    if (s < 85) return '#eab308'; // yellow-500
    return '#22c55e'; // green-500
  };

  const getScoreLabel = (s: number): string => {
    if (s < 50) return 'Risque élevé';
    if (s < 70) return 'Risque modéré';
    if (s < 85) return 'Acceptable';
    return 'Excellent';
  };

  // Dimensions selon la taille
  const dimensions = {
    small: { size: 120, needleLength: 40, fontSize: 16, labelSize: 8 },
    medium: { size: 160, needleLength: 55, fontSize: 22, labelSize: 10 },
    large: { size: 200, needleLength: 70, fontSize: 28, labelSize: 12 }
  };

  const { size: svgSize, needleLength, fontSize, labelSize } = dimensions[size];
  const centerX = svgSize / 2;
  const centerY = svgSize / 2 + 10;
  const arcRadius = svgSize / 2 - 20;
  
  // Angle de l'aiguille basé sur le score (de 180° à 0°, soit de gauche à droite)
  const needleAngle = 180 - (validScore / 100) * 180;
  const needleAngleRad = (needleAngle * Math.PI) / 180;
  const needleEndX = centerX + needleLength * Math.cos(needleAngleRad);
  const needleEndY = centerY - needleLength * Math.sin(needleAngleRad);

  const color = getScoreColor(validScore);

  // Créer l'arc en dégradé avec plusieurs segments
  const createGradientArc = () => {
    const segments = [
      { start: 0, end: 50, color: '#ef4444' },    // Rouge
      { start: 50, end: 70, color: '#f97316' },   // Orange
      { start: 70, end: 85, color: '#eab308' },   // Jaune
      { start: 85, end: 100, color: '#22c55e' }   // Vert
    ];

    return segments.map((segment, index) => {
      const startAngle = 180 - (segment.start / 100) * 180;
      const endAngle = 180 - (segment.end / 100) * 180;
      const startAngleRad = (startAngle * Math.PI) / 180;
      const endAngleRad = (endAngle * Math.PI) / 180;

      const startX = centerX + arcRadius * Math.cos(startAngleRad);
      const startY = centerY - arcRadius * Math.sin(startAngleRad);
      const endX = centerX + arcRadius * Math.cos(endAngleRad);
      const endY = centerY - arcRadius * Math.sin(endAngleRad);

      return (
        <path
          key={index}
          d={`M ${startX} ${startY} A ${arcRadius} ${arcRadius} 0 0 1 ${endX} ${endY}`}
          fill="none"
          stroke={segment.color}
          strokeWidth="8"
          strokeLinecap="round"
        />
      );
    });
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: svgSize, height: svgSize / 1.5 }}>
        <svg width={svgSize} height={svgSize / 1.5} viewBox={`0 0 ${svgSize} ${svgSize / 1.5}`}>
          {/* Arc en dégradé de couleurs */}
          {createGradientArc()}
          
          {/* Graduation marks */}
          {[0, 25, 50, 75, 100].map((mark) => {
            const angle = 180 - (mark / 100) * 180;
            const angleRad = (angle * Math.PI) / 180;
            const x1 = centerX + (arcRadius - 5) * Math.cos(angleRad);
            const y1 = centerY - (arcRadius - 5) * Math.sin(angleRad);
            const x2 = centerX + (arcRadius + 5) * Math.cos(angleRad);
            const y2 = centerY - (arcRadius + 5) * Math.sin(angleRad);
            
            return (
              <g key={mark}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#9ca3af"
                  strokeWidth="2"
                />
                <text
                  x={centerX + (arcRadius + 15) * Math.cos(angleRad)}
                  y={centerY - (arcRadius + 15) * Math.sin(angleRad) + 3}
                  textAnchor="middle"
                  fontSize={labelSize}
                  fill="#6b7280"
                  className="font-medium"
                >
                  {mark}
                </text>
              </g>
            );
          })}
          
          {/* Aiguille */}
          <g>
            <line
              x1={centerX}
              y1={centerY}
              x2={needleEndX}
              y2={needleEndY}
              stroke={color}
              strokeWidth="3"
              strokeLinecap="round"
              style={{ transition: 'all 0.5s ease' }}
            />
            <circle cx={centerX} cy={centerY} r="6" fill={color} />
            <circle cx={centerX} cy={centerY} r="3" fill="white" />
          </g>
        </svg>
        
        {/* Score text sous le cadran */}
        <div 
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center"
          style={{ fontSize: `${fontSize}px` }}
        >
          <span className="font-bold" style={{ color }}>
            {validScore}
          </span>
        </div>
      </div>
      
      {showLabel && (
        <div className="text-center">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Score de crédit
          </div>
          <div className="text-xs font-semibold" style={{ color }}>
            {getScoreLabel(validScore)}
          </div>
        </div>
      )}
    </div>
  );
}
