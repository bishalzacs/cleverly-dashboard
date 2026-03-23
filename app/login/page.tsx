import { FirebaseLoginForm } from '@/components/FirebaseLoginForm'

export default async function LoginPage() {
  return (
    <div className="flex-1 flex flex-col w-full min-h-screen justify-center items-center px-4 relative">
      {/* Background Decorative Gradient */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md p-8 bg-[#0c0c0e] border border-zinc-800 shadow-2xl rounded-2xl">
        <FirebaseLoginForm />
      </div>
    </div>
  )
}
