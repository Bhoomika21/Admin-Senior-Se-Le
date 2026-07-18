import { useState } from 'react'
import { Lock } from 'lucide-react'

export default function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const success = onLogin(password)
    if (!success) {
      setError('Incorrect password')
      setPassword('')
    }
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-navy flex items-center justify-center mb-4">
            <Lock size={24} className="text-orange" />
          </div>
          <h1 className="font-display font-bold text-navy text-xl">Admin Access</h1>
          <p className="text-muted text-sm mt-1">Senior Se Le Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-navy mb-1.5 font-display">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full bg-[#F0F2F5] border border-[#ECEAE6] rounded-xl px-4 py-3 text-sm text-navy outline-none focus:border-orange transition-colors"
              autoFocus
              required
            />
          </div>
          {error && <p className="text-xs text-danger font-medium">{error}</p>}
          <button
            type="submit"
            className="w-full bg-orange text-white font-display font-semibold py-3 rounded-xl hover:bg-orange-dark transition-colors"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  )
}
