import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
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
  { p: 0.0, pos: [17, 7.5, 21], look: [0, 2.2, 0], side: 1 }, // hero
  { p: 0.25, pos: [-15, 14, 12], look: [0, 1.5, 0], side: 1 }, // 01 structure
  { p: 0.5, pos: [15, 4, -15], look: [0, 2.6, 0], side: -1 }, // 02 covering
  { p: 0.62, pos: [6, 3, 19], look: [0, 2.4, 0], side: 0 }, // waypoint to the door
  { p: 0.75, pos: [1.6, 2.6, 9.6], look: [0, 2.3, -12], side: 0.35 }, // 03 climate (inside)
  { p: 1.0, pos: [2.8, 1.7, 2.2], look: [-1.4, 0.9, -6], side: -0.5 }, // 04 harvest
]

function StoryRig({ progressRef }) {
  const group = useRef()
  const fx = useMemo(() => ({ cover: 1, glow: 0, climate: 0, plants: 1, shade: 0 }), [])
  const curves = useMemo(() => {
    const v = (a) => new THREE.Vector3(...a)
    return {
      pos: new THREE.CatmullRomCurve3(KEYS.map((k) => v(k.pos)), false, 'centripetal'),
      look: new THREE.CatmullRomCurve3(KEYS.map((k) => v(k.look)), false, 'centripetal'),
      // 'catmullrom' type: centripetal would divide by zero on repeated values
      side: new THREE.CatmullRomCurve3(KEYS.map((k) => new THREE.Vector3(k.side, 0, 0)), false, 'catmullrom', 0.5),
    }
  }, [])
  const tmp = useMemo(() => ({ pos: new THREE.Vector3(), look: new THREE.Vector3(), side: new THREE.Vector3(), right: new THREE.Vector3(), up: new THREE.Vector3(0, 1, 0), dir: new THREE.Vector3() }), [])
  const sm = useRef(0)
  const mouse = useRef({ x: 0, y: 0 })

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05)
    sm.current = THREE.MathUtils.damp(sm.current, progressRef.current, 3.2, d)
    const p = sm.current
    const t = p * 4

    // ---- Story fx ----
    fx.cover = t < 1 ? 1 - smooth(0.15, 0.9, t) : smooth(1.25, 1.9, t)
    fx.glow = Math.max(0, 1 - Math.abs(t - 1) * 1.3)
    fx.climate = smooth(2.2, 2.85, t)
    fx.plants = t < 1.5 ? lerp(1, 0.12, smooth(0.05, 0.8, t)) : lerp(0.12, 1, smooth(3.05, 3.85, t))

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
    // pull back on portrait screens while outside
    if (aspect < 1) {
      tmp.dir.subVectors(tmp.pos, tmp.look)
      tmp.pos.copy(tmp.look).addScaledVector(tmp.dir, 1 + 0.6 * outside)
    }
    // lateral framing (desktop only)
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
    </group>
  )
}

export default function StageScene({ progressRef, active = true }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      frameloop={active ? 'always' : 'never'}
      camera={{ fov: 35, near: 0.1, far: 400, position: [17, 7.5, 21] }}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#07140e']} />
      <fog attach="fog" args={['#07140e', 30, 95]} />
      <SceneEnv shadowSize={50} />
      <StoryRig progressRef={progressRef} />
      <Sparkles count={140} scale={[44, 12, 44]} position={[0, 5, 0]} size={2.4} speed={0.25} opacity={0.7} color="#c9f7b0" />
      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur luminanceThreshold={0.85} luminanceSmoothing={0.2} intensity={0.7} />
        <Vignette offset={0.25} darkness={0.7} />
      </EffectComposer>
    </Canvas>
  )
}
