import { useEffect, useState } from 'react';
import {
  Activity, ArrowRight, CalendarDays, Camera, Check, CheckCircle2, ChevronRight,
  Clock3, FileText, Home, LogOut, Menu, Pencil, UserRound, WalletCards, X
} from 'lucide-react';
import { api, clearSession, getSession, saveSession } from './api/client';
import Button from './components/ui/Button';
import Card from './components/ui/Card';
import PageHeader from './components/ui/PageHeader';
import LoadingState from './components/ui/LoadingState';
import EmptyState from './components/ui/EmptyState';
import Badge from './components/ui/Badge';
import Avatar from './components/ui/Avatar';
import Table from './components/ui/Table';
import Modal from './components/ui/Modal';
import AppShell from './components/layout/AppShell';

const navItems = [
  { path: 'dashboard', label: 'Dashboard', icon: Home },
  { path: 'profile', label: 'My Profile', icon: UserRound },
  { path: 'attendance', label: 'Attendance', icon: Clock3 },
  { path: 'leave', label: 'Leave', icon: CalendarDays },
  { path: 'salary', label: 'Salary', icon: WalletCards }
];

function formatDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`));
}
function formatDateTime(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}
function money(value) {
  return value == null ? '—' : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}
function greeting() {
  const hour = new Date().getHours();
  return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
}
function errorText(error) { return error?.message || 'Unable to load this information. Please try again.'; }


function Auth({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'employee' });
  const [verifyToken, setVerifyToken] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try {
      if (mode === 'login') {
        const result = await api.login({ email: form.email, password: form.password });
        if (result.role !== 'employee') throw new Error('This portal is for employee accounts.');
        saveSession(result); onLogin(result);
      } else {
        const result = await api.signup(form); setVerifyToken(result.verify_token); setMessage('Account created. Verify your account to continue.');
      }
    } catch (err) { setError(errorText(err)); } finally { setBusy(false); }
  }
  async function verify() { setBusy(true); setError(''); try { await api.verify(verifyToken); setMode('login'); setMessage('Account verified. You can sign in now.'); } catch (err) { setError(errorText(err)); } finally { setBusy(false); } }
  return <div className="auth-page"><div className="auth-aside"><div className="brand brand-light"><div className="brand-mark">D</div><div><strong>dayflow</strong><span>HR management</span></div></div><div className="auth-quote"><p className="eyebrow">Your workday, in rhythm</p><h1>Everything you need to do your best work.</h1><p>Stay close to your time, your growth, and the people who make work matter.</p></div><span className="auth-note">Employee workspace · 2026</span></div><div className="auth-form-side"><div className="auth-form"><p className="eyebrow">Employee portal</p><h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2><p className="page-description">{mode === 'login' ? 'Sign in to continue to your workspace.' : 'Join Dayflow and keep your workday aligned.'}</p>{error && <div className="alert alert-error">{error}</div>}{message && <div className="alert alert-success">{message}</div>}{verifyToken ? <div className="verify-box"><CheckCircle2 size={28} /><h3>Verify your account</h3><p>Use the mock verification step for this demo.</p><Button onClick={verify} disabled={busy} icon={Check}>{busy ? 'Verifying...' : 'Verify now'}</Button></div> : <form onSubmit={submit}>{mode === 'signup' && <label>Full name<input name="name" value={form.name} onChange={update} required placeholder="Priya Sharma" /></label>}<label>Email address<input name="email" type="email" value={form.email} onChange={update} required placeholder="you@company.com" /></label><label>Password<input name="password" type="password" value={form.password} onChange={update} required placeholder="At least 8 characters" /></label><Button type="submit" disabled={busy}>{busy ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}<ArrowRight size={16} /></Button></form>}<p className="auth-switch">{mode === 'login' ? 'New to Dayflow?' : 'Already have an account?'} <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setMessage(''); }}>{mode === 'login' ? 'Create an account' : 'Sign in'}</button></p></div></div></div>;
}

function Dashboard({ session, onNavigate }) {
  const [data, setData] = useState({ employee: null, attendance: [], leaves: null, salary: null, activity: [] });
  const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [actionBusy, setActionBusy] = useState(false);
  async function load() { setLoading(true); setError(''); try { const [employee, attendance, leaves, salary, activity] = await Promise.all([api.employee(session.employee_id), api.attendance('daily'), api.leaves(), api.salary(session.employee_id), api.activity().catch(() => [])]); setData({ employee, attendance, leaves, salary, activity }); } catch (err) { setError(errorText(err)); } finally { setLoading(false); } }
  useEffect(() => { load(); }, []);
  async function attendanceAction() { setActionBusy(true); try { const today = data.attendance?.[0]; if (today?.check_in && !today?.check_out) await api.checkOut(); else await api.checkIn(); await load(); } catch (err) { setError(errorText(err)); } finally { setActionBusy(false); } }
  if (loading) return <><PageHeader eyebrow="Overview" title="Your day at a glance" /><LoadingState /></>;
  const employee = data.employee || session; const today = data.attendance?.find((record) => record.date === new Date().toISOString().slice(0, 10)) || data.attendance?.[0]; const canCheckIn = !today?.check_in; const canCheckOut = today?.check_in && !today?.check_out;
  return <><PageHeader eyebrow="Employee dashboard" title={`${greeting()}, ${employee.name?.split(' ')[0] || 'there'}.`} description="A clear view of your workday, time off, and pay." action={<Button icon={UserRound} onClick={() => onNavigate('profile')}>View profile</Button>} />{error && <div className="alert alert-error">{error}</div>}<div className="dashboard-grid"><Card className="attendance-card"><div className="card-heading"><div><p className="eyebrow">Today’s attendance</p><h2>{today ? <Badge status={today.status} /> : 'Not started'}</h2></div><div className="metric-icon"><Clock3 size={20} /></div></div><div className="attendance-times"><div><span>Check in</span><strong>{formatDateTime(today?.check_in)}</strong></div><div><span>Check out</span><strong>{formatDateTime(today?.check_out)}</strong></div><div><span>Work hours</span><strong>{today?.work_hours != null ? `${today.work_hours}h` : '—'}</strong></div></div>{(canCheckIn || canCheckOut) && <Button onClick={attendanceAction} disabled={actionBusy}>{actionBusy ? 'Updating...' : canCheckIn ? 'Check in' : 'Check out'}<ArrowRight size={16} /></Button>}</Card><Card className="balance-card"><div className="card-heading"><div><p className="eyebrow">Leave balance</p><h2>Time to recharge</h2></div><div className="metric-icon soft"><CalendarDays size={20} /></div></div><div className="balance-row"><div><strong>{data.leaves?.balances?.paid ?? '—'}</strong><span>Paid leave days</span></div><div><strong>{data.leaves?.balances?.sick ?? '—'}</strong><span>Sick leave days</span></div></div><button className="text-link" onClick={() => onNavigate('leave')}>Manage leave <ArrowRight size={15} /></button></Card></div><div className="content-grid"><Card><div className="section-heading"><div><p className="eyebrow">Recent requests</p><h2>Time off</h2></div><button className="text-link" onClick={() => onNavigate('leave')}>View all <ArrowRight size={15} /></button></div>{data.leaves?.requests?.length ? <div className="request-list">{data.leaves.requests.slice(0, 3).map((request) => <div className="request-item" key={request.id}><div><strong>{request.leave_type} leave</strong><span>{formatDate(request.start_date)} – {formatDate(request.end_date)}</span></div><Badge status={request.status} /></div>)}</div> : <EmptyState>No leave requests yet.</EmptyState>}</Card><Card><div className="section-heading"><div><p className="eyebrow">Monthly snapshot</p><h2>Salary</h2></div><button className="text-link" onClick={() => onNavigate('salary')}>Details <ArrowRight size={15} /></button></div>{data.salary ? <div className="salary-snapshot"><span>Net salary</span><strong>{money(data.salary.net)}</strong><small>Gross {money(data.salary.gross)}</small></div> : <EmptyState icon={WalletCards}>Salary information unavailable.</EmptyState>}</Card></div><Card><div className="section-heading"><div><p className="eyebrow">Your workspace</p><h2>Recent activity</h2></div><Activity size={20} className="section-icon" /></div>{data.activity?.length ? <div className="activity-list">{data.activity.slice(0, 4).map((item, index) => <div className="activity-item" key={`${item.time}-${index}`}><span className="activity-dot" /><div><strong>{item.text}</strong><span>{formatDateTime(item.time)}</span></div></div>)}</div> : <EmptyState icon={Activity}>No recent activity yet.</EmptyState>}</Card></>;
}

function Profile({ session }) {
  const [employee, setEmployee] = useState(null); const [form, setForm] = useState({ phone: '', address: '' }); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [message, setMessage] = useState(''); const [error, setError] = useState('');
  async function load() { try { const result = await api.employee(session.employee_id); setEmployee(result); setForm({ phone: result.phone || '', address: result.address || '' }); } catch (err) { setError(errorText(err)); } finally { setLoading(false); } }
  useEffect(() => { load(); }, []);
  async function save(event) { event.preventDefault(); setSaving(true); setMessage(''); setError(''); try { const result = await api.updateEmployee(session.employee_id, form); setEmployee(result); setMessage('Profile updated successfully.'); } catch (err) { setError(errorText(err)); } finally { setSaving(false); } }
  async function photo(event) { const file = event.target.files?.[0]; if (!file) return; try { const result = await api.uploadPhoto(session.employee_id, file); setEmployee({ ...employee, profile_picture: result.profile_picture }); setMessage('Profile picture updated.'); } catch (err) { setError(errorText(err)); } }
  if (loading) return <><PageHeader eyebrow="Personal details" title="My profile" /><LoadingState /></>;
  return <><PageHeader eyebrow="Personal details" title="My profile" description="Keep your personal information current." />{error && <div className="alert alert-error">{error}</div>}{message && <div className="alert alert-success">{message}</div>}<div className="profile-grid"><Card className="profile-intro"><Avatar employee={employee} size="xl" /><h2>{employee.name}</h2><p>{employee.job_position || 'Employee'}</p><span>{employee.department || 'Dayflow'}</span><label className="upload-button"><Camera size={16} />Update photo<input type="file" accept="image/*" onChange={photo} /></label></Card><div className="profile-details"><Card><div className="section-heading"><div><p className="eyebrow">Personal information</p><h2>Your details</h2></div><Pencil size={18} className="section-icon" /></div><form className="form-grid" onSubmit={save}><label>Email address<input value={employee.email || ''} disabled /></label><label>Phone<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label><label className="span-2">Address<textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows="3" /></label><div className="form-actions span-2"><Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}<Check size={16} /></Button></div></form></Card><Card><div className="section-heading"><div><p className="eyebrow">Job information</p><h2>Your role</h2></div></div><div className="detail-grid">{[['Employee code', employee.employee_code], ['Department', employee.department], ['Job position', employee.job_position], ['Manager', employee.manager], ['Location', employee.location], ['Joining date', formatDate(employee.joining_date)]].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value || '—'}</strong></div>)}</div></Card></div></div></>;
}

function Attendance({ session }) {
  const [range, setRange] = useState('weekly'); const [records, setRecords] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  async function load() { setLoading(true); try { setRecords(await api.attendance(range)); } catch (err) { setError(errorText(err)); } finally { setLoading(false); } }
  useEffect(() => { load(); }, [range]);
  async function action() { setBusy(true); try { const today = records.find((record) => record.date === new Date().toISOString().slice(0, 10)); if (today?.check_in && !today.check_out) await api.checkOut(); else await api.checkIn(); await load(); } catch (err) { setError(errorText(err)); } finally { setBusy(false); } }
  const today = records.find((record) => record.date === new Date().toISOString().slice(0, 10)); const canAct = !today?.check_in || !today?.check_out;
  return <><PageHeader eyebrow="Time tracking" title="Attendance" description="Your attendance records, directly from Dayflow." action={canAct && <Button onClick={action} disabled={busy} icon={Clock3}>{busy ? 'Updating...' : !today?.check_in ? 'Check in' : 'Check out'}</Button>} />{error && <div className="alert alert-error">{error}</div>}<Card><div className="section-heading"><div><p className="eyebrow">Attendance history</p><h2>{range === 'weekly' ? 'This week' : 'Today'}</h2></div><div className="segmented"><button className={range === 'daily' ? 'selected' : ''} onClick={() => setRange('daily')}>Daily</button><button className={range === 'weekly' ? 'selected' : ''} onClick={() => setRange('weekly')}>Weekly</button></div></div>{loading ? <LoadingState /> : records.length ? <Table headers={['Date', 'Check in', 'Check out', 'Work hours', 'Extra hours', 'Status']}>{records.map((record) => <tr key={record.date}><td><strong>{formatDate(record.date)}</strong></td><td>{formatDateTime(record.check_in)}</td><td>{formatDateTime(record.check_out)}</td><td>{record.work_hours != null ? `${record.work_hours}h` : '—'}</td><td>{record.extra_hours != null ? `${record.extra_hours}h` : '—'}</td><td><Badge status={record.status} /></td></tr>)}</Table> : <EmptyState icon={Clock3}>No attendance records available.</EmptyState>}</Card></>;
}

function Leave({ session }) {
  const [data, setData] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [message, setMessage] = useState(''); const [showForm, setShowForm] = useState(false); const [busy, setBusy] = useState(false); const [form, setForm] = useState({ leave_type: 'Paid', start_date: '', end_date: '', remarks: '', attachment: null });
  async function load() { setLoading(true); try { setData(await api.leaves()); } catch (err) { setError(errorText(err)); } finally { setLoading(false); } }
  useEffect(() => { load(); }, []);
  async function submit(event) { event.preventDefault(); setBusy(true); setError(''); setMessage(''); try { await api.createLeave(form); setMessage('Leave request submitted successfully.'); setShowForm(false); setForm({ leave_type: 'Paid', start_date: '', end_date: '', remarks: '', attachment: null }); await load(); } catch (err) { setError(errorText(err)); } finally { setBusy(false); } }
  return <><PageHeader eyebrow="Time away" title="Leave" description="Request time off and track every decision." action={<Button icon={CalendarDays} onClick={() => setShowForm(true)}>Apply for leave</Button>} />{error && <div className="alert alert-error">{error}</div>}{message && <div className="alert alert-success">{message}</div>}{loading ? <LoadingState /> : <><div className="balance-cards"><Card><span>Paid leave</span><strong>{data?.balances?.paid ?? '—'}</strong><small>days remaining</small></Card><Card><span>Sick leave</span><strong>{data?.balances?.sick ?? '—'}</strong><small>days remaining</small></Card><Card><span>Unpaid leave</span><strong>—</strong><small>no balance limit</small></Card></div><Card><div className="section-heading"><div><p className="eyebrow">Request history</p><h2>My requests</h2></div></div>{data?.requests?.length ? <Table headers={['Type', 'Dates', 'Remarks', 'Status']}>{data.requests.map((request) => <tr key={request.id}><td><strong>{request.leave_type}</strong></td><td>{formatDate(request.start_date)} – {formatDate(request.end_date)}</td><td>{request.remarks || '—'}</td><td><Badge status={request.status} /></td></tr>)}</Table> : <EmptyState>No leave requests yet.</EmptyState>}</Card></>}{showForm && <Modal title="Apply for leave" onClose={() => setShowForm(false)}><form className="leave-form" onSubmit={submit}><label>Leave type<select value={form.leave_type} onChange={(e) => setForm({ ...form, leave_type: e.target.value })}><option>Paid</option><option>Sick</option><option>Unpaid</option></select></label><div className="form-grid"><label>Start date<input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} required /></label><label>End date<input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} required /></label></div><label>Remarks<textarea value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} rows="3" placeholder="Add context for your request" /></label><label>Attachment <span className="caption">(optional)</span><input type="file" onChange={(e) => setForm({ ...form, attachment: e.target.files?.[0] || null })} /></label><div className="form-actions"><Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button><Button type="submit" disabled={busy}>{busy ? 'Submitting...' : 'Submit request'}<ArrowRight size={16} /></Button></div></form></Modal>}</>;
}

function Salary({ session }) {
  const [salary, setSalary] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  useEffect(() => { api.salary(session.employee_id).then(setSalary).catch((err) => setError(errorText(err))).finally(() => setLoading(false)); }, []);
  if (loading) return <><PageHeader eyebrow="Compensation" title="Salary" /><LoadingState /></>;
  return <><PageHeader eyebrow="Compensation" title="Salary" description="A transparent view of your current salary structure." />{error && <div className="alert alert-error">{error}</div>}{salary && <><div className="salary-hero"><div><p className="eyebrow">Net monthly salary</p><h2>{money(salary.net)}</h2><span>Gross salary {money(salary.gross)}</span></div><WalletCards size={32} /></div><div className="salary-grid"><Card><p className="eyebrow">Earnings</p><h2>Salary components</h2><div className="money-list">{Object.entries(salary.components || {}).map(([key, value]) => <div key={key}><span>{key.replaceAll('_', ' ')}</span><strong>{money(value)}</strong></div>)}</div></Card><Card><p className="eyebrow">Deductions</p><h2>Monthly deductions</h2><div className="money-list">{Object.entries(salary.deductions || {}).map(([key, value]) => <div key={key}><span>{key.replaceAll('_', ' ')}</span><strong>{money(value)}</strong></div>)}</div><div className="salary-total"><span>Net salary</span><strong>{money(salary.net)}</strong></div></Card></div></>}</>;
}

export default function App() {
  const [session, setSession] = useState(getSession());
  const allowedPages = navItems.map(({ path }) => path);
  const getPageFromHash = () => {
    const requestedPage = window.location.hash.replace(/^#\/?/, '');
    return allowedPages.includes(requestedPage) ? requestedPage : 'dashboard';
  };
  const [page, setPage] = useState(getPageFromHash);

  useEffect(() => {
    const handleHashChange = () => {
      setPage(getPageFromHash());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  function navigate(path) {
    const nextPage = allowedPages.includes(path) ? path : 'dashboard';
    setPage(nextPage);
    window.location.hash = `/${nextPage}`;
    window.scrollTo(0, 0);
  }
  function logout() { clearSession(); setSession(null); }
  if (!session) return <Auth onLogin={setSession} />;
  if (session.role !== 'employee' || !session.employee_id) return <Auth onLogin={setSession} />;
  const pages = { dashboard: <Dashboard session={session} onNavigate={navigate} />, profile: <Profile session={session} />, attendance: <Attendance session={session} />, leave: <Leave session={session} />, salary: <Salary session={session} /> };
  return <AppShell current={pages[page] ? page : 'dashboard'} onNavigate={navigate} session={session} onLogout={logout}><div className="page-content">{pages[page] || pages.dashboard}</div></AppShell>;
}
