const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function req<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}/api${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

// Auth
export const auth = {
  login: (email: string, password: string) => req('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (name: string, email: string, password: string, level: string) => req('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password, level }) }),
  logout: () => req('/auth/logout', { method: 'POST' }),
  me: () => req('/auth/me'),
};

// Notes
export const notes = {
  list: (subject?: string) => req(`/notes${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`),
  get: (id: string) => req(`/notes/${id}`),
  create: (data: any) => req('/notes', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: string) => req(`/notes/${id}`, { method: 'DELETE' }),
  markRead: (id: string, idx: number) => req(`/notes/${id}/read/${idx}`, { method: 'POST' }),
  getProgress: (id: string) => req(`/notes/${id}/progress`),
  saveQuiz: (id: string, score: number, total: number) => req(`/notes/${id}/quiz-result`, { method: 'POST', body: JSON.stringify({ score, total }) }),
  getQuizResults: (id: string) => req(`/notes/${id}/quiz-results`),
};

// Sessions (timetable)
export const sessions = {
  list: () => req('/sessions'),
  create: (data: any) => req('/sessions', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => req(`/sessions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  toggle: (id: string) => req(`/sessions/${id}/toggle`, { method: 'PATCH' }),
  delete: (id: string) => req(`/sessions/${id}`, { method: 'DELETE' }),
};

// Threads (community)
export const threads = {
  list: (subject?: string, sort?: string) => {
    const params = new URLSearchParams({ ...(subject ? { subject } : {}), ...(sort ? { sort } : {}) });
    const qs = params.toString();
    return req(`/threads${qs ? '?' + qs : ''}`);
  },
  get: (id: string) => req(`/threads/${id}`),
  create: (data: any) => req('/threads', { method: 'POST', body: JSON.stringify(data) }),
  like: (id: string) => req(`/threads/${id}/like`, { method: 'POST' }),
  reply: (id: string, content: string) => req(`/threads/${id}/reply`, { method: 'POST', body: JSON.stringify({ content }) }),
  likeReply: (id: string) => req(`/threads/replies/${id}/like`, { method: 'POST' }),
  leaderboard: () => req('/threads/leaderboard'),
};

// Progress
export const progress = {
  get: () => req('/progress'),
  activity: () => req('/progress/activity'),
};
