import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, DepthOfField } from '@react-three/postprocessing'
import * as THREE from 'three'
import Greenhouse from './Greenhouse'
import SceneEnv from './SceneEnv'

const clamp01 = (x) => Math.min(1, Math.max(0, x))
const smooth = (e0, e1, x) => {
  const t = clamp01((x - e0) / (e1 - e0))
  return t * t * (3 - 2 * t)
}
const lerp = (a, b, t) => a + (b - a) * t

/**
 * Camera keyframes keyed to scroll progress p (0..1).
 * side: +1 pushes the model to the right of the screen (text on the left), -1 to the left.
 */
const KEYS = [
  { p: 0.0,  pos: [17, 7.5, 21],    look: [0, 2.2, 0],   side: 1    }, // hero
  { p: 0.25, pos: [-15, 14, 12],   look: [0, 1.5, 0],   side: 1    }, // 01 structure
  { p: 0.5,  pos: [15, 4, -15],    look: [0, 2.6, 0],   side: -1   }, // 02 covering
  { p: 0.62, pos: [6, 3, 19],      look: [0, 2.4, 0],   side: 0    }, // waypoint to door
  { p: 0.75, pos: [1.6, 2.6, 9.6], look: [0, 2.3, -12], side: 0.35 }, // 03 climate (inside)
  { p: 1.0,  pos: [2.8, 1.7, 2.2], look: [-1.4, 0.9, -6], side: -0.5 }, // 04 harvest
]

/* --- Phase 6: Rain particles inside the greenhouse --- */
function RainSystem({ active }) {
  const COUNT = 1500
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(COUNT * 3)
    const vel = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 9
      pos[i * 3 + 1] = Math.random() * 8
      pos[i * 3 + 2] = (Math.random() - 0.5) * 22
      vel[i] = 2.5 + Math.random() * 2.5
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g._vel = vel
    return g
  }, [])

  const mat = useMemo(
    () => new THREE.PointsMaterial({ color: '#a8d8c0', size: 0.055, transparent: true, opacity: 0, depthWrite: false, sizeAttenuation: true }),
    []
  )
  const targetOpacity = useRef(0)

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05)
    targetOpacity.current = active ? 0.55 : 0
    mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity.current, d * 4)
    mat.visible = mat.opacity > 0.01

    if (mat.opacity < 0.02) return
    const pos = geo.attributes.position
    const arr = pos.array
    const vel = geo._vel
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3 + 1] -= vel[i] * d
      if (arr[i * 3 + 1] < -0.2) {
        arr[i * 3 + 1] = 7.5 + Math.random() * 1.5
        arr[i * 3]     = (Math.random() - 0.5) * 9
        arr[i * 3 + 2] = (Math.random() - 0.5) * 22
      }
    }
    pos.needsUpdate = true
  })

  return <points geometry={geo} material={mat} />
}

function StoryRig({ progressRef }) {
  const group = useRef()
  const fx = useMemo(() => ({ cover: 1, glow: 0, climate: 0, plants: 1, shade: 0 }), [])
  const curves = useMemo(() => {
    const v = (a) => new THREE.Vector3(...a)
    return {
      pos:  new THREE.CatmullRomCurve3(KEYS.map((k) => v(k.pos)),  false, 'centripetal'),
      look: new THREE.CatmullRomCurve3(KEYS.map((k) => v(k.look)), false, 'centripetal'),
      side: new THREE.CatmullRomCurve3(KEYS.map((k) => new THREE.Vector3(k.side, 0, 0)), false, 'catmullrom', 0.5),
    }
  }, [])
  const tmp = useMemo(() => ({
    pos: new THREE.Vector3(), look: new THREE.Vector3(),
    side: new THREE.Vector3(), right: new THREE.Vector3(),
    up: new THREE.Vector3(0, 1, 0), dir: new THREE.Vector3(),
  }), [])
  const sm = useRef(0)
  const mouse = useRef({ x: 0, y: 0 })

  // Phase 3: Depth of Field focus target (animated with scroll)
  const dofFocus = useRef(0.02)

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05)
    // Phase 7: Smooth scrub — camera catches up with momentum (damp factor 2.4 = ~0.4s lag)
    sm.current = THREE.MathUtils.damp(sm.current, progressRef.current, 2.4, d)
    const p = sm.current
    const t = p * 4

    // ---- Story fx ----
    fx.cover   = t < 1 ? 1 - smooth(0.15, 0.9, t) : smooth(1.25, 1.9, t)
    fx.glow    = Math.max(0, 1 - Math.abs(t - 1) * 1.3)
    fx.climate = smooth(2.2, 2.85, t)
    fx.plants  = t < 1.5 ? lerp(1, 0.12, smooth(0.05, 0.8, t)) : lerp(0.12, 1, smooth(3.05, 3.85, t))

    // ---- Phase 3: Shift DoF focus distance with scroll ----
    // Outside: focus far (the whole greenhouse). Inside: focus close (plants).
    const inside = smooth(0.65, 0.78, p)
    dofFocus.current = THREE.MathUtils.lerp(dofFocus.current, lerp(0.015, 0.006, inside), d * 3)

    // ---- Camera along curve (index-parameterised) ----
    let i = 0
    while (i < KEYS.length - 2 && p > KEYS[i + 1].p) i++
    const local = clamp01((p - KEYS[i].p) / (KEYS[i + 1].p - KEYS[i].p))
    const u = (i + local) / (KEYS.length - 1)
    curves.pos.getPoint(u, tmp.pos)
    curves.look.getPoint(u, tmp.look)
    curves.side.getPoint(u, tmp.side)

    const aspect = state.size.width / state.size.height
    const outside = 1 - smooth(0.55, 0.7, p)
    if (aspect < 1) {
      tmp.dir.subVectors(tmp.pos, tmp.look)
      tmp.pos.copy(tmp.look).addScaledVector(tmp.dir, 1 + 0.6 * outside)
    }
    if (aspect > 1) {
      tmp.dir.subVectors(tmp.look, tmp.pos)
      const dist = tmp.dir.length()
      tmp.right.crossVectors(tmp.dir, tmp.up).normalize()
      tmp.look.addScaledVector(tmp.right, -tmp.side.x * dist * 0.17)
    }

    // mouse parallax
    mouse.current.x = THREE.MathUtils.damp(mouse.current.x, state.pointer.x, 2.5, d)
    mouse.current.y = THREE.MathUtils.damp(mouse.current.y, state.pointer.y, 2.5, d)
    const par = lerp(1.2, 0.35, 1 - outside)
    tmp.pos.x += mouse.current.x * par
    tmp.pos.y += mouse.current.y * par * 0.5

    state.camera.position.copy(tmp.pos)
    state.camera.lookAt(tmp.look)

    // idle sway on hero
    if (group.current) group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.22 * (1 - smooth(0, 0.25, t))
  })

  return (
    <group ref={group}>
      <Greenhouse type="poly" length={24} width={10} fx={fx} />
      {/* Phase 6: Rain active when climate is running */}
      <RainSystem active={fx.climate > 0.5} />
    </group>
  )
}

export default function StageScene({ progressRef, active = true }) {
  const dofFocusRef = useRef(0.015)

  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      frameloop={active ? 'always' : 'never'}
      camera={{ fov: 35, near: 0.1, far: 600, position: [17, 7.5, 21] }}
      gl={{ antialias: false, powerPreference: 'high-performance', alpha: false }}
    >
      <color attach="background" args={['#07140e']} />
      <fog attach="fog" args={['#07140e', 38, 110]} />
      <SceneEnv shadowSize={50} animateSun />
      <StoryRig progressRef={progressRef} />
      <Sparkles count={140} scale={[44, 12, 44]} position={[0, 5, 0]} size={2.4} speed={0.25} opacity={0.7} color="#c9f7b0" />
      {/* Phase 3: Depth of Field + Bloom + Vignette */}
      <EffectComposer multisampling={4}>
        <DepthOfField
          focusDistance={0.015}
          focalLength={0.09}
          bokehScale={2.2}
          height={480}
        />
        <Bloom mipmapBlur luminanceThreshold={0.82} luminanceSmoothing={0.25} intensity={0.8} />
        <Vignette offset={0.22} darkness={0.65} />
      </EffectComposer>
    </Canvas>
  )
}
