import './WaveDivider.css'

export function WaveDivider() {
  return (
    <div className="wave-divider" aria-hidden="true">
      <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="wave-divider__svg">
        <path
          d="M0,30 C60,50 120,10 180,30 C240,50 300,10 360,30 C420,50 480,10 540,30 C600,50 660,10 720,30 C780,50 840,10 900,30 C960,50 1020,10 1080,30 C1140,50 1170,20 1200,30 L1200,60 L0,60 Z"
          fill="var(--color-border)"
        />
      </svg>
    </div>
  )
}
