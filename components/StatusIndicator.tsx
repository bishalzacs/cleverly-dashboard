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
        <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${indicatorColor}`}></div>
            <span className="text-sm text-gray-400 font-medium">{statusText}</span>
        </div>
    );
};
