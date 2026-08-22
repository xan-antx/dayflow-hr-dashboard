import React, { useEffect, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import PageHeader from '../../components/ui/PageHeader'
import LoadingState from '../../components/ui/LoadingState'
import ErrorState from '../../components/ui/ErrorState'
import EmptyState from '../../components/ui/EmptyState'
import Badge from '../../components/ui/Badge'
import Table from '../../components/ui/Table'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import { api } from '../../api/client'

const dateText = (value) => value ? new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`)) : '-'

export default function Leave() {
  const [data, setData] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [message, setMessage] = useState(''); const [showForm, setShowForm] = useState(false); const [busy, setBusy] = useState(false); const [form, setForm] = useState({ leave_type:'Paid', start_date:'', end_date:'', remarks:'', attachment:null })
  async function load() { setLoading(true); setError(''); try { setData(await api.leaves()) } catch (err) { setError(err.message) } finally { setLoading(false) } }
  useEffect(() => { load() }, [])
  async function submit(event) { event.preventDefault(); setBusy(true); setError(''); setMessage(''); try { await api.createLeave(form); setMessage('Leave request submitted successfully.'); setShowForm(false); setForm({ leave_type:'Paid', start_date:'', end_date:'', remarks:'', attachment:null }); await load() } catch (err) { setError(err.message) } finally { setBusy(false) } }
  if (loading) return <><PageHeader eyebrow="Time away" title="Leave" /><LoadingState /></>
  if (error && !showForm) return <><PageHeader eyebrow="Time away" title="Leave" /><ErrorState message={error} onRetry={load} /></>
  const rows = data?.requests?.map((request) => ({ leave_type:request.leave_type, dates:`${dateText(request.start_date)} - ${dateText(request.end_date)}`, remarks:request.remarks || '-', status:<Badge status={request.status} /> }))
  return <><PageHeader eyebrow="Time away" title="Leave" description="Request time off and track every decision." action={<Button icon={CalendarDays} onClick={() => setShowForm(true)}>Apply for leave</Button>} />{error && <ErrorState message={error} />}{message && <div className="alert alert-success">{message}</div>}<div className="balance-cards"><Card><span>Paid leave</span><strong>{data?.balances?.paid ?? '-'}</strong><small>days remaining</small></Card><Card><span>Sick leave</span><strong>{data?.balances?.sick ?? '-'}</strong><small>days remaining</small></Card><Card><span>Unpaid leave</span><strong>-</strong><small>no balance limit</small></Card></div><Card><div className="section-heading"><div><p className="eyebrow">Request history</p><h2>My requests</h2></div></div>{rows?.length ? <Table columns={[{key:'leave_type',label:'Type'},{key:'dates',label:'Dates'},{key:'remarks',label:'Remarks'},{key:'status',label:'Status'}]} data={rows} /> : <EmptyState title="No leave requests yet." />}</Card>{showForm && <Modal title="Apply for leave" onClose={() => setShowForm(false)}><form className="leave-form" onSubmit={submit}><label>Leave type<Select value={form.leave_type} onChange={(event) => setForm({ ...form, leave_type:event.target.value })} options={['Paid','Sick','Unpaid']} /></label><div className="form-grid"><label>Start date<Input type="date" value={form.start_date} onChange={(event) => setForm({ ...form, start_date:event.target.value })} required /></label><label>End date<Input type="date" value={form.end_date} onChange={(event) => setForm({ ...form, end_date:event.target.value })} required /></label></div><label>Remarks<Input value={form.remarks} onChange={(event) => setForm({ ...form, remarks:event.target.value })} /></label><label>Attachment<input type="file" onChange={(event) => setForm({ ...form, attachment:event.target.files?.[0] || null })} /></label><div className="form-actions"><Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button><Button type="submit" disabled={busy}>{busy ? 'Submitting...' : 'Submit request'}</Button></div></form></Modal>}</>
}
