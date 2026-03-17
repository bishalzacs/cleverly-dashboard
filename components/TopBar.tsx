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
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
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

        // Load theme
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
        if (savedTheme) {
            setTheme(savedTheme);
            document.documentElement.setAttribute('data-theme', savedTheme);
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = "/login";
    };
    return (
        <header className="h-14 bg-surface-base border-b border-border-subtle flex items-center justify-between px-6 sticky top-0 z-50 animate-fade-in">
            <div className="flex items-center space-x-6">
                <div className="flex items-center justify-center p-1 rounded-lg bg-surface-panel border border-border-subtle shadow-xl hover:scale-105 transition-transform cursor-pointer">
                    <img src="/logo.png" alt="Cleverly Logo" className="h-7 w-auto object-contain" />
                </div>
                <h1 className="text-lg font-bold tracking-tight text-text-primary font-outfit uppercase">
                    Cleverly<span className="text-text-secondary font-normal ml-1 normal-case">Dialer</span>
                </h1>
                <div className="h-4 w-px bg-border-subtle mx-2" />
                <StatusIndicator deviceStatus={deviceStatus} callStatus={callStatus} />
            </div>

            <div className="flex items-center gap-4">
                {isAdmin && (
                    <button 
                        onClick={() => setShowInviteModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary border border-brand-primary/20 rounded-lg transition-all"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Invite User
                    </button>
                )}

                <div className="h-6 w-px bg-border-subtle mx-1" />

                {/* Theme Toggle Button */}
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-xl bg-surface-panel border border-border-subtle text-text-secondary hover:text-brand-primary hover:border-brand-primary/30 transition-all shadow-sm"
                    title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
                >
                    {theme === 'light' ? (
                        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                    ) : (
                        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    )}
                </button>

                <div 
                    onClick={handleLogout}
                    className="flex items-center space-x-3 bg-surface-panel border border-border-subtle px-3 py-1.5 rounded-full cursor-pointer hover:bg-red-500/10 dark:hover:bg-red-500/20 hover:border-red-500/30 group transition-all"
                    title="Sign Out"
                >
                    <div className="w-6 h-6 rounded-full bg-brand-accent/20 flex items-center justify-center text-[10px] font-black text-brand-accent border border-brand-accent/30 group-hover:bg-red-500 group-hover:text-white group-hover:border-red-500 transition-all shadow-sm">
                        {userEmail ? userEmail.charAt(0).toUpperCase() : "?"}
                    </div>
                    <span className="text-xs font-bold text-text-primary pr-1 max-w-[120px] truncate group-hover:text-red-500 transition-colors">
                        {userEmail || "Loading..."}
                    </span>
                    <svg className="w-3 h-3 text-slate-400 group-hover:text-red-500 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </div>
            </div>

            {showInviteModal && <AdminInviteModal onClose={() => setShowInviteModal(false)} />}
        </header>
    );
};
