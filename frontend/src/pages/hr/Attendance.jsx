import React from 'react'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import PageHeader from '../../components/ui/PageHeader'
import Table from '../../components/ui/Table'

const attendance = [
  { employee: 'John Doe', date: '2026-08-22', checkIn: '09:02', checkOut: '18:32', hours: '9.5h', status: 'Present' },
  { employee: 'Priya Nair', date: '2026-08-22', checkIn: '10:05', checkOut: '17:45', hours: '7.7h', status: 'Half-day' },
  { employee: 'Amit Shah', date: '2026-08-22', checkIn: '-', checkOut: '-', hours: '-', status: 'Leave' },
  { employee: 'Sara Khan', date: '2026-08-22', checkIn: '-', checkOut: '-', hours: '-', status: 'Absent' }
]

export default function Attendance(){
  return (
    <div style={{padding:24}}>
      <PageHeader title="Attendance" subtitle="Daily attendance overview for the organization" />
      <Card>
        <Table
          columns={[
            { key: 'employee', label: 'Employee' },
            { key: 'date', label: 'Date' },
            { key: 'checkIn', label: 'Check-in' },
            { key: 'checkOut', label: 'Check-out' },
            { key: 'hours', label: 'Work hours' },
            { key: 'status', label: 'Status' }
          ]}
          data={attendance.map((row) => ({
            ...row,
            status: <Badge status={row.status}>{row.status}</Badge>
          }))}
        />
      </Card>
    </div>
  )
}
