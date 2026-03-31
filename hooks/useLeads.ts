"use client";

import { useState, useEffect, useCallback } from "react";
import { Lead } from "@/services/mondayService";
import { FilterState } from "@/components/FilterBar";

import { createClient } from "@/utils/supabase/client";

interface UseLeadsReturn {
    leads: Lead[];
    isLoading: boolean;
    error: string | null;
    refreshLeads: () => Promise<void>;
}

export const useLeads = (filters?: FilterState): UseLeadsReturn => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    const fetchLeads = useCallback(async () => {
        try {
            setError(null);
            const params = new URLSearchParams({ limit: "10000" });
            if (filters?.owner) params.set("owner", filters.owner);
            if (filters?.from) params.set("from", filters.from);
            if (filters?.to) params.set("to", filters.to);

            const response = await fetch(`/api/leads?${params.toString()}`);
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || "Failed to fetch leads");
            }

            setLeads(data.data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [filters?.owner, filters?.from, filters?.to]);

    // 1. Initial Fetch
    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    // 2. Realtime Subscription & Polling
    useEffect(() => {
        const channel = supabase
            .channel('leads-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'leads' },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setLeads((prev) => [payload.new as Lead, ...prev]);
                    } else if (payload.eventType === 'UPDATE') {
                        setLeads((prev) => 
                            prev.map((lead) => 
                                lead.id === payload.new.id ? { ...lead, ...payload.new as Lead } : lead
                            )
                        );
                    } else if (payload.eventType === 'DELETE') {
                        setLeads((prev) => prev.filter((lead) => lead.id !== payload.old?.id));
                    }
                }
            )
            .subscribe();

        // 3. Auto-polling every 2 minutes (120000ms)
        const syncInterval = setInterval(async () => {
            try {
                // Silently trigger background sync from Monday to DB
                console.log("[AutoSync] Triggering background sync...");
                await fetch('/api/sync-leads', { method: 'POST' });
            } catch (err) {
                console.warn("[AutoSync] Failed:", err);
            }
        }, 120000);

        return () => {
            supabase.removeChannel(channel);
            clearInterval(syncInterval);
        };
    }, [supabase]);

    // Force strict chronological sorting natively in the frontend to guarantee robust ordering
    const sortedLeads = [...leads].sort((a, b) => {
        const dateA = new Date(a.monday_created_at || a.createdDate || 0).getTime();
        const dateB = new Date(b.monday_created_at || b.createdDate || 0).getTime();
        return dateB - dateA;
    });

    return { leads: sortedLeads, isLoading, error, refreshLeads: fetchLeads };
};
