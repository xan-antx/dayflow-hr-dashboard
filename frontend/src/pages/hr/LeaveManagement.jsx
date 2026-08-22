import React from 'react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import PageHeader from '../../components/ui/PageHeader'
import Table from '../../components/ui/Table'

const leaveRequests = [
  { employee: 'Riya Nair', type: 'Sick', dates: 'Aug 24 – Aug 26', remarks: 'Fever', status: 'Pending' },
  { employee: 'Arjun Singh', type: 'Paid', dates: 'Aug 28 – Sep 01', remarks: 'Family travel', status: 'Approved' },
  { employee: 'Meera Das', type: 'Unpaid', dates: 'Sep 02', remarks: 'Personal reason', status: 'Rejected' }
]

export default function LeaveManagement(){
  return (
    <div style={{padding:24}}>
      <PageHeader title="Leave Management" subtitle="Review and decide leave requests" />
      <Card>
        <Table
          columns={[
            { key: 'employee', label: 'Employee' },
            { key: 'type', label: 'Leave type' },
            { key: 'dates', label: 'Dates' },
            { key: 'remarks', label: 'Remarks' },
            { key: 'status', label: 'Status' }
          ]}
          data={leaveRequests.map((row) => ({
            ...row,
            status: <div style={{display:'flex',gap:8,alignItems:'center'}}><Badge status={row.status}>{row.status}</Badge><Button variant="ghost">Review</Button></div>
          }))}
        />
      </Card>
    </div>
  )
}
