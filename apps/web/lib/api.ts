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
  updateProfile: (data: { name?: string }) => req('/auth/profile', { method: 'PATCH', body: JSON.stringify(data) }),
  saveOnboarding: (data: { learningStyles?: string[]; dailyHours?: number; mainGoal?: string; studyTimes?: string[]; challenges?: string[] }) =>
    req('/auth/onboarding', { method: 'POST', body: JSON.stringify(data) }),
};

// Notes
export const notes = {
  list: (subject?: string) => req(`/notes${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`),
  get: (id: string) => req(`/notes/${id}`),
  create: (data: any) => req('/notes', { method: 'POST', body: JSON.stringify(data) }),
  summarize: (text: string, subject: string, level: string, tags: string[]) =>
    req('/notes/summarize', { method: 'POST', body: JSON.stringify({ text, subject, level, tags }) }),
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
  editReply: (id: string, content: string) => req(`/threads/replies/${id}`, { method: 'PATCH', body: JSON.stringify({ content }) }),
  deleteReply: (id: string) => req(`/threads/replies/${id}`, { method: 'DELETE' }),
  leaderboard: () => req('/threads/leaderboard'),
  notifications: () => req('/threads/my/notifications'),
};

// Progress
export const progress = {
  get: () => req('/progress'),
  activity: () => req('/progress/activity'),
};

// Videos
export const videos = {
  search: (q: string, maxResults = 6) =>
    req(`/videos/search?q=${encodeURIComponent(q)}&maxResults=${maxResults}`),
};

// Teachers
export const teachers = {
  list: (subject?: string, town?: string) => {
    const p = new URLSearchParams({ ...(subject ? { subject } : {}), ...(town ? { town } : {}) });
    return req(`/teachers${p.toString() ? '?' + p.toString() : ''}`);
  },
  get: (id: string) => req(`/teachers/${id}`),
  me: () => req('/teachers/me'),
  createProfile: (data: any) => req('/teachers/profile', { method: 'POST', body: JSON.stringify(data) }),
  updateProfile: (data: any) => req('/teachers/profile', { method: 'PATCH', body: JSON.stringify(data) }),
  follow: (id: string) => req(`/teachers/${id}/follow`, { method: 'POST' }),
  rate: (id: string, rating: number) => req(`/teachers/${id}/rate`, { method: 'POST', body: JSON.stringify({ rating }) }),
};

// Badges
export const badges = {
  getAll: () => req('/progress/badges'),
};

// Best answer
export const community = {
  markBestAnswer: (replyId: string) => req(`/threads/replies/${replyId}/best-answer`, { method: 'PATCH' }),
};

// Quikz
export const quikz = {
  getSettings: () => req('/quikz/settings'),
  saveSettings: (data: any) => req('/quikz/settings', { method: 'POST', body: JSON.stringify(data) }),
  getQuestion: () => req('/quikz/question'),
  recordAnswer: (noteId: string, questionIdx: number, correct: boolean) =>
    req('/quikz/answer', { method: 'POST', body: JSON.stringify({ noteId, questionIdx, correct }) }),
  subscribe: (subscription: any) => req('/quikz/subscribe', { method: 'POST', body: JSON.stringify({ subscription }) }),
  unsubscribe: () => req('/quikz/unsubscribe', { method: 'POST' }),
  getVapidKey: () => req('/quikz/vapid-public-key') as Promise<{ key: string }>,
};

// Research / Wikipedia
export const research = {
  search: (q: string) => req(`/research/wiki/search?q=${encodeURIComponent(q)}`),
  article: (title: string) => req(`/research/wiki/article?title=${encodeURIComponent(title)}`),
  chat: (data: { noteTitle: string; noteContent: string; history: { role: string; text: string }[]; question: string }) =>
    req('/research/note-chat', { method: 'POST', body: JSON.stringify(data) }) as Promise<{ answer: string }>,
};
