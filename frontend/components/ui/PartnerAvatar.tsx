import { getApiUrl } from '@/lib/utils';
import Image from 'next/image';

interface PartnerAvatarProps { name: string; photoUrl?: string; size?: 'sm' | 'md' | 'lg'; }

export default function PartnerAvatar({ name, photoUrl, size = 'md' }: PartnerAvatarProps) {
  const sizeClass = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-16 h-16 text-lg' }[size];
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  if (photoUrl) {
    return (
      <div className={`${sizeClass} rounded-full overflow-hidden bg-purple-100 flex-shrink-0 relative`}>
        <Image src={getApiUrl(photoUrl)} alt={name} fill className="object-cover" unoptimized />
      </div>
    );
  }
  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center flex-shrink-0`}>
      <span className="font-bold text-white">{initials}</span>
    </div>
  );
}
