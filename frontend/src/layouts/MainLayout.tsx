import type { ReactNode } from 'react'
import { IconRail } from '../components/IconRail/IconRail'
import { Header } from '../components/Header/Header'
import './MainLayout.css'

interface MainLayoutProps {
  children: ReactNode
  isDark: boolean
  onThemeToggle: () => void
}

export function MainLayout({ children, isDark, onThemeToggle }: MainLayoutProps) {
  return (
    <div className="layout">
      <IconRail />
      <div className="layout__main">
        <Header isDark={isDark} onThemeToggle={onThemeToggle} />
        <main className="layout__content">{children}</main>
      </div>
    </div>
  )
}
