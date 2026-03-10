"use client";

import { useState, useEffect, useCallback } from "react";
import { Lead } from "@/services/mondayService";

interface UseLeadsReturn {
    leads: Lead[];
    isLoading: boolean;
    error: string | null;
    refreshLeads: () => Promise<void>;
}

export const useLeads = (): UseLeadsReturn => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLeads = useCallback(async () => {
        try {
            setError(null);
            const response = await fetch("/api/leads?limit=500");
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
    }, []);

    useEffect(() => {
        // Initial fetch
        fetchLeads();

        // Auto-refresh every 20 seconds
        const interval = setInterval(() => {
            fetchLeads();
        }, 20000);

        return () => clearInterval(interval);
    }, [fetchLeads]);

    return { leads, isLoading, error, refreshLeads: fetchLeads };
};
