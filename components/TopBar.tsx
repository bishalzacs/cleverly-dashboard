"use client";

import { StatusIndicator } from "./StatusIndicator";
import { DeviceStatus, CallStatus } from "@/hooks/useTwilioDevice";

interface TopBarProps {
    deviceStatus: DeviceStatus;
    callStatus: CallStatus;
}

export const TopBar = ({ deviceStatus, callStatus }: TopBarProps) => {
    return (
        <header className="h-16 bg-[#0B0B0B] border-b border-[#1F1F1F] flex items-center justify-between px-6 sticky top-0 z-50">
            <div className="flex items-center space-x-6">
                <h1 className="text-xl font-bold tracking-tight text-[#EAEAEA]">
                    Recovery Dialer <span className="text-blue-500 text-lg">.</span>
                </h1>
                <StatusIndicator deviceStatus={deviceStatus} callStatus={callStatus} />
            </div>

            <div className="flex items-center space-x-4">
                <div className="w-8 h-8 rounded-full bg-[#1F1F1F] flex items-center justify-center text-sm font-semibold text-gray-300 border border-[#2A2A2A]">
                    JD
                </div>
            </div>
        </header>
    );
};
