import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../services/api';
import { unwrapApiData } from '../utils/apiData';

export default function useApiData(url, fallback) {
  const fallbackRef = useRef(fallback);
  const initialData = fallbackRef.current ?? [];
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!url) return;
    setLoading(true);
    try {
      const response = await api.get(url);
      setData(unwrapApiData(response.data, initialData));
      setOffline(false);
      setError(null);
    } catch (err) {
      setData(initialData);
      setOffline(true);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => { load(); }, [load]);
  return { data, setData, loading, offline, error, reload: load };
}
