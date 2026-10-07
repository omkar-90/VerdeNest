import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import Greenhouse from './Greenhouse'
import SceneEnv from './SceneEnv'

/** Smoothly keeps the camera at a distance that fits the current greenhouse size. */
function AutoFit({ length, width, controls }) {
  const dir = useMemo(() => new THREE.Vector3(), [])
  useFrame((state, dt) => {
    const target = controls.current?.target ?? new THREE.Vector3(0, 2, 0)
    const want = Math.max(length * 0.95, width * 1.5, 22) * (state.size.width < state.size.height ? 1.5 : 1)
    dir.subVectors(state.camera.position, target)
    const cur = dir.length()
    const next = THREE.MathUtils.damp(cur, want, 3, Math.min(dt, 0.05))
    dir.setLength(next)
    state.camera.position.copy(target).add(dir)
  })
  return null
}

/** Eases fx values toward the selected add-ons so toggles animate. */
function FxDriver({ fx, addons }) {
  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05)
    fx.climate = THREE.MathUtils.damp(fx.climate, addons.climate ? 1 : 0, 4, d)
    fx.shade = THREE.MathUtils.damp(fx.shade, addons.shade ? 1 : 0, 4, d)
  })
  return null
}

export default function ConfigScene({ type, length, width, addons, active = true }) {
  const controls = useRef()
  const fx = useMemo(() => ({ cover: 1, glow: 0, climate: 0, plants: 1, shade: 0 }), [])
  return (
    <Canvas shadows dpr={[1, 1.5]} frameloop={active ? 'always' : 'never'} camera={{ fov: 35, position: [26, 14, 30], near: 0.1, far: 500 }}>
      <color attach="background" args={['#0a1c14']} />
      <fog attach="fog" args={['#0a1c14', 60, 170]} />
      <SceneEnv shadowSize={Math.max(60, length * 1.3)} />
      <FxDriver fx={fx} addons={addons} />
      <Greenhouse type={type} length={length} width={width} fx={fx} showClimate={addons.climate} />
      <ContactShadows position-y={0.02} scale={Math.max(length, width) * 1.6} opacity={0.5} blur={2.4} far={8} />
      <OrbitControls
        ref={controls}
        makeDefault
        target={[0, 2, 0]}
        enablePan={false}
        enableZoom={false}
        autoRotate
        autoRotateSpeed={0.6}
        enableDamping
        minPolarAngle={0.4}
        maxPolarAngle={Math.PI / 2.15}
      />
      <AutoFit length={length} width={width} controls={controls} />
    </Canvas>
  )
}
