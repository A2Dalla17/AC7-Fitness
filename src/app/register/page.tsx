'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import AuthCard from '@/components/AuthCard';

export default function RegisterPage() {
  const { signUpWithEmail, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signUpWithEmail(name, email, password);
      router.push('/onboarding/role');
    } catch (err: any) {
      setError(err.message ?? 'Could not create account');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    try {
      await signInWithGoogle();
      router.push('/onboarding/role');
    } catch (err: any) {
      setError(err.message ?? 'Google sign-in failed');
    }
  };

  return (
    <AuthCard title="Create your account" subtitle="Join AC7 Fitness today">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          required
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-navy"
        />
        <input
          required
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-navy"
        />
        <input
          required
          type="password"
          minLength={6}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-navy"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          disabled={loading}
          type="submit"
          className="rounded-full bg-navy px-6 py-3.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(163,230,53,0.3)] disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>
      <button
        onClick={handleGoogle}
        className="mt-3 w-full rounded-full border border-white/15 px-6 py-3.5 text-sm font-semibold text-ink"
      >
        Continue with Google
      </button>
      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-navy">
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}
