import { useState, useEffect, useCallback } from 'react';
import { Mail, ApiResponse } from '../types';
import { API_BASE } from '../config/api';

export function useTempMail(session: string) {
  const [inbox, setInbox] = useState<Mail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInbox = useCallback(async () => {
    if (!session.trim()) {
      setError('Session ID tidak boleh kosong.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = `${API_BASE}?session=${encodeURIComponent(session)}`;
      const res = await fetch(url);
      const data: ApiResponse = await res.json();

      if (data.status === true && Array.isArray(data.data)) {
        setInbox(data.data);
        if (data.data.length === 0) {
          setError('Belum ada email masuk.');
        }
      } else {
        setError(data.message || 'Gagal mengambil inbox.');
        setInbox([]);
      }
    } catch {
      setError('Terjadi kesalahan jaringan. Coba lagi.');
      setInbox([]);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchInbox();
    const interval = setInterval(fetchInbox, 8000);
    return () => clearInterval(interval);
  }, [fetchInbox]);

  return { inbox, loading, error, refetch: fetchInbox };
}