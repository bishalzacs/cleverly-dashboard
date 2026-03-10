"use client";

import { CallStatus } from "@/hooks/useTwilioDevice";

interface CallControlsProps {
    callStatus: CallStatus;
    callDuration: number;
    isMuted: boolean;
    onHangUp: () => void;
    onMuteToggle: () => void;
}

export const CallControls = ({
    callStatus,
    callDuration,
    isMuted,
    onHangUp,
    onMuteToggle,
}: CallControlsProps) => {
    const formatDuration = (seconds: number) => {
        const min = Math.floor(seconds / 60).toString().padStart(2, "0");
        const sec = (seconds % 60).toString().padStart(2, "0");
        return `${min}:${sec}`;
    };

    if (callStatus === "idle") {
        return null; // hide controls if not in a call state
    }

    const isActive = callStatus === "connected" || callStatus === "ringing" || callStatus === "connecting";

    return (
        <div className="flex flex-col items-center justify-center w-full space-y-6 mt-8">
            {callStatus === "connected" && (
                <div className="text-4xl font-mono text-white tracking-widest">
                    {formatDuration(callDuration)}
                </div>
            )}

            {isActive && (
                <div className="flex items-center space-x-6">
                    <button
                        onClick={onMuteToggle}
                        className={`w-16 h-16 rounded-full flex items-center justify-center border transition-all ${isMuted
                            ? "bg-[#1F1F1F] border-blue-500 text-blue-500"
                            : "bg-transparent border-[#2A2A2A] text-gray-400 hover:border-gray-500 hover:text-white"
                            }`}
                    >
                        {isMuted ? "Unmute" : "Mute"}
                    </button>

                    <button
                        onClick={onHangUp}
                        className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-[0_0_20px_rgba(239,68,68,0.1)] hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]"
                    >
                        <span className="font-bold text-lg">End</span>
                    </button>
                </div>
            )}

            {callStatus === "ended" && (
                <div className="text-gray-400 text-sm">Call Ended</div>
            )}
        </div>
    );
};
