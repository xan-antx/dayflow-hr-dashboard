import React, { useEffect, useState } from 'react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import PageHeader from '../../components/ui/PageHeader'
import Table from '../../components/ui/Table'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { api } from '../../api/client'

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString()}`

const fallbackRows = [
  { employee_id: 0, employee_name: 'No employees', wage: 0, gross: 0, deductions: { pf_employee: 0, professional_tax: 0 }, net: 0 }
]

export default function Payroll(){
  const [rows, setRows] = useState([])
  const [open, setOpen] = useState(false)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [newWage, setNewWage] = useState('')

  const loadPayroll = async () => {
    try {
      const employees = await api.employeesList().catch(() => [])
      const nextRows = []

      for (const employee of employees) {
        try {
          const salary = await api.salaryOf(employee.id)
          nextRows.push({
            employee_id: employee.id,
            employee_name: employee.name,
            wage: Number(salary.wage || employee.wage || 0),
            gross: Number(salary.gross || 0),
            deductions: salary.deductions || { pf_employee: 0, professional_tax: 0 },
            net: Number(salary.net || 0)
          })
        } catch {
          nextRows.push({
            employee_id: employee.id,
            employee_name: employee.name,
            wage: Number(employee.wage || 0),
            gross: Number(employee.wage || 0),
            deductions: { pf_employee: 0, professional_tax: 0 },
            net: Number(employee.wage || 0)
          })
        }
      }

      if (!nextRows.length) {
        setRows([])
        return
      }

      setRows(nextRows)
      if (!selectedEmployeeId && nextRows[0]) setSelectedEmployeeId(String(nextRows[0].employee_id))
      if (!newWage && nextRows[0]) setNewWage(String(nextRows[0].wage))
    } catch {
      setRows([])
    }
  }

  useEffect(() => {
    loadPayroll()
  }, [])

  const totalGross = rows.reduce((sum, row) => sum + Number(row.gross || 0), 0)

  const handleWageUpdate = async () => {
    if (!selectedEmployeeId) return

    try {
      const salary = await api.updateSalary(Number(selectedEmployeeId), Number(newWage))
      setRows((prev) => prev.map((row) => row.employee_id === Number(selectedEmployeeId)
        ? {
            ...row,
            wage: Number(salary.wage || newWage || row.wage),
            gross: Number(salary.gross || row.gross),
            deductions: salary.deductions || row.deductions,
            net: Number(salary.net || row.net)
          }
        : row
      ))
      setOpen(false)
    } catch (err) {
      alert(err.message || 'Unable to update salary')
    }
  }

  return (
    <div style={{padding:24}}>
      <PageHeader title="Payroll" subtitle="Monthly salary overview and computation" />

      <div style={{display:'grid',gridTemplateColumns:'repeat(3, minmax(170px, 1fr))',gap:16,marginBottom:24}}>
        <Card header={<h3>Total Payroll</h3>}>
          <div style={{fontSize:28,fontWeight:700}}>{formatCurrency(totalGross)}</div>
          <div style={{marginTop:8,color:'var(--success)'}}>Live payroll total</div>
        </Card>
        <Card header={<h3>Gross Salaries</h3>}>
          <div style={{fontSize:28,fontWeight:700}}>{formatCurrency(totalGross)}</div>
          <div style={{marginTop:8,color:'var(--text-secondary)'}}>Across active employees</div>
        </Card>
        <Card header={<h3>Pending</h3>}>
          <div style={{fontSize:28,fontWeight:700}}>{formatCurrency(rows.reduce((sum, row) => sum + Number(row.net || 0), 0) * 0.04)}</div>
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
          data={(rows.length ? rows : fallbackRows).map((row) => ({
            ...row,
            wage: formatCurrency(row.wage),
            gross: formatCurrency(row.gross),
            deductions: formatCurrency((row.deductions?.pf_employee || 0) + (row.deductions?.professional_tax || 0)),
            net: <span style={{fontWeight:600}}>{formatCurrency(row.net)}</span>
          }))}
        />
      </Card>

      <Modal open={open} title="Update employee wage" onClose={() => setOpen(false)}>
        <div style={{display:'grid',gap:12}}>
          <select value={selectedEmployeeId} onChange={(e) => { setSelectedEmployeeId(e.target.value); const target = rows.find((row) => String(row.employee_id) === e.target.value); setNewWage(String(target?.wage || '')) }} style={{padding:10,border:'1px solid var(--border)',borderRadius:8}}>
            {rows.map((row) => <option key={row.employee_id} value={String(row.employee_id)}>{row.employee_name}</option>)}
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
