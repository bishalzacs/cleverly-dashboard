"use client";

import { useState } from "react";
import { Lead } from "@/services/mondayService";

interface LeadEditModalProps {
    lead: Lead;
    onClose: () => void;
    onSave: (id: string, updates: Partial<Lead>) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

const Field = ({ label, icon, children }: { label: string; icon: string; children: React.ReactNode }) => (
    <div>
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 block">{label}</label>
        <div className="relative">
            <svg className="absolute left-3 top-3 w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
            </svg>
            {children}
        </div>
    </div>
);

export const LeadEditModal = ({ lead, onClose, onSave, onDelete }: LeadEditModalProps) => {
    const [form, setForm] = useState({
        name: lead.name || "",
        phone: lead.phone || "",
        email: lead.email || "",
        company: lead.company || "",
        owner: lead.owner || "",
        interested_in: lead.interested_in || "",
        notes: lead.notes || "",
        sales_call_date: lead.sales_call_date || "",
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

    const handleSave = async () => {
        setIsSaving(true);
        try { await onSave(lead.id, form); onClose(); }
        finally { setIsSaving(false); }
    };

    const handleDelete = async () => {
        if (!confirmDelete) { setConfirmDelete(true); return; }
        setIsDeleting(true);
        try { await onDelete(lead.id); onClose(); }
        finally { setIsDeleting(false); }
    };

    const inputCls = "w-full bg-surface-panel border border-border-subtle rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-text-secondary focus:outline-none focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/30 transition-all";
    const textareaCls = "w-full bg-surface-panel border border-border-subtle rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-text-secondary focus:outline-none focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/30 transition-all resize-none";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div className="relative w-full max-w-lg glass-panel rounded-2xl border border-border-subtle shadow-[0_24px_80px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border-subtle flex-shrink-0">
                    <div>
                        <h2 className="text-lg font-semibold text-white">Edit Contact</h2>
                        <p className="text-xs text-text-secondary mt-0.5">{lead.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-text-secondary hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Scrollable form */}
                <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Full Name" icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z">
                            <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls} />
                        </Field>
                        <Field label="Company" icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4">
                            <input type="text" value={form.company} onChange={(e) => set("company", e.target.value)} className={inputCls} />
                        </Field>
                        <Field label="Phone" icon="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z">
                            <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputCls} />
                        </Field>
                        <Field label="Email" icon="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z">
                            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls} />
                        </Field>
                        <Field label="Owner / Sales Rep" icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z">
                            <input type="text" value={form.owner} onChange={(e) => set("owner", e.target.value)} className={inputCls} />
                        </Field>
                        <Field label="Sales Call Date" icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z">
                            <input type="date" value={form.sales_call_date} onChange={(e) => set("sales_call_date", e.target.value)} className={inputCls} />
                        </Field>
                    </div>
                    <Field label="Interested In" icon="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z">
                        <input type="text" value={form.interested_in} onChange={(e) => set("interested_in", e.target.value)} className={inputCls} placeholder="e.g. Growth Plan, Enterprise..." />
                    </Field>
                    <Field label="Notes" icon="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z">
                        <textarea rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} className={textareaCls} placeholder="Add notes..." />
                    </Field>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between p-6 pt-4 border-t border-border-subtle gap-3 flex-shrink-0">
                    <button onClick={handleDelete} disabled={isDeleting}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all border ${confirmDelete ? "bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30" : "bg-surface-panel text-text-secondary border-border-subtle hover:text-red-400 hover:border-red-500/30"}`}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        {confirmDelete ? "Confirm Delete?" : "Delete"}
                    </button>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-surface-panel border border-border-subtle text-text-secondary hover:text-white transition-all">Cancel</button>
                        <button onClick={handleSave} disabled={isSaving} className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-brand-accent/10 border border-brand-accent/30 text-brand-accent hover:bg-brand-accent/20 transition-all disabled:opacity-50">
                            {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
