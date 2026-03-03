'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { companiesApi } from '@/lib/api';
import { Company } from '@/lib/types';
import AuthGuard from '@/components/layout/AuthGuard';
import Navbar from '@/components/layout/Navbar';
import PartnerAvatar from '@/components/ui/PartnerAvatar';
import ProgressBar from '@/components/ui/ProgressBar';
import { getRevenueTypeLabel, getRevenueTypeBadgeColor } from '@/lib/utils';
import { ArrowLeft, Users, DollarSign, FileText, ChevronRight, Plus } from 'lucide-react';

export default function CompanyPage() {
  const params = useParams();
  const id = params.id as string;
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    companiesApi.get(id).then(res => setCompany(res.data)).catch(() => toast.error('Помилка завантаження')).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <AuthGuard><div className="min-h-screen bg-gray-50"><Navbar />
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </div></AuthGuard>
  );
  if (!company) return null;

  const totalShare = company.partners?.reduce((s, p) => s + p.share, 0) || 0;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-12">
          <Link href="/dashboard" className="btn-ghost mb-6 -ml-2">
            <ArrowLeft className="w-4 h-4" /> Дашборд
          </Link>

          {/* Company Header */}
          <div className="card p-6 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge bg-purple-100 text-purple-700">{company.type === 'COMPANY' ? 'Компанія' : 'Проєкт'}</span>
                </div>
                <h1 className="font-display font-bold text-2xl text-gray-900">"{company.name}"</h1>
                <p className="text-sm text-gray-500 mt-1">{company.partners?.length || 0} партнер(ів) • Загальна частка: {totalShare}%</p>
              </div>
            </div>

            {/* Total share progress */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Розподіл часток</span>
                <span>{totalShare}% / 100%</span>
              </div>
              <ProgressBar value={totalShare} color={totalShare === 100 ? 'bg-green-500' : totalShare > 100 ? 'bg-red-500' : 'bg-purple-500'} />
            </div>
          </div>

          {/* Navigation Cards */}
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            {[
              { href: `/company/${id}/partners`, icon: <Users className="w-6 h-6 text-purple-500" />, title: 'Співвласники', count: company.partners?.length || 0, desc: 'Управління партнерами', color: 'bg-purple-50' },
              { href: `/company/${id}/revenue`, icon: <DollarSign className="w-6 h-6 text-blue-500" />, title: 'Розподіл доходів', count: company.revenueRules?.length || 0, desc: 'Правила розподілу', color: 'bg-blue-50' },
              { href: `/company/${id}/agreement`, icon: <FileText className="w-6 h-6 text-green-500" />, title: 'Договір', count: company.agreements?.length || 0, desc: 'Перегляд та експорт', color: 'bg-green-50' },
            ].map(item => (
              <Link key={item.href} href={item.href} className="card p-5 hover:shadow-md transition-all hover:-translate-y-0.5 group">
                <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center mb-3`}>{item.icon}</div>
                <div className="font-display font-bold text-gray-900 mb-0.5">{item.title}</div>
                <div className="text-xs text-gray-500">{item.desc}</div>
                <div className="flex items-center justify-between mt-3">
                  <span className="badge bg-gray-100 text-gray-600">{item.count}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                </div>
              </Link>
            ))}
          </div>

          {/* Partners overview */}
          {company.partners && company.partners.length > 0 && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-gray-900">Огляд співвласників</h2>
                <Link href={`/company/${id}/partners`} className="text-sm text-purple-600 hover:underline flex items-center gap-1">
                  Всі <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-4">
                {company.partners.map((partner, i) => (
                  <div key={partner.id} className="flex items-center gap-4">
                    <div className="text-xs font-bold text-gray-400 w-4">{i + 1}</div>
                    <PartnerAvatar name={partner.fullName} photoUrl={partner.photoUrl} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 truncate">{partner.fullName}</span>
                        <span className="text-sm font-bold text-purple-600 ml-2">{partner.share}%</span>
                      </div>
                      <ProgressBar value={partner.share} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Pie chart visual */}
              {company.partners.length >= 2 && (
                <div className="mt-6 flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-16 h-16 rounded-full flex-shrink-0" style={{
                    background: `conic-gradient(${company.partners.map((p, i) => {
                      const colors = ['#7B2FE8', '#B980FF', '#9B59FF', '#6620CC'];
                      const start = company.partners.slice(0, i).reduce((s, pp) => s + pp.share, 0);
                      return `${colors[i % colors.length]} ${start}% ${start + p.share}%`;
                    }).join(', ')})`,
                  }} />
                  <div className="space-y-1.5">
                    {company.partners.map((p, i) => {
                      const colors = ['bg-purple-500', 'bg-purple-300', 'bg-purple-700', 'bg-purple-400'];
                      return (
                        <div key={p.id} className="flex items-center gap-2 text-xs text-gray-600">
                          <div className={`w-2.5 h-2.5 rounded-full ${colors[i % colors.length]}`} />
                          {p.fullName} — {p.share}%
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
