import React, { useState } from 'react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Badge from '../../components/ui/Badge'
import PageHeader from '../../components/ui/PageHeader'
import Table from '../../components/ui/Table'
import Modal from '../../components/ui/Modal'

const initialEmployees = [
  { id: 2, employee_code: 'OIJODO20260001', name: 'John Doe', email: 'john@dayflow.com', phone: '98xxxxxx', department: 'Engineering', job_position: 'Developer', manager: 'Priya Sharma', location: 'Bengaluru', joining_date: '2026-08-22', wage: 50000, today_status: 'present' },
  { id: 3, employee_code: 'OIJODO20260002', name: 'Priya Nair', email: 'priya@dayflow.com', phone: '97xxxxxx', department: 'People', job_position: 'HR Specialist', manager: 'Karan Mehta', location: 'Hyderabad', joining_date: '2025-11-14', wage: 42000, today_status: 'absent' },
  { id: 4, employee_code: 'OIJODO20260003', name: 'Amit Shah', email: 'amit@dayflow.com', phone: '96xxxxxx', department: 'Finance', job_position: 'Accountant', manager: 'Priya Sharma', location: 'Bengaluru', joining_date: '2025-09-02', wage: 55000, today_status: 'leave' },
  { id: 5, employee_code: 'OIJODO20260004', name: 'Sara Khan', email: 'sara@dayflow.com', phone: '95xxxxxx', department: 'Design', job_position: 'UX Designer', manager: 'Rhea Jain', location: 'Pune', joining_date: '2026-01-08', wage: 47000, today_status: 'absent' }
]

const todayStatusMap = {
  present: 'Present',
  leave: 'Leave',
  absent: 'Absent'
}

export default function EmployeeManagement(){
  const [employees, setEmployees] = useState(initialEmployees)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', phone: '', department: 'Engineering', job_position: 'Developer', manager: 'Priya Sharma', location: 'Bengaluru', joining_date: '2026-08-22', wage: 50000
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const nextCode = `OIJODO${new Date().getFullYear()}${String(employees.length + 1).padStart(5, '0')}`
    setEmployees(prev => [{
      id: prev.length + 2,
      employee_code: nextCode,
      name: form.name,
      email: form.email,
      phone: form.phone,
      department: form.department,
      job_position: form.job_position,
      manager: form.manager,
      location: form.location,
      joining_date: form.joining_date,
      wage: Number(form.wage),
      today_status: 'present'
    }, ...prev])
    setForm({ name: '', email: '', phone: '', department: 'Engineering', job_position: 'Developer', manager: 'Priya Sharma', location: 'Bengaluru', joining_date: '2026-08-22', wage: 50000 })
    setOpen(false)
  }

  return (
    <div style={{padding:24}}>
      <PageHeader title="Employee Management" subtitle="Search, review, and manage organization-wide employee records" />

      <Card>
        <div style={{display:'flex',gap:12,alignItems:'center',flexWrap:'wrap',justifyContent:'space-between'}}>
          <div style={{display:'flex',gap:12,alignItems:'center',flexWrap:'wrap'}}>
            <Input placeholder="Search employees" style={{minWidth:260}} />
            <Select options={['All departments', 'Engineering', 'People', 'Finance', 'Design']} value="All departments" />
          </div>
          <Button variant="primary" onClick={() => setOpen(true)}>+ Add Employee</Button>
        </div>
      </Card>

      <div style={{marginTop:24}}>
        <Table
          columns={[
            { key: 'employee_code', label: 'Code' },
            { key: 'name', label: 'Name' },
            { key: 'email', label: 'Email' },
            { key: 'department', label: 'Department' },
            { key: 'job_position', label: 'Position' },
            { key: 'today_status', label: 'Status' }
          ]}
          data={employees.map((employee) => ({
            ...employee,
            today_status: <Badge status={todayStatusMap[employee.today_status] || employee.today_status}>{todayStatusMap[employee.today_status] || employee.today_status}</Badge>
          }))}
        />
      </div>

      <Modal open={open} title="Create employee" onClose={() => setOpen(false)}>
        <form onSubmit={handleSubmit} style={{display:'grid',gap:12}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <Input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input placeholder="Joining date" type="date" value={form.joining_date} onChange={(e) => setForm({ ...form, joining_date: e.target.value })} />
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <Select options={['Engineering', 'People', 'Finance', 'Design']} value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
            <Input placeholder="Job position" value={form.job_position} onChange={(e) => setForm({ ...form, job_position: e.target.value })} />
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <Input placeholder="Manager" value={form.manager} onChange={(e) => setForm({ ...form, manager: e.target.value })} />
            <Input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <Input placeholder="Wage" type="number" value={form.wage} onChange={(e) => setForm({ ...form, wage: e.target.value })} />
          <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:4}}>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Create employee</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
