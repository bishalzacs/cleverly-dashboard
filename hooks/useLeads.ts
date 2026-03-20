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

    // 2. Realtime Subscription
    useEffect(() => {
        const channel = supabase
            .channel('leads-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'leads' },
                () => {
                    // On any change, refresh for consistency (handles complex filters better than manual patch)
                    fetchLeads();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, fetchLeads]);

    return { leads, isLoading, error, refreshLeads: fetchLeads };
};
