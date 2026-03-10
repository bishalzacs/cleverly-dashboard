"use client";

import { StatusIndicator } from "./StatusIndicator";
import { DeviceStatus, CallStatus } from "@/hooks/useTwilioDevice";

interface TopBarProps {
    deviceStatus: DeviceStatus;
    callStatus: CallStatus;
}

export const TopBar = ({ deviceStatus, callStatus }: TopBarProps) => {
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
                <div className="flex items-center space-x-2 glass-pill px-3 py-1.5 rounded-full cursor-pointer hover:bg-white/5 transition-colors">
                    <div className="w-6 h-6 rounded-full bg-brand-accent/20 flex items-center justify-center text-xs font-semibold text-brand-accent border border-brand-accent/30">
                        JD
                    </div>
                    <span className="text-sm font-medium text-text-primary pr-1">John Doe</span>
                </div>
            </div>
        </header>
    );
};
