import { useState, useEffect } from 'react'
import { Search, Trash2, ShieldCheck } from 'lucide-react'
import { supabase } from '../lib/supabase'

const CONDITIONS = { 5: 'Like New', 4: 'Good', 3: 'Fair', 2: 'Worn', 1: 'Heavily Used' }
const STATUS_COLORS = { available: 'bg-success-bg text-success', sold: 'bg-navy/10 text-navy', removed: 'bg-danger-bg text-danger', reserved: 'bg-warning-bg text-warning' }

export default function Books() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('available')
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => { fetchBooks() }, [filter])

  async function fetchBooks() {
    setLoading(true)
    let query = supabase.from('books').select('*, profiles:seller_id(full_name, college)').order('created_at', { ascending: false })
    if (filter !== 'all') query = query.eq('status', filter)
    const { data } = await query
    setBooks(data || [])
    setLoading(false)
  }

  async function removeBook(bookId) {
    if (!confirm('Remove this listing? The seller will no longer see it.')) return
    setActionLoading(bookId)
    await supabase.from('books').update({ status: 'removed' }).eq('id', bookId)
    setBooks((prev) => prev.map((b) => b.id === bookId ? { ...b, status: 'removed' } : b))
    setActionLoading(null)
  }

  const filtered = books.filter((b) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return b.title?.toLowerCase().includes(q) || b.profiles?.full_name?.toLowerCase().includes(q)
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-navy">Books</h1>
        <p className="text-muted text-sm mt-1">All book listings on the platform</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-48 bg-white border border-[#ECEAE6] rounded-xl px-4 py-2.5 flex items-center gap-2">
          <Search size={15} className="text-muted shrink-0" />
          <input type="text" placeholder="Search by title or seller…" value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent text-sm outline-none w-full placeholder:text-muted/60" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['available', 'sold', 'removed', 'all'].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-xs font-display font-semibold px-4 py-2 rounded-full capitalize transition-colors ${filter === f ? 'bg-navy text-white' : 'bg-white text-muted border border-[#ECEAE6]'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="flex flex-col gap-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />)}</div>}

      {!loading && (
        <div className="flex flex-col gap-3">
          {filtered.map((book) => (
            <div key={book.id} className="bg-white rounded-2xl border border-[#ECEAE6] shadow-sm p-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-orange/10 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                {book.images?.[0] ? <img src={book.images[0]} alt="" className="w-full h-full object-cover" /> : '📘'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-display font-semibold text-sm text-navy truncate">{book.title}</p>
                  {book.video_url && <span className="flex items-center gap-0.5 text-[9px] font-bold text-success bg-success-bg px-1.5 py-0.5 rounded"><ShieldCheck size={9} /> Verified</span>}
                </div>
                <p className="text-xs text-muted mt-0.5">by {book.profiles?.full_name} · {book.profiles?.college}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="font-display font-bold text-sm text-orange">₹{book.price}</span>
                  <span className="text-xs text-muted">{CONDITIONS[book.condition]}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[book.status]}`}>{book.status}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className="text-xs text-muted">{new Date(book.created_at).toLocaleDateString('en-IN')}</span>
                {book.status === 'available' && (
                  <button onClick={() => removeBook(book.id)} disabled={actionLoading === book.id}
                    className="flex items-center gap-1 text-xs font-semibold text-danger bg-danger-bg px-3 py-1.5 rounded-xl hover:opacity-80 transition-opacity disabled:opacity-50">
                    <Trash2 size={13} /> Remove
                  </button>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center border border-[#ECEAE6]">
              <p className="font-display font-semibold text-navy">No {filter} books found</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
