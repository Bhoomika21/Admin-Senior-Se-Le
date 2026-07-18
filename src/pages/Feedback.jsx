import { useState, useEffect } from 'react'
import { MessageSquare, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Feedback() {
  const [feedback, setFeedback] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => { fetchFeedback() }, [])

  async function fetchFeedback() {
    setLoading(true)
    const { data } = await supabase.from('feedback').select('*').order('created_at', { ascending: false })
    setFeedback(data || [])
    setLoading(false)
  }

  async function deleteFeedback(id) {
    setDeleting(id)
    await supabase.from('feedback').delete().eq('id', id)
    setFeedback((prev) => prev.filter((f) => f.id !== id))
    setDeleting(null)
  }

  function getCategory(message) {
    const match = message.match(/^\[(.+?)\]/)
    return match ? match[1] : null
  }

  function getContent(message) {
    return message.replace(/^\[.+?\]\s*/, '')
  }

  const CATEGORY_COLORS = {
    'Bug / Something broken': 'bg-danger-bg text-danger',
    'Feature request': 'bg-[#EEF2FF] text-[#4F46E5]',
    'Bad experience': 'bg-warning-bg text-warning',
    'General feedback': 'bg-success-bg text-success',
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-navy">Feedback</h1>
          <p className="text-muted text-sm mt-1">{feedback.length} submission{feedback.length !== 1 ? 's' : ''} from users</p>
        </div>
      </div>

      {loading && <div className="flex flex-col gap-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />)}</div>}

      {!loading && feedback.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#ECEAE6]">
          <MessageSquare size={32} className="text-muted/40 mx-auto mb-3" />
          <p className="font-display font-semibold text-navy">No feedback yet</p>
          <p className="text-sm text-muted mt-1">Feedback submitted by users will appear here</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {feedback.map((item) => {
          const category = getCategory(item.message)
          const content = getContent(item.message)
          return (
            <div key={item.id} className="bg-white rounded-2xl border border-[#ECEAE6] shadow-sm p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {category && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[category] || 'bg-navy/10 text-navy'}`}>
                        {category}
                      </span>
                    )}
                    <span className="text-xs text-muted">{new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <p className="text-sm text-navy leading-relaxed">{content}</p>
                  {item.user_email && (
                    <p className="text-xs text-muted mt-2">
                      From: <span className="font-medium text-navy">{item.user_email}</span>
                    </p>
                  )}
                </div>
                <button
                  onClick={() => deleteFeedback(item.id)}
                  disabled={deleting === item.id}
                  className="shrink-0 text-muted hover:text-danger transition-colors disabled:opacity-50"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
