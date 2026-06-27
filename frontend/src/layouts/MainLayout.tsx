import type { ReactNode } from 'react'
import { IconRail } from '../components/IconRail/IconRail'
import { Header } from '../components/Header/Header'
import './MainLayout.css'

interface MainLayoutProps {
  children: ReactNode
  activePage: 'home' | 'liked'
  isDark: boolean
  onNavigate: (page: 'home' | 'liked') => void
  onThemeToggle: () => void
}

export function MainLayout({
  children,
  activePage,
  isDark,
  onNavigate,
  onThemeToggle,
}: MainLayoutProps) {
  return (
    <div className="layout">
      <IconRail activePage={activePage} onNavigate={onNavigate} />
      <div className="layout__main">
        <Header isDark={isDark} onThemeToggle={onThemeToggle} />
        <main className="layout__content">{children}</main>
      </div>
    </div>
  )
}
