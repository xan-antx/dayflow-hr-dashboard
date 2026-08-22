import React, { useEffect, useState } from 'react'
import { Activity, ArrowRight, CalendarDays, Clock3, UserRound, WalletCards } from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import PageHeader from '../../components/ui/PageHeader'
import LoadingState from '../../components/ui/LoadingState'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'
import Badge from '../../components/ui/Badge'
import { api } from '../../api/client'

const dateText = (value) => value ? new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`)) : '-'
const timeText = (value) => value ? new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit' }).format(new Date(value)) : '-'
const money = (value) => value == null ? '-' : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)

export default function Dashboard({ session, onNavigate }) {
  const [data, setData] = useState({ employee: null, attendance: [], leaves: null, salary: null, activity: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  async function load() { setLoading(true); setError(''); try { const [employee, attendance, leaves, salary, activity] = await Promise.all([api.employee(session.employee_id), api.attendance('daily'), api.leaves(), api.salary(session.employee_id), api.activity().catch(() => [])]); setData({ employee, attendance, leaves, salary, activity }) } catch (err) { setError(err.message || 'Unable to load your dashboard.') } finally { setLoading(false) } }
  useEffect(() => { load() }, [])
  async function attendanceAction() { try { const today = data.attendance?.[0]; if (today?.check_in && !today?.check_out) await api.checkOut(); else await api.checkIn(); await load() } catch (err) { setError(err.message) } }
  if (loading) return <><PageHeader eyebrow="Overview" title="Your day at a glance" /><LoadingState /></>
  if (error) return <><PageHeader eyebrow="Overview" title="Your day at a glance" /><ErrorState message={error} onRetry={load} /></>
  const employee = data.employee || session
  const today = data.attendance?.find((record) => record.date === new Date().toISOString().slice(0, 10)) || data.attendance?.[0]
  return <><PageHeader eyebrow="Employee dashboard" title={`Good day, ${employee.name?.split(' ')[0] || 'there'}.`} description="A clear view of your workday, time off, and pay." action={<Button icon={UserRound} onClick={() => onNavigate('profile')}>View profile</Button>} /><div className="dashboard-grid"><Card><div className="card-heading"><div><p className="eyebrow">Today's attendance</p><h2>{today ? <Badge status={today.status} /> : 'Not started'}</h2></div><Clock3 size={20} /></div><div className="attendance-times"><div><span>Check in</span><strong>{timeText(today?.check_in)}</strong></div><div><span>Check out</span><strong>{timeText(today?.check_out)}</strong></div><div><span>Work hours</span><strong>{today?.work_hours != null ? `${today.work_hours}h` : '-'}</strong></div></div>{(!today?.check_out) && <Button onClick={attendanceAction}>{today?.check_in ? 'Check out' : 'Check in'}<ArrowRight size={16} /></Button>}</Card><Card><div className="card-heading"><div><p className="eyebrow">Leave balance</p><h2>Time to recharge</h2></div><CalendarDays size={20} /></div><div className="balance-row"><div><strong>{data.leaves?.balances?.paid ?? '-'}</strong><span>Paid leave days</span></div><div><strong>{data.leaves?.balances?.sick ?? '-'}</strong><span>Sick leave days</span></div></div><button className="text-link" onClick={() => onNavigate('leave')}>Manage leave <ArrowRight size={15} /></button></Card></div><div className="content-grid"><Card><div className="section-heading"><div><p className="eyebrow">Recent requests</p><h2>Time off</h2></div></div>{data.leaves?.requests?.length ? data.leaves.requests.slice(0, 3).map((request) => <div className="request-item" key={request.id}><div><strong>{request.leave_type} leave</strong><span>{dateText(request.start_date)} - {dateText(request.end_date)}</span></div><Badge status={request.status} /></div>) : <EmptyState title="No leave requests yet." />}</Card><Card><div className="section-heading"><div><p className="eyebrow">Monthly snapshot</p><h2>Salary</h2></div><WalletCards size={20} /></div>{data.salary ? <div className="salary-snapshot"><span>Net salary</span><strong>{money(data.salary.net)}</strong><small>Gross {money(data.salary.gross)}</small></div> : <EmptyState title="Salary information unavailable." />}</Card></div><Card><div className="section-heading"><div><p className="eyebrow">Your workspace</p><h2>Recent activity</h2></div><Activity size={20} /></div>{data.activity?.length ? data.activity.slice(0, 4).map((item, index) => <div className="activity-item" key={`${item.time}-${index}`}><span className="activity-dot" /><div><strong>{item.text}</strong><span>{timeText(item.time)}</span></div></div>) : <EmptyState title="No recent activity yet." />}</Card></>
}
