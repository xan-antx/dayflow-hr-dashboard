import React, { useState } from 'react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import PageHeader from '../../components/ui/PageHeader'
import Table from '../../components/ui/Table'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'

const formatCurrency = (value) => `₹${Number(value).toLocaleString()}`

const initialPayrollRows = [
  { employee_id: 2, employee_name: 'John Doe', wage: 50000, components: { basic: 25000, hra: 12500, standard_allowance: 4167, performance_bonus: 4165, lta: 4165, fixed_allowance: 3 }, deductions: { pf_employee: 3000, professional_tax: 200 }, gross: 50000, net: 46800 },
  { employee_id: 3, employee_name: 'Priya Nair', wage: 42000, components: { basic: 21000, hra: 10500, standard_allowance: 3500, performance_bonus: 3500, lta: 3500, fixed_allowance: 0 }, deductions: { pf_employee: 2520, professional_tax: 180 }, gross: 42000, net: 39300 },
  { employee_id: 4, employee_name: 'Amit Shah', wage: 55000, components: { basic: 27500, hra: 13750, standard_allowance: 4583, performance_bonus: 4583, lta: 4584, fixed_allowance: 0 }, deductions: { pf_employee: 3300, professional_tax: 220 }, gross: 55000, net: 51480 }
]

export default function Payroll(){
  const [rows, setRows] = useState(initialPayrollRows)
  const [open, setOpen] = useState(false)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(2)
  const [newWage, setNewWage] = useState('60000')

  const handleWageUpdate = () => {
    const wageValue = Number(newWage)
    setRows(prev => prev.map((row) => {
      if (row.employee_id !== selectedEmployeeId) return row
      const pfEmployee = Math.round(wageValue * 0.06)
      const professionalTax = 200
      const totalDeductions = pfEmployee + professionalTax
      const nextGross = wageValue
      const nextNet = nextGross - totalDeductions
      return {
        ...row,
        wage: wageValue,
        components: {
          basic: Math.round(wageValue * 0.5),
          hra: Math.round(wageValue * 0.25),
          standard_allowance: Math.round(wageValue * 0.0834),
          performance_bonus: Math.round(wageValue * 0.0833),
          lta: Math.round(wageValue * 0.0833),
          fixed_allowance: 0
        },
        deductions: { pf_employee: pfEmployee, professional_tax: professionalTax },
        gross: nextGross,
        net: nextNet
      }
    }))
    setOpen(false)
  }

  return (
    <div style={{padding:24}}>
      <PageHeader title="Payroll" subtitle="Monthly salary overview and computation" />

      <div style={{display:'grid',gridTemplateColumns:'repeat(3, minmax(170px, 1fr))',gap:16,marginBottom:24}}>
        <Card header={<h3>Total Payroll</h3>}>
          <div style={{fontSize:28,fontWeight:700}}>{formatCurrency(rows.reduce((sum, row) => sum + row.gross, 0))}</div>
          <div style={{marginTop:8,color:'var(--success)'}}>+4.3% vs last month</div>
        </Card>
        <Card header={<h3>Gross Salaries</h3>}>
          <div style={{fontSize:28,fontWeight:700}}>{formatCurrency(rows.reduce((sum, row) => sum + row.gross, 0))}</div>
          <div style={{marginTop:8,color:'var(--text-secondary)'}}>Across active employees</div>
        </Card>
        <Card header={<h3>Pending</h3>}>
          <div style={{fontSize:28,fontWeight:700}}>{formatCurrency(8600)}</div>
          <div style={{marginTop:8,color:'var(--warning)'}}>Awaiting review</div>
        </Card>
      </div>

      <Card>
        <div style={{display:'flex',justifyContent:'flex-end',marginBottom:12}}>
          <Button variant="primary" onClick={() => setOpen(true)}>Update wage</Button>
        </div>

        <Table
          columns={[
            { key: 'employee_name', label: 'Employee' },
            { key: 'wage', label: 'Wage' },
            { key: 'gross', label: 'Gross' },
            { key: 'deductions', label: 'Deductions' },
            { key: 'net', label: 'Net salary' }
          ]}
          data={rows.map((row) => ({
            ...row,
            wage: formatCurrency(row.wage),
            gross: formatCurrency(row.gross),
            deductions: formatCurrency((row.deductions.pf_employee || 0) + (row.deductions.professional_tax || 0)),
            net: <span style={{fontWeight:600}}>{formatCurrency(row.net)}</span>
          }))}
        />
      </Card>

      <Modal open={open} title="Update employee wage" onClose={() => setOpen(false)}>
        <div style={{display:'grid',gap:12}}>
          <select value={selectedEmployeeId} onChange={(e) => setSelectedEmployeeId(Number(e.target.value))} style={{padding:10,border:'1px solid var(--border)',borderRadius:8}}>
            {rows.map((row) => <option key={row.employee_id} value={row.employee_id}>{row.employee_name}</option>)}
          </select>
          <Input type="number" value={newWage} onChange={(e) => setNewWage(e.target.value)} placeholder="New wage" />
          <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleWageUpdate}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
