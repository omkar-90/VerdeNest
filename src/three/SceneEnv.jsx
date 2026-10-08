import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sky, MeshReflectorMaterial, Lightformer, Environment } from '@react-three/drei'
import * as THREE from 'three'

/** Shared lighting + ground + sky for every canvas. */
export default function SceneEnv({ shadowSize = 60, grid = false, animateSun = true }) {
  const s = shadowSize / 2
  const sunRef = useRef()
  const ambRef = useRef()

  useFrame(({ clock }) => {
    if (!animateSun) return
    // Very slow sun arc — full cycle in ~420s so it's barely perceptible but
    // gives a beautiful, continuous warm/cool light shift.
    const t = clock.elapsedTime * 0.015
    const angle = t % (Math.PI * 2)
    const sinA = Math.sin(angle)
    const cosA = Math.cos(angle)

    if (sunRef.current) {
      sunRef.current.position.set(cosA * 38, Math.max(2, sinA * 28 + 12), sinA * 18)
      // warm golden at low angle, cooler white at noon
      const warmth = 1 - Math.abs(sinA) * 0.35
      sunRef.current.color.setHSL(0.09 * warmth, 0.75 * warmth, 0.72 + warmth * 0.12)
      sunRef.current.intensity = 2.2 + sinA * 0.6
    }
    if (ambRef.current) {
      ambRef.current.intensity = 0.2 + sinA * 0.08
    }
  })

  return (
    <>
      <Sky
        distance={450000}
        sunPosition={[100, 20, 100]}
        inclination={0.48}
        azimuth={0.26}
        rayleigh={0.4}
        turbidity={6}
        mieCoefficient={0.003}
        mieDirectionalG={0.92}
      />

      <ambientLight ref={ambRef} intensity={0.22} color="#cfe8d6" />
      <hemisphereLight args={['#ffe7c2', '#0b1f17', 0.5]} />

      {/* Main sun — animated each frame */}
      <directionalLight
        ref={sunRef}
        castShadow
        position={[18, 24, 14]}
        intensity={2.6}
        color="#ffd8a3"
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      >
        <orthographicCamera attach="shadow-camera" args={[-s, s, s, -s, 1, 120]} />
      </directionalLight>

      {/* Cool fill from opposite side */}
      <directionalLight position={[-20, 8, -16]} intensity={0.55} color="#9fe3b8" />

      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={1.8} color="#ffd29a" position={[12, 6, 10]} scale={[24, 8, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={0.9} color="#b6f09c" position={[-14, 4, -10]} scale={[24, 6, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={0.6} color="#ffffff" position={[0, 16, 0]} rotation-x={Math.PI / 2} scale={[40, 40, 1]} />
      </Environment>

      {/* Reflective ground */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow position-y={-0.01}>
        <planeGeometry args={[300, 300]} />
        <MeshReflectorMaterial
          blur={[512, 128]}
          resolution={512}
          mixBlur={1.2}
          mixStrength={12}
          depthScale={1}
          minDepthThreshold={0.8}
          maxDepthThreshold={1}
          color="#091a10"
          metalness={0.5}
          roughness={0.95}
        />
      </mesh>
    </>
  )
}
