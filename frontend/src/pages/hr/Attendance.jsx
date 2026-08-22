import React, { useEffect, useMemo, useState } from 'react'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import PageHeader from '../../components/ui/PageHeader'
import Table from '../../components/ui/Table'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import { api } from '../../api/client'

const fallbackAttendance = [
  { employee_name: 'No records', employee_code: '—', date: '', check_in: null, check_out: null, work_hours: 0, extra_hours: 0, status: 'Absent' }
]

const formatClock = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
}

export default function Attendance(){
  const [records, setRecords] = useState([])
  const [employees, setEmployees] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10))
  const [employeeFilter, setEmployeeFilter] = useState('')

  useEffect(() => {
    let active = true

    async function loadData() {
      try {
        const employeeList = await api.employeesList().catch(() => [])
        if (active) setEmployees(Array.isArray(employeeList) ? employeeList : [])

        const params = {}
        if (selectedDate) params.date = selectedDate
        if (employeeFilter) params.employee_id = Number(employeeFilter)

        const attendanceData = await api.attendanceAll(params).catch(() => [])
        if (active) setRecords(Array.isArray(attendanceData) ? attendanceData : [])
      } catch {
        if (active) {
          setEmployees([])
          setRecords([])
        }
      }
    }

    loadData()
    return () => { active = false }
  }, [selectedDate, employeeFilter])

  const employeeOptions = useMemo(() => [{ label: 'All employees', value: '' }, ...employees.map((employee) => ({ label: employee.name, value: String(employee.id) }))], [employees])

  return (
    <div style={{padding:24}}>
      <PageHeader title="Attendance" subtitle="Daily attendance overview for the organization" />

      <Card>
        <div style={{display:'flex',gap:12,alignItems:'center',flexWrap:'wrap',marginBottom:12}}>
          <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={{minWidth:170}} />
          <Select options={employeeOptions} value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)} style={{minWidth:180}} />
        </div>

        <Table
          columns={[
            { key: 'employee_name', label: 'Employee' },
            { key: 'employee_code', label: 'Employee code' },
            { key: 'date', label: 'Date' },
            { key: 'check_in', label: 'Check-in' },
            { key: 'check_out', label: 'Check-out' },
            { key: 'work_hours', label: 'Work hours' },
            { key: 'status', label: 'Status' }
          ]}
          data={(records.length ? records : fallbackAttendance).map((row) => ({
            ...row,
            check_in: formatClock(row.check_in),
            check_out: formatClock(row.check_out),
            work_hours: row.work_hours ? `${row.work_hours}h` : '-',
            status: <Badge status={row.status || 'Absent'}>{row.status || 'Absent'}</Badge>
          }))}
        />
      </Card>
    </div>
  )
}
