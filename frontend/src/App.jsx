import React, { useState } from 'react'
import AppShell from './components/layout/AppShell'
import { clearSession, getSession } from './api/client'
import Dashboard from './pages/hr/Dashboard'
import EmployeeManagement from './pages/hr/EmployeeManagement'
import Attendance from './pages/hr/Attendance'
import LeaveManagement from './pages/hr/LeaveManagement'
import Payroll from './pages/hr/Payroll'

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

  const handleSelect = (value) => {
    if (value === 'Logout') {
      clearSession();
      window.location.reload();
      return;
    }
    setActiveItem(value)
  }

  return (
    <AppShell activeItem={activeItem} items={HR_NAV_ITEMS} onSelect={handleSelect}>
      <ActivePage session={session} />
    </AppShell>
  )
}

function EmployeeApp({ session }) {
  const [activeItem, setActiveItem] = useState('Overview')

  const EMPLOYEE_NAV_ITEMS = ['Overview', 'Attendance', 'Leave', 'Profile', 'Logout']
  const EMPLOYEE_PAGE_MAP = {
    Overview: () => <div style={{ padding: 24 }}>Employee overview coming soon.</div>,
    Attendance: () => <div style={{ padding: 24 }}>Employee attendance screen coming soon.</div>,
    Leave: () => <div style={{ padding: 24 }}>Employee leave screen coming soon.</div>,
    Profile: () => <div style={{ padding: 24 }}>Employee profile screen coming soon.</div>
  }

  const ActivePage = EMPLOYEE_PAGE_MAP[activeItem] || EMPLOYEE_PAGE_MAP.Overview

  const handleSelect = (value) => {
    if (value === 'Logout') {
      clearSession();
      window.location.reload();
      return;
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
  const session = getSession() || { role: 'hr', name: 'Priya Sharma', email: 'dayflow@company.com' }

  if (session.role === 'employee') {
    return <EmployeeApp session={session} />
  }

  return <HRApp session={session} />
}
