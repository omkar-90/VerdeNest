import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import Lenis from 'lenis'
import { Loader, Navbar, Cursor, WhatsAppFab, scrollToTarget } from './components/Chrome'
import Stage from './components/Stage'
import { Marquee, Types, Projects, Process, Proof } from './components/Sections'
import Configurator from './components/Configurator'
import { Contact, Footer } from './components/Contact'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export default function App() {
  const root = useRef()
  const [ready, setReady] = useState(false)
  const [type, setType] = useState('poly')
  const [prefill, setPrefill] = useState(null)

  // Smooth scrolling (Lenis) synced with GSAP ScrollTrigger
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.2, smoothWheel: true })
    window.lenis = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (t) => lenis.raf(t * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
      window.lenis = null
    }
  }, [])

  // Lock scroll while loading
  useEffect(() => {
    if (!window.lenis) return
    if (ready) window.lenis.start()
    else window.lenis.stop()
  }, [ready])

  // Generic scroll reveals
  useGSAP(
    () => {
      gsap.utils.toArray('.reveal').forEach((el) => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'expo.out',
          clearProps: 'transform',
          scrollTrigger: { trigger: el, start: 'top 90%' },
        })
      })
      ScrollTrigger.refresh()
    },
    { scope: root }
  )

  const onLoaded = useCallback(() => setReady(true), [])

  const pickType = (k) => {
    setType(k)
    scrollToTarget('#configure')
  }
  const onQuote = (data) => {
    setPrefill({ ...data, t: Date.now() })
    scrollToTarget('#contact')
  }

  return (
    <div ref={root}>
      <Loader onDone={onLoaded} />
      <div className="grain" aria-hidden />
      <Navbar />
      <main>
        <Stage ready={ready} />
        <Marquee />
        <Types onPick={pickType} />
        <Configurator type={type} setType={setType} onQuote={onQuote} />
        <Projects />
        <Process />
        <Proof />
        <Contact prefill={prefill} />
      </main>
      <Footer />
      <WhatsAppFab />
      <Cursor />
    </div>
  )
}
