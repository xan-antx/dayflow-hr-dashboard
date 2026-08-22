<<<<<<< HEAD
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
=======
﻿import React, { useState } from 'react'
import AppShell from './components/layout/AppShell'
import { clearSession, getSession } from './api/client'
import Dashboard from './pages/hr/Dashboard'
import EmployeeManagement from './pages/hr/EmployeeManagement'
import Attendance from './pages/hr/Attendance'
import LeaveManagement from './pages/hr/LeaveManagement'
import Payroll from './pages/hr/Payroll'
>>>>>>> 7a63a3c (feat: implement shared UI foundation and HR frontend flows)

const HR_NAV_ITEMS = ['Dashboard', 'Employees', 'Attendance', 'Leave', 'Payroll', 'Logout']
const HR_PAGE_MAP = {
  Dashboard: Dashboard,
  Employees: EmployeeManagement,
  Attendance: Attendance,
  Leave: LeaveManagement,
  Payroll: Payroll
}

function HRApp({ session }) {
  const [activeItem, setActiveItem] = useState('Dashboard')
  const ActivePage = HR_PAGE_MAP[activeItem] || Dashboard

<<<<<<< HEAD

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
=======
  const handleSelect = (value) => {
    if (value === 'Logout') {
      clearSession()
      window.location.reload()
      return
    }
    setActiveItem(value)
>>>>>>> 7a63a3c (feat: implement shared UI foundation and HR frontend flows)
  }

  return (
    <AppShell activeItem={activeItem} items={HR_NAV_ITEMS} onSelect={handleSelect}>
      <ActivePage session={session} />
    </AppShell>
  )
}

<<<<<<< HEAD
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
=======
function EmployeeApp({ session }) {
  const [activeItem, setActiveItem] = useState('Overview')
  const EMPLOYEE_NAV_ITEMS = ['Overview', 'Attendance', 'Leave', 'Profile', 'Logout']
  const EMPLOYEE_PAGE_MAP = {
    Overview: () => <div style={{ padding: 24 }}>Employee overview coming soon.</div>,
    Attendance: () => <div style={{ padding: 24 }}>Employee attendance screen coming soon.</div>,
    Leave: () => <div style={{ padding: 24 }}>Employee leave screen coming soon.</div>,
    Profile: () => <div style={{ padding: 24 }}>Employee profile screen coming soon.</div>
  }
>>>>>>> 7a63a3c (feat: implement shared UI foundation and HR frontend flows)

  const ActivePage = EMPLOYEE_PAGE_MAP[activeItem] || EMPLOYEE_PAGE_MAP.Overview

  const handleSelect = (value) => {
    if (value === 'Logout') {
      clearSession()
      window.location.reload()
      return
    }
    setActiveItem(value)
  }

  return (
    <AppShell activeItem={activeItem} items={EMPLOYEE_NAV_ITEMS} onSelect={handleSelect}>
      <ActivePage session={session} />
    </AppShell>
  )
}

export default function App() {
<<<<<<< HEAD
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
=======
  const session = getSession() || { role: 'hr', name: 'Priya Sharma', email: 'dayflow@company.com' }

  if (session.role === 'employee') {
    return <EmployeeApp session={session} />
  }

  return <HRApp session={session} />
>>>>>>> 7a63a3c (feat: implement shared UI foundation and HR frontend flows)
}
