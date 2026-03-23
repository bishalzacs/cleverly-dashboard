"use client";

import { createElement } from "react";

type DashboardSidebarProps = {
  activeTab: string;
  onTabChange: (tab: any) => void;
  userName?: string | null;
};

// Icons (Lucide or similar simple SVGs)
const icons = {
  dashboard: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  portfolio: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  analysis: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  market: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  pipeline: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
    </svg>
  )
};

export const DashboardSidebar = ({ activeTab, onTabChange, userName = "User" }: DashboardSidebarProps) => {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: icons.dashboard },
    { id: "leads", label: "Leads", icon: icons.portfolio },
    { id: "pipeline", label: "Pipeline", icon: icons.pipeline },
    { id: "dialer", label: "Dialer", icon: icons.market },
    { id: "analysis", label: "Analysis", icon: icons.analysis },
  ];

  const supportItems = [
    { id: "community", label: "Community", icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )},
    { id: "support", label: "Help & Support", icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )}
  ];

  return (
    <nav className="w-64 h-full bg-[#05050A] border-r border-white/5 flex flex-col pt-8 pb-8 px-6 flex-shrink-0 z-30">
      <div className="flex items-center space-x-2 mb-10 pl-2">
        <div className="w-6 h-6 bg-brand-primary rounded-sm flex items-center justify-center">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 22h20L12 2z"/></svg>
        </div>
        <span className="text-xl font-semibold tracking-wide text-white">Cleverly</span>
      </div>

      <div className="mb-8 pl-2">
        <h2 className="text-2xl font-semibold text-white mb-1">Welcome, {userName || "User"}</h2>
        <p className="text-sm text-text-secondary">Here's your dashboard overview</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        <div className="mb-8">
          <p className="text-xs text-text-secondary w-full pl-2 mb-3">Main Menu</p>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onTabChange(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? "bg-brand-primary text-white shadow-[0_4px_24px_rgba(0,102,255,0.4)]" 
                        : "text-text-secondary hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <div className={`${isActive ? "opacity-100" : "opacity-60"}`}>
                      {item.icon}
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <p className="text-xs text-text-secondary w-full pl-2 mb-3">Support</p>
          <ul className="space-y-1">
            {supportItems.map((item) => (
              <li key={item.id}>
                <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-text-secondary hover:text-white hover:bg-white/5 transition-all duration-200">
                  <div className="opacity-60">{item.icon}</div>
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};
