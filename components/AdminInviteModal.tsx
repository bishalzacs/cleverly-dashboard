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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-surface-base border border-border-subtle rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/5 to-transparent pointer-events-none" />
                
                <div className="p-6 relative z-10 flex flex-col gap-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                                <svg className="w-5 h-5 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                                Invite New User
                            </h2>
                            <p className="text-xs text-text-secondary mt-1">Send an invitation link via email</p>
                        </div>
                        <button onClick={onClose} className="p-2 -mr-2 text-text-secondary hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <form onSubmit={handleInvite} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-text-secondary">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="teammate@example.com"
                                className="w-full bg-surface-panel border border-border-subtle rounded-lg px-4 py-2.5 text-white shadow-inner focus:outline-none focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/50 transition-all text-sm font-medium"
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

                        <div className="flex gap-3 justify-end mt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2.5 text-sm font-semibold rounded-lg text-text-secondary bg-surface-panel hover:bg-white/5 border border-border-subtle hover:text-white transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-5 py-2.5 text-sm font-semibold rounded-lg text-white bg-brand-accent hover:bg-brand-accent/90 shadow-[0_0_15px_rgba(0,240,255,0.2)] hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Sending..." : "Send Invite"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
