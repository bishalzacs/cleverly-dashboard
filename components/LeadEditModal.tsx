"use client";

import { useState } from "react";
import { Lead } from "@/services/mondayService";

interface LeadEditModalProps {
    lead: Lead;
    onClose: () => void;
    onSave: (id: string, updates: Partial<Lead>) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

export const LeadEditModal = ({ lead, onClose, onSave, onDelete }: LeadEditModalProps) => {
    const [name, setName] = useState(lead.name || "");
    const [phone, setPhone] = useState(lead.phone || "");
    const [email, setEmail] = useState(lead.email || "");
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(lead.id, { name, phone, email });
            onClose();
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirmDelete) { setConfirmDelete(true); return; }
        setIsDeleting(true);
        try {
            await onDelete(lead.id);
            onClose();
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <div className="relative w-full max-w-md glass-panel rounded-2xl border border-border-subtle shadow-[0_24px_80px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border-subtle">
                    <div>
                        <h2 className="text-lg font-semibold text-white">Edit Contact</h2>
                        <p className="text-xs text-text-secondary mt-0.5">Update details or remove this lead</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-text-secondary hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Form */}
                <div className="p-6 space-y-4">
                    {[
                        { label: "Full Name", value: name, setter: setName, type: "text", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
                        { label: "Phone Number", value: phone, setter: setPhone, type: "tel", icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" },
                        { label: "Email Address", value: email, setter: setEmail, type: "email", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
                    ].map((field) => (
                        <div key={field.label}>
                            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 block">{field.label}</label>
                            <div className="relative">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={field.icon} />
                                </svg>
                                <input
                                    type={field.type}
                                    value={field.value}
                                    onChange={(e) => field.setter(e.target.value)}
                                    className="w-full bg-surface-panel border border-border-subtle rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-text-secondary focus:outline-none focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/30 transition-all"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between p-6 pt-0 gap-3">
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all border ${confirmDelete
                                ? "bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30"
                                : "bg-surface-panel text-text-secondary border-border-subtle hover:text-red-400 hover:border-red-500/30"
                            }`}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        {confirmDelete ? "Confirm Delete?" : "Delete"}
                    </button>
                    <div className="flex gap-2 flex-1 justify-end">
                        <button onClick={onClose} className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-surface-panel border border-border-subtle text-text-secondary hover:text-white transition-all">
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-brand-accent/10 border border-brand-accent/30 text-brand-accent hover:bg-brand-accent/20 transition-all disabled:opacity-50"
                        >
                            {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
