interface PageLayoutProps {
  children: React.ReactNode
  className?: string
}

export function PageLayout({ children, className }: PageLayoutProps) {
  return (
    <main className={`max-w-7xl mx-auto px-4 py-8 ${className ?? ''}`}>
      {children}
    </main>
  )
}
