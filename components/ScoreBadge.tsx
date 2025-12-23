'use client';

interface ScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showBar?: boolean;
}

export default function ScoreBadge({ score, size = 'md', showBar = true }: ScoreBadgeProps) {
  const getColorClasses = () => {
    if (score >= 70) return {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200',
      bar: 'bg-green-500',
      label: 'bg-green-600',
    };
    if (score >= 40) return {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-200',
      bar: 'bg-yellow-500',
      label: 'bg-yellow-600',
    };
    return {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      border: 'border-gray-200',
      bar: 'bg-gray-400',
      label: 'bg-gray-500',
    };
  };

  const getLabel = () => {
    if (score >= 70) return 'Hot';
    if (score >= 40) return 'Warm';
    return 'Cold';
  };

  const colors = getColorClasses();

  const sizeClasses = {
    sm: { container: 'w-16', text: 'text-sm', label: 'text-[10px]' },
    md: { container: 'w-20', text: 'text-lg', label: 'text-xs' },
    lg: { container: 'w-24', text: 'text-xl', label: 'text-sm' },
  };

  const sizes = sizeClasses[size];

  return (
    <div className={`${sizes.container} flex flex-col items-center`}>
      {/* Score number */}
      <div className={`flex items-baseline gap-0.5 ${colors.text}`}>
        <span className={`font-bold ${sizes.text}`}>{score}</span>
        <span className="text-xs opacity-60">/100</span>
      </div>

      {/* Progress bar */}
      {showBar && (
        <div className={`w-full h-1.5 ${colors.bg} rounded-full mt-1 overflow-hidden`}>
          <div
            className={`h-full ${colors.bar} rounded-full transition-all duration-300`}
            style={{ width: `${score}%` }}
          />
        </div>
      )}

      {/* Label */}
      <span className={`mt-1.5 px-2 py-0.5 rounded-full text-white font-medium ${colors.label} ${sizes.label}`}>
        {getLabel()}
      </span>
    </div>
  );
}
