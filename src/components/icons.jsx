export const Leaf = (p) => (
  <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M6 26C6 14 13 6 27 5c0 14-7 21-19 21" />
    <path d="M6 26 18 14" />
  </svg>
)
export const Arrow = (p) => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
)
export const ChevronL = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
    <path d="m15 18-6-6 6-6" />
  </svg>
)
export const ChevronR = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
    <path d="m9 18 6-6-6-6" />
  </svg>
)
export const Phone = (p) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
  </svg>
)
export const Mail = (p) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}>
    <rect x="2" y="4" width="20" height="16" rx="3" />
    <path d="m22 7-10 6L2 7" />
  </svg>
)
export const Pin = (p) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}>
    <path d="M12 22s8-6.5 8-13a8 8 0 1 0-16 0c0 6.5 8 13 8 13z" />
    <circle cx="12" cy="9" r="3" />
  </svg>
)
export const WhatsApp = (p) => (
  <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" {...p}>
    <path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 1 1 12 21.8zm8.4-18.2A11.8 11.8 0 0 0 1.7 17.8L0 24l6.3-1.7A11.8 11.8 0 0 0 24 12a11.7 11.7 0 0 0-3.6-8.4z" />
  </svg>
)

/* Stylised line-art greenhouse icons for the type cards */
export const TypeArt = ({ kind }) => {
  const stroke = 'rgba(182,240,156,.85)'
  const fill = 'rgba(182,240,156,.08)'
  if (kind === 'glass')
    return (
      <svg viewBox="0 0 200 120" fill="none" stroke={stroke} strokeWidth="1.4">
        <path d="M10 110V60L55 25l45 35 45-35 45 35v50Z" fill={fill} />
        {[32, 55, 78, 122, 145, 168].map((x) => {
          const local = (x - 10) % 90
          const top = local <= 45 ? 60 - local * (35 / 45) : 25 + (local - 45) * (35 / 45)
          return <path key={x} d={`M${x} 110V${top}`} opacity=".5" />
        })}
        <path d="M10 60h180M100 60v50" opacity=".6" />
      </svg>
    )
  if (kind === 'net')
    return (
      <svg viewBox="0 0 200 120" fill="none" stroke={stroke} strokeWidth="1.4">
        <path d="M10 110V55Q10 30 55 28h90q45 2 45 27v55Z" fill={fill} />
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i} d={`M${18 + i * 15} 110V40`} opacity=".25" />
        ))}
        {Array.from({ length: 5 }, (_, i) => (
          <path key={'h' + i} d={`M10 ${50 + i * 14}h180`} opacity=".25" />
        ))}
      </svg>
    )
  if (kind === 'hydro')
    return (
      <svg viewBox="0 0 200 120" fill="none" stroke={stroke} strokeWidth="1.4">
        <path d="M10 110V60Q10 15 100 12q90 3 90 48v50Z" fill={fill} />
        {[45, 75, 105].map((y) => (
          <g key={y}>
            <path d={`M35 ${y}h130`} strokeWidth="3" opacity=".7" />
            {[50, 75, 100, 125, 150].map((x) => (
              <circle key={x} cx={x} cy={y - 6} r="5" fill={stroke} opacity=".55" stroke="none" />
            ))}
          </g>
        ))}
      </svg>
    )
  return (
    <svg viewBox="0 0 200 120" fill="none" stroke={stroke} strokeWidth="1.4">
      <path d="M10 110V60Q10 15 100 12q90 3 90 48v50Z" fill={fill} />
      <path d="M40 110V45M70 110V24M100 110V12M130 110V24M160 110V45" opacity=".35" />
      {[45, 80, 120, 155].map((x) => (
        <path key={x} d={`M${x} 110c-6-14 0-22 0-30 0 8 6 16 0 30`} fill={stroke} opacity=".5" stroke="none" />
      ))}
    </svg>
  )
}
