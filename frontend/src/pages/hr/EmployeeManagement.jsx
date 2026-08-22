import React, { useEffect, useMemo, useState } from 'react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Badge from '../../components/ui/Badge'
import PageHeader from '../../components/ui/PageHeader'
import Table from '../../components/ui/Table'
import Modal from '../../components/ui/Modal'
import { api } from '../../api/client'

const todayStatusMap = {
  present: 'Present',
  leave: 'Leave',
  absent: 'Absent'
}

const defaultForm = {
  name: '',
  email: '',
  phone: '',
  department: 'Engineering',
  job_position: 'Developer',
  manager: 'Priya Sharma',
  location: 'Bengaluru',
  joining_date: new Date().toISOString().slice(0, 10),
  wage: 50000
}

export default function EmployeeManagement(){
  const [employees, setEmployees] = useState([])
  const [open, setOpen] = useState(false)
  const [success, setSuccess] = useState(null)
  const [search, setSearch] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('All departments')
  const [form, setForm] = useState(defaultForm)

  useEffect(() => {
    let active = true

    async function loadEmployees() {
      try {
        const data = await api.employeesList().catch(() => [])
        if (active) setEmployees(Array.isArray(data) ? data : [])
      } catch {
        if (active) setEmployees([])
      }
    }

    loadEmployees()
    return () => { active = false }
  }, [])

  const departmentOptions = useMemo(() => {
    const uniqueDepartments = ['All departments', ...new Set(employees.map((employee) => employee.department).filter(Boolean))]
    return uniqueDepartments
  }, [employees])

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch = !search || `${employee.name || ''} ${employee.employee_code || ''}`.toLowerCase().includes(search.toLowerCase())
    const matchesDepartment = departmentFilter === 'All departments' || employee.department === departmentFilter
    return matchesSearch && matchesDepartment
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        department: form.department,
        job_position: form.job_position,
        manager: form.manager,
        location: form.location,
        joining_date: form.joining_date,
        wage: Number(form.wage)
      }

      const created = await api.createEmployee(payload)
      const newEmployee = {
        id: created.employee_id,
        employee_code: created.employee_code,
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
      }

      setEmployees((prev) => [newEmployee, ...prev])
      setSuccess({
        employee_code: created.employee_code,
        initial_password: created.initial_password,
        name: form.name
      })
      setForm(defaultForm)
      setOpen(false)
    } catch (err) {
      alert(err.message || 'Unable to create employee')
    }
  }

  return (
    <div style={{padding:24}}>
      <PageHeader title="Employee Management" subtitle="Search, review, and manage organization-wide employee records" />

      <Card>
        <div style={{display:'flex',gap:12,alignItems:'center',flexWrap:'wrap',justifyContent:'space-between'}}>
          <div style={{display:'flex',gap:12,alignItems:'center',flexWrap:'wrap'}}>
            <Input placeholder="Search employees" value={search} onChange={(e) => setSearch(e.target.value)} style={{minWidth:260}} />
            <Select options={departmentOptions} value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} />
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
          data={filteredEmployees.map((employee) => ({
            ...employee,
            today_status: <Badge status={todayStatusMap[employee.today_status] || employee.today_status || 'Present'}>{todayStatusMap[employee.today_status] || employee.today_status || 'Present'}</Badge>
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

      <Modal open={Boolean(success)} title="Employee created" onClose={() => setSuccess(null)}>
        {success && (
          <div style={{display:'grid',gap:12}}>
            <div><strong>Name:</strong> {success.name}</div>
            <div><strong>Employee code:</strong> {success.employee_code}</div>
            <div><strong>Initial password:</strong> {success.initial_password}</div>
            <div style={{display:'flex',justifyContent:'flex-end'}}>
              <Button variant="primary" onClick={() => setSuccess(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
