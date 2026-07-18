import { useState } from 'react'
import AdminLogin from './pages/AdminLogin'
import Dashboard from './pages/Dashboard'
import Reports from './pages/Reports'
import Users from './pages/Users'
import Books from './pages/Books'
import Feedback from './pages/Feedback'
import Sidebar from './components/Sidebar'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123'

export default function App() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('ssl_admin') === 'true')
  const [page, setPage] = useState('dashboard')

  if (!authed) {
    return <AdminLogin onLogin={(pwd) => {
      if (pwd === ADMIN_PASSWORD) {
        sessionStorage.setItem('ssl_admin', 'true')
        setAuthed(true)
      } else {
        return false
      }
      return true
    }} />
  }

  const pages = { dashboard: <Dashboard />, reports: <Reports />, users: <Users />, books: <Books />, feedback: <Feedback /> }

  return (
    <div className="flex min-h-screen bg-[#F0F2F5]">
      <Sidebar
        activePage={page}
        onNavigate={setPage}
        onLogout={() => { sessionStorage.removeItem('ssl_admin'); setAuthed(false) }}
      />
      <main className="flex-1 ml-64 p-8 overflow-auto">
        {pages[page] || <Dashboard />}
      </main>
    </div>
  )
}
