'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { partnersApi, companiesApi } from '@/lib/api';
import { Company, Partner } from '@/lib/types';
import AuthGuard from '@/components/layout/AuthGuard';
import Navbar from '@/components/layout/Navbar';
import Modal from '@/components/ui/Modal';
import PartnerAvatar from '@/components/ui/PartnerAvatar';
import ProgressBar from '@/components/ui/ProgressBar';
import EmptyState from '@/components/ui/EmptyState';
import { ArrowLeft, Plus, Pencil, Trash2, Upload, Users } from 'lucide-react';

const schema = z.object({
  fullName: z.string().min(2, 'Мінімум 2 символи'),
  share: z.number({ invalid_type_error: 'Введіть число' }).min(1, 'Мінімум 1%').max(100, 'Максимум 100%'),
});
type FormData = z.infer<typeof schema>;

export default function PartnersPage() {
  const params = useParams();
  const companyId = params.id as string;
  const [company, setCompany] = useState<Company | null>(null);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const load = async () => {
    try {
      const [compRes, partRes] = await Promise.all([companiesApi.get(companyId), partnersApi.list(companyId)]);
      setCompany(compRes.data);
      setPartners(partRes.data);
    } catch { toast.error('Помилка завантаження'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [companyId]);

  const openAdd = () => { setEditingPartner(null); setPhotoFile(null); reset({ fullName: '', share: undefined }); setModalOpen(true); };
  const openEdit = (p: Partner) => { setEditingPartner(p); setPhotoFile(null); setValue('fullName', p.fullName); setValue('share', p.share); setModalOpen(true); };

  const onSubmit = async (data: FormData) => {
    try {
      const fd = new FormData();
      fd.append('fullName', data.fullName);
      fd.append('share', String(data.share));
      if (photoFile) fd.append('photo', photoFile);

      if (editingPartner) {
        await partnersApi.update(companyId, editingPartner.id, fd);
        toast.success('Оновлено');
      } else {
        await partnersApi.create(companyId, fd);
        toast.success('Додано');
      }
      setModalOpen(false);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Помилка');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Видалити партнера?')) return;
    try {
      await partnersApi.delete(companyId, id);
      toast.success('Видалено');
      load(); // Full reload since revenue rules may reference this partner
    } catch { toast.error('Помилка видалення'); }
  };

  const totalShare = partners.reduce((s, p) => s + p.share, 0);

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
              <h1 className="font-display font-bold text-2xl text-gray-900">Співвласники</h1>
              <p className="text-gray-500 text-sm mt-0.5">Загальна частка: <span className={`font-semibold ${totalShare === 100 ? 'text-green-600' : totalShare > 100 ? 'text-red-600' : 'text-purple-600'}`}>{totalShare}%</span></p>
            </div>
            <button onClick={openAdd} className="btn-primary">
              <Plus className="w-4 h-4" /> Додати
            </button>
          </div>

          {/* Total bar */}
          <div className="card p-4 mb-6">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Розподіл часток</span>
              <span className={totalShare === 100 ? 'text-green-600 font-medium' : ''}>{totalShare}% / 100%</span>
            </div>
            <ProgressBar value={totalShare} color={totalShare === 100 ? 'bg-green-500' : 'bg-purple-500'} />
            {totalShare === 100 && <p className="text-xs text-green-600 mt-1.5">✓ Частки розподілено рівно по 100%</p>}
            {totalShare < 100 && partners.length > 0 && <p className="text-xs text-amber-600 mt-1.5">Залишилось розподілити {100 - totalShare}%</p>}
          </div>

          {/* Partners */}
          {loading ? (
            <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : partners.length === 0 ? (
            <div className="card"><EmptyState icon={<Users className="w-8 h-8 text-purple-400" />} title="Немає партнерів" description="Додайте першого співвласника до вашого проєкту" action={<button onClick={openAdd} className="btn-primary">Додати партнера</button>} /></div>
          ) : (
            <div className="space-y-3">
              {partners.map((partner, i) => (
                <div key={partner.id} className="card p-5 group">
                  <div className="flex items-start gap-4">
                    <span className="text-sm font-bold text-gray-300 w-5 flex-shrink-0 mt-1">{i + 1}</span>
                    <PartnerAvatar name={partner.fullName} photoUrl={partner.photoUrl} size="lg" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-display font-bold text-gray-900">{partner.fullName}</h3>
                          <p className="text-sm text-gray-500 mt-0.5">Частка компанії «{company?.name}»</p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(partner)} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(partner.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Частка</span>
                          <span className="font-bold text-purple-600">{partner.share}%</span>
                        </div>
                        <ProgressBar value={partner.share} />
                      </div>
                      {partner.revenueShares && partner.revenueShares.length > 0 && (
                        <div className="mt-3 space-y-1.5">
                          {partner.revenueShares.map(rs => (
                            <div key={rs.id} className="flex justify-between text-xs text-gray-500">
                              <span>{rs.revenueRule?.name}</span>
                              <span className="font-medium text-gray-700">{rs.share}%</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingPartner ? 'Редагувати партнера' : 'Додати партнера'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Повне ім'я (ПІП)</label>
            <input {...register('fullName')} placeholder="Іванов Іван Іванович" className="input" />
            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
          </div>
          <div>
            <label className="label">Частка компанії (1–100%)</label>
            <input {...register('share', { valueAsNumber: true })} type="number" min="1" max="100" placeholder="50" className="input" />
            {errors.share && <p className="text-red-500 text-xs mt-1">{errors.share.message}</p>}
            <p className="text-xs text-gray-400 mt-1">Доступно: {Math.max(0, 100 - totalShare + (editingPartner?.share || 0))}%</p>
          </div>
          <div>
            <label className="label">Фото (опційно)</label>
            <div onClick={() => photoRef.current?.click()} className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-purple-300 transition-colors">
              {photoFile ? (
                <p className="text-sm text-purple-600">{photoFile.name}</p>
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-gray-400">
                  <Upload className="w-5 h-5" />
                  <span className="text-xs">Клікніть для вибору файлу</span>
                </div>
              )}
            </div>
            <input ref={photoRef} type="file" accept="image/*" className="sr-only" onChange={e => setPhotoFile(e.target.files?.[0] || null)} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1 justify-center">Скасувати</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 justify-center">
              {isSubmitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (editingPartner ? 'Зберегти' : 'Додати')}
            </button>
          </div>
        </form>
      </Modal>
    </AuthGuard>
  );
}
