interface ProgressBarProps { value: number; color?: string; className?: string; }
export default function ProgressBar({ value, color = 'bg-purple-500', className = '' }: ProgressBarProps) {
  return (
    <div className={`h-2 bg-gray-100 rounded-full overflow-hidden ${className}`}>
      <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  );
}
