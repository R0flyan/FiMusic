import { Logo } from '../Logo/Logo'
import './Footer.css'

const PRIVACY_URL = 'https://ifbest.org/politika-konfidentsialnosti'
const GITHUB_URL = 'https://github.com/R0flyan/FiMusic'

export function Footer() {
  return (
    <footer className="app-footer">
      <div className="app-footer__brand">
        <Logo size={34} showText />
      </div>

      <p className="app-footer__copyright">© 2026 FiMusic. Учебный проект.</p>

      <nav className="app-footer__links" aria-label="Ссылки футера">
        <a href={PRIVACY_URL} target="_blank" rel="noreferrer">
          Политика конфиденциальности
        </a>
        <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="app-footer__github">
          <GitHubIcon />
          GitHub
        </a>
      </nav>
    </footer>
  )
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 19c-4 1.2-4-2-5.6-2.4M15 22v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.7-1.4 5.7-6.2a4.8 4.8 0 0 0-1.3-3.4 4.5 4.5 0 0 0-.1-3.4s-1.1-.3-3.6 1.3a12.3 12.3 0 0 0-6.4 0C6.3 3.2 5.2 3.5 5.2 3.5a4.5 4.5 0 0 0-.1 3.4 4.8 4.8 0 0 0-1.3 3.4c0 4.8 2.9 5.9 5.7 6.2-.4.4-.6.8-.6 1.6V22"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
