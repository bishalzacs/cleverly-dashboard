import { useState } from "react";

interface AdminInviteModalProps {
    onClose: () => void;
}

export const AdminInviteModal = ({ onClose }: AdminInviteModalProps) => {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setError(null);
        setIsLoading(true);

        try {
            const res = await fetch("/api/admin/invite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();
            
            if (!res.ok) {
                setError(data.error || "Failed to send invite");
            } else {
                setMessage("Invitation sent! The user should receive an email shortly.");
                setEmail(""); // Clear for next input
            }
        } catch (e: any) {
            setError(e.message || "Network error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
            <div className="relative w-full max-w-md bg-surface-panel rounded-[2.5rem] border border-border-subtle shadow-[0_40px_100px_rgba(0,0,0,0.8)] animate-scale-in overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/5 to-transparent pointer-events-none" />
                
                <div className="p-10 relative z-10 flex flex-col gap-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-black tracking-tight text-text-primary flex items-center gap-3 font-outfit uppercase">
                                <svg className="w-6 h-6 text-brand-accent shadow-[0_0_15px_rgba(0,240,255,0.4)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                                Deploy Invitation
                            </h2>
                            <p className="text-[10px] text-text-secondary mt-2 font-black uppercase tracking-[0.2em] opacity-50">Authorized Personnel Registration</p>
                        </div>
                        <button onClick={onClose} className="p-2 -mr-2 text-text-secondary hover:text-text-primary rounded-xl hover:bg-surface-panel-hover transition-all">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <form onSubmit={handleInvite} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2.5">
                            <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1 opacity-50">Recipient Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="nominee@cleverly.ai"
                                className="w-full bg-surface-base border border-border-subtle rounded-2xl px-5 py-4 text-text-primary shadow-inner focus:outline-none focus:border-brand-accent/60 focus:ring-4 focus:ring-brand-accent/10 transition-all text-sm font-bold placeholder:opacity-30"
                                required
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-xs font-semibold text-red-400 bg-red-400/10 border border-red-500/20 px-3 py-2 rounded-lg">
                                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                {error}
                            </div>
                        )}

                        {message && (
                            <div className="flex items-center gap-2 text-xs font-semibold text-brand-accent bg-brand-accent/10 border border-brand-accent/20 px-3 py-2 rounded-lg">
                                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {message}
                            </div>
                        )}

                        <div className="flex gap-4 justify-end mt-4">
                             <button
                                type="button"
                                onClick={onClose}
                                className="px-8 py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl text-text-secondary bg-surface-base hover:bg-surface-panel-hover border border-border-subtle hover:text-text-primary transition-all shadow-sm"
                            >
                                Dismiss
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-10 py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl text-white bg-brand-accent hover:bg-brand-accent/90 shadow-xl hover:shadow-[0_10px_30px_rgba(0,240,255,0.4)] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {isLoading ? "Transmitting..." : "Issue Signal"}
                                {!isLoading && <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
