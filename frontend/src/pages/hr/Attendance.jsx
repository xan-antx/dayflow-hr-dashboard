import React from 'react'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import PageHeader from '../../components/ui/PageHeader'
import Table from '../../components/ui/Table'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'

const attendance = [
  { employee_name: 'John Doe', employee_code: 'OIJODO20260001', date: '2026-08-22', check_in: '2026-08-22T09:02:00', check_out: '2026-08-22T18:32:00', work_hours: 9.47, extra_hours: 1.47, status: 'Present' },
  { employee_name: 'Priya Nair', employee_code: 'OIJODO20260002', date: '2026-08-22', check_in: '2026-08-22T10:05:00', check_out: '2026-08-22T17:45:00', work_hours: 7.67, extra_hours: 0, status: 'Half-day' },
  { employee_name: 'Amit Shah', employee_code: 'OIJODO20260003', date: '2026-08-22', check_in: null, check_out: null, work_hours: 0, extra_hours: 0, status: 'Leave' },
  { employee_name: 'Sara Khan', employee_code: 'OIJODO20260004', date: '2026-08-22', check_in: null, check_out: null, work_hours: 0, extra_hours: 0, status: 'Absent' }
]

const formatClock = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
}

export default function Attendance(){
  return (
    <div style={{padding:24}}>
      <PageHeader title="Attendance" subtitle="Daily attendance overview for the organization" />

      <Card>
        <div style={{display:'flex',gap:12,alignItems:'center',flexWrap:'wrap',marginBottom:12}}>
          <Input type="date" value="2026-08-22" style={{minWidth:170}} />
          <Select options={['All employees', 'John Doe', 'Priya Nair', 'Amit Shah', 'Sara Khan']} value="All employees" style={{minWidth:180}} />
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
          data={attendance.map((row) => ({
            ...row,
            check_in: formatClock(row.check_in),
            check_out: formatClock(row.check_out),
            work_hours: row.work_hours ? `${row.work_hours}h` : '-',
            status: <Badge status={row.status}>{row.status}</Badge>
          }))}
        />
      </Card>
    </div>
  )
}
