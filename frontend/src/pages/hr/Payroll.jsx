import React from 'react'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import PageHeader from '../../components/ui/PageHeader'
import Table from '../../components/ui/Table'

const payrollRows = [
  { employee: 'John Doe', wage: '₹50,000', gross: '₹50,000', deductions: '₹3,200', net: '₹46,800' },
  { employee: 'Priya Nair', wage: '₹42,000', gross: '₹42,000', deductions: '₹2,850', net: '₹39,150' },
  { employee: 'Amit Shah', wage: '₹55,000', gross: '₹55,000', deductions: '₹3,300', net: '₹51,700' }
]

export default function Payroll(){
  return (
    <div style={{padding:24}}>
      <PageHeader title="Payroll" subtitle="Monthly salary overview and computation" />

      <div style={{display:'grid',gridTemplateColumns:'repeat(3, minmax(170px, 1fr))',gap:16,marginBottom:24}}>
        <Card header={<h3>Total Payroll</h3>}>
          <div style={{fontSize:28,fontWeight:700}}>₹1,92,500</div>
          <div style={{marginTop:8,color:'var(--success)'}}>+4.3% vs last month</div>
        </Card>
        <Card header={<h3>Gross Salaries</h3>}>
          <div style={{fontSize:28,fontWeight:700}}>₹1,47,000</div>
          <div style={{marginTop:8,color:'var(--text-secondary)'}}>Across active employees</div>
        </Card>
        <Card header={<h3>Pending</h3>}>
          <div style={{fontSize:28,fontWeight:700}}>₹8,600</div>
          <div style={{marginTop:8,color:'var(--warning)'}}>Awaiting review</div>
        </Card>
      </div>

      <Card>
        <Table
          columns={[
            { key: 'employee', label: 'Employee' },
            { key: 'wage', label: 'Wage' },
            { key: 'gross', label: 'Gross' },
            { key: 'deductions', label: 'Deductions' },
            { key: 'net', label: 'Net salary' }
          ]}
          data={payrollRows.map((row) => ({
            ...row,
            net: <span style={{fontWeight:600}}>{row.net}</span>
          }))}
        />
      </Card>
    </div>
  )
}
