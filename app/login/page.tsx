import { FirebaseLoginForm } from '@/components/FirebaseLoginForm'

export default async function LoginPage() {
  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 m-auto mt-20 relative z-10 p-10 bg-surface-panel border border-border-subtle shadow-xl rounded-2xl">
      <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/5 to-transparent rounded-2xl pointer-events-none" />
      <FirebaseLoginForm />
    </div>
  )
}
