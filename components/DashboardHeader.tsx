"use client";

import { useState, useEffect } from "react";
import { DeviceStatus, CallStatus } from "@/hooks/useTwilioDevice";
import { StatusIndicator } from "./StatusIndicator";
import { createClient } from "@/utils/supabase/client";

type DashboardHeaderProps = {
  deviceStatus: DeviceStatus;
  callStatus: CallStatus;
};

export const DashboardHeader = ({ deviceStatus, callStatus }: DashboardHeaderProps) => {
  const [activePill, setActivePill] = useState("Market");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user && !error) {
        setUserEmail(user.email || null);
      } else {
        // Fallback: This fixes a cross-browser bug where the Firebase cookie 
        // survives but the Supabase session expires. Forces a clean re-login.
        window.location.href = "/login";
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <header className="h-20 w-full flex items-center justify-between px-8 z-40 bg-surface-base">
      
      {/* Primary Search Bar */}
        <div className="hidden lg:flex items-center space-x-4 flex-1 max-w-2xl px-8 relative">
          <div className="absolute left-12 top-1/2 -translate-y-1/2 opacity-50">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input 
            type="text" 
            placeholder="Search Cleverly..." 
            className="w-full bg-[#1A1A22] border border-white/5 placeholder:text-text-secondary text-white text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all py-2 pl-10 pr-4 rounded-full"
          />
        </div>

      {/* Right Icons & Profile */}
      <div className="flex items-center space-x-6">
        
        {/* Twilio Status Injector */}
        <div className="hidden lg:block">
             <StatusIndicator deviceStatus={deviceStatus} callStatus={callStatus} />
        </div>

        <div className="flex items-center space-x-3">
          <button className="w-10 h-10 rounded-full bg-[#1A1A22] border border-white/5 flex items-center justify-center text-text-secondary hover:text-white hover:bg-white/10 transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          </button>
          <button className="w-10 h-10 rounded-full bg-[#1A1A22] border border-white/5 flex items-center justify-center text-text-secondary hover:text-white hover:bg-white/10 transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>
        </div>

        {/* Profile */}
        <div 
          onClick={handleLogout}
          className="flex items-center space-x-3 cursor-pointer group px-2 py-1.5 rounded-full hover:bg-white/5 transition-all"
          title="Sign Out"
        >
          <div className="w-10 h-10 rounded-full bg-brand-primary overflow-hidden border-2 border-white/10 flex items-center justify-center">
            {/* If we had an image it would go here, using initial for now */}
            <span className="text-white font-bold text-sm">
                {userEmail ? userEmail.charAt(0).toUpperCase() : "U"}
            </span>
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-sm font-semibold text-white group-hover:text-red-400 transition-colors">User</span>
            <span className="text-xs text-text-secondary truncate max-w-[120px]">{userEmail || "Loading..."}</span>
          </div>
        </div>

      </div>
    </header>
  );
};
