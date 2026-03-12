import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function UpdatePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams;
  const message = typeof sp?.message === 'string' ? sp.message : undefined;

  const updatePassword = async (formData: FormData) => {
    'use server'

    const password = formData.get('password') as string
    const supabase = await createClient()

    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) {
      return redirect('/update-password?message=Could not update password')
    }

    return redirect('/')
  }

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 m-auto mt-20 relative z-10 p-10 bg-surface-base border border-border-subtle shadow-2xl rounded-2xl">
      <div className="absolute inset-0 bg-gradient-to-b from-brand-accent/5 to-transparent rounded-2xl pointer-events-none" />
      <form className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground relative z-10" action={updatePassword}>
        <div className="mb-6 flex flex-col gap-2 text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">Activate Account</h1>
            <p className="text-sm text-text-secondary">Please set your account password</p>
        </div>
        
        <label className="text-sm text-text-secondary font-medium" htmlFor="password">
          New Password
        </label>
        <input
          className="rounded-md px-4 py-2 bg-surface-panel border border-border-subtle mb-6 text-white focus:outline-none focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/50 transition-all font-medium"
          type="password"
          name="password"
          placeholder="••••••••"
          required
        />
        
        <button className="bg-brand-accent hover:bg-brand-accent/90 focus:ring-4 focus:ring-brand-accent/20 text-white font-semibold rounded-lg px-4 py-2.5 transition-all w-full mt-2 shadow-lg shadow-brand-accent/20">
          Set Password
        </button>
        
        {message && (
          <p className="mt-4 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-center text-sm rounded-lg font-medium">
            {message}
          </p>
        )}
      </form>
    </div>
  )
}
