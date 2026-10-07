import { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import ConfigScene from '../three/ConfigScene'
import useInView from '../hooks/useInView'
import { TYPES, ADDONS } from '../data'
import { Arrow } from './icons'

const fmtLakh = (v) => (v >= 1e7 ? `₹${(v / 1e7).toFixed(2)} Cr` : `₹${(v / 1e5).toFixed(1)} L`)

function Range({ id, label, value, min, max, step, unit, onChange }) {
  const p = ((value - min) / (max - min)) * 100
  return (
    <div>
      <label className="field-label" htmlFor={id}>
        {label}
        <b>
          {value} {unit}
        </b>
      </label>
      <input id={id} className="range" type="range" min={min} max={max} step={step} value={value} style={{ '--p': `${p}%` }} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  )
}

export default function Configurator({ type, setType, onQuote }) {
  const view = useRef()
  const inView = useInView(view)
  const [length, setLength] = useState(32)
  const [width, setWidth] = useState(20)
  const [addons, setAddons] = useState({ climate: true, shade: false, drip: true, iot: false })

  const est = useMemo(() => {
    const area = length * width
    const t = TYPES.find((x) => x.key === type)
    let total = area * t.rate
    ADDONS.forEach((a) => {
      if (addons[a.key]) total += a.fixed ?? a.rate * area
    })
    return { area, total, subsidy: total * 0.5 }
  }, [length, width, type, addons])

  // animated price
  const amountRef = useRef()
  const shown = useRef({ v: est.total })
  useEffect(() => {
    const tween = gsap.to(shown.current, {
      v: est.total,
      duration: 0.8,
      ease: 'power3.out',
      onUpdate: () => amountRef.current && (amountRef.current.textContent = fmtLakh(shown.current.v)),
    })
    return () => tween.kill()
  }, [est.total])

  const toggle = (k) => setAddons((a) => ({ ...a, [k]: !a[k] }))
  const typeName = TYPES.find((t) => t.key === type).name

  const quote = () =>
    onQuote({
      type,
      message: `${typeName}, ${length} m × ${width} m (${est.area.toLocaleString('en-IN')} m²). Add-ons: ${
        ADDONS.filter((a) => addons[a.key])
          .map((a) => a.label)
          .join(', ') || 'none'
      }. Estimate ${fmtLakh(est.total)}.`,
    })

  return (
    <section className="section config" id="configure">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow reveal">3D configurator</span>
            <h2 className="h-section reveal">
              Design it. <span className="serif text-grad">See it.</span> Price it.
            </h2>
          </div>
          <p className="lead reveal">Change the type, size and systems, and the 3D model and estimate update instantly. Drag the model to look around.</p>
        </div>

        <div className="config-shell reveal">
          <div className="config-view glass" ref={view}>
            <ConfigScene type={type} length={length} width={width} addons={addons} active={inView} />
            <div className="config-view-hud">
              <span>
                Model · <b>{typeName}</b>
              </span>
              <span>
                <b>{est.area.toLocaleString('en-IN')}</b> m²
              </span>
            </div>
            <div className="config-hint">Drag to rotate</div>
          </div>

          <div className="config-panel glass">
            <div>
              <div className="field-label">Structure type</div>
              <div className="seg" role="radiogroup" aria-label="Structure type">
                {TYPES.map((t) => (
                  <button key={t.key} className={type === t.key ? 'on' : ''} onClick={() => setType(t.key)} role="radio" aria-checked={type === t.key} id={`cfg-type-${t.key}`}>
                    {t.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
            <Range id="cfg-length" label="Length" value={length} min={16} max={80} step={4} unit="m" onChange={setLength} />
            <Range id="cfg-width" label="Width (spans of ~10 m)" value={width} min={8} max={32} step={4} unit="m" onChange={setWidth} />
            <div>
              <div className="field-label">Systems</div>
              <div className="addons">
                {ADDONS.map((a) => (
                  <button key={a.key} className={`addon ${addons[a.key] ? 'on' : ''}`} onClick={() => toggle(a.key)} aria-pressed={!!addons[a.key]} id={`cfg-addon-${a.key}`}>
                    <i />
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="estimate">
              <small>Estimated project cost</small>
              <div className="amount" ref={amountRef}>
                {fmtLakh(est.total)}
              </div>
              <div className="breakdown">
                <span>After ~50% subsidy</span>
                <b>{fmtLakh(est.subsidy)}</b>
              </div>
              <button className="btn btn-primary" onClick={quote} id="cfg-quote">
                Get exact quote
                <span className="btn-icon">
                  <Arrow />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
