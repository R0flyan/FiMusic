// import { Logo } from '../Logo/Logo'
import './Header.css'

interface HeaderProps {
  onThemeToggle: () => void
  isDark: boolean
}

export function Header({ onThemeToggle, isDark }: HeaderProps) {
  return (
    <header className="header">
      {/* <Logo size={28} showText /> */}

      <div className="header__search">
        <SearchIcon />
        <input
          type="search"
          placeholder="Треки, артисты, альбомы..."
          aria-label="Поиск"
        />
      </div>

      <div className="header__actions">
        <button
          type="button"
          className="header__theme-btn"
          onClick={onThemeToggle}
          aria-label={isDark ? 'Светлая тема' : 'Тёмная тема'}
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </button>
        <button type="button" className="header__avatar" aria-label="Профиль">
          <span>A</span>
        </button>
      </div>
    </header>
  )
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 16l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21 14.5A8.5 8.5 0 1112.5 3a6.5 6.5 0 108.5 11.5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
