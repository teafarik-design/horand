'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { revenueApi, companiesApi, partnersApi } from '@/lib/api';
import { Company, Partner, RevenueRule } from '@/lib/types';
import AuthGuard from '@/components/layout/AuthGuard';
import Navbar from '@/components/layout/Navbar';
import Modal from '@/components/ui/Modal';
import ProgressBar from '@/components/ui/ProgressBar';
import EmptyState from '@/components/ui/EmptyState';
import { getRevenueTypeLabel, getRevenueTypeBadgeColor } from '@/lib/utils';
import { ArrowLeft, Plus, Pencil, Trash2, DollarSign, AlertCircle } from 'lucide-react';

const schema = z.object({
  type: z.enum(['PROJECT', 'CLIENTS', 'NET_PROFIT']),
  name: z.string().min(1, 'Введіть назву'),
  description: z.string().optional(),
  shares: z.array(z.object({
    partnerId: z.string(),
    share: z.number().min(0).max(100),
    partnerName: z.string(),
  })),
}).refine(d => {
  const total = d.shares.reduce((s, sh) => s + sh.share, 0);
  return Math.abs(total - 100) < 0.01;
}, { message: 'Сума часток має дорівнювати 100%', path: ['shares'] });

type FormData = z.infer<typeof schema>;

export default function RevenuePage() {
  const params = useParams();
  const companyId = params.id as string;
  const [company, setCompany] = useState<Company | null>(null);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [rules, setRules] = useState<RevenueRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<RevenueRule | null>(null);
  const [sharesError, setSharesError] = useState('');

  const { register, handleSubmit, reset, watch, setValue, control, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'PROJECT', shares: [] },
  });
  const { fields } = useFieldArray({ control, name: 'shares' });
  const sharesValues = watch('shares');
  const sharesTotal = sharesValues?.reduce((s, sh) => s + (sh.share || 0), 0) || 0;

  const load = async () => {
    try {
      const [compRes, partRes, ruleRes] = await Promise.all([
        companiesApi.get(companyId),
        partnersApi.list(companyId),
        revenueApi.list(companyId),
      ]);
      setCompany(compRes.data);
      setPartners(partRes.data);
      setRules(ruleRes.data);
    } catch { toast.error('Помилка завантаження'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [companyId]);

  const initShares = (rule?: RevenueRule) => {
    return partners.map(p => ({
      partnerId: p.id,
      partnerName: p.fullName,
      share: rule?.shares.find(s => s.partnerId === p.id)?.share || 0,
    }));
  };

  const openAdd = () => {
    setEditingRule(null);
    reset({ type: 'PROJECT', name: '', description: '', shares: initShares() });
    setSharesError('');
    setModalOpen(true);
  };

  const openEdit = (rule: RevenueRule) => {
    setEditingRule(rule);
    reset({ type: rule.type as any, name: rule.name, description: rule.description || '', shares: initShares(rule) });
    setSharesError('');
    setModalOpen(true);
  };

  const distributeEqual = () => {
    if (partners.length === 0) return;
    const base = Math.floor((100 / partners.length) * 100) / 100;
    const remainder = Math.round((100 - base * partners.length) * 100) / 100;
    fields.forEach((_, i) => {
      const share = i === partners.length - 1 ? Math.round((base + remainder) * 100) / 100 : base;
      setValue(`shares.${i}.share`, share);
    });
  };

  const onSubmit = async (data: FormData) => {
    const total = data.shares.reduce((s, sh) => s + sh.share, 0);
    if (Math.abs(total - 100) > 0.01) { setSharesError('Сума має дорівнювати 100%'); return; }
    setSharesError('');
    try {
      const payload = {
        type: data.type,
        name: data.name,
        description: data.description,
        shares: data.shares.map(s => ({ partnerId: s.partnerId, share: s.share })),
      };
      if (editingRule) {
        await revenueApi.update(companyId, editingRule.id, payload);
        toast.success('Оновлено');
      } else {
        await revenueApi.create(companyId, payload);
        toast.success('Додано');
      }
      setModalOpen(false);
      load();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Помилка'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Видалити правило?')) return;
    try {
      await revenueApi.delete(companyId, id);
      setRules(prev => prev.filter(r => r.id !== id));
      toast.success('Видалено');
    } catch { toast.error('Помилка'); }
  };

  const typeColors: Record<string, string> = {
    PROJECT: 'from-purple-500 to-purple-700',
    CLIENTS: 'from-blue-500 to-blue-700',
    NET_PROFIT: 'from-green-500 to-green-700',
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-24 pb-12">
          <Link href={`/company/${companyId}`} className="btn-ghost mb-6 -ml-2">
            <ArrowLeft className="w-4 h-4" /> {company?.name}
          </Link>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display font-bold text-2xl text-gray-900">Розподіл доходів</h1>
              <p className="text-gray-500 text-sm mt-0.5">{rules.length} правил(о)</p>
            </div>
            <button onClick={openAdd} disabled={partners.length === 0} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
              <Plus className="w-4 h-4" /> Додати правило
            </button>
          </div>

          {partners.length === 0 && (
            <div className="card p-4 mb-4 flex items-start gap-3 border-amber-200 bg-amber-50">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700">Спочатку додайте партнерів, щоб налаштувати розподіл доходів</p>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : rules.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={<DollarSign className="w-8 h-8 text-purple-400" />}
                title="Немає правил розподілу"
                description="Додайте правила для розподілу доходів між партнерами"
                action={partners.length > 0 ? <button onClick={openAdd} className="btn-primary">Додати правило</button> : undefined}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {rules.map(rule => (
                <div key={rule.id} className="card overflow-hidden group">
                  <div className={`h-1.5 bg-gradient-to-r ${typeColors[rule.type]}`} />
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="font-display font-bold text-gray-900">{rule.name}</h3>
                        <span className={`badge mt-1 ${getRevenueTypeBadgeColor(rule.type)}`}>{getRevenueTypeLabel(rule.type)}</span>
                        {rule.description && <p className="text-xs text-gray-500 mt-1">{rule.description}</p>}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(rule)} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(rule.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    <div className="space-y-2.5">
                      {rule.shares.map(share => (
                        <div key={share.id}>
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>{share.partner?.fullName}</span>
                            <span className="font-bold">{share.share}%</span>
                          </div>
                          <ProgressBar value={share.share} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingRule ? 'Редагувати правило' : 'Додати правило'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="label">Тип розподілу</label>
            <div className="grid grid-cols-3 gap-2">
              {(['PROJECT', 'CLIENTS', 'NET_PROFIT'] as const).map(t => (
                <label key={t} className={`p-3 rounded-xl border-2 cursor-pointer text-center transition-all ${watch('type') === t ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-200'}`}>
                  <input type="radio" {...register('type')} value={t} className="sr-only" />
                  <div className={`text-xs font-medium ${watch('type') === t ? 'text-purple-700' : 'text-gray-600'}`}>{getRevenueTypeLabel(t)}</div>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Назва</label>
            <input {...register('name')} placeholder="Наприклад: Проєкт Квантіс" className="input" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">Опис (опційно)</label>
            <input {...register('description')} placeholder="Додатковий опис" className="input" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">Частки партнерів</label>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold ${Math.abs(sharesTotal - 100) < 0.01 ? 'text-green-600' : 'text-red-500'}`}>{sharesTotal.toFixed(0)}% / 100%</span>
                <button type="button" onClick={distributeEqual} className="text-xs text-purple-600 hover:underline">Рівний розподіл</button>
              </div>
            </div>
            <div className="space-y-3">
              {fields.map((field, i) => (
                <div key={field.id} className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-gray-600 mb-1 block">{field.partnerName}</label>
                    <ProgressBar value={sharesValues?.[i]?.share || 0} />
                  </div>
                  <div className="w-20 flex-shrink-0">
                    <input {...register(`shares.${i}.share`, { valueAsNumber: true })} type="number" min="0" max="100" step="0.01" className="input text-center py-2 text-sm" />
                  </div>
                  <span className="text-gray-400 text-sm w-4">%</span>
                </div>
              ))}
            </div>
            {(sharesError || errors.shares) && <p className="text-red-500 text-xs mt-2">{sharesError || 'Сума має дорівнювати 100%'}</p>}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1 justify-center">Скасувати</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 justify-center">
              {isSubmitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (editingRule ? 'Зберегти' : 'Додати')}
            </button>
          </div>
        </form>
      </Modal>
    </AuthGuard>
  );
}
