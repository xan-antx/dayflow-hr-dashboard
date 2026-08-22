import React, { useEffect, useState } from 'react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import StatCard from '../../components/ui/StatCard'
import PageHeader from '../../components/ui/PageHeader'
import Table from '../../components/ui/Table'
import { api } from '../../api/client'

const fallbackStats = [
  { title: 'Total Employees', value: '0', trend: 'up' },
  { title: 'Present Today', value: '0', trend: 'up' },
  { title: 'Absent Today', value: '0', trend: 'down' },
  { title: 'Pending Leave', value: '0', trend: 'up' }
]

const fallbackRecentLeave = [
  { employee: 'No data', type: '—', dates: '—', status: 'Pending' }
]

export default function Dashboard(){
  const [stats, setStats] = useState(fallbackStats)
  const [recentLeave, setRecentLeave] = useState(fallbackRecentLeave)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function loadDashboard() {
      try {
        const employees = await api.employeesList().catch(() => [])
        const pendingLeaves = await api.leavesAll('Pending').catch(() => [])

        const totalEmployees = employees.length
        const presentToday = employees.filter((employee) => String(employee.today_status || '').toLowerCase() === 'present').length
        const absentToday = employees.filter((employee) => String(employee.today_status || '').toLowerCase() === 'absent').length

        if (!active) return

        setStats([
          { title: 'Total Employees', value: String(totalEmployees), trend: 'up' },
          { title: 'Present Today', value: String(presentToday), trend: 'up' },
          { title: 'Absent Today', value: String(absentToday), trend: 'down' },
          { title: 'Pending Leave', value: String((Array.isArray(pendingLeaves) ? pendingLeaves : []).length), trend: 'up' }
        ])

        const recent = (Array.isArray(pendingLeaves) ? pendingLeaves : []).slice(0, 3).map((item) => ({
          employee: item.employee_name || 'Employee',
          type: item.leave_type || 'Leave',
          dates: item.start_date && item.end_date ? `${item.start_date} – ${item.end_date}` : '—',
          status: item.status || 'Pending'
        }))

        setRecentLeave(recent.length ? recent : fallbackRecentLeave)
      } catch {
        if (!active) return
        setStats(fallbackStats)
        setRecentLeave(fallbackRecentLeave)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadDashboard()
    return () => { active = false }
  }, [])

  return (
    <div style={{padding:24}}>
      <PageHeader title="HR Dashboard" subtitle="Operational overview for the organization" />

      <div style={{display:'grid',gridTemplateColumns:'repeat(4, minmax(180px, 1fr))',gap:16,marginTop:16}}>
        {stats.map((stat) => (
          <StatCard key={stat.title} title={stat.title} value={loading ? '…' : stat.value} trend={stat.trend} />
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1.4fr 0.9fr',gap:16,marginTop:24}}>
        <Card header={<h3>Attendance Overview</h3>}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3, minmax(120px, 1fr))',gap:12,marginTop:8}}>
            <div style={{padding:16,border:'1px solid var(--border)',borderRadius:12,background:'var(--color-soft-olive)'}}>
              <div style={{fontSize:12,color:'var(--text-secondary)'}}>Present</div>
              <div style={{fontSize:24,fontWeight:700}}>{loading ? '…' : stats[1].value}</div>
            </div>
            <div style={{padding:16,border:'1px solid var(--border)',borderRadius:12,background:'var(--color-warm-cream)'}}>
              <div style={{fontSize:12,color:'var(--text-secondary)'}}>Absent</div>
              <div style={{fontSize:24,fontWeight:700}}>{loading ? '…' : stats[2].value}</div>
            </div>
            <div style={{padding:16,border:'1px solid var(--border)',borderRadius:12,background:'var(--color-sand)'}}>
              <div style={{fontSize:12,color:'var(--text-secondary)'}}>On Leave</div>
              <div style={{fontSize:24,fontWeight:700}}>{loading ? '…' : String(Math.max(0, Number(stats[3].value) || 0))}</div>
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
