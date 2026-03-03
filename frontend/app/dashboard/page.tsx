'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { companiesApi } from '@/lib/api';
import { Company } from '@/lib/types';
import { getUser } from '@/lib/auth';
import AuthGuard from '@/components/layout/AuthGuard';
import Navbar from '@/components/layout/Navbar';
import PartnerAvatar from '@/components/ui/PartnerAvatar';
import EmptyState from '@/components/ui/EmptyState';
import { Building2, Plus, Users, FileText, ChevronRight, Trash2, FolderOpen } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const user = getUser();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    companiesApi.list().then(res => setCompanies(res.data)).catch(() => toast.error('Помилка завантаження')).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Видалити "${name}"? Всі дані буде втрачено.`)) return;
    try {
      await companiesApi.delete(id);
      setCompanies(prev => prev.filter(c => c.id !== id));
      toast.success('Видалено');
    } catch { toast.error('Помилка видалення'); }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display font-bold text-2xl text-gray-900">Дашборд</h1>
              <p className="text-gray-500 text-sm mt-0.5">Вітаємо, {user?.name}!</p>
            </div>
            <Link href="/company/new" className="btn-primary">
              <Plus className="w-4 h-4" />
              Нова компанія / проєкт
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Компаній/проєктів', value: companies.length, icon: <Building2 className="w-5 h-5 text-purple-500" /> },
              { label: 'Партнерів', value: companies.reduce((s, c) => s + (c._count?.partners || c.partners?.length || 0), 0), icon: <Users className="w-5 h-5 text-blue-500" /> },
              { label: 'Договорів', value: companies.reduce((s, c) => s + (c.agreements?.length || 0), 0), icon: <FileText className="w-5 h-5 text-green-500" /> },
            ].map((stat, i) => (
              <div key={i} className="card p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">{stat.icon}</div>
                  <div>
                    <div className="font-display font-bold text-xl text-gray-900">{stat.value}</div>
                    <div className="text-xs text-gray-500">{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Companies List */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : companies.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={<FolderOpen className="w-8 h-8 text-purple-400" />}
                title="Немає компаній/проєктів"
                description="Створіть свою першу компанію або проєкт, щоб розпочати"
                action={<Link href="/company/new" className="btn-primary">Створити зараз</Link>}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="font-display font-semibold text-gray-900">Ваші компанії та проєкти</h2>
              {companies.map(company => (
                <div key={company.id} className="card p-5 hover:shadow-md transition-shadow group relative">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-display font-bold text-gray-900">{company.name}</h3>
                          <span className="badge bg-purple-100 text-purple-700 mt-1">
                            {company.type === 'COMPANY' ? 'Компанія' : 'Проєкт'}
                          </span>
                        </div>
                          <div className="flex items-center gap-1 flex-shrink-0 relative z-10">
                          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(company.id, company.name); }} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <Link href={`/company/${company.id}`} className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors relative z-10">
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>

                      {/* Partners preview */}
                      {company.partners && company.partners.length > 0 && (
                        <div className="mt-3 flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {company.partners.slice(0, 4).map(p => (
                              <div key={p.id} className="ring-2 ring-white rounded-full">
                                <PartnerAvatar name={p.fullName} photoUrl={p.photoUrl} size="sm" />
                              </div>
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">{company.partners.length} партнер{company.partners.length !== 1 ? 'ів' : ''}</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-xs text-gray-500">{formatDate(company.createdAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Link href={`/company/${company.id}`} className="absolute inset-0 rounded-2xl" aria-label={company.name} />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
