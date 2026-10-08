import { useMemo, useRef, useLayoutEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Procedural greenhouse model.
 * Everything is generated from code (no .glb needed), so size / type
 * can be changed live by the configurator.
 *
 * `fx` is a plain mutable object that the parent can update every frame:
 *   cover   0..1  covering opacity multiplier
 *   glow    0..1  frame emissive highlight
 *   climate 0..1  fan speed + misting
 *   plants  0..1  plant growth
 *   shade   0..1  internal shade-net visibility
 */

export const GH_TYPES = {
  poly: { label: 'Polyhouse', profile: 'arch', height: 5, archStep: 2, cover: '#eef8f1', opacity: 0.34, roughness: 0.4, frame: '#c9d3cc', beds: 'soil' },
  glass: { label: 'Glasshouse', profile: 'gable', height: 5.6, archStep: 1.6, cover: '#d6ecff', opacity: 0.16, roughness: 0.04, frame: '#e9eef0', beds: 'soil' },
  net: { label: 'Net House', profile: 'arch', height: 4.4, archStep: 2.4, cover: '#1e5a3a', opacity: 0.55, roughness: 0.9, frame: '#8fa397', beds: 'soil' },
  hydro: { label: 'Hydroponic', profile: 'arch', height: 5, archStep: 2, cover: '#f1faf5', opacity: 0.3, roughness: 0.35, frame: '#d8e0db', beds: 'nft' },
}

const DEFAULT_FX = { cover: 1, glow: 0, climate: 0.6, plants: 1, shade: 0 }

const clamp01 = (x) => Math.min(1, Math.max(0, x))
const smooth = (e0, e1, x) => {
  const t = clamp01((x - e0) / (e1 - e0))
  return t * t * (3 - 2 * t)
}
function rng(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function makeProfile(kind, w, h) {
  const hw = w / 2
  const wall = h * 0.55
  const pts = []
  if (kind === 'gable') {
    pts.push([-hw, 0], [-hw, wall], [0, h], [hw, wall], [hw, 0])
  } else {
    const N = 14
    pts.push([-hw, 0])
    for (let i = 0; i <= N; i++) {
      const a = i / N
      pts.push([-hw + a * hw, wall + (h - wall) * Math.sin((a * Math.PI) / 2)])
    }
    for (let i = N - 1; i >= 0; i--) {
      const a = i / N
      pts.push([hw - a * hw, wall + (h - wall) * Math.sin((a * Math.PI) / 2)])
    }
    pts.push([hw, 0])
  }
  return { pts: pts.map(([x, y]) => new THREE.Vector2(x, y)), wall }
}

export default function Greenhouse({ type = 'poly', length = 24, width = 10, fx = DEFAULT_FX, showClimate = true, ...props }) {
  const cfg = GH_TYPES[type] ?? GH_TYPES.poly
  const height = cfg.height
  const spans = Math.max(1, Math.round(width / 10))
  const bayW = width / spans

  /* ---------- Geometry ---------- */
  const geo = useMemo(() => {
    const { pts, wall } = makeProfile(cfg.profile, bayW, height)
    const cover = new THREE.ExtrudeGeometry(new THREE.Shape(pts), { depth: length, bevelEnabled: false, curveSegments: 1 })
    cover.translate(0, 0, -length / 2)

    const path = new THREE.CurvePath()
    for (let i = 0; i < pts.length - 1; i++) {
      path.add(new THREE.LineCurve3(new THREE.Vector3(pts[i].x, pts[i].y, 0), new THREE.Vector3(pts[i + 1].x, pts[i + 1].y, 0)))
    }
    const arch = new THREE.TubeGeometry(path, pts.length * 3, 0.06, 6, false)

    const step = Math.max(1, Math.floor(pts.length / 7))
    const purl = []
    for (let i = 1; i < pts.length - 1; i += step) purl.push(pts[i])
    purl.push(pts[Math.floor(pts.length / 2)])
    const purlin = new THREE.BoxGeometry(0.06, 0.06, length)

    return { cover, arch, purl, purlin, wall }
  }, [cfg.profile, bayW, height, length])

  const bays = useMemo(() => Array.from({ length: spans }, (_, i) => -width / 2 + bayW * (i + 0.5)), [spans, width, bayW])
  const archZ = useMemo(() => {
    const n = Math.max(2, Math.round(length / cfg.archStep))
    return Array.from({ length: n + 1 }, (_, i) => -length / 2 + (i * length) / n)
  }, [length, cfg.archStep])

  /* ---------- Materials ---------- */
  const mats = useMemo(
    () => ({
      frame: new THREE.MeshStandardMaterial({ color: cfg.frame, metalness: 0.85, roughness: 0.3, emissive: new THREE.Color('#b6f09c'), emissiveIntensity: 0 }),
      // Phase 1: Physical glass — real IOR + transmission instead of fake opacity
      cover: new THREE.MeshPhysicalMaterial({
        color: cfg.cover,
        transmission: cfg.roughness < 0.2 ? 0.92 : 0,   // glass/poly: physical; net: opaque
        transparent: true,
        opacity: cfg.roughness < 0.2 ? 1 : cfg.opacity,
        ior: 1.45,
        thickness: 0.35,
        roughness: cfg.roughness,
        metalness: 0,
        clearcoat: cfg.roughness < 0.5 ? 1 : 0,
        clearcoatRoughness: 0.1,
        envMapIntensity: 1.2,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
      soil: new THREE.MeshStandardMaterial({ color: '#3a2a1d', roughness: 1 }),
      plant: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.75, flatShading: true }),
      fruit: new THREE.MeshStandardMaterial({ color: '#e5482f', roughness: 0.35, emissive: '#5a1000', emissiveIntensity: 0.4 }),
      white: new THREE.MeshStandardMaterial({ color: '#eef2ef', roughness: 0.5 }),
      dark: new THREE.MeshStandardMaterial({ color: '#16211c', metalness: 0.6, roughness: 0.5 }),
      pad: new THREE.MeshStandardMaterial({ color: '#8aa863', roughness: 0.95 }),
      shade: new THREE.MeshStandardMaterial({ color: '#0c1f15', transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }),
      floor: new THREE.MeshStandardMaterial({ color: '#25332a', roughness: 1 }),
      mist: new THREE.PointsMaterial({ color: '#e8fff2', size: 0.07, transparent: true, opacity: 0, depthWrite: false, sizeAttenuation: true }),
    }),
    [cfg]
  )

  /* ---------- Plants ---------- */
  const plantData = useMemo(() => {
    const r = rng(11)
    const hydro = cfg.beds === 'nft'
    const pitch = 1.7
    const rows = Math.max(2, Math.floor((width - 1.4) / pitch))
    const xs = Array.from({ length: rows }, (_, i) => (i - (rows - 1) / 2) * pitch)
    const bedLen = Math.max(4, length - 3.4)
    const spacing = hydro ? 0.32 : 0.55
    const n = Math.floor(bedLen / spacing)
    const plants = []
    const fruits = []
    xs.forEach((x) => {
      ;[-0.22, 0.22].forEach((dx) => {
        for (let i = 0; i < n; i++) {
          const z = -bedLen / 2 + spacing * (i + 0.5) + (hydro ? 0 : (r() - 0.5) * 0.12)
          const y = hydro ? 0.97 : 0.28
          const s = hydro ? 0.85 + r() * 0.35 : 0.7 + r() * 0.6
          plants.push({ x: x + dx, y, z, s, rot: r() * Math.PI * 2, c: r() })
          if (!hydro && r() > 0.5) {
            fruits.push({ x: x + dx + (r() - 0.5) * 0.36, y: y + 0.25 + r() * 0.6 * s, z: z + (r() - 0.5) * 0.34, s: 0.055 + r() * 0.03 })
          }
        }
      })
    })
    return { xs, bedLen, plants, fruits, hydro }
  }, [width, length, cfg.beds])

  const plantGeo = useMemo(() => {
    if (plantData.hydro) {
      const g = new THREE.IcosahedronGeometry(0.15, 1)
      g.scale(1, 0.55, 1)
      g.translate(0, 0.06, 0)
      return g
    }
    const g = new THREE.IcosahedronGeometry(0.3, 1)
    g.scale(1, 1.75, 1)
    g.translate(0, 0.5, 0)
    return g
  }, [plantData.hydro])
  const fruitGeo = useMemo(() => new THREE.SphereGeometry(1, 10, 8), [])

  const plantRef = useRef()
  const fruitRef = useRef()
  const lastGrow = useRef(-1)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const applyGrowth = (k) => {
    const pm = plantRef.current
    if (!pm) return
    plantData.plants.forEach((p, i) => {
      const s = p.s * Math.max(0.001, k)
      dummy.position.set(p.x, p.y, p.z)
      dummy.rotation.set(0, p.rot, 0)
      dummy.scale.set(s, s, s)
      dummy.updateMatrix()
      pm.setMatrixAt(i, dummy.matrix)
    })
    pm.instanceMatrix.needsUpdate = true
    const fm = fruitRef.current
    if (fm) {
      const fk = smooth(0.82, 1, k)
      plantData.fruits.forEach((f, i) => {
        const s = f.s * Math.max(0.001, fk)
        dummy.position.set(f.x, f.y, f.z)
        dummy.rotation.set(0, 0, 0)
        dummy.scale.set(s, s, s)
        dummy.updateMatrix()
        fm.setMatrixAt(i, dummy.matrix)
      })
      fm.instanceMatrix.needsUpdate = true
    }
  }

  useLayoutEffect(() => {
    const pm = plantRef.current
    if (!pm) return
    const col = new THREE.Color()
    plantData.plants.forEach((p, i) => {
      if (plantData.hydro) col.setHSL(0.26 + p.c * 0.05, 0.6, 0.45 + p.c * 0.12)
      else col.setHSL(0.3 + p.c * 0.06, 0.55, 0.22 + p.c * 0.12)
      pm.setColorAt(i, col)
    })
    if (pm.instanceColor) pm.instanceColor.needsUpdate = true
    lastGrow.current = -1
    applyGrowth(fx.plants)
    lastGrow.current = fx.plants
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plantData])

  /* ---------- Frame instancing ---------- */
  const archRef = useRef()
  const purlRef = useRef()
  useLayoutEffect(() => {
    const am = archRef.current
    if (am) {
      let k = 0
      bays.forEach((bx) =>
        archZ.forEach((z) => {
          dummy.position.set(bx, 0, z)
          dummy.rotation.set(0, 0, 0)
          dummy.scale.set(1, 1, 1)
          dummy.updateMatrix()
          am.setMatrixAt(k++, dummy.matrix)
        })
      )
      am.instanceMatrix.needsUpdate = true
    }
    const pm = purlRef.current
    if (pm) {
      let k = 0
      bays.forEach((bx) =>
        geo.purl.forEach((pt) => {
          dummy.position.set(bx + pt.x, pt.y, 0)
          dummy.rotation.set(0, 0, 0)
          dummy.scale.set(1, 1, 1)
          dummy.updateMatrix()
          pm.setMatrixAt(k++, dummy.matrix)
        })
      )
      pm.instanceMatrix.needsUpdate = true
    }
  }, [bays, archZ, geo, dummy])

  /* ---------- Mist ---------- */
  const mistGeo = useMemo(() => {
    const count = Math.min(1800, Math.floor(width * length * 1.4))
    const r = rng(3)
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (r() - 0.5) * (width - 1)
      arr[i * 3 + 1] = 0.4 + r() * height * 0.65
      arr[i * 3 + 2] = (r() - 0.5) * (length - 2)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(arr, 3))
    return g
  }, [width, length, height])

  const fanRefs = useRef([])

  /* ---------- Per-frame fx ---------- */
  useFrame(({ clock }, dt) => {
    const d = Math.min(dt, 0.05)
    const t = clock.elapsedTime

    // Cover visibility (physical glass: control via cover prop not opacity)
    if (mats.cover.transmission > 0) {
      mats.cover.visible = fx.cover > 0.01
    } else {
      mats.cover.opacity = cfg.opacity * fx.cover
      mats.cover.visible = fx.cover > 0.01
    }

    mats.frame.emissiveIntensity = fx.glow * 1.8
    mats.shade.opacity = 0.65 * fx.shade
    mats.shade.visible = fx.shade > 0.01
    mats.mist.opacity = 0.5 * fx.climate
    mats.mist.visible = fx.climate > 0.01

    fanRefs.current.forEach((f) => f && (f.rotation.z += d * (0.4 + fx.climate * 16)))

    if (fx.climate > 0.01) {
      const pos = mistGeo.attributes.position
      const a = pos.array
      const top = 0.4 + height * 0.65
      for (let i = 1; i < a.length; i += 3) {
        a[i] -= d * 0.35
        if (a[i] < 0.3) a[i] = top
      }
      pos.needsUpdate = true
    }

    // Phase 5: Wind sway — each plant sways on a unique phase based on position
    const pm = plantRef.current
    if (pm && fx.plants > 0.05) {
      const windAmp = 0.032 + fx.climate * 0.045
      const windFreq = 1.1 + fx.climate * 0.8
      plantData.plants.forEach((p, i) => {
        const phase = p.x * 3.7 + p.z * 2.1
        const sway = Math.sin(t * windFreq + phase) * windAmp
        const s = p.s * Math.max(0.001, fx.plants)
        dummy.position.set(p.x, p.y, p.z)
        dummy.rotation.set(sway, p.rot, sway * 0.4)
        dummy.scale.set(s, s, s)
        dummy.updateMatrix()
        pm.setMatrixAt(i, dummy.matrix)
      })
      pm.instanceMatrix.needsUpdate = true
    } else if (Math.abs(fx.plants - lastGrow.current) > 0.002) {
      applyGrowth(fx.plants)
      lastGrow.current = fx.plants
    }
  })

  const midBay = bays[Math.floor(bays.length / 2)]

  return (
    <group {...props}>
      {/* floor pad */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.01} receiveShadow material={mats.floor}>
        <planeGeometry args={[width + 2.4, length + 2.4]} />
      </mesh>

      {/* frame */}
      <instancedMesh ref={archRef} key={`a${bays.length}-${archZ.length}-${type}`} args={[geo.arch, mats.frame, bays.length * archZ.length]} castShadow />
      <instancedMesh ref={purlRef} key={`p${bays.length}-${geo.purl.length}-${type}`} args={[geo.purlin, mats.frame, bays.length * geo.purl.length]} castShadow />

      {/* covering */}
      {bays.map((bx) => (
        <mesh key={`c${bx}`} geometry={geo.cover} material={mats.cover} position-x={bx} renderOrder={2} />
      ))}

      {/* shade net */}
      {bays.map((bx) => (
        <mesh key={`s${bx}`} material={mats.shade} position={[bx, geo.wall - 0.1, 0]} rotation-x={-Math.PI / 2} renderOrder={1}>
          <planeGeometry args={[bayW - 0.2, length - 0.2]} />
        </mesh>
      ))}

      {/* door frame */}
      <group position={[midBay, 0, length / 2 + 0.03]}>
        <mesh material={mats.dark} position={[-0.8, 1.25, 0]} castShadow>
          <boxGeometry args={[0.1, 2.5, 0.1]} />
        </mesh>
        <mesh material={mats.dark} position={[0.8, 1.25, 0]} castShadow>
          <boxGeometry args={[0.1, 2.5, 0.1]} />
        </mesh>
        <mesh material={mats.dark} position={[0, 2.5, 0]} castShadow>
          <boxGeometry args={[1.7, 0.1, 0.1]} />
        </mesh>
      </group>

      {/* beds / NFT channels */}
      {plantData.xs.map((x) =>
        plantData.hydro ? (
          <group key={`b${x}`} position-x={x}>
            <mesh material={mats.white} position={[0, 0.86, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.66, 0.05, plantData.bedLen]} />
            </mesh>
            <mesh material={mats.dark} position={[0, 0.43, 0]}>
              <boxGeometry args={[0.05, 0.86, plantData.bedLen]} />
            </mesh>
            {[-0.22, 0.22].map((dx) => (
              <mesh key={dx} material={mats.white} position={[dx, 0.93, 0]} castShadow>
                <boxGeometry args={[0.14, 0.09, plantData.bedLen]} />
              </mesh>
            ))}
          </group>
        ) : (
          <mesh key={`b${x}`} material={mats.soil} position={[x, 0.14, 0]} receiveShadow castShadow>
            <boxGeometry args={[0.9, 0.28, plantData.bedLen]} />
          </mesh>
        )
      )}

      <instancedMesh ref={plantRef} key={`pl${plantData.plants.length}-${type}`} args={[plantGeo, mats.plant, plantData.plants.length]} castShadow receiveShadow />
      {plantData.fruits.length > 0 && <instancedMesh ref={fruitRef} key={`fr${plantData.fruits.length}`} args={[fruitGeo, mats.fruit, plantData.fruits.length]} />}

      {/* climate system: fans on back wall, cooling pad on front */}
      {showClimate &&
        bays.map((bx, bi) => (
          <group key={`f${bx}`}>
            {[-bayW / 4, bayW / 4].map((off, fi) => (
              <group key={off} position={[bx + off, 1.7, -length / 2 + 0.18]}>
                <mesh material={mats.dark} castShadow>
                  <boxGeometry args={[1.35, 1.35, 0.3]} />
                </mesh>
                <group ref={(el) => (fanRefs.current[bi * 2 + fi] = el)} position-z={0.18}>
                  {[0, 1, 2].map((b) => (
                    <mesh key={b} material={mats.white} rotation-z={(b * Math.PI * 2) / 3}>
                      <boxGeometry args={[0.16, 1.1, 0.03]} />
                    </mesh>
                  ))}
                  <mesh material={mats.frame}>
                    <cylinderGeometry args={[0.1, 0.1, 0.08, 16]} />
                  </mesh>
                </group>
              </group>
            ))}
            <mesh material={mats.pad} position={[bx, 1.3, length / 2 - 0.12]}>
              <boxGeometry args={[bayW * 0.7, 1.3, 0.12]} />
            </mesh>
          </group>
        ))}

      {showClimate && <points geometry={mistGeo} material={mats.mist} />}
    </group>
  )
}
