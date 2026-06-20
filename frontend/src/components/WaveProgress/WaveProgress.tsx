import './WaveProgress.css'

interface WaveProgressProps {
  progress: number
  className?: string
}

export function WaveProgress({ progress, className = '' }: WaveProgressProps) {
  const clamped = Math.min(100, Math.max(0, progress))

  return (
    <div className={`wave-progress ${className}`.trim()} role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}>
      <svg viewBox="0 0 300 12" preserveAspectRatio="none" className="wave-progress__track">
        <defs>
          <clipPath id="wave-clip">
            <path d="M0,0 H300 V8 L295,10 L290,7 L285,10 L280,6 L275,10 L270,7 L265,10 L260,6 L255,10 L250,7 L245,10 L240,6 L235,10 L230,7 L225,10 L220,6 L215,10 L210,7 L205,10 L200,6 L195,10 L190,7 L185,10 L180,6 L175,10 L170,7 L165,10 L160,6 L155,10 L150,7 L145,10 L140,6 L135,10 L130,7 L125,10 L120,6 L115,10 L110,7 L105,10 L100,6 L95,10 L90,7 L85,10 L80,6 L75,10 L70,7 L65,10 L60,6 L55,10 L50,7 L45,10 L40,6 L35,10 L30,7 L25,10 L20,6 L15,10 L10,7 L5,10 L0,8 Z" />
          </clipPath>
        </defs>
        <rect x="0" y="0" width="300" height="12" fill="var(--color-border)" clipPath="url(#wave-clip)" />
        <rect
          x="0"
          y="0"
          width={(300 * clamped) / 100}
          height="12"
          fill="var(--color-accent)"
          clipPath="url(#wave-clip)"
          className="wave-progress__fill"
        />
      </svg>
    </div>
  )
}
