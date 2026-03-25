import { HeadContent, Scripts, createRootRoute, Link, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import { PackageSearch } from 'lucide-react'

import { Header } from '../components/layout/Header'
import { authApi } from '../api/auth'
import { useAuthStore } from '../store/auth.store'
import { queryClient } from '../router'
import { TOKEN_KEY } from '../api/client'
import '../lib/i18n'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Inventory' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  notFoundComponent: NotFound,
  shellComponent: RootDocument,
})

function NotFound() {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <PackageSearch className="w-16 h-16 text-muted-foreground/30 mb-4" />
      <h1 className="text-2xl font-bold mb-2">{t('notFound.title')}</h1>
      <p className="text-muted-foreground text-sm mb-6">
        {t('notFound.subtitle')}
      </p>
      <Link
        to="/"
        className="text-sm font-medium underline underline-offset-4 hover:text-primary"
      >
        {t('notFound.goHome')}
      </Link>
    </div>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const { setUser } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    // Handle OAuth callback: ?accessToken=xxx in URL
    const params = new URLSearchParams(window.location.search)
    const oauthToken = params.get('accessToken')
    if (oauthToken) {
      localStorage.setItem(TOKEN_KEY, oauthToken)
      // Remove token from URL without page reload
      const url = new URL(window.location.href)
      url.searchParams.delete('accessToken')
      window.history.replaceState({}, '', url.toString())
    }

    authApi
      .me()
      .then((user) => {
        setUser(user)
        if (oauthToken) navigate({ to: '/' })
      })
      .catch(() => setUser(null))
  }, [])

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <Header />
          {children}
        </QueryClientProvider>
        <TanStackDevtools
          config={{ position: 'bottom-right' }}
          plugins={[{ name: 'Tanstack Router', render: <TanStackRouterDevtoolsPanel /> }]}
        />
        <Scripts />
      </body>
    </html>
  )
}
