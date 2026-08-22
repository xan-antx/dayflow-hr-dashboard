import React from 'react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import StatCard from '../../components/ui/StatCard'
import PageHeader from '../../components/ui/PageHeader'
import Table from '../../components/ui/Table'

const stats = [
  { title: 'Total Employees', value: '248', trend: 'up' },
  { title: 'Present Today', value: '186', trend: 'up' },
  { title: 'Absent Today', value: '12', trend: 'down' },
  { title: 'Pending Leave', value: '9', trend: 'up' }
]

const recentLeave = [
  { employee: 'Riya Nair', type: 'Sick', dates: 'Aug 24 – Aug 26', status: 'Pending' },
  { employee: 'Arjun Singh', type: 'Paid', dates: 'Aug 28 – Sep 01', status: 'Approved' },
  { employee: 'Meera Das', type: 'Sick', dates: 'Aug 30', status: 'Rejected' }
]

export default function Dashboard(){
  return (
    <div style={{padding:24}}>
      <PageHeader title="HR Dashboard" subtitle="Operational overview for the organization" />

      <div style={{display:'grid',gridTemplateColumns:'repeat(4, minmax(180px, 1fr))',gap:16,marginTop:16}}>
        {stats.map((stat) => (
          <StatCard key={stat.title} title={stat.title} value={stat.value} trend={stat.trend} />
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1.4fr 0.9fr',gap:16,marginTop:24}}>
        <Card header={<h3>Attendance Overview</h3>}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3, minmax(120px, 1fr))',gap:12,marginTop:8}}>
            <div style={{padding:16,border:'1px solid var(--border)',borderRadius:12,background:'var(--color-soft-olive)'}}>
              <div style={{fontSize:12,color:'var(--text-secondary)'}}>Present</div>
              <div style={{fontSize:24,fontWeight:700}}>186</div>
            </div>
            <div style={{padding:16,border:'1px solid var(--border)',borderRadius:12,background:'var(--color-warm-cream)'}}>
              <div style={{fontSize:12,color:'var(--text-secondary)'}}>Absent</div>
              <div style={{fontSize:24,fontWeight:700}}>12</div>
            </div>
            <div style={{padding:16,border:'1px solid var(--border)',borderRadius:12,background:'var(--color-sand)'}}>
              <div style={{fontSize:12,color:'var(--text-secondary)'}}>On Leave</div>
              <div style={{fontSize:24,fontWeight:700}}>9</div>
            </div>
          </div>
        </Card>

        <Card header={<h3>Quick Actions</h3>}>
          <div style={{display:'flex',flexDirection:'column',gap:10,marginTop:8}}>
            <Button variant="primary">+ Add Employee</Button>
            <Button variant="secondary">Review Leave</Button>
            <Button variant="ghost">View Attendance</Button>
          </div>
        </Card>
      </div>

      <div style={{marginTop:24}}>
        <Card header={<h3>Recent Leave Requests</h3>} footer={<Button variant="ghost">View all leave</Button>}>
          <Table
            columns={[{ key: 'employee', label: 'Employee' }, { key: 'type', label: 'Type' }, { key: 'dates', label: 'Dates' }, { key: 'status', label: 'Status' }]}
            data={recentLeave.map((item) => ({
              ...item,
              status: <Badge status={item.status}>{item.status}</Badge>
            }))}
          />
        </Card>
      </div>
    </div>
  )
}
