import React, { useEffect, useState } from 'react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import PageHeader from '../../components/ui/PageHeader'
import Table from '../../components/ui/Table'
import Modal from '../../components/ui/Modal'
import Select from '../../components/ui/Select'
import { api } from '../../api/client'

const fallbackLeaveRequests = [
  { id: 0, employee_id: 0, employee_name: 'No requests', leave_type: '—', start_date: '', end_date: '', remarks: '', status: 'Pending', admin_comment: '' }
]

export default function LeaveManagement(){
  const [requests, setRequests] = useState([])
  const [filter, setFilter] = useState('All requests')
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [comment, setComment] = useState('')

  const loadRequests = async () => {
    const status = filter === 'All requests' ? undefined : filter
    try {
      const data = await api.leavesAll(status).catch(() => [])
      setRequests(Array.isArray(data) ? data : [])
    } catch {
      setRequests([])
    }
  }

  useEffect(() => {
    loadRequests()
  }, [filter])

  const handleDecision = async (decision) => {
    if (!selected) return
    try {
      await api.decideLeave(selected.id, { decision, admin_comment: comment })
      setOpen(false)
      setSelected(null)
      setComment('')
      loadRequests()
    } catch (err) {
      alert(err.message || 'Unable to update leave request')
    }
  }

  return (
    <div style={{padding:24}}>
      <PageHeader title="Leave Management" subtitle="Review and decide leave requests" />
      <Card>
        <div style={{display:'flex',gap:12,alignItems:'center',marginBottom:12}}>
          <Select options={['All requests', 'Pending', 'Approved', 'Rejected']} value={filter} onChange={(e) => setFilter(e.target.value)} style={{minWidth:180}} />
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
          data={(requests.length ? requests : fallbackLeaveRequests).map((row) => ({
            ...row,
            status: <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <Badge status={row.status || 'Pending'}>{row.status || 'Pending'}</Badge>
              {row.id ? <Button variant="ghost" onClick={() => { setSelected(row); setComment(row.admin_comment || ''); setOpen(true) }}>Review</Button> : null}
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
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{width:'100%',minHeight:90,padding:10,border:'1px solid var(--border)',borderRadius:8,resize:'vertical'}}
            />
            <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
              <Button variant="danger" onClick={() => handleDecision('Rejected')}>Reject</Button>
              <Button variant="primary" onClick={() => handleDecision('Approved')}>Approve</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
