"use client";

import { useState, useEffect } from "react";
import { StatusIndicator } from "./StatusIndicator";
import { DeviceStatus, CallStatus } from "@/hooks/useTwilioDevice";
import { createClient } from "@/utils/supabase/client";
import { AdminInviteModal } from "./AdminInviteModal";

interface TopBarProps {
    deviceStatus: DeviceStatus;
    callStatus: CallStatus;
}

export const TopBar = ({ deviceStatus, callStatus }: TopBarProps) => {
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserEmail(user.email || null);
                // Check if they are admin
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();
                    
                if (profile && profile.role === 'admin') {
                    setIsAdmin(true);
                }
            }
        };
        fetchUser();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = "/login";
    };
    return (
        <header className="h-16 glass border-b border-border-subtle flex items-center justify-between px-8 sticky top-0 z-50">
            <div className="flex items-center space-x-6">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-accent/10 border border-brand-accent/30 shadow-md">
                    <span className="text-brand-accent font-bold text-xs tracking-widest">CL</span>
                </div>
                <h1 className="text-lg font-semibold tracking-wide text-text-primary">
                    Cleverly<span className="text-text-secondary font-normal ml-1">Dialer</span>
                </h1>
                <div className="h-4 w-px bg-border-subtle mx-2" />
                <StatusIndicator deviceStatus={deviceStatus} callStatus={callStatus} />
            </div>

            <div className="flex items-center space-x-4">
                {isAdmin && (
                    <button 
                        onClick={() => setShowInviteModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-brand-accent/10 hover:bg-brand-accent/20 text-brand-accent border border-brand-accent/20 rounded-lg transition-all"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Invite User
                    </button>
                )}

                <div 
                    onClick={handleLogout}
                    className="flex items-center space-x-2 glass-pill px-3 py-1.5 rounded-full cursor-pointer hover:bg-red-500/10 hover:border-red-500/20 group transition-colors"
                    title="Sign Out"
                >
                    <div className="w-6 h-6 rounded-full bg-brand-accent/20 flex items-center justify-center text-xs font-semibold text-brand-accent border border-brand-accent/30 group-hover:bg-red-500/20 group-hover:text-red-400 group-hover:border-red-500/30 transition-all">
                        {userEmail ? userEmail.charAt(0).toUpperCase() : "?"}
                    </div>
                    <span className="text-sm font-medium text-text-primary pr-1 max-w-[120px] truncate group-hover:text-red-400 transition-colors">
                        {userEmail || "Loading..."}
                    </span>
                    <svg className="w-3.5 h-3.5 text-text-secondary opacity-50 group-hover:opacity-100 group-hover:text-red-400 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </div>
            </div>

            {showInviteModal && <AdminInviteModal onClose={() => setShowInviteModal(false)} />}
        </header>
    );
};
