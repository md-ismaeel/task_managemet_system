'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { AxiosError } from 'axios';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Include at least one uppercase letter')
    .regex(/[0-9]/, 'Include at least one number'),
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [showPwd, setShowPwd] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setServerError('');
    try {
      await registerUser(data.name, data.email, data.password);
    } catch (err) {
      const e = err as AxiosError<{ message: string }>;
      setServerError(e.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="animate-slide-up">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-8">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--accent)' }}
        >
          <Zap size={18} className="text-white" fill="white" />
        </div>
        <span className="text-lg font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          TaskFlow
        </span>
      </div>

      <div className="card p-8">
        <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
          Create an account
        </h1>
        <p className="text-sm mb-7" style={{ color: 'var(--text-secondary)' }}>
          Start managing your tasks today
        </p>

        {serverError && (
          <div
            className="mb-5 px-4 py-3 rounded-lg text-sm"
            style={{ background: 'var(--danger-muted)', color: 'var(--danger)', border: '1px solid var(--danger)' }}
          >
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="label">Full name</label>
            <input {...register('name')} type="text" className="input" placeholder="Alex Johnson" autoComplete="name" />
            {errors.name && (
              <p className="mt-1.5 text-xs" style={{ color: 'var(--danger)' }}>
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="label">Email address</label>
            <input {...register('email')} type="email" className="input" placeholder="you@example.com" autoComplete="email" />
            {errors.email && (
              <p className="mt-1.5 text-xs" style={{ color: 'var(--danger)' }}>
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPwd ? 'text' : 'password'}
                className="input pr-10"
                placeholder="Min. 8 characters"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs" style={{ color: 'var(--danger)' }}>
                {errors.password.message}
              </p>
            )}
            <p className="mt-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              8+ characters, one uppercase, one number
            </p>
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-2">
            {isSubmitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Creating account…
              </>
            ) : (
              'Create account'
            )}
          </button>
        </form>
      </div>

      <p className="text-center mt-5 text-sm" style={{ color: 'var(--text-secondary)' }}>
        Already have an account?{' '}
        <Link href="/login" className="font-medium hover:underline" style={{ color: 'var(--accent)' }}>
          Sign in
        </Link>
      </p>
    </div>
  );
}
