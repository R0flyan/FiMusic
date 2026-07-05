import './Logo.css'

interface LogoProps {
  size?: number
  showText?: boolean
}

export function Logo({ size = 32, showText = false }: LogoProps) {
  return (
    <div className="logo" style={{ gap: showText ? 10 : 0 }}>
      <img
        src="/Fimusic_logo.jpg"
        alt="FiMusic"
        width={size}
        height={size}
        className="logo__mark"
        aria-hidden={showText ? undefined : true}
      />
      {showText && (
        <span className="logo__text">
          <span className="logo__text-accent">Fi</span>Music
        </span>
      )}
    </div>
  )
}
