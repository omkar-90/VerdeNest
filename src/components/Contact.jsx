import { useEffect, useState } from 'react'
import { BRAND, TYPES } from '../data'
import { Arrow, Leaf, Mail, Phone, Pin, WhatsApp } from './icons'
import { scrollToTarget } from './Chrome'

export function Contact({ prefill }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', type: 'poly', message: '' })
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (prefill) setForm((f) => ({ ...f, type: prefill.type, message: prefill.message }))
  }, [prefill])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const submit = (e) => {
    e.preventDefault()
    setSent(true) // dummy: wire to Formspree / EmailJS / backend later
  }

  return (
    <section className="section contact" id="contact">
      <div className="container contact-grid">
        <div>
          <span className="eyebrow reveal">Let’s build</span>
          <h2 className="h-section reveal">
            Start your <span className="serif text-grad">greenhouse</span> today
          </h2>
          <p className="lead reveal">Book a free site survey. We’ll get back to you within 24 hours with a design and estimate.</p>
          <div className="contact-info">
            <a className="contact-item glass reveal" href={`tel:${BRAND.phone.replace(/\s/g, '')}`} id="contact-phone">
              <span className="ico">
                <Phone />
              </span>
              <span>
                <small>Call us</small>
                {BRAND.phone}
              </span>
            </a>
            <a className="contact-item glass reveal" href={`https://wa.me/${BRAND.whatsapp}`} target="_blank" rel="noreferrer" id="contact-whatsapp">
              <span className="ico">
                <WhatsApp width="20" height="20" />
              </span>
              <span>
                <small>WhatsApp</small>
                Chat with an expert
              </span>
            </a>
            <a className="contact-item glass reveal" href={`mailto:${BRAND.email}`} id="contact-email">
              <span className="ico">
                <Mail />
              </span>
              <span>
                <small>Email</small>
                {BRAND.email}
              </span>
            </a>
            <div className="contact-item glass reveal">
              <span className="ico">
                <Pin />
              </span>
              <span>
                <small>Head office</small>
                {BRAND.city}
              </span>
            </div>
          </div>
        </div>

        <form className="form glass reveal" onSubmit={submit} id="quote-form">
          <div className="input">
            <input id="f-name" placeholder=" " required value={form.name} onChange={set('name')} />
            <label htmlFor="f-name">Full name</label>
          </div>
          <div className="input">
            <input id="f-phone" placeholder=" " required type="tel" value={form.phone} onChange={set('phone')} />
            <label htmlFor="f-phone">Phone / WhatsApp</label>
          </div>
          <div className="input">
            <input id="f-email" placeholder=" " type="email" value={form.email} onChange={set('email')} />
            <label htmlFor="f-email">Email</label>
          </div>
          <div className="input">
            <select id="f-type" value={form.type} onChange={set('type')}>
              {TYPES.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.name}
                </option>
              ))}
            </select>
            <label htmlFor="f-type">Structure</label>
          </div>
          <div className="input full">
            <textarea id="f-msg" rows="5" placeholder=" " value={form.message} onChange={set('message')} />
            <label htmlFor="f-msg">Land size, location, crop…</label>
          </div>
          {sent && <div className="form-success">Thanks {form.name.split(' ')[0] || ''}! Our team will call you within 24 hours. (Demo form, nothing was sent.)</div>}
          <button className="btn btn-primary full" type="submit" id="f-submit">
            Request free site survey
            <span className="btn-icon">
              <Arrow />
            </span>
          </button>
        </form>
      </div>
    </section>
  )
}

export function Footer() {
  const go = (h) => (e) => (e.preventDefault(), scrollToTarget(h))
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <a href="#top" className="logo" onClick={go('#top')}>
              <Leaf />
              {BRAND.name}
            </a>
            <p className="lead" style={{ marginTop: 16, fontSize: 15 }}>
              Turnkey greenhouse construction for farmers, agri-businesses and research institutes.
            </p>
          </div>
          <div>
            <h4>Structures</h4>
            <ul>
              {TYPES.map((t) => (
                <li key={t.key}>
                  <a href="#types" onClick={go('#types')}>
                    {t.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li><a href="#projects" onClick={go('#projects')}>Projects</a></li>
              <li><a href="#process" onClick={go('#process')}>Process</a></li>
              <li><a href="#configure" onClick={go('#configure')}>Configurator</a></li>
              <li><a href="#contact" onClick={go('#contact')}>Contact</a></li>
            </ul>
          </div>
          <div>
            <h4>Reach us</h4>
            <ul>
              <li><a href={`tel:${BRAND.phone.replace(/\s/g, '')}`}>{BRAND.phone}</a></li>
              <li><a href={`mailto:${BRAND.email}`}>{BRAND.email}</a></li>
              <li><a href="#contact" onClick={go('#contact')}>{BRAND.city}</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-word" aria-hidden>
          {BRAND.name}
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} {BRAND.name} Greenhouses Pvt. Ltd. Demo content.</span>
          <span>Built with Three.js · GSAP · React</span>
        </div>
      </div>
    </footer>
  )
}
