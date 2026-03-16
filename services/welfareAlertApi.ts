const API_BASE = 'http://158.179.171.241:3000';

export interface WelfareAlert {
  id: number;
  source: string;
  source_url: string;
  title: string;
  date: string;
  category: string;
  target: string;
  summary: string;
  crawled_at: string;
}

export interface WelfareStats {
  total: number;
  today: number;
  sources: Record<string, number>;
}

export async function fetchWelfareAlerts(limit = 50, offset = 0, target?: string): Promise<WelfareAlert[]> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (target) params.set('target', target);
  const res = await fetch(`${API_BASE}/api/posts?${params}`);
  if (!res.ok) throw new Error('복지 알림 조회 실패');
  const data = await res.json();
  return data.posts;
}

export async function searchWelfareAlerts(keyword: string, limit = 50, target?: string): Promise<WelfareAlert[]> {
  const params = new URLSearchParams({ q: keyword, limit: String(limit) });
  if (target) params.set('target', target);
  const res = await fetch(`${API_BASE}/api/search?${params}`);
  if (!res.ok) throw new Error('검색 실패');
  const data = await res.json();
  return data.posts;
}

export async function fetchWelfareAlertsByCategory(category: string, limit = 50): Promise<WelfareAlert[]> {
  const res = await fetch(`${API_BASE}/api/posts/category/${encodeURIComponent(category)}?limit=${limit}`);
  if (!res.ok) throw new Error('카테고리 조회 실패');
  const data = await res.json();
  return data.posts;
}

export async function fetchWelfareStats(target?: string): Promise<WelfareStats> {
  const params = target ? `?target=${target}` : '';
  const res = await fetch(`${API_BASE}/api/stats${params}`);
  if (!res.ok) throw new Error('통계 조회 실패');
  return res.json();
}
