"use client";

import { DeviceStatus, CallStatus } from "@/hooks/useTwilioDevice";

interface StatusIndicatorProps {
    deviceStatus: DeviceStatus;
    callStatus: CallStatus;
}

export const StatusIndicator = ({ deviceStatus, callStatus }: StatusIndicatorProps) => {
    let indicatorColor = "bg-gray-500";
    let statusText = "Initializing...";

    if (deviceStatus === "error") {
        indicatorColor = "bg-red-500";
        statusText = "Device Error";
    } else if (deviceStatus === "ready") {
        indicatorColor = "bg-green-500";
        statusText = "Online";

        if (callStatus === "connecting") {
            indicatorColor = "bg-yellow-500 animate-pulse";
            statusText = "Connecting...";
        } else if (callStatus === "ringing") {
            indicatorColor = "bg-yellow-400 animate-pulse";
            statusText = "Ringing...";
        } else if (callStatus === "connected") {
            indicatorColor = "bg-blue-500 animate-pulse";
            statusText = "On Call";
        }
    }

    return (
        <div className="flex items-center space-x-2.5 glass-pill px-3 py-1.5 rounded-full">
            <div className="relative flex h-2.5 w-2.5">
                {/* Ping animation for active states */}
                {(indicatorColor.includes("green") || indicatorColor.includes("blue") || indicatorColor.includes("yellow")) && (
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-40 ${indicatorColor.replace("bg-", "bg-")}`}></span>
                )}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${indicatorColor} shadow-[0_0_8px_currentColor]`}></span>
            </div>
            <span className="text-xs text-text-secondary font-semibold uppercase tracking-wider">{statusText}</span>
        </div>
    );
};
