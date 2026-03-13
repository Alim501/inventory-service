import { Link } from '@tanstack/react-router'
import { LogOut, User, Shield, Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth.store'
import { useThemeStore } from '@/store/theme.store'
import { authApi } from '@/api/auth'
import { useEffect, useState } from 'react'

export function Header() {
  const { user, logout } = useAuthStore()
  const { theme, toggle } = useThemeStore()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const handleLogout = async () => {
    await authApi.logout()
    logout()
    window.location.href = '/login'
  }

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="font-semibold text-lg">
            Inventory
          </Link>

          {user && (
            <nav className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link
                to="/inventories"
                className="hover:text-foreground transition-colors"
              >
                My Inventories
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Theme toggle */}
          <Button variant="ghost" size="sm" onClick={toggle} className="w-8 h-8 p-0">
            {mounted && (theme === 'dark' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            ))}
          </Button>

          {user ? (
            <>
              {user.isAdmin && (
                <Link to="/admin">
                  <Button variant="ghost" size="sm">
                    <Shield className="w-4 h-4 mr-1" />
                    Admin
                  </Button>
                </Link>
              )}
              <Link to="/profile">
                <Button variant="ghost" size="sm">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.username}
                      className="w-6 h-6 rounded-full mr-1"
                    />
                  ) : (
                    <User className="w-4 h-4 mr-1" />
                  )}
                  {user.username}
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="w-8 h-8 p-0">
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button size="sm">Sign in</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
