import React, { useEffect, useState } from 'react'
import { WalletCards } from 'lucide-react'
import Card from '../../components/ui/Card'
import PageHeader from '../../components/ui/PageHeader'
import LoadingState from '../../components/ui/LoadingState'
import ErrorState from '../../components/ui/ErrorState'
import EmptyState from '../../components/ui/EmptyState'
import { api } from '../../api/client'

const money = (value) => value == null ? '-' : new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(value)

export default function Salary({ session }) {
  const [salary, setSalary] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState('')
  async function load() { setLoading(true); setError(''); try { setSalary(await api.salary(session.employee_id)) } catch (err) { setError(err.message) } finally { setLoading(false) } }
  useEffect(() => { load() }, [])
  if (loading) return <><PageHeader eyebrow="Compensation" title="Salary" /><LoadingState /></>
  if (error) return <><PageHeader eyebrow="Compensation" title="Salary" /><ErrorState message={error} onRetry={load} /></>
  if (!salary) return <><PageHeader eyebrow="Compensation" title="Salary" /><EmptyState title="No salary information available." /></>
  const list = (values) => Object.entries(values || {}).map(([key, value]) => <div className="money-list" key={key}><span>{key.replaceAll('_', ' ')}</span><strong>{money(value)}</strong></div>)
  return <><PageHeader eyebrow="Compensation" title="Salary" description="A transparent view of your current salary structure." /><div className="salary-hero"><div><p className="eyebrow">Net monthly salary</p><h2>{money(salary.net)}</h2><span>Gross salary {money(salary.gross)}</span></div><WalletCards size={32} /></div><div className="salary-grid"><Card><p className="eyebrow">Earnings</p><h2>Salary components</h2>{list(salary.components)}</Card><Card><p className="eyebrow">Deductions</p><h2>Monthly deductions</h2>{list(salary.deductions)}<div className="salary-total"><span>Net salary</span><strong>{money(salary.net)}</strong></div></Card></div></>
}
