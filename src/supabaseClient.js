import { createClient } from '@supabase/supabase-js';

const isDev = import.meta.env.DEV;
const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

// Robust silent fetch with jittered backoff for network/proxy instability (525 errors)
const customFetch = async (url, options) => {
  let retries = 0;
  const maxRetries = 5;
  const delay = (ms) => new Promise(res => setTimeout(res, ms));

  while (retries <= maxRetries) {
    try {
      const response = await fetch(url, options);
      // Cloudflare 525 often means a temporary handshake break — retry silently
      if (response.status === 525 && isDev) {
        throw new Error('525 SSL Handshake Failed');
      }
      return response;
    } catch (err) {
      const isRetryable = err.message.includes('525') ||
        err.message.includes('Failed to fetch') ||
        err.name === 'TypeError' || // Often network disconnected error
        err.name === 'AuthRetryableFetchError';

      if (isRetryable && retries < maxRetries && isDev) {
        retries++;
        // Quietly wait before retry with jitter to avoid collisions
        const backoff = Math.min(1000, 200 * Math.pow(2, retries));
        const jitter = Math.random() * 100;
        await delay(backoff + jitter);
        continue;
      }

      // Only log on the absolute final failure if NOT a standard network disconnect to keep console clean
      if (retries >= maxRetries) {
        const isNetworkDisconnect = err.message.includes('Failed to fetch') || err.message.includes('network') || !window.navigator.onLine;
        if (!isNetworkDisconnect) {
          console.error('❌ Supabase final failure:', err.message, url);
        }
      }
      throw err;
    }
  }
};

let _supabase = null;

const getSupabaseClient = () => {
  if (_supabase) return _supabase;
  _supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      detectSessionInUrl: true,
      autoRefreshToken: true,
      storageKey: 'sb-main-auth-token',
    },
    // Use custom fetch only in dev to handle proxy instability
    global: {
      fetch: isDev ? customFetch : undefined
    }
  });
  return _supabase;
};

export const supabase = getSupabaseClient();
