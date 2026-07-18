import { useState, useEffect } from 'react'
import { Search, ShieldOff, ShieldCheck, Star } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => { fetchUsers() }, [filter])

  async function fetchUsers() {
    setLoading(true)
    let query = supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (filter === 'banned') query = query.eq('is_banned', true)
    if (filter === 'active') query = query.eq('is_banned', false)
    const { data } = await query
    setUsers(data || [])
    setLoading(false)
  }

  async function toggleBan(userId, currentStatus) {
    setActionLoading(userId)
    await supabase.from('profiles').update({ is_banned: !currentStatus }).eq('id', userId)
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, is_banned: !currentStatus } : u))
    setActionLoading(null)
  }

  const filtered = users.filter((u) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return u.full_name?.toLowerCase().includes(q) || u.college?.toLowerCase().includes(q)
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-navy">Users</h1>
        <p className="text-muted text-sm mt-1">Manage all registered users</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-48 bg-white border border-[#ECEAE6] rounded-xl px-4 py-2.5 flex items-center gap-2">
          <Search size={15} className="text-muted shrink-0" />
          <input type="text" placeholder="Search by name or college…" value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent text-sm outline-none w-full placeholder:text-muted/60" />
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'banned'].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-xs font-display font-semibold px-4 py-2 rounded-full capitalize transition-colors ${filter === f ? 'bg-navy text-white' : 'bg-white text-muted border border-[#ECEAE6]'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="flex flex-col gap-3">{[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-white rounded-2xl animate-pulse" />)}</div>}

      {!loading && (
        <div className="bg-white rounded-2xl border border-[#ECEAE6] shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#ECEAE6]">
                <th className="text-left px-6 py-3 text-xs font-display font-semibold text-muted">User</th>
                <th className="text-left px-6 py-3 text-xs font-display font-semibold text-muted">College</th>
                <th className="text-left px-6 py-3 text-xs font-display font-semibold text-muted">Rating</th>
                <th className="text-left px-6 py-3 text-xs font-display font-semibold text-muted">Joined</th>
                <th className="text-left px-6 py-3 text-xs font-display font-semibold text-muted">Status</th>
                <th className="text-right px-6 py-3 text-xs font-display font-semibold text-muted">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECEAE6]">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-[#F0F2F5] transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange/10 flex items-center justify-center font-display font-bold text-orange text-xs shrink-0">
                        {u.full_name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <span className="font-medium text-sm text-navy">{u.full_name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm text-muted">{u.college || '—'}</td>
                  <td className="px-6 py-3">
                    {u.rating_avg > 0 ? (
                      <div className="flex items-center gap-1">
                        <Star size={12} className="text-warning fill-warning" />
                        <span className="text-sm font-semibold text-navy">{u.rating_avg}</span>
                        <span className="text-xs text-muted">({u.rating_count})</span>
                      </div>
                    ) : <span className="text-sm text-muted">No ratings</span>}
                  </td>
                  <td className="px-6 py-3 text-xs text-muted">{new Date(u.created_at).toLocaleDateString('en-IN')}</td>
                  <td className="px-6 py-3">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${u.is_banned ? 'bg-danger-bg text-danger' : 'bg-success-bg text-success'}`}>
                      {u.is_banned ? 'Banned' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => toggleBan(u.id, u.is_banned)}
                      disabled={actionLoading === u.id}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50 ml-auto ${u.is_banned ? 'bg-success-bg text-success hover:bg-success/20' : 'bg-danger-bg text-danger hover:bg-danger/20'}`}
                    >
                      {u.is_banned ? <><ShieldCheck size={13} /> Unban</> : <><ShieldOff size={13} /> Ban</>}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-muted">No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
