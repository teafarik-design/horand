import { ReactNode } from 'react';
interface EmptyStateProps { icon: ReactNode; title: string; description: string; action?: ReactNode; }
export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-4">{icon}</div>
      <h3 className="font-display font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-xs">{description}</p>
      {action}
    </div>
  );
}
