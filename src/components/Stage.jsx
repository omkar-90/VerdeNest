import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import StageScene from '../three/StageScene'
import useInView from '../hooks/useInView'
import { CHAPTERS } from '../data'
import { Arrow } from './icons'
import { scrollToTarget } from './Chrome'

/**
 * Hero + pinned scroll story.
 * A sticky WebGL canvas sits behind; HTML chapters scroll over it while
 * the scroll progress (0..1 across 4 viewport heights) drives the camera.
 */
export default function Stage({ ready }) {
  const wrap = useRef()
  const progress = useRef(0)
  const [active, setActive] = useState(-1)
  const inView = useInView(wrap, '0px')

  useGSAP(
    () => {
      gsap.timeline({
        scrollTrigger: {
          trigger: wrap.current,
          start: 'top top',
          end: () => `+=${window.innerHeight * 4}`,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            progress.current = self.progress
            const a = self.progress < 0.13 ? -1 : Math.min(3, Math.round(self.progress * 4) - 1)
            setActive((prev) => (prev === a ? prev : a))
          },
        },
      })

      gsap.utils.toArray('.chapter').forEach((ch) => {
        const card = ch.querySelector('.chapter-card')
        gsap
          .timeline({ scrollTrigger: { trigger: ch, start: 'top bottom', end: 'bottom top', scrub: true } })
          .fromTo(card, { autoAlpha: 0, y: 120 }, { autoAlpha: 1, y: 0, ease: 'power2.out', duration: 0.38 })
          .to(card, { autoAlpha: 1, duration: 0.24 })
          .to(card, { autoAlpha: 0, y: -120, ease: 'power2.in', duration: 0.38 })
      })

      gsap.to('.hero-content, .hero-meta', {
        autoAlpha: 0,
        y: -80,
        ease: 'none',
        scrollTrigger: { trigger: wrap.current, start: 'top top', end: () => `+=${window.innerHeight * 0.6}`, scrub: true },
      })
    },
    { scope: wrap }
  )

  useGSAP(
    () => {
      if (!ready) return
      gsap
        .timeline()
        .from('.hero-title .line > span', { yPercent: 115, duration: 1.4, ease: 'expo.out', stagger: 0.12 })
        .from('.hero-fade', { autoAlpha: 0, y: 26, duration: 1.1, stagger: 0.08, ease: 'power3.out' }, '-=1')
    },
    { dependencies: [ready], scope: wrap }
  )

  const jump = (i) => {
    const top = wrap.current.getBoundingClientRect().top + window.scrollY
    scrollToTarget(top + window.innerHeight * (i + 1))
  }

  return (
    <div className="stage-wrap" ref={wrap} id="top">
      <div className="stage">
        <StageScene progressRef={progress} active={inView} />
      </div>

      <div className="stage-overlay">
        <section className="hero container" aria-label="Introduction">
          <div className="hero-content">
            <span className="eyebrow hero-fade">Greenhouse construction · Since 2009</span>
            <h1 className="hero-title h-display">
              <span className="line">
                <span>Grow beyond</span>
              </span>
              <span className="line">
                <span>
                  <em className="serif text-grad">every</em> season.
                </span>
              </span>
            </h1>
            <p className="lead hero-sub hero-fade">
              We design, build and automate climate-controlled polyhouses, glasshouses and hydroponic farms. Turnkey, from site survey to first harvest.
            </p>
            <div className="hero-ctas hero-fade">
              <a href="#configure" className="btn btn-primary" id="hero-configure" onClick={(e) => (e.preventDefault(), scrollToTarget('#configure'))}>
                Design your greenhouse
                <span className="btn-icon">
                  <Arrow />
                </span>
              </a>
              <a href="#projects" className="btn btn-ghost" id="hero-projects" onClick={(e) => (e.preventDefault(), scrollToTarget('#projects'))}>
                View projects
              </a>
            </div>
          </div>
          <div className="hero-meta">
            <div className="hero-badges hero-fade">
              <div className="hero-badge">
                <strong>1,200+</strong>
                <span>Structures built</span>
              </div>
              <div className="hero-badge">
                <strong>50%</strong>
                <span>Subsidy support</span>
              </div>
              <div className="hero-badge">
                <strong>5 yr</strong>
                <span>Warranty</span>
              </div>
            </div>
            <div className="scroll-cue hero-fade">
              <i /> Scroll to build
            </div>
          </div>
        </section>

        {CHAPTERS.map((c, i) => (
          <section key={c.id} id={c.id} className={`chapter container ${i % 2 ? 'right' : ''}`}>
            <article className="chapter-card glass">
              <div className="chapter-num">
                <span>{c.id.toUpperCase()}</span>
                <b>0{i + 1}</b>
              </div>
              <h2>{c.title}</h2>
              <p>{c.text}</p>
              <ul className="chapter-specs">
                {c.specs.map(([v, l]) => (
                  <li key={l}>
                    <strong>{v}</strong>
                    <span>{l}</span>
                  </li>
                ))}
              </ul>
            </article>
          </section>
        ))}
      </div>

      <nav className={`story-rail ${active < 0 || !inView ? 'off' : ''}`} aria-label="Story chapters">
        {CHAPTERS.map((c, i) => (
          <button key={c.id} className={active === i ? 'active' : ''} onClick={() => jump(i)} id={`rail-${c.id}`}>
            <span>{c.id}</span>
            <i />
          </button>
        ))}
      </nav>
    </div>
  )
}
