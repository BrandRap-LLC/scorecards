import { useState, useEffect, useCallback } from 'react';
import MCP from '@/lib/mcp-integration';

/**
 * Custom hook for MCP operations in React components
 */
export function useMCP() {
  const [status, setStatus] = useState<{
    supabase: boolean;
    mssql: boolean;
    ide: boolean;
    replicate: boolean;
  } | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Check MCP status on mount
  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/mcp/status');
      const data = await response.json();
      
      if (data.success) {
        setStatus(data.status);
      } else {
        setError(new Error(data.error));
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const getExecutiveReports = useCallback(async (
    clinic?: string,
    month?: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (clinic) params.set('clinic', clinic);
      if (month) params.set('month', month);
      
      const response = await fetch(`/api/mcp/executive-reports?${params}`);
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setError(err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const syncData = useCallback(async (target: 'executive' | 'all' = 'executive') => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/mcp/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ target })
      });
      
      const data = await response.json();
      
      if (data.success) {
        return data.result;
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setError(err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    status,
    loading,
    error,
    checkStatus,
    getExecutiveReports,
    syncData,
    // Direct access to MCP classes if needed
    MCP
  };
}

/**
 * Hook for real-time subscriptions via Supabase MCP
 */
export function useMCPSubscription(
  table: string,
  onUpdate: (payload: any) => void
) {
  useEffect(() => {
    const subscription = MCP.Supabase.subscribeToChanges(table, onUpdate);
    
    return () => {
      subscription.unsubscribe();
    };
  }, [table, onUpdate]);
}

/**
 * Hook for fetching weekly reports
 */
export function useWeeklyReports(clinic: string, weeks: number = 12) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const result = await MCP.Supabase.getWeeklyReports(clinic);
        
        if (result.error) {
          throw result.error;
        }
        
        setData(result.data || []);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    if (clinic) {
      fetchData();
    }
  }, [clinic, weeks]);

  return { data, loading, error };
}

/**
 * Hook for paid ads performance
 */
export function usePaidAdsPerformance(startDate?: string, endDate?: string) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const result = await MCP.Supabase.getPaidAdsPerformance(startDate, endDate);
        
        if (result.error) {
          throw result.error;
        }
        
        setData(result.data || []);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [startDate, endDate]);

  return { data, loading, error };
}

/**
 * Hook for SEO data
 */
export function useSEOData() {
  const [channels, setChannels] = useState<any[]>([]);
  const [keywords, setKeywords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        const [channelsResult, keywordsResult] = await Promise.all([
          MCP.Supabase.getSEOChannels(),
          MCP.Supabase.getTopKeywords(20)
        ]);
        
        if (channelsResult.error) throw channelsResult.error;
        if (keywordsResult.error) throw keywordsResult.error;
        
        setChannels(channelsResult.data || []);
        setKeywords(keywordsResult.data || []);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { channels, keywords, loading, error };
}