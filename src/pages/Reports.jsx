import { useState, useEffect } from 'react'
import { Flag, CheckCircle, XCircle, Eye } from 'lucide-react'
import { supabase } from '../lib/supabase'

const STATUS_COLORS = {
  pending: 'bg-warning-bg text-warning',
  reviewed: 'bg-navy/10 text-navy',
  actioned: 'bg-danger-bg text-danger',
  dismissed: 'bg-[#ECEAE6] text-muted',
}

export default function Reports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [selected, setSelected] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [adminNote, setAdminNote] = useState('')

  useEffect(() => { fetchReports() }, [filter])

  async function fetchReports() {
    setLoading(true)
    let query = supabase.from('reports')
      .select('*, reporter:reporter_id(full_name, college), reported:reported_user_id(full_name, college, is_banned)')
      .order('created_at', { ascending: false })
    if (filter !== 'all') query = query.eq('status', filter)
    const { data } = await query
    setReports(data || [])
    setLoading(false)
  }

  async function updateReport(reportId, status) {
    setActionLoading(true)
    await supabase.from('reports').update({ status, admin_notes: adminNote || null }).eq('id', reportId)
    await fetchReports()
    setSelected(null)
    setAdminNote('')
    setActionLoading(false)
  }

  async function banUser(userId) {
    setActionLoading(true)
    await supabase.from('profiles').update({ is_banned: true }).eq('id', userId)
    await updateReport(selected.id, 'actioned')
  }

  async function dismissReport(reportId) {
    await updateReport(reportId, 'dismissed')
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-navy">Reports</h1>
        <p className="text-muted text-sm mt-1">Review and action user reports</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {['pending', 'actioned', 'dismissed', 'all'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-xs font-display font-semibold px-4 py-2 rounded-full capitalize transition-colors ${filter === f ? 'bg-navy text-white' : 'bg-white text-muted border border-[#ECEAE6] hover:border-navy'}`}>
            {f}
          </button>
        ))}
      </div>

      {loading && <div className="flex flex-col gap-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />)}</div>}

      {!loading && reports.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#ECEAE6]">
          <Flag size={32} className="text-muted/40 mx-auto mb-3" />
          <p className="font-display font-semibold text-navy">No {filter} reports</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {reports.map((report) => (
          <div key={report.id} className="bg-white rounded-2xl border border-[#ECEAE6] shadow-sm overflow-hidden">
            <div className="px-6 py-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${STATUS_COLORS[report.status]}`}>{report.status}</span>
                  <span className="text-xs text-muted">{new Date(report.created_at).toLocaleDateString('en-IN')}</span>
                </div>
                <p className="font-display font-semibold text-sm text-navy mb-1">{report.reason}</p>
                <div className="flex gap-4 text-xs text-muted">
                  <span>Reporter: <span className="text-navy font-medium">{report.reporter?.full_name || 'Unknown'}</span></span>
                  <span>Reported: <span className="text-danger font-medium">{report.reported?.full_name || 'Unknown'}</span>{report.reported?.is_banned && ' (Banned)'}</span>
                </div>
                {report.admin_notes && <p className="text-xs text-muted mt-2 italic">Note: {report.admin_notes}</p>}
              </div>
              <button onClick={() => { setSelected(report); setAdminNote(report.admin_notes || '') }}
                className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-navy bg-navy/5 px-3 py-2 rounded-xl hover:bg-navy/10 transition-colors">
                <Eye size={14} /> Review
              </button>
            </div>
            {report.proof_url && (
              <div className="px-6 pb-4">
                <a href={report.proof_url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-orange underline">View proof screenshot ↗</a>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Review modal */}
      {selected && (
        <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-[#ECEAE6]">
              <h2 className="font-display font-bold text-navy">Review Report</h2>
            </div>
            <div className="px-6 py-4 flex flex-col gap-4">
              <div>
                <p className="text-xs text-muted font-semibold mb-1">REASON</p>
                <p className="text-sm text-navy font-medium">{selected.reason}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted font-semibold mb-1">REPORTER</p>
                  <p className="text-sm text-navy">{selected.reporter?.full_name}</p>
                  <p className="text-xs text-muted">{selected.reporter?.college}</p>
                </div>
                <div>
                  <p className="text-xs text-muted font-semibold mb-1">REPORTED USER</p>
                  <p className="text-sm text-navy">{selected.reported?.full_name}</p>
                  <p className="text-xs text-muted">{selected.reported?.college}</p>
                </div>
              </div>
              {selected.proof_url && (
                <a href={selected.proof_url} target="_blank" rel="noopener noreferrer" className="block">
                  <img src={selected.proof_url} alt="Proof" className="w-full max-h-48 object-contain rounded-xl border border-[#ECEAE6] bg-[#F0F2F5]" />
                </a>
              )}
              <div>
                <label className="text-xs text-muted font-semibold block mb-1">ADMIN NOTE (optional)</label>
                <textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)} rows={2}
                  placeholder="Add a note about this decision…"
                  className="w-full bg-[#F0F2F5] border border-[#ECEAE6] rounded-xl px-4 py-2 text-sm text-navy outline-none focus:border-orange resize-none" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#ECEAE6] flex gap-3 flex-wrap">
              <button onClick={() => setSelected(null)} className="flex-1 py-2.5 rounded-xl border border-[#ECEAE6] text-sm font-semibold text-muted hover:bg-[#F0F2F5]">Cancel</button>
              <button onClick={() => dismissReport(selected.id)} disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl bg-[#F0F2F5] text-sm font-semibold text-navy hover:bg-[#ECEAE6] disabled:opacity-50 flex items-center justify-center gap-2">
                <XCircle size={15} /> Dismiss
              </button>
              {!selected.reported?.is_banned && (
                <button onClick={() => banUser(selected.reported_user_id)} disabled={actionLoading}
                  className="flex-1 py-2.5 rounded-xl bg-danger text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                  <CheckCircle size={15} /> Ban User
                </button>
              )}
              <button onClick={() => updateReport(selected.id, 'reviewed')} disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl bg-navy text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50">
                Mark Reviewed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
