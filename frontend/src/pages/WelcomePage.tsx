import { Footer } from '../components/Footer/Footer'
import { Logo } from '../components/Logo/Logo'
import './WelcomePage.css'

interface WelcomePageProps {
  onLogin: () => void
  onRegister: () => void
}

const features = [
  {
    title: 'Личная медиатека',
    text: 'Загружайте треки, слушайте музыку и собирайте собственную библиотеку без лишнего интерфейсного шума.',
  },
  {
    title: 'Плейлисты и избранное',
    text: 'Создавайте подборки, добавляйте треки в избранное и быстро возвращайтесь к нужной музыке.',
  },
  {
    title: 'Музыкальный плеер',
    text: 'Управляйте воспроизведением, прогрессом, повтором, случайным режимом и очередью треков.',
  },
  {
    title: 'Адаптивный интерфейс',
    text: 'Сервис рассчитан на использование с компьютера и мобильных устройств.',
  },
]

export function WelcomePage({ onLogin, onRegister }: WelcomePageProps) {
  return (
    <>
      <main className="welcome-page">
        <header className="welcome-page__header">
          <Logo size={38} showText />
          <div className="welcome-page__actions">
            <button type="button" className="welcome-page__link" onClick={onLogin}>
              Войти
            </button>
            <button type="button" className="welcome-page__button" onClick={onRegister}>
              Создать аккаунт
            </button>
          </div>
        </header>

        <section className="welcome-page__hero">
          <div className="welcome-page__hero-content">
            <p className="welcome-page__eyebrow">Стриминг музыки в одном месте</p>
            <h1>FiMusic</h1>
            <p className="welcome-page__lead">
              Веб-приложение для прослушивания музыки, управления личной медиатекой,
              избранными треками и плейлистами.
            </p>
            <div className="welcome-page__hero-actions">
              <button type="button" className="welcome-page__primary" onClick={onRegister}>
                Начать пользоваться
              </button>
              <button type="button" className="welcome-page__secondary" onClick={onLogin}>
                У меня уже есть аккаунт
              </button>
            </div>
          </div>

          <div className="welcome-page__preview" aria-label="Возможности FiMusic">
            <div className="welcome-page__player">
              <div className="welcome-page__cover" />
              <div>
                <strong>Твой музыкальный вайб</strong>
                <span>FiMusic Микс</span>
              </div>
              <div className="welcome-page__play">▶</div>
            </div>
            <div className="welcome-page__wave">
              {Array.from({ length: 34 }).map((_, index) => (
                <span key={index} style={{ height: `${18 + ((index * 13) % 42)}px` }} />
              ))}
            </div>
          </div>
        </section>

        <section className="welcome-page__features" aria-label="Основные возможности">
          {features.map((feature) => (
            <article key={feature.title} className="welcome-page__feature">
              <h2>{feature.title}</h2>
              <p>{feature.text}</p>
            </article>
          ))}
        </section>
      </main>
      <Footer />
    </>
  )
}
