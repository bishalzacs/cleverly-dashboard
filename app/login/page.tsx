import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams;
  const message = typeof sp?.message === 'string' ? sp.message : undefined;

  const signIn = async (formData: FormData) => {
    'use server'

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return redirect(`/login?message=${encodeURIComponent(error.message)}`)
    }

    return redirect('/')
  }

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 m-auto mt-20 relative z-10 p-10 bg-surface-panel border border-border-subtle shadow-xl rounded-2xl">
      <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/5 to-transparent rounded-2xl pointer-events-none" />
      <form className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground relative z-10" action={signIn}>
        <div className="mb-6 flex flex-col gap-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-text-primary font-outfit uppercase">Welcome Back</h1>
            <p className="text-sm text-text-secondary font-medium font-inter">Sign in to your dashboard</p>
        </div>
        
        <label className="text-sm text-text-secondary font-bold uppercase tracking-wider mb-1" htmlFor="email">
          Email
        </label>
        <input
          className="rounded-lg px-4 py-3 bg-surface-base border border-border-subtle mb-6 text-text-primary placeholder-text-secondary/30 focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all font-medium shadow-sm"
          name="email"
          placeholder="you@example.com"
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
          required
        />
        
        <button className="bg-brand-primary hover:bg-brand-primary/90 focus:ring-4 focus:ring-brand-primary/20 text-white font-semibold rounded-lg px-4 py-2.5 transition-all w-full mt-2 shadow-lg shadow-brand-primary/20">
          Sign In
        </button>
        
        {message && (
          <p className="mt-4 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-center text-sm rounded-lg font-bold">
            {message}
          </p>
        )}
      </form>
    </div>
  )
}
