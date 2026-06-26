import { Logo } from '../Logo/Logo'
import './IconRail.css'

const navItems = [
  { id: 'home', label: 'Главная', icon: HomeIcon },
  { id: 'search', label: 'Поиск', icon: SearchIcon },
  { id: 'library', label: 'Библиотека', icon: LibraryIcon },
  { id: 'liked', label: 'Избранное', icon: HeartIcon },
]

export function IconRail() {
  return (
    <nav className="icon-rail" aria-label="Основная навигация">
      <div className="icon-rail__logo">
        <Logo size={32} showText />
      </div>
      <ul className="icon-rail__list">
        {navItems.map(({ id, label, icon: Icon }) => (
          <li key={id}>
            <button
              type="button"
              className={`icon-rail__item${id === 'home' ? ' icon-rail__item--active' : ''}`}
              aria-label={label}
            >
              <Icon />
              <span className="icon-rail__label">{label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function HomeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 16l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function LibraryIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="6" height="16" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="12" y="8" width="6" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 20s-7-4.5-9-8.5C1.5 8.5 3.5 5 7 5c2 0 3.5 1.5 5 3 1.5-1.5 3-3 5-3 3.5 0 5.5 3.5 4 6.5-2 4-9 8.5-9 8.5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}
