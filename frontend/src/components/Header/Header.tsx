import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import './Header.css'

interface HeaderProps {
  onThemeToggle: () => void
  isDark: boolean
}

export function Header({ onThemeToggle, isDark }: HeaderProps) {
  const { user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const actionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
  }

  const avatarLetter = user ? user.username.charAt(0).toUpperCase() : 'A'

  return (
    <header className="header">
      <div className="header__search">
        <SearchIcon />
        <input
          type="search"
          placeholder="Треки, артисты, альбомы..."
          aria-label="Поиск"
        />
      </div>

      <div className="header__actions" ref={actionsRef}>
        <button
          type="button"
          className="header__theme-btn"
          onClick={onThemeToggle}
          aria-label={isDark ? 'Светлая тема' : 'Тёмная тема'}
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </button>

        <button
          type="button"
          className="header__avatar"
          onClick={() => setIsMenuOpen((v) => !v)}
          aria-label="Профиль"
        >
          <span>{avatarLetter}</span>
        </button>

        {isMenuOpen && (
          <div className="header__menu">
            {user ? (
              <>
                <div className="header__menu-user">
                  <div className="header__menu-username">{user.username}</div>
                  <div className="header__menu-email">{user.email}</div>
                </div>
                <div className="header__menu-divider" />
                <button
                  type="button"
                  className="header__menu-item header__menu-item--logout"
                  onClick={handleLogout}
                >
                  <LogoutIcon />
                  Выйти
                </button>
              </>
            ) : (
              <div className="header__menu-item">Не авторизован</div>
            )}
          </div>
        )}
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

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}