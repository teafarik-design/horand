'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clearAuth, getUser } from '@/lib/auth';
import { Building2, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const user = getUser();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const logout = () => {
    clearAuth();
    router.push('/auth/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center group-hover:bg-purple-600 transition-colors">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div className="leading-none">
            <div className="font-display font-bold text-gray-900 text-sm">HORAND</div>
            <div className="font-display font-bold text-purple-500 text-sm">Partnership</div>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <div className="relative" ref={menuRef}>
            <button onClick={() => setOpen(!open)} className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors">
              <div className="w-7 h-7 bg-purple-100 rounded-full flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.name || 'User'}</span>
            </button>
            {open && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-gray-100 shadow-lg py-1 z-50">
                <div className="px-3 py-2 border-b border-gray-100">
                  <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                  <div className="text-xs text-gray-500">{user?.email}</div>
                </div>
                <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                  <LogOut className="w-4 h-4" />
                  Вийти
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
