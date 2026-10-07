import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { TYPES, PROJECTS, PROCESS, STATS, TESTIMONIALS } from '../data'
import { Leaf, Arrow, TypeArt, ChevronL, ChevronR } from './icons'

/* ---------------- Marquee ---------------- */
const WORDS = ['Polyhouse', 'Glasshouse', 'Hydroponics', 'Net House', 'Fan & Pad', 'Drip Fertigation', 'IoT Climate']
export function Marquee() {
  const row = [...WORDS, ...WORDS]
  return (
    <div className="marquee" aria-hidden>
      <div className="marquee-track">
        {row.map((w, i) => (
          <span className="marquee-item" key={i}>
            {w}
            <Leaf />
          </span>
        ))}
      </div>
    </div>
  )
}

/* ---------------- Types ---------------- */
function TiltCard({ children, onClick, id }) {
  const ref = useRef()
  const move = (e) => {
    const r = ref.current.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    ref.current.style.setProperty('--mx', `${x * 100}%`)
    ref.current.style.setProperty('--my', `${y * 100}%`)
    ref.current.style.transform = `rotateY(${(x - 0.5) * 14}deg) rotateX(${(0.5 - y) * 14}deg) translateZ(0)`
  }
  const leave = () => (ref.current.style.transform = '')
  return (
    <article ref={ref} className="type-card glass reveal" onMouseMove={move} onMouseLeave={leave} onClick={onClick} id={id} tabIndex={0}>
      {children}
    </article>
  )
}

export function Types({ onPick }) {
  return (
    <section className="section" id="types">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow reveal">Structures</span>
            <h2 className="h-section reveal">
              Four ways to <span className="serif text-grad">grow</span>
            </h2>
          </div>
          <p className="lead reveal">Every structure is designed around your crop, climate and budget. Pick one to preview it in 3D.</p>
        </div>
        <div className="types-grid">
          {TYPES.map((t) => (
            <TiltCard key={t.key} onClick={() => onPick(t.key)} id={`type-${t.key}`}>
              <span className="tag">{t.tag}</span>
              <div className="type-art">
                <TypeArt kind={t.key} />
              </div>
              <div>
                <h3>{t.name}</h3>
                <p>{t.desc}</p>
                <div className="price">
                  <span>From</span>
                  <b>₹{t.rate.toLocaleString('en-IN')}/m²</b>
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- Projects ---------------- */
export function Projects() {
  const ref = useRef()
  useGSAP(
    () => {
      gsap.utils.toArray('.project img').forEach((img) => {
        gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: img.parentElement, scrub: true } })
      })
    },
    { scope: ref }
  )
  return (
    <section className="section" id="projects" ref={ref}>
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow reveal">Selected work</span>
            <h2 className="h-section reveal">
              Built in the <span className="serif text-grad">field</span>
            </h2>
          </div>
          <p className="lead reveal">From 1,000 m² family farms to 10-acre agri-business clusters across India.</p>
        </div>
        <div className="projects-grid">
          {PROJECTS.map((p, i) => (
            <a href="#contact" className="project reveal" key={p.title} id={`project-${i}`}>
              <img src={p.img} alt={`${p.title}, ${p.meta}`} loading="lazy" />
              <div className="project-chips">
                {p.chips.map((c) => (
                  <span key={c}>{c}</span>
                ))}
              </div>
              <div className="project-info">
                <div>
                  <h3>{p.title}</h3>
                  <p>{p.meta}</p>
                </div>
                <span className="project-arrow">
                  <Arrow width="18" height="18" />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- Process ---------------- */
export function Process() {
  const ref = useRef()
  useGSAP(
    () => {
      gsap.to('.process-line span', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.process-list', start: 'top 80%', end: 'bottom 50%', scrub: true } })
      gsap.from('.process-step', { autoAlpha: 0, y: 50, stagger: 0.15, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.process-list', start: 'top 80%' } })
    },
    { scope: ref }
  )
  return (
    <section className="section" id="process" ref={ref}>
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow reveal">How we work</span>
            <h2 className="h-section reveal">
              From soil test to <span className="serif text-grad">first harvest</span>
            </h2>
          </div>
          <p className="lead reveal">One team handles design, subsidy paperwork, construction and agronomy support.</p>
        </div>
        <ol className="process-list">
          <div className="process-line">
            <span />
          </div>
          {PROCESS.map((s, i) => (
            <li className="process-step" key={s.title}>
              <div className="process-dot">0{i + 1}</div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
              <small>{s.time}</small>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ---------------- Stats + testimonials ---------------- */
export function Proof() {
  const ref = useRef()
  const [q, setQ] = useState(0)
  useGSAP(
    () => {
      gsap.utils.toArray('.stat strong b').forEach((el) => {
        const to = Number(el.dataset.to)
        const o = { v: 0 }
        gsap.to(o, {
          v: to,
          duration: 2.2,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%' },
          onUpdate: () => (el.textContent = Math.round(o.v).toLocaleString('en-IN')),
        })
      })
    },
    { scope: ref }
  )
  useEffect(() => {
    const id = setInterval(() => setQ((v) => (v + 1) % TESTIMONIALS.length), 6500)
    return () => clearInterval(id)
  }, [q])
  const t = TESTIMONIALS[q]
  return (
    <section className="section" ref={ref} aria-label="Results and testimonials">
      <div className="container">
        <div className="stats reveal">
          {STATS.map((s) => (
            <div className="stat" key={s.label}>
              <strong>
                <b data-to={s.value}>0</b>
                <em>{s.suffix}</em>
              </strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
        <div className="testimonials">
          <div>
            <span className="eyebrow reveal">Growers say</span>
            <h2 className="h-section reveal">
              Trusted by <span className="serif text-grad">1,000+</span> farmers
            </h2>
            <p className="lead reveal">Real yields, real farms. Ask us for a site visit to a working VerdeNest greenhouse near you.</p>
          </div>
          <div className="quote-card glass reveal">
            <div key={q} className="quote-fade">
              <blockquote>{t.quote}</blockquote>
            </div>
            <div className="quote-author">
              <div className="who">
                <div className="avatar">{t.name[0]}</div>
                <div>
                  <b>{t.name}</b>
                  <small>{t.role}</small>
                </div>
              </div>
              <div className="quote-nav">
                <button aria-label="Previous testimonial" id="quote-prev" onClick={() => setQ((v) => (v - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}>
                  <ChevronL />
                </button>
                <button aria-label="Next testimonial" id="quote-next" onClick={() => setQ((v) => (v + 1) % TESTIMONIALS.length)}>
                  <ChevronR />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
