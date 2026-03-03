'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api';
import { setAuth } from '@/lib/auth';
import { Building2, Eye, EyeOff } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Введіть коректний email'),
  password: z.string().min(6, 'Мінімум 6 символів'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await authApi.login(data);
      setAuth(res.data.access_token, res.data.user);
      toast.success('Вітаємо! Успішний вхід');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Невірні дані для входу');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-purple-500 rounded-2xl mb-4 shadow-lg shadow-purple-200">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display font-bold text-2xl text-gray-900">HORAND Partnership</h1>
          <p className="text-gray-500 text-sm mt-1">Управління партнерськими угодами</p>
        </div>

        {/* Card */}
        <div className="card p-8">
          <h2 className="font-display font-bold text-xl text-gray-900 mb-6">Вхід до системи</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input {...register('email')} type="email" placeholder="your@email.com" className="input" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label">Пароль</label>
              <div className="relative">
                <input {...register('password')} type={showPass ? 'text' : 'password'} placeholder="••••••••" className="input pr-10" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center mt-2">
              {isSubmitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Увійти'}
            </button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-gray-500">Немає акаунту? </span>
            <Link href="/auth/register" className="text-purple-600 font-medium hover:underline">Зареєструватись</Link>
          </div>
          <div className="mt-4 p-3 bg-purple-50 rounded-xl text-xs text-gray-500">
            <strong>Demo:</strong> demo@horand.com / password123
          </div>
        </div>
      </div>
    </div>
  );
}
