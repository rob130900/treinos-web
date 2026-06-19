const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth && getToken()) headers.Authorization = `Bearer ${getToken()}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try { data = await res.json(); } catch { data = null; }

  if (!res.ok) throw new Error(data?.error || 'Erro na requisicao.');
  return data;
}

export const api = {
  register: (payload) => request('/api/auth/register', { method: 'POST', body: payload, auth: false }),
  login: (payload) => request('/api/auth/login', { method: 'POST', body: payload, auth: false }),
  me: () => request('/api/auth/me'),

  createStudent: (payload) => request('/api/students', { method: 'POST', body: payload }),
  listStudents: () => request('/api/students'),
  studentProgress: (id) => request(`/api/students/${id}/progress`),

  createWorkout: (payload) => request('/api/workouts', { method: 'POST', body: payload }),
  listWorkouts: (studentId) => request(`/api/workouts${studentId ? `?student_id=${studentId}` : ''}`),
  getWorkout: (id) => request(`/api/workouts/${id}`),
  deleteWorkout: (id) => request(`/api/workouts/${id}`, { method: 'DELETE' }),
  completeWorkout: (id, duration) =>
    request(`/api/workouts/${id}/complete`, { method: 'POST', body: { duration_seconds: duration ?? null } }),
  uncompleteWorkout: (id) => request(`/api/workouts/${id}/complete`, { method: 'DELETE' }),
  completeExercise: (wid, exId) => request(`/api/workouts/${wid}/exercises/${exId}/complete`, { method: 'POST' }),
  uncompleteExercise: (wid, exId) => request(`/api/workouts/${wid}/exercises/${exId}/complete`, { method: 'DELETE' }),
  myProgress: () => request('/api/workouts/me/progress'),
  dashboard: () => request('/api/workouts/me/dashboard'),
};

export { BASE };
