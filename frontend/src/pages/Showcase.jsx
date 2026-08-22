import React from 'react'
import '../components/ui/Button.jsx'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Input from '../components/ui/Input'
import Card from '../components/ui/Card'
import Table from '../components/ui/Table'
import Modal from '../components/ui/Modal'
import Avatar from '../components/ui/Avatar'
import StatCard from '../components/ui/StatCard'
import PageHeader from '../components/ui/PageHeader'
import EmptyState from '../components/ui/EmptyState'
import LoadingState from '../components/ui/LoadingState'
import AppShell from '../components/layout/AppShell'

export default function Showcase(){
  const sampleData = [
    { id: 1, name: 'Priya Sharma', status: 'Present' },
    { id: 2, name: 'Amit Patel', status: 'Absent' }
  ]

  return (
    <AppShell>
      <div style={{padding:24}}>
        <PageHeader title="Shared UI — Showcase" subtitle="All components and variants" />

        <section style={{marginTop:16}}>
          <h3>Buttons</h3>
          <div style={{display:'flex',gap:12,alignItems:'center'}}>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
          </div>
        </section>

        <section style={{marginTop:24}}>
          <h3>Badges</h3>
          <div style={{display:'flex',gap:8}}>
            <Badge status="Present">Present</Badge>
            <Badge status="Absent">Absent</Badge>
            <Badge status="Half-day">Half-day</Badge>
            <Badge status="Leave">Leave</Badge>
            <Badge status="Pending">Pending</Badge>
            <Badge status="Approved">Approved</Badge>
            <Badge status="Rejected">Rejected</Badge>
          </div>
        </section>

        <section style={{marginTop:24}}>
          <h3>Inputs</h3>
          <div style={{display:'flex',gap:12,flexDirection:'column',maxWidth:420}}>
            <Input placeholder="Normal input" />
            <Input placeholder="Disabled" disabled />
            <Input placeholder="Error state" error />
          </div>
        </section>

        <section style={{marginTop:24}}>
          <h3>Cards & Stat</h3>
          <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
            <Card>
              <h4>Normal Card</h4>
              <p>Card content</p>
            </Card>
            <StatCard title="Attendance" value="96%" trend="up" />
          </div>
        </section>

        <section style={{marginTop:24}}>
          <h3>Table</h3>
          <Table columns={[{key:'name',label:'Name'},{key:'status',label:'Status'}]} data={sampleData} />
        </section>

        <section style={{marginTop:24}}>
          <h3>Modal & Empty / Loading</h3>
          <Modal open title="Confirm">This is a confirmation modal.</Modal>
          <EmptyState title="No records" description="There are no items to show." />
          <LoadingState />
        </section>
      </div>
    </AppShell>
  )
}
