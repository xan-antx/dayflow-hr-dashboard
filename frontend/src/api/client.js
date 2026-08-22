const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export function getSession() {
  try {
    const raw = localStorage.getItem('dayflow_session');
    return raw ? JSON.parse(raw) : null;
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

function buildQueryString(params = {}) {
  const entries = Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '');
  if (!entries.length) return '';
  const search = new URLSearchParams();
  entries.forEach(([key, value]) => search.append(key, String(value)));
  return `?${search.toString()}`;
}

async function request(path, options = {}) {
  const session = getSession();
  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (session?.token) headers.set('Authorization', `Bearer ${session.token}`);

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch {
    throw new Error('Unable to reach Dayflow. Please check that the backend is running.');
  }
  const payload = await response.json().catch(() => ({}));
  if (response.status === 401) clearSession();
  if (!response.ok) throw new Error(payload.detail || payload.message || 'Something went wrong. Please try again.');
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

  employeesList: () => request('/employees'),
  createEmployee: (body) => request('/employees', { method: 'POST', body: JSON.stringify(body) }),

  attendance: (range = 'daily') => request(`/attendance/me?range=${range}`),
  attendanceAll: (params = {}) => request(`/attendance${buildQueryString(params)}`),
  checkIn: () => request('/attendance/check-in', { method: 'POST' }),
  checkOut: () => request('/attendance/check-out', { method: 'POST' }),

  leaves: () => request('/leaves/me'),
  leavesAll: (status) => request(status ? `/leaves?status=${encodeURIComponent(status)}` : '/leaves'),
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
  decideLeave: (id, body) => request(`/leaves/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

  salary: (id) => request(`/salary/${id}`),
  salaryOf: (id) => request(`/salary/${id}`),
  updateSalary: (id, wage) => request(`/salary/${id}`, { method: 'PUT', body: JSON.stringify({ wage }) }),

  activity: () => request('/activity/me')
};
