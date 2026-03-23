import { FirebaseLoginForm } from '@/components/FirebaseLoginForm'

export default async function LoginPage() {
  return (
    <div className="flex-1 flex flex-col w-full min-h-screen justify-center items-center px-4 relative bg-[#030308]">
      {/* Background Decorative Gradient */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-primary/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md p-8 bg-[#111116] border border-white/5 shadow-[0_0_50px_rgba(0,102,255,0.05)] rounded-2xl">
        <FirebaseLoginForm />
      </div>
    </div>
  )
}
