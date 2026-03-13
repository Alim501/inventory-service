import { createFileRoute, redirect, isRedirect, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { authApi } from '@/api/auth'
import { TOKEN_KEY } from '@/api/client'
import { useAuthStore } from '@/store/auth.store'
import type { TelegramAuthData } from '@/api/auth'

export const Route = createFileRoute('/login')({
  beforeLoad: async () => {
    try {
      await authApi.me()
      throw redirect({ to: '/' })
    } catch (err) {
      if (isRedirect(err)) throw err
    }
  },
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const telegramRef = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSuccess = async (accessToken: string) => {
    localStorage.setItem(TOKEN_KEY, accessToken)
    const user = await authApi.me()
    setUser(user)
    window.location.href = '/'
  }

  const handleTelegramAuth = async (data: TelegramAuthData) => {
    try {
      const { accessToken } = await authApi.telegramCallback(data)
      await handleSuccess(accessToken)
    } catch {
      setError('Telegram auth failed')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        const { accessToken } = await authApi.login(email, password)
        await handleSuccess(accessToken)
      } else {
        const { accessToken } = await authApi.register(username, email, password)
        await handleSuccess(accessToken)
      }
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const botName = (import.meta as any).env?.VITE_TELEGRAM_BOT_NAME
    if (!botName || !telegramRef.current) return

    ;(window as any).onTelegramAuth = handleTelegramAuth

    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.setAttribute('data-telegram-login', botName)
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-radius', '8')
    script.setAttribute('data-request-access', 'write')
    script.setAttribute('data-userpic', 'false')
    script.setAttribute('data-onauth', 'onTelegramAuth(user)')
    script.async = true
    telegramRef.current.appendChild(script)

    return () => {
      delete (window as any).onTelegramAuth
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Inventory</h1>
          <p className="text-muted-foreground text-sm">
            {mode === 'login' ? 'Sign in to manage your inventories' : 'Create your account'}
          </p>
        </div>

        <div className="border border-border rounded-xl p-6 space-y-4">
          {/* OAuth buttons */}
          <a
            href={authApi.googleLoginUrl}
            className="flex items-center justify-center gap-3 w-full h-10 px-4 border border-border rounded-lg text-sm font-medium hover:bg-accent transition-colors"
          >
            <GoogleIcon />
            Continue with Google
          </a>

          <div ref={telegramRef} className="flex justify-center" />

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Email/password form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full h-10 px-3 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-10 px-3 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-10 px-3 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? '...' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
              className="text-primary hover:underline"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path
        fill="#4285F4"
        d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"
      />
      <path
        fill="#34A853"
        d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"
      />
      <path
        fill="#FBBC05"
        d="M4.5 10.48A4.8 4.8 0 0 1 4.5 7.5V5.43H1.83a8 8 0 0 0 0 7.12z"
      />
      <path
        fill="#EA4335"
        d="M8.98 3.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.43L4.5 7.5c.69-2.07 2.62-4.32 4.48-4.32z"
      />
    </svg>
  )
}
