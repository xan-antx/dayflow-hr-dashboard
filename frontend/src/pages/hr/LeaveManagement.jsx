import React, { useState } from 'react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import PageHeader from '../../components/ui/PageHeader'
import Table from '../../components/ui/Table'
import Modal from '../../components/ui/Modal'
import Select from '../../components/ui/Select'

const leaveRequests = [
  { id: 7, employee_id: 2, employee_name: 'Riya Nair', leave_type: 'Sick', start_date: '2026-08-24', end_date: '2026-08-26', remarks: 'Fever', attachment: null, status: 'Pending', admin_comment: null },
  { id: 8, employee_id: 3, employee_name: 'Arjun Singh', leave_type: 'Paid', start_date: '2026-08-28', end_date: '2026-09-01', remarks: 'Family travel', attachment: null, status: 'Approved', admin_comment: 'Approved for family travel' },
  { id: 9, employee_id: 4, employee_name: 'Meera Das', leave_type: 'Unpaid', start_date: '2026-09-02', end_date: '2026-09-02', remarks: 'Personal reason', attachment: null, status: 'Rejected', admin_comment: 'Rejected due to staffing constraints' }
]

export default function LeaveManagement(){
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(null)

  return (
    <div style={{padding:24}}>
      <PageHeader title="Leave Management" subtitle="Review and decide leave requests" />
      <Card>
        <div style={{display:'flex',gap:12,alignItems:'center',marginBottom:12}}>
          <Select options={['All requests', 'Pending', 'Approved', 'Rejected']} value="All requests" style={{minWidth:180}} />
        </div>

        <Table
          columns={[
            { key: 'employee_name', label: 'Employee' },
            { key: 'leave_type', label: 'Leave type' },
            { key: 'start_date', label: 'Start' },
            { key: 'end_date', label: 'End' },
            { key: 'remarks', label: 'Remarks' },
            { key: 'status', label: 'Status' }
          ]}
          data={leaveRequests.map((row) => ({
            ...row,
            status: <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <Badge status={row.status}>{row.status}</Badge>
              <Button variant="ghost" onClick={() => { setSelected(row); setOpen(true) }}>Review</Button>
            </div>
          }))}
        />
      </Card>

      <Modal open={open} title={selected ? `Review leave for ${selected.employee_name}` : 'Review leave'} onClose={() => setOpen(false)}>
        {selected && (
          <div style={{display:'grid',gap:12}}>
            <div><strong>Employee ID:</strong> {selected.employee_id}</div>
            <div><strong>Leave type:</strong> {selected.leave_type}</div>
            <div><strong>Dates:</strong> {selected.start_date} → {selected.end_date}</div>
            <div><strong>Remarks:</strong> {selected.remarks}</div>
            <textarea
              placeholder="Admin comment"
              defaultValue={selected.admin_comment || ''}
              style={{width:'100%',minHeight:90,padding:10,border:'1px solid var(--border)',borderRadius:8,resize:'vertical'}}
            />
            <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
              <Button variant="danger" onClick={() => setOpen(false)}>Reject</Button>
              <Button variant="primary" onClick={() => setOpen(false)}>Approve</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
