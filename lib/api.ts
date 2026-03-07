// Always use the backend URL - frontend should never have its own API routes
export const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/api/v1';

console.log('🚀 API_BASE:', API_BASE); // Debug log

export async function api<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const fullUrl = `${API_BASE}${path}`;
  console.log('📡 API Request:', init.method || 'GET', fullUrl); // Debug log
  
  // Build headers — always include Bearer token if available (cross-origin cookie fallback)
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> || {}),
  };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('sliqpay_token');
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const res = await fetch(fullUrl, {
    credentials: 'include',
    headers,
    ...init
  });
  
  console.log('📨 API Response:', res.status, res.statusText); // Debug log
  
  if (!res.ok) {
    let msg = 'Request failed';
    try {
      const data = await res.json();
      msg =
        (typeof data.error === 'string' ? data.error : data.error?.message) ||
        data.message ||
        msg;
    } catch {}
    throw new Error(msg);
  }
  try { return await res.json(); } catch { return undefined as any; }
}
