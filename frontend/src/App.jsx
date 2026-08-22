import React, { useEffect, useState } from 'react'
import { ArrowRight, Check, CheckCircle2 } from 'lucide-react'
import { api, clearSession, getSession, saveSession } from './api/client'
import Button from './components/ui/Button'
import AppShell from './components/layout/AppShell'
import EmployeeDashboard from './pages/employee/Dashboard'
import EmployeeProfile from './pages/employee/Profile'
import EmployeeAttendance from './pages/employee/Attendance'
import EmployeeLeave from './pages/employee/Leave'
import EmployeeSalary from './pages/employee/Salary'
import HRDashboard from './pages/hr/Dashboard'
import EmployeeManagement from './pages/hr/EmployeeManagement'
import HRAttendance from './pages/hr/Attendance'
import LeaveManagement from './pages/hr/LeaveManagement'
import Payroll from './pages/hr/Payroll'

const employeeRoutes = { dashboard: EmployeeDashboard, profile: EmployeeProfile, attendance: EmployeeAttendance, leave: EmployeeLeave, salary: EmployeeSalary }
const hrRoutes = { Dashboard: HRDashboard, Employees: EmployeeManagement, Attendance: HRAttendance, Leave: LeaveManagement, Payroll }

function Auth({ onLogin }) {
  const [mode, setMode] = useState('login'); const [form, setForm] = useState({ name:'', email:'', password:'', role:'employee' }); const [verifyToken, setVerifyToken] = useState(''); const [message, setMessage] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value })
  async function submit(event) { event.preventDefault(); setBusy(true); setError(''); setMessage(''); try { if (mode === 'login') { const result = await api.login({ email:form.email, password:form.password }); saveSession(result); onLogin(result) } else { const result = await api.signup(form); setVerifyToken(result.verify_token); setMessage('Account created. Verify your account to continue.') } } catch (err) { setError(err.message || 'Unable to complete authentication.') } finally { setBusy(false) } }
  async function verify() { setBusy(true); setError(''); try { await api.verify(verifyToken); setVerifyToken(''); setMode('login'); setMessage('Account verified. You can sign in now.') } catch (err) { setError(err.message) } finally { setBusy(false) } }
  return <div className="auth-page"><div className="auth-aside"><div className="brand brand-light"><div className="brand-mark">D</div><div><strong>dayflow</strong><span>HR management</span></div></div><div className="auth-quote"><p className="eyebrow">Your workday, in rhythm</p><h1>Everything you need to do your best work.</h1><p>Stay close to your time, your growth, and the people who make work matter.</p></div></div><div className="auth-form-side"><div className="auth-form"><p className="eyebrow">Dayflow portal</p><h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2><p className="page-description">{mode === 'login' ? 'Sign in to continue to your workspace.' : 'Join Dayflow and keep your workday aligned.'}</p>{error && <div className="alert alert-error">{error}</div>}{message && <div className="alert alert-success">{message}</div>}{verifyToken ? <div className="verify-box"><CheckCircle2 size={28} /><h3>Verify your account</h3><p>Use the mock verification step for this demo.</p><Button onClick={verify} disabled={busy} icon={Check}>{busy ? 'Verifying...' : 'Verify now'}</Button></div> : <form onSubmit={submit}>{mode === 'signup' && <label>Full name<input name="name" value={form.name} onChange={update} required placeholder="Priya Sharma" /></label>}<label>Email address<input name="email" type="email" value={form.email} onChange={update} required placeholder="you@company.com" /></label><label>Password<input name="password" type="password" value={form.password} onChange={update} required placeholder="At least 8 characters" /></label><Button type="submit" disabled={busy}>{busy ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}<ArrowRight size={16} /></Button></form>}<p className="auth-switch">{mode === 'login' ? 'New to Dayflow?' : 'Already have an account?'} <button type="button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setMessage('') }}>{mode === 'login' ? 'Create an account' : 'Sign in'}</button></p></div></div></div>
}

function EmployeeApp({ session }) { const [page, setPage] = useState(window.location.hash.replace(/^#\/?/, '') || 'dashboard'); useEffect(() => { const onHashChange = () => { setPage(window.location.hash.replace(/^#\/?/, '') || 'dashboard'); window.scrollTo(0, 0) }; window.addEventListener('hashchange', onHashChange); return () => window.removeEventListener('hashchange', onHashChange) }, []); function navigate(path) { const next = employeeRoutes[path] ? path : 'dashboard'; window.location.hash = `/${next}` }; function logout() { clearSession(); window.location.reload() }; const Page = employeeRoutes[page] || EmployeeDashboard; return <AppShell current={page} onNavigate={navigate} session={session} onLogout={logout}><div className="page-content"><Page session={session} onNavigate={navigate} /></div></AppShell> }

function HRApp({ session }) { const [activeItem, setActiveItem] = useState('Dashboard'); function select(value) { if (value === 'Logout') { clearSession(); window.location.reload(); return } setActiveItem(value) }; const Page = hrRoutes[activeItem] || HRDashboard; return <AppShell activeItem={activeItem} items={[...Object.keys(hrRoutes), 'Logout']} onSelect={select}><Page session={session} /></AppShell> }

export default function App() { const [session, setSession] = useState(getSession()); if (!session) return <Auth onLogin={setSession} />; return session.role === 'employee' && session.employee_id ? <EmployeeApp session={session} /> : <HRApp session={session} /> }
