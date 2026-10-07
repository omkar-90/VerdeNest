import { Environment, Lightformer, Grid } from '@react-three/drei'

/** Shared lighting + ground for every canvas. No network HDRs needed. */
export default function SceneEnv({ shadowSize = 60, grid = true }) {
  const s = shadowSize / 2
  return (
    <>
      <ambientLight intensity={0.25} color="#cfe8d6" />
      <hemisphereLight args={['#ffe7c2', '#0b1f17', 0.55]} />
      <directionalLight
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
      <directionalLight position={[-20, 8, -16]} intensity={0.6} color="#9fe3b8" />

      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.2} color="#ffd29a" position={[12, 6, 10]} scale={[24, 8, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={1.1} color="#b6f09c" position={[-14, 4, -10]} scale={[24, 6, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={0.7} color="#ffffff" position={[0, 16, 0]} rotation-x={Math.PI / 2} scale={[40, 40, 1]} />
      </Environment>

      <mesh rotation-x={-Math.PI / 2} receiveShadow position-y={-0.01}>
        <circleGeometry args={[160, 64]} />
        <meshStandardMaterial color="#0c1c14" roughness={1} />
      </mesh>
      {grid && (
        <Grid
          position-y={0.002}
          infiniteGrid
          cellSize={1}
          sectionSize={6}
          cellThickness={0.5}
          sectionThickness={1}
          cellColor="#1d3a2a"
          sectionColor="#2f6b47"
          fadeDistance={70}
          fadeStrength={2}
        />
      )}
    </>
  )
}
