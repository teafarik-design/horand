'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { companiesApi } from '@/lib/api';
import AuthGuard from '@/components/layout/AuthGuard';
import Navbar from '@/components/layout/Navbar';
import { ArrowLeft, Building2, FolderOpen } from 'lucide-react';

const schema = z.object({
  name: z.string().min(1, "Введіть назву"),
  type: z.enum(['COMPANY', 'PROJECT']),
});
type FormData = z.infer<typeof schema>;

export default function NewCompanyPage() {
  const router = useRouter();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'COMPANY' },
  });
  const type = watch('type');

  const onSubmit = async (data: FormData) => {
    try {
      const res = await companiesApi.create(data);
      toast.success('Створено успішно!');
      router.push(`/company/${res.data.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Помилка створення');
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-lg mx-auto px-4 pt-24 pb-12">
          <Link href="/dashboard" className="btn-ghost mb-6 -ml-2">
            <ArrowLeft className="w-4 h-4" /> Назад
          </Link>
          <div className="card p-8">
            <h1 className="font-display font-bold text-2xl text-gray-900 mb-2">Новий проєкт</h1>
            <p className="text-gray-500 text-sm mb-8">Заповніть основну інформацію</p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Type */}
              <div>
                <label className="label">Тип</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'COMPANY', label: 'Компанія', icon: <Building2 className="w-5 h-5" /> },
                    { value: 'PROJECT', label: 'Проєкт', icon: <FolderOpen className="w-5 h-5" /> },
                  ].map(opt => (
                    <label key={opt.value} className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${type === opt.value ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-200'}`}>
                      <input type="radio" {...register('type')} value={opt.value} className="sr-only" />
                      <div className={type === opt.value ? 'text-purple-500' : 'text-gray-400'}>{opt.icon}</div>
                      <span className={`text-sm font-medium ${type === opt.value ? 'text-purple-700' : 'text-gray-600'}`}>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* Name */}
              <div>
                <label className="label">{type === 'COMPANY' ? 'Назва компанії' : 'Назва проєкту'}</label>
                <input {...register('name')} placeholder={type === 'COMPANY' ? 'Наприклад: Канаріс' : 'Наприклад: Квантіс'} className="input" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center">
                {isSubmitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Створити'}
              </button>
            </form>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
