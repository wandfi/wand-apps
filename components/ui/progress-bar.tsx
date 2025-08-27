import React from 'react';

interface ProgressBarProps {
  value: number; // 进度值，0-100
  className?: string; // 可选的额外类名
  height?: string; // 进度条高度，默认为h-4
  color?: string; // 进度条颜色，默认为bg-blue-500
  showLabel?: boolean; // 是否显示进度标签
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  className = '',
  height = 'h-4',
  color = 'bg-primary',
  showLabel = false,
}) => {
  // 确保值在0-100范围内
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={`w-full bg-gray-200 rounded-full relative ${height} ${className}`}>
      <div
        className={`${color} h-full rounded-full transition-all duration-500 ease-out`}
        style={{ width: `${clampedValue}%` }}
      />
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
          {`${clampedValue}%`}
        </div>
      )}
    </div>
  );
};
