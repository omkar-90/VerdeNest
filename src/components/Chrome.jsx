import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Leaf, Arrow, WhatsApp } from './icons'
import { BRAND } from '../data'

export const scrollToTarget = (target) => {
  const el = typeof target === 'string' ? document.querySelector(target) : target
  if (window.lenis) window.lenis.scrollTo(el ?? target, { duration: 1.6 })
  else el?.scrollIntoView({ behavior: 'smooth' })
}

/* ---------------- Loader ---------------- */
export function Loader({ onDone }) {
  const [count, setCount] = useState(0)
  const [done, setDone] = useState(false)
  useEffect(() => {
    const o = { v: 0 }
    const tween = gsap.to(o, {
      v: 100,
      duration: 2,
      ease: 'power2.inOut',
      onUpdate: () => setCount(Math.round(o.v)),
      onComplete: async () => {
        try {
          await document.fonts.ready
        } catch {
          /* ignore */
        }
        setDone(true)
        onDone?.()
      },
    })
    return () => tween.kill()
  }, [onDone])
  return (
    <div className={`loader ${done ? 'done' : ''}`} aria-hidden={done}>
      <div className="loader-inner">
        <Leaf className="loader-leaf" />
        <div className="loader-count">{String(count).padStart(3, '0')}</div>
        <div className="loader-bar">
          <span style={{ width: `${count}%` }} />
        </div>
        <div className="loader-label">Growing your greenhouse</div>
      </div>
    </div>
  )
}

/* ---------------- Navbar ---------------- */
const LINKS = [
  ['Systems', '#structure'],
  ['Types', '#types'],
  ['Configure', '#configure'],
  ['Projects', '#projects'],
  ['Process', '#process'],
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [open, setOpen] = useState(false)
  const last = useRef(0)
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 40)
      setHidden(y > last.current && y > 600)
      last.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const go = (e, href) => {
    e.preventDefault()
    setOpen(false)
    scrollToTarget(href)
  }
  return (
    <header className={`nav ${scrolled ? 'scrolled' : ''} ${hidden && !open ? 'hidden' : ''} ${open ? 'open' : ''}`}>
      <a href="#top" className="logo" onClick={(e) => go(e, '#top')} id="nav-logo">
        <Leaf />
        {BRAND.name}
      </a>
      <nav aria-label="Primary">
        <ul className="nav-links">
          {LINKS.map(([l, h]) => (
            <li key={h}>
              <a href={h} onClick={(e) => go(e, h)} id={`nav-${l.toLowerCase()}`}>
                {l}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <a href="#contact" className="btn btn-primary" onClick={(e) => go(e, '#contact')} id="nav-quote">
        Get a quote
        <span className="btn-icon">
          <Arrow />
        </span>
      </a>
      <button className="nav-burger" aria-label="Menu" onClick={() => setOpen((o) => !o)} id="nav-burger">
        <span style={{ transform: open ? 'translateY(3px) rotate(45deg)' : '' }} />
        <span style={{ transform: open ? 'translateY(-3px) rotate(-45deg)' : '' }} />
      </button>
    </header>
  )
}

/* ---------------- Cursor + magnetic buttons ---------------- */
export function Cursor() {
  const ref = useRef()
  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return
    const xTo = gsap.quickTo(ref.current, 'x', { duration: 0.35, ease: 'power3' })
    const yTo = gsap.quickTo(ref.current, 'y', { duration: 0.35, ease: 'power3' })
    const move = (e) => {
      xTo(e.clientX)
      yTo(e.clientY)
    }
    const over = (e) => {
      const hit = e.target.closest?.('a, button, .type-card, .project, input, select, textarea')
      ref.current?.classList.toggle('big', !!hit)
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseover', over)

    // magnetic effect on buttons
    const btns = [...document.querySelectorAll('.btn')]
    const handlers = btns.map((b) => {
      const m = (e) => {
        const r = b.getBoundingClientRect()
        gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * 0.25, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.4, ease: 'power3.out' })
      }
      const l = () => gsap.to(b, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' })
      b.addEventListener('mousemove', m)
      b.addEventListener('mouseleave', l)
      return [b, m, l]
    })
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseover', over)
      handlers.forEach(([b, m, l]) => {
        b.removeEventListener('mousemove', m)
        b.removeEventListener('mouseleave', l)
      })
    }
  }, [])
  return <div className="cursor" ref={ref} aria-hidden />
}

export function WhatsAppFab() {
  return (
    <a className="wa" href={`https://wa.me/${BRAND.whatsapp}?text=Hi%20VerdeNest%2C%20I%27d%20like%20a%20greenhouse%20quote`} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp" id="whatsapp-fab">
      <WhatsApp />
    </a>
  )
}
