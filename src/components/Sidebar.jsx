import { LayoutDashboard, Flag, Users, BookOpen, MessageSquare, LogOut } from 'lucide-react'

const NAV = [
  { key: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { key: 'reports', icon: Flag, label: 'Reports' },
  { key: 'users', icon: Users, label: 'Users' },
  { key: 'books', icon: BookOpen, label: 'Books' },
  { key: 'feedback', icon: MessageSquare, label: 'Feedback' },
]

export default function Sidebar({ activePage, onNavigate, onLogout }) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-navy flex flex-col shadow-xl z-10">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <p className="font-display font-bold text-white text-lg">Senior <span className="text-orange">से</span> Le</p>
        <p className="text-white/40 text-xs mt-0.5">Admin Panel</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {NAV.map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => onNavigate(key)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-button text-sm font-display font-semibold transition-colors text-left ${
              activePage === key
                ? 'bg-orange text-white'
                : 'text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-button text-sm font-display font-semibold text-white/60 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  )
}
