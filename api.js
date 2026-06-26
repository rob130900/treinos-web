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
  updateStudent: (id, payload) => request(`/api/students/${id}`, { method: 'PATCH', body: payload }),

  // Planos do personal (limite de alunos)
  getPlan: () => request('/api/plan'),
  upgradePlan: (plan) => request('/api/plan/upgrade', { method: 'POST', body: { plan } }),
  checkoutPlan: (payload) => request('/api/plan/checkout', { method: 'POST', body: payload }),
  cancelPlan: () => request('/api/plan/cancel', { method: 'POST' }),
  connectAsaas: (payload) => request('/api/plan/connect', { method: 'POST', body: payload }),

  // CRM financeiro
  paymentsSummary: () => request('/api/payments/summary'),
  listPayments: (sid) => request(`/api/payments${sid ? `?student_id=${sid}` : ''}`),
  addPayment: (payload) => request('/api/payments', { method: 'POST', body: payload }),
  markPaid: (id, paidOn) => request(`/api/payments/${id}/pay`, { method: 'PATCH', body: { paid_on: paidOn || null } }),
  deletePayment: (id) => request(`/api/payments/${id}`, { method: 'DELETE' }),
  duplicateWorkout: (id, studentId) => request(`/api/workouts/${id}/duplicate`, { method: 'POST', body: studentId ? { student_id: studentId } : {} }),

  // Exercícios personalizados do personal
  listCustomEx: () => request('/api/custom-exercises'),
  createCustomEx: (payload) => request('/api/custom-exercises', { method: 'POST', body: payload }),
  updateCustomEx: (id, payload) => request(`/api/custom-exercises/${id}`, { method: 'PUT', body: payload }),
  deleteCustomEx: (id) => request(`/api/custom-exercises/${id}`, { method: 'DELETE' }),

  createWorkout: (payload) => request('/api/workouts', { method: 'POST', body: payload }),
  updateWorkout: (id, payload) => request(`/api/workouts/${id}`, { method: 'PUT', body: payload }),
  linkTrainer: (invite_code) => request('/api/auth/link-trainer', { method: 'POST', body: { invite_code } }),
  listWorkouts: (studentId) => request(`/api/workouts${studentId ? `?student_id=${studentId}` : ''}`),
  getWorkout: (id) => request(`/api/workouts/${id}`),
  deleteWorkout: (id) => request(`/api/workouts/${id}`, { method: 'DELETE' }),
  completeWorkout: (id, duration, fb) =>
    request(`/api/workouts/${id}/complete`, {
      method: 'POST',
      body: { duration_seconds: duration ?? null, ...(fb || {}) },
    }),
  uncompleteWorkout: (id) => request(`/api/workouts/${id}/complete`, { method: 'DELETE' }),
  completeExercise: (wid, exId) => request(`/api/workouts/${wid}/exercises/${exId}/complete`, { method: 'POST' }),
  uncompleteExercise: (wid, exId) => request(`/api/workouts/${wid}/exercises/${exId}/complete`, { method: 'DELETE' }),
  myProgress: () => request('/api/workouts/me/progress'),
  dashboard: () => request('/api/workouts/me/dashboard'),

  // Evolução
  listMeasurements: (sid) => request(`/api/progress/measurements${sid ? `?student_id=${sid}` : ''}`),
  addMeasurement: (payload) => request('/api/progress/measurements', { method: 'POST', body: payload }),
  deleteMeasurement: (id) => request(`/api/progress/measurements/${id}`, { method: 'DELETE' }),
  listPhotos: (sid) => request(`/api/progress/photos${sid ? `?student_id=${sid}` : ''}`),
  addPhoto: (payload) => request('/api/progress/photos', { method: 'POST', body: payload }),
  deletePhoto: (id) => request(`/api/progress/photos/${id}`, { method: 'DELETE' }),

  // Comunicação
  sendMessage: (payload) => request('/api/messages', { method: 'POST', body: payload }),
  thread: (studentId) => request(`/api/messages/thread${studentId ? `?student_id=${studentId}` : ''}`),
  conversations: () => request('/api/messages/conversations'),
  unreadCount: () => request('/api/messages/unread'),
  listModels: (exercise) => request(`/api/messages/models${exercise ? `?exercise=${encodeURIComponent(exercise)}` : ''}`),
  saveModel: (payload) => request('/api/messages/models', { method: 'POST', body: payload }),
  deleteModel: (id) => request(`/api/messages/models/${id}`, { method: 'DELETE' }),
  alerts: () => request('/api/students/alerts'),
  exportSql: async () => {
    const res = await fetch(`${BASE}/api/export`, {
      headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {},
    });
    if (!res.ok) throw new Error('Erro ao gerar backup.');
    return res.text();
  },
};

export { BASE };
