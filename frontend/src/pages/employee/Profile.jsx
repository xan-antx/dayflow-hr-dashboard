import React, { useEffect, useState } from 'react'
import { Camera, Check, Pencil } from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import PageHeader from '../../components/ui/PageHeader'
import LoadingState from '../../components/ui/LoadingState'
import ErrorState from '../../components/ui/ErrorState'
import Avatar from '../../components/ui/Avatar'
import Input from '../../components/ui/Input'
import { api } from '../../api/client'

const dateText = (value) => value ? new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`)) : '-'

export default function Profile({ session }) {
  const [employee, setEmployee] = useState(null); const [form, setForm] = useState({ phone: '', address: '' }); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [message, setMessage] = useState(''); const [error, setError] = useState('')
  async function load() { setLoading(true); setError(''); try { const result = await api.employee(session.employee_id); setEmployee(result); setForm({ phone: result.phone || '', address: result.address || '' }) } catch (err) { setError(err.message) } finally { setLoading(false) } }
  useEffect(() => { load() }, [])
  async function save(event) { event.preventDefault(); setSaving(true); setMessage(''); try { setEmployee(await api.updateEmployee(session.employee_id, form)); setMessage('Profile updated successfully.') } catch (err) { setError(err.message) } finally { setSaving(false) } }
  async function photo(event) { const file = event.target.files?.[0]; if (!file) return; try { const result = await api.uploadPhoto(session.employee_id, file); setEmployee({ ...employee, profile_picture: result.profile_picture }); setMessage('Profile picture updated.') } catch (err) { setError(err.message) } }
  if (loading) return <><PageHeader eyebrow="Personal details" title="My profile" /><LoadingState /></>
  if (error && !employee) return <><PageHeader eyebrow="Personal details" title="My profile" /><ErrorState message={error} onRetry={load} /></>
  return <><PageHeader eyebrow="Personal details" title="My profile" description="Keep your personal information current." />{error && <ErrorState message={error} onRetry={load} />}{message && <div className="alert alert-success">{message}</div>}<div className="profile-grid"><Card className="profile-intro"><Avatar employee={employee} size="xl" /><h2>{employee.name}</h2><p>{employee.job_position || 'Employee'}</p><span>{employee.department || 'Dayflow'}</span><label className="upload-button"><Camera size={16} />Update photo<input type="file" accept="image/*" onChange={photo} /></label></Card><div className="profile-details"><Card><div className="section-heading"><div><p className="eyebrow">Personal information</p><h2>Your details</h2></div><Pencil size={18} /></div><form className="form-grid" onSubmit={save}><label>Email address<Input value={employee.email || ''} disabled /></label><label>Phone<Input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label><label className="span-2">Address<textarea value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} rows="3" /></label><div className="form-actions span-2"><Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}<Check size={16} /></Button></div></form></Card><Card><div className="section-heading"><div><p className="eyebrow">Job information</p><h2>Your role</h2></div></div><div className="detail-grid">{[['Employee code', employee.employee_code], ['Department', employee.department], ['Job position', employee.job_position], ['Manager', employee.manager], ['Location', employee.location], ['Joining date', dateText(employee.joining_date)]].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value || '-'}</strong></div>)}</div></Card></div></div></>
}
