import React from 'react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import PageHeader from '../../components/ui/PageHeader'
import Table from '../../components/ui/Table'

const employees = [
  { code: 'OIJODO20260001', name: 'John Doe', email: 'john@dayflow.com', department: 'Engineering', position: 'Developer', status: 'Present' },
  { code: 'OIJODO20260002', name: 'Priya Nair', email: 'priya@dayflow.com', department: 'People', position: 'HR Specialist', status: 'Half-day' },
  { code: 'OIJODO20260003', name: 'Amit Shah', email: 'amit@dayflow.com', department: 'Finance', position: 'Accountant', status: 'Leave' },
  { code: 'OIJODO20260004', name: 'Sara Khan', email: 'sara@dayflow.com', department: 'Design', position: 'UX Designer', status: 'Absent' }
]

export default function EmployeeManagement(){
  return (
    <div style={{padding:24}}>
      <PageHeader title="Employee Management" subtitle="Search, review, and manage organization-wide employee records" />

      <Card footer={<Button variant="primary">+ Add Employee</Button>}>
        <div style={{display:'flex',gap:12,alignItems:'center',flexWrap:'wrap'}}>
          <Input placeholder="Search employees" style={{minWidth:260}} />
          <Button variant="secondary">Filter</Button>
        </div>
      </Card>

      <div style={{marginTop:24}}>
        <Table
          columns={[
            { key: 'code', label: 'Code' },
            { key: 'name', label: 'Name' },
            { key: 'email', label: 'Email' },
            { key: 'department', label: 'Department' },
            { key: 'position', label: 'Position' },
            { key: 'status', label: 'Status' }
          ]}
          data={employees.map((employee) => ({
            ...employee,
            status: <Badge status={employee.status}>{employee.status}</Badge>
          }))}
        />
      </div>
    </div>
  )
}
