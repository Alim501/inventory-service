import { Link } from '@tanstack/react-router'
import { HeadphonesIcon, LogOut, Moon, Shield, Sun, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth.store'
import { useThemeStore } from '@/store/theme.store'
import { useLangStore } from '@/store/lang.store'
import { authApi } from '@/api/auth'
import { SupportTicketModal } from '@/components/support/SupportTicketModal'

export function Header() {
  const { t } = useTranslation()
  const { user, logout } = useAuthStore()
  const { theme, toggle } = useThemeStore()
  const { lang, toggle: toggleLang } = useLangStore()
  const [mounted, setMounted] = useState(false)
  const [showSupport, setShowSupport] = useState(false)
  useEffect(() => setMounted(true), [])

  const handleLogout = async () => {
    await authApi.logout()
    logout()
    window.location.href = '/login'
  }

  return (
    <>
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="font-semibold text-lg">
            {t('nav.brand')}
          </Link>

          {user && (
            <nav className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link
                to="/inventories"
                className="hover:text-foreground transition-colors"
              >
                {t('nav.myInventories')}
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Language toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLang}
              className="w-8 h-8 p-0 text-xs font-semibold"
              title={
                lang === 'en' ? 'Переключить на русский' : 'Switch to English'
              }
            >
              {lang === 'en' ? 'RU' : 'EN'}
            </Button>
          )}

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggle}
            className="w-8 h-8 p-0"
          >
            {mounted &&
              (theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              ))}
          </Button>

          {user && (
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0"
              title={t('support.title')}
              onClick={() => setShowSupport(true)}
            >
              <HeadphonesIcon className="w-4 h-4" />
            </Button>
          )}

          {user ? (
            <>
              {user.isAdmin && (
                <Link to="/admin">
                  <Button variant="ghost" size="sm">
                    <Shield className="w-4 h-4 mr-1" />
                    {t('nav.admin')}
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
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-8 h-8 p-0"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button size="sm">{t('nav.signIn')}</Button>
            </Link>
          )}
        </div>
      </div>
    </header>

    {showSupport && <SupportTicketModal onClose={() => setShowSupport(false)} />}
  </>
  )
}
