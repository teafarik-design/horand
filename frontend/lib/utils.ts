import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getApiUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';
  return base + path;
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('uk-UA', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function getRevenueTypeLabel(type: string) {
  const map: Record<string, string> = {
    PROJECT: 'Доходи з проєкту',
    CLIENTS: 'Доходи від клієнтів',
    NET_PROFIT: 'Чистий прибуток',
  };
  return map[type] || type;
}

export function getRevenueTypeBadgeColor(type: string) {
  const map: Record<string, string> = {
    PROJECT: 'bg-purple-100 text-purple-700',
    CLIENTS: 'bg-blue-100 text-blue-700',
    NET_PROFIT: 'bg-green-100 text-green-700',
  };
  return map[type] || 'bg-gray-100 text-gray-700';
}
