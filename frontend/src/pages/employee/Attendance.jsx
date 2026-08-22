import React, { useEffect, useState } from 'react'
import { Clock3 } from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import PageHeader from '../../components/ui/PageHeader'
import LoadingState from '../../components/ui/LoadingState'
import ErrorState from '../../components/ui/ErrorState'
import EmptyState from '../../components/ui/EmptyState'
import Badge from '../../components/ui/Badge'
import Table from '../../components/ui/Table'
import { api } from '../../api/client'

const dateText = (value) => value ? new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`)) : '-'
const timeText = (value) => value ? new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit' }).format(new Date(value)) : '-'

export default function Attendance() {
  const [range, setRange] = useState('weekly'); const [records, setRecords] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  async function load() { setLoading(true); setError(''); try { setRecords(await api.attendance(range)) } catch (err) { setError(err.message) } finally { setLoading(false) } }
  useEffect(() => { load() }, [range])
  async function action() { setBusy(true); try { const today = records.find((record) => record.date === new Date().toISOString().slice(0, 10)); if (today?.check_in && !today.check_out) await api.checkOut(); else await api.checkIn(); await load() } catch (err) { setError(err.message) } finally { setBusy(false) } }
  if (loading) return <><PageHeader eyebrow="Time tracking" title="Attendance" /><LoadingState /></>
  if (error) return <><PageHeader eyebrow="Time tracking" title="Attendance" /><ErrorState message={error} onRetry={load} /></>
  const today = records.find((record) => record.date === new Date().toISOString().slice(0, 10)); const rows = records.map((record) => ({ ...record, date: dateText(record.date), check_in: timeText(record.check_in), check_out: timeText(record.check_out), work_hours: record.work_hours == null ? '-' : `${record.work_hours}h`, extra_hours: record.extra_hours == null ? '-' : `${record.extra_hours}h`, status: <Badge status={record.status} /> }))
  return <><PageHeader eyebrow="Time tracking" title="Attendance" description="Your attendance records, directly from Dayflow." action={(!today?.check_out) && <Button onClick={action} disabled={busy} icon={Clock3}>{busy ? 'Updating...' : today?.check_in ? 'Check out' : 'Check in'}</Button>} /><Card><div className="section-heading"><div><p className="eyebrow">Attendance history</p><h2>{range === 'weekly' ? 'This week' : 'Today'}</h2></div><div className="segmented"><button className={range === 'daily' ? 'selected' : ''} onClick={() => setRange('daily')}>Daily</button><button className={range === 'weekly' ? 'selected' : ''} onClick={() => setRange('weekly')}>Weekly</button></div></div>{records.length ? <Table columns={[{ key:'date', label:'Date' }, { key:'check_in', label:'Check in' }, { key:'check_out', label:'Check out' }, { key:'work_hours', label:'Work hours' }, { key:'extra_hours', label:'Extra hours' }, { key:'status', label:'Status' }]} data={rows} /> : <EmptyState title="No attendance records available." />}</Card></>
}
