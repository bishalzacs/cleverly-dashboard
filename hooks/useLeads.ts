"use client";

import { useState, useEffect, useCallback } from "react";
import { Lead } from "@/services/mondayService";
import { FilterState } from "@/components/FilterBar";

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

    const fetchLeads = useCallback(async () => {
        try {
            setError(null);
            const params = new URLSearchParams({ limit: "5000" });
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

    useEffect(() => {
        fetchLeads();
        const interval = setInterval(fetchLeads, 30000);
        return () => clearInterval(interval);
    }, [fetchLeads]);

    return { leads, isLoading, error, refreshLeads: fetchLeads };
};
