'use client';

import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export const FirebaseLoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      
      // Set a simple session cookie for the middleware
      // In a production app, you should use an API route to set a HttpOnly secure cookie
      document.cookie = `firebase-auth-token=${token}; path=/; max-age=3600; SameSite=Lax`;
      
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    }
  };

  return (
    <form className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground relative z-10" onSubmit={handleSignIn}>
      <div className="mb-6 flex flex-col gap-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary font-outfit uppercase">Welcome Back</h1>
        <p className="text-sm text-text-secondary font-medium font-inter">Sign in with Firebase</p>
      </div>
      
      <label className="text-sm text-text-secondary font-bold uppercase tracking-wider mb-1" htmlFor="email">
        Email
      </label>
      <input
        className="rounded-lg px-4 py-3 bg-surface-base border border-border-subtle mb-6 text-text-primary placeholder-text-secondary/30 focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all font-medium shadow-sm"
        name="email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      
      <label className="text-sm text-text-secondary font-bold uppercase tracking-wider mb-1" htmlFor="password">
        Password
      </label>
      <input
        className="rounded-lg px-4 py-3 bg-surface-base border border-border-subtle mb-6 text-text-primary placeholder-text-secondary/30 focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all font-medium shadow-sm"
        type="password"
        name="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      
      <button type="submit" className="bg-brand-primary hover:bg-brand-primary/90 focus:ring-4 focus:ring-brand-primary/20 text-white font-semibold rounded-lg px-4 py-2.5 transition-all w-full mt-2 shadow-lg shadow-brand-primary/20">
        Sign In
      </button>
      
      {error && (
        <p className="mt-4 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-center text-sm rounded-lg font-bold">
          {error}
        </p>
      )}
    </form>
  );
};
