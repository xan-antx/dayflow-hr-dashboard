const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem('dayflow_session'));
  } catch {
    return null;
  }
}

export function saveSession(session) {
  localStorage.setItem('dayflow_session', JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem('dayflow_session');
}

async function request(path, options = {}) {
  const session = getSession();
  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (session?.token) headers.set('Authorization', `Bearer ${session.token}`);

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.detail || 'Something went wrong. Please try again.');
  return payload;
}

export const api = {
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  signup: (body) => request('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  verify: (verify_token) => request('/auth/verify', { method: 'POST', body: JSON.stringify({ verify_token }) }),
  me: () => request('/auth/me'),
  employee: (id) => request(`/employees/${id}`),
  updateEmployee: (id, body) => request(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  uploadPhoto: (id, file) => {
    const body = new FormData();
    body.append('file', file);
    return request(`/employees/${id}/photo`, { method: 'POST', body });
  },
  attendance: (range = 'daily') => request(`/attendance/me?range=${range}`),
  checkIn: () => request('/attendance/check-in', { method: 'POST' }),
  checkOut: () => request('/attendance/check-out', { method: 'POST' }),
  leaves: () => request('/leaves/me'),
  createLeave: ({ leave_type, start_date, end_date, remarks, attachment }) => {
    if (attachment) {
      const body = new FormData();
      body.append('leave_type', leave_type);
      body.append('start_date', start_date);
      body.append('end_date', end_date);
      body.append('remarks', remarks);
      body.append('attachment', attachment);
      return request('/leaves', { method: 'POST', body });
    }
    return request('/leaves', { method: 'POST', body: JSON.stringify({ leave_type, start_date, end_date, remarks }) });
  },
  salary: (id) => request(`/salary/${id}`),
  activity: () => request('/activity/me')
};
