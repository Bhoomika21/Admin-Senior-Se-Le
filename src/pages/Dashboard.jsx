import { useState, useEffect } from 'react'
import { Users, BookOpen, Flag, MessageSquare, TrendingUp, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#ECEAE6]">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-muted font-display">{label}</p>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={18} className="text-white" />
        </div>
      </div>
      <p className="font-display font-bold text-3xl text-navy">{value ?? '—'}</p>
      {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState({})
  const [recentBooks, setRecentBooks] = useState([])
  const [recentUsers, setRecentUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    const [
      { count: totalUsers },
      { count: totalBooks },
      { count: activeBooks },
      { count: totalReports },
      { count: pendingReports },
      { count: totalFeedback },
      { count: bannedUsers },
      { data: recentBooksData },
      { data: recentUsersData },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('books').select('*', { count: 'exact', head: true }),
      supabase.from('books').select('*', { count: 'exact', head: true }).eq('status', 'available'),
      supabase.from('reports').select('*', { count: 'exact', head: true }),
      supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('feedback').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_banned', true),
      supabase.from('books').select('*, profiles:seller_id(full_name)').eq('status', 'available').order('created_at', { ascending: false }).limit(5),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(5),
    ])

    setStats({ totalUsers, totalBooks, activeBooks, totalReports, pendingReports, totalFeedback, bannedUsers })
    setRecentBooks(recentBooksData || [])
    setRecentUsers(recentUsersData || [])
    setLoading(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex gap-1.5">
        {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-orange animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
      </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display font-bold text-2xl text-navy">Dashboard</h1>
        <p className="text-muted text-sm mt-1">Welcome back. Here's what's happening on Senior Se Le.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="bg-navy" sub={`${stats.bannedUsers} banned`} />
        <StatCard icon={BookOpen} label="Active Books" value={stats.activeBooks} color="bg-orange" sub={`${stats.totalBooks} total ever`} />
        <StatCard icon={Flag} label="Pending Reports" value={stats.pendingReports} color={stats.pendingReports > 0 ? 'bg-danger' : 'bg-success'} sub={`${stats.totalReports} total reports`} />
        <StatCard icon={MessageSquare} label="Feedback" value={stats.totalFeedback} color="bg-[#8A8AA3]" sub="All submissions" />
      </div>

      {/* Alert if pending reports */}
      {stats.pendingReports > 0 && (
        <div className="bg-danger-bg border border-danger/20 rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle size={18} className="text-danger shrink-0" />
          <p className="text-sm text-navy font-medium">
            <span className="font-bold">{stats.pendingReports} report{stats.pendingReports > 1 ? 's' : ''}</span> waiting for your review. Go to Reports to action them.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Books */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#ECEAE6] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#ECEAE6]">
            <h2 className="font-display font-bold text-navy text-base">Recent Listings</h2>
          </div>
          <div className="divide-y divide-[#ECEAE6]">
            {recentBooks.map((book) => (
              <div key={book.id} className="px-6 py-3 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="font-medium text-sm text-navy truncate">{book.title}</p>
                  <p className="text-xs text-muted">{book.profiles?.full_name} · ₹{book.price}</p>
                </div>
                <span className="text-xs font-semibold text-success bg-success-bg px-2 py-1 rounded-full shrink-0 ml-3">Active</span>
              </div>
            ))}
            {recentBooks.length === 0 && <p className="px-6 py-4 text-sm text-muted">No listings yet</p>}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#ECEAE6] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#ECEAE6]">
            <h2 className="font-display font-bold text-navy text-base">Recent Signups</h2>
          </div>
          <div className="divide-y divide-[#ECEAE6]">
            {recentUsers.map((u) => (
              <div key={u.id} className="px-6 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange/10 flex items-center justify-center font-display font-bold text-orange text-xs shrink-0">
                  {u.full_name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm text-navy truncate">{u.full_name}</p>
                  <p className="text-xs text-muted truncate">{u.college}</p>
                </div>
                {u.is_banned && <span className="text-xs font-semibold text-danger bg-danger-bg px-2 py-1 rounded-full shrink-0">Banned</span>}
              </div>
            ))}
            {recentUsers.length === 0 && <p className="px-6 py-4 text-sm text-muted">No users yet</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
