"use client";

import { useState } from "react";
import { CallStatus } from "@/hooks/useTwilioDevice";

interface DirectDialerProps {
    callStatus: CallStatus;
    callDuration: number;
    isMuted: boolean;
    onCall: (phoneNumber: string) => void;
    onHangUp: () => void;
    onToggleMute: () => void;
}

export const DirectDialer = ({
    callStatus,
    callDuration,
    isMuted,
    onCall,
    onHangUp,
    onToggleMute
}: DirectDialerProps) => {
    const [phoneNumber, setPhoneNumber] = useState("");

    const handleNumberClick = (digit: string) => {
        if (callStatus === "idle" || callStatus === "ended") {
            setPhoneNumber((prev) => prev + digit);
        }
    };

    const handleBackspace = () => {
        if (callStatus === "idle" || callStatus === "ended") {
            setPhoneNumber((prev) => prev.slice(0, -1));
        }
    };

    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    const isCallActive = callStatus === "connecting" || callStatus === "ringing" || callStatus === "connected";

    return (
        <div className="flex flex-col items-center justify-center p-8 glass-panel rounded-2xl w-full max-w-sm mx-auto shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-border-subtle">
            {/* Display Screen */}
            <div className="w-full bg-surface-base border border-border-subtle rounded-xl p-6 mb-8 text-center shadow-inner relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-brand-accent/5 to-transparent pointer-events-none" />

                <h2 className={`text-3xl font-mono tracking-widest h-10 flex items-center justify-center
                    ${isCallActive ? "text-brand-accent shadow-brand-accent drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]" : "text-white"}`}>
                    {phoneNumber || "Enter Number..."}
                </h2>

                <div className="flex justify-between items-center mt-3 text-xs uppercase tracking-widest font-bold">
                    <span className={
                        callStatus === "connected" ? "text-green-400 animate-pulse" :
                            "text-text-secondary"
                    }>
                        {callStatus.toUpperCase()}
                    </span>
                    {callStatus === "connected" && (
                        <span className="text-white bg-white/10 px-2 py-0.5 rounded backdrop-blur-md border border-white/5">
                            {formatDuration(callDuration)}
                        </span>
                    )}
                </div>
            </div>

            {/* Keypad */}
            <div className={`grid grid-cols-3 gap-4 mb-8 w-full ${isCallActive ? "opacity-30 pointer-events-none" : ""}`}>
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map((key) => (
                    <button
                        key={key}
                        onClick={() => handleNumberClick(key)}
                        className="h-16 rounded-xl bg-surface-panel border border-border-subtle text-xl text-white font-medium hover:bg-white/10 hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(0,0,0,0.3)] transition-all active:scale-95 flex items-center justify-center"
                    >
                        {key}
                    </button>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center space-x-6 w-full">
                {/* Backspace Button */}
                {!isCallActive && (
                    <button
                        onClick={handleBackspace}
                        disabled={!phoneNumber}
                        className="w-16 h-16 rounded-full bg-surface-panel border border-border-subtle text-text-secondary hover:text-white hover:bg-white/5 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" /></svg>
                    </button>
                )}

                {/* Call / Hangup Button */}
                {!isCallActive ? (
                    <button
                        onClick={() => onCall(phoneNumber)}
                        disabled={!phoneNumber}
                        className="w-20 h-20 rounded-full bg-green-500 hover:bg-green-400 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_30px_rgba(34,197,94,0.6)] transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center disabled:opacity-50 disabled:bg-surface-panel disabled:shadow-none disabled:text-text-secondary border border-transparent disabled:border-border-subtle"
                    >
                        <svg className="w-8 h-8" fill="solid" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    </button>
                ) : (
                    <button
                        onClick={onHangUp}
                        className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-400 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)] transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center"
                    >
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l-8 8m0-8l8 8" /></svg>
                    </button>
                )}

                {/* Mute Button */}
                {isCallActive && (
                    <button
                        onClick={onToggleMute}
                        className={`w-16 h-16 rounded-full border transition-all flex items-center justify-center
                            ${isMuted
                                ? "bg-red-500/20 text-red-500 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                                : "bg-surface-panel border-border-subtle text-text-secondary hover:text-white hover:bg-white/5"}`}
                    >
                        {isMuted ? (
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z m7.414-8l4 4m0-4l-4 4" /></svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};
