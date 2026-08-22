import React, { useState } from 'react'
import AppShell from './components/layout/AppShell'
import Dashboard from './pages/hr/Dashboard'
import EmployeeManagement from './pages/hr/EmployeeManagement'
import Attendance from './pages/hr/Attendance'
import LeaveManagement from './pages/hr/LeaveManagement'
import Payroll from './pages/hr/Payroll'

const NAV_ITEMS = ['Dashboard', 'Employees', 'Attendance', 'Leave', 'Payroll']

const PAGE_MAP = {
  Dashboard: Dashboard,
  Employees: EmployeeManagement,
  Attendance: Attendance,
  Leave: LeaveManagement,
  Payroll: Payroll
}

export default function App(){
  const [activeItem, setActiveItem] = useState('Dashboard')
  const ActivePage = PAGE_MAP[activeItem] || Dashboard

  return (
    <AppShell activeItem={activeItem} items={NAV_ITEMS} onSelect={setActiveItem}>
      <ActivePage />
    </AppShell>
  )
}
