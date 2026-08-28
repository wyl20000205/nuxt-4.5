<template>
  <section ref="stage" class="m9-stage" aria-label="M9 刺刀三维查看器">
    <div class="m9-stage__backdrop"></div>
    <div ref="canvasHost" class="m9-stage__canvas"></div>

    <header class="m9-stage__header">
      <p class="m9-stage__eyebrow">IMG2THREEJS · REFERENCE PROJECTION</p>
      <h1>M9 刺刀</h1>
      <p class="m9-stage__hint">拖拽旋转查看 · 点击结构高亮</p>
    </header>

    <aside class="m9-stage__panel" aria-live="polite">
      <p class="m9-stage__panel-label">当前结构</p>
      <p class="m9-stage__part">{{ activePart }}</p>
      <p class="m9-stage__meta">蓝紫大理石刀身 · 黑色分段握把</p>
      <div class="m9-stage__controls">
        <button type="button" @click="toggleExploded">{{ exploded ? '收拢结构' : '展开结构' }}</button>
        <button type="button" @click="resetView">重置视角</button>
      </div>
    </aside>

    <p class="m9-stage__credit">基于 m9.jpg 单视角程序化重建</p>
  </section>
</template>

<script setup lang="ts">
import * as THREE from 'three'

definePageMeta({ layout: false })

const stage = ref<HTMLElement | null>(null)
const canvasHost = ref<HTMLElement | null>(null)
const activePart = ref('刀身')
const exploded = ref(false)

let setExploded: ((value: boolean) => void) | undefined
let resetCameraView: (() => void) | undefined

const partLabels: Record<string, string> = {
  blade: '刀身与开孔',
  guard: '护手与护环',
  grip: '分段橡胶握把',
  pommel: '尾部撞击锤',
}

const toggleExploded = () => {
  exploded.value = !exploded.value
  setExploded?.(exploded.value)
}

const resetView = () => {
  exploded.value = false
  setExploded?.(false)
  resetCameraView?.()
}

const createNoiseTexture = (seed: number, contrast = 0.45) => {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const context = canvas.getContext('2d')!
  const image = context.createImageData(canvas.width, canvas.height)
  let value = seed >>> 0

  for (let index = 0; index < image.data.length; index += 4) {
    value = (value * 1664525 + 1013904223) >>> 0
    const noise = 124 + ((value >>> 16) % 96 - 48) * contrast
    image.data[index] = noise
    image.data[index + 1] = noise
    image.data[index + 2] = noise
    image.data[index + 3] = 255
  }

  context.putImageData(image, 0, 0)
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.colorSpace = THREE.NoColorSpace
  return texture
}

const createBladeShape = () => {
  const blade = new THREE.Shape()
  blade.moveTo(-0.22, 0.76)
  blade.lineTo(0.72, 0.82)

  for (let tooth = 0; tooth < 10; tooth += 1) {
    const x = 0.72 + tooth * 0.38
    blade.lineTo(x + 0.08, 0.83)
    blade.lineTo(x + 0.2, 1.0)
    blade.lineTo(x + 0.34, 0.73)
  }

  blade.lineTo(5.05, 0.68)
  blade.quadraticCurveTo(7.5, 0.52, 8.95, 0.02)
  blade.quadraticCurveTo(7.04, -0.1, 5.18, -0.47)
  blade.lineTo(0.12, -0.61)
  blade.quadraticCurveTo(-0.2, -0.32, -0.22, 0.76)

  const aperture = new THREE.Path()
  aperture.absellipse(6.58, 0.04, 0.33, 0.2, 0, Math.PI * 2, false, 0)
  blade.holes.push(aperture)
  return blade
}

const addRivet = (group: THREE.Group, x: number, y: number, material: THREE.Material) => {
  const rivet = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.115, 1.78, 16), material)
  rivet.rotation.x = Math.PI / 2
  rivet.position.set(x, y, 0)
  group.add(rivet)
}

onMounted(() => {
  if (!stage.value || !canvasHost.value) return

  const host = canvasHost.value
  const scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x06120f, 0.035)

  const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 100)
  camera.position.set(0.15, 0.1, 22)

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(host.clientWidth, host.clientHeight)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.18
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  host.appendChild(renderer.domElement)

  const world = new THREE.Group()
  world.rotation.set(-0.05, -0.18, -0.03)
  scene.add(world)
  const model = new THREE.Group()
  model.name = 'm9-bayonet-root'
  world.add(model)

  const roughnessMap = createNoiseTexture(1843, 0.28)
  roughnessMap.repeat.set(5, 3)
  const normalMap = createNoiseTexture(98731, 0.8)
  normalMap.repeat.set(36, 18)
  const gripRoughness = createNoiseTexture(46291, 0.45)
  gripRoughness.repeat.set(8, 3)

  const bladeMaterial = new THREE.MeshPhysicalMaterial({ color: 0x494aca, metalness: 0.96, roughness: 0.18, roughnessMap, normalMap, normalScale: new THREE.Vector2(0.18, 0.18), clearcoat: 0.72, clearcoatRoughness: 0.14, iridescence: 0.26, iridescenceIOR: 1.52, envMapIntensity: 1.9 })
  const edgeMaterial = new THREE.MeshPhysicalMaterial({ color: 0xbed3fa, metalness: 1, roughness: 0.12, clearcoat: 0.42, envMapIntensity: 2.3 })
  const guardMaterial = new THREE.MeshPhysicalMaterial({ color: 0x181a1d, metalness: 0.88, roughness: 0.24, normalMap, normalScale: new THREE.Vector2(0.08, 0.08), envMapIntensity: 1.8 })
  const gripMaterial = new THREE.MeshStandardMaterial({ color: 0x101314, roughness: 0.72, roughnessMap: gripRoughness, metalness: 0.14 })
  const gripRibMaterial = new THREE.MeshStandardMaterial({ color: 0x050707, roughness: 0.53, metalness: 0.3 })
  const pinMaterial = new THREE.MeshPhysicalMaterial({ color: 0x3a4048, metalness: 1, roughness: 0.27 })

  const bladeGroup = new THREE.Group()
  bladeGroup.name = 'blade'
  const bladeShape = createBladeShape()
  const bladeVolume = new THREE.Mesh(new THREE.ExtrudeGeometry(bladeShape, { depth: 0.54, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.045, bevelThickness: 0.07, curveSegments: 24 }), bladeMaterial)
  bladeVolume.name = 'blade-volume'
  bladeVolume.position.z = -0.27
  bladeVolume.castShadow = true
  bladeVolume.receiveShadow = true
  bladeGroup.add(bladeVolume)

  const edgeCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(0.08, -0.55, 0.31), new THREE.Vector3(2.6, -0.54, 0.31), new THREE.Vector3(5.15, -0.47, 0.31), new THREE.Vector3(7.2, -0.18, 0.31), new THREE.Vector3(8.94, 0.02, 0.31)])
  const cuttingEdge = new THREE.Mesh(new THREE.TubeGeometry(edgeCurve, 72, 0.037, 8, false), edgeMaterial)
  cuttingEdge.name = 'sharpened-edge'
  bladeGroup.add(cuttingEdge)

  const loader = new THREE.TextureLoader()
  loader.load('/images/m9.jpg', (sourceTexture) => {
    sourceTexture.colorSpace = THREE.SRGBColorSpace
    sourceTexture.wrapS = THREE.ClampToEdgeWrapping
    sourceTexture.wrapT = THREE.ClampToEdgeWrapping
    sourceTexture.repeat.set(0.315, 0.32)
    sourceTexture.offset.set(0.37, 0.35)
    const projectionMaterial = new THREE.MeshBasicMaterial({ map: sourceTexture, transparent: true, opacity: 0.48, blending: THREE.AdditiveBlending, depthWrite: false })
    const frontProjection = new THREE.Mesh(new THREE.ShapeGeometry(bladeShape, 24), projectionMaterial)
    frontProjection.name = 'blade-reference-projection'
    frontProjection.position.z = 0.314
    bladeGroup.add(frontProjection)
  })
  model.add(bladeGroup)

  const guardGroup = new THREE.Group()
  guardGroup.name = 'guard'
  const guardStem = new THREE.Mesh(new THREE.BoxGeometry(0.32, 4.65, 0.82), guardMaterial)
  guardStem.position.set(-0.34, 0.16, 0)
  guardStem.castShadow = true
  guardGroup.add(guardStem)
  const guardBridge = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.48, 1.05), guardMaterial)
  guardBridge.position.set(-0.34, -0.2, 0)
  guardGroup.add(guardBridge)
  const guardRing = new THREE.Mesh(new THREE.TorusGeometry(0.67, 0.13, 12, 40), guardMaterial)
  guardRing.position.set(-0.31, 2.25, 0)
  guardRing.scale.set(0.82, 1.25, 1)
  guardRing.castShadow = true
  guardGroup.add(guardRing)
  model.add(guardGroup)

  const gripGroup = new THREE.Group()
  gripGroup.name = 'grip'
  const gripCore = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.92, 7.4, 36, 1), gripMaterial)
  gripCore.rotation.z = Math.PI / 2
  gripCore.position.set(-4.3, -0.08, 0)
  gripCore.castShadow = true
  gripGroup.add(gripCore)
  for (let index = 0; index < 8; index += 1) {
    const rib = new THREE.Mesh(new THREE.TorusGeometry(0.79 + index * 0.012, 0.095, 10, 32), gripRibMaterial)
    rib.rotation.y = Math.PI / 2
    rib.position.set(-7.37 + index * 0.86, -0.08, 0)
    rib.scale.set(1, 1.06, 0.93)
    rib.castShadow = true
    gripGroup.add(rib)
  }
  addRivet(gripGroup, -6.48, 0.08, pinMaterial)
  addRivet(gripGroup, -4.38, -0.02, pinMaterial)
  addRivet(gripGroup, -2.28, -0.08, pinMaterial)
  model.add(gripGroup)

  const pommelGroup = new THREE.Group()
  pommelGroup.name = 'pommel'
  const pommel = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.8, 1.18), guardMaterial)
  pommel.position.set(-8.28, -0.06, 0)
  pommel.castShadow = true
  pommelGroup.add(pommel)
  const pommelCap = new THREE.Mesh(new THREE.CylinderGeometry(0.54, 0.54, 0.7, 24), pinMaterial)
  pommelCap.rotation.z = Math.PI / 2
  pommelCap.position.set(-8.6, -0.06, 0)
  pommelGroup.add(pommelCap)
  model.add(pommelGroup)

  const homePositions = new Map<THREE.Object3D, THREE.Vector3>()
  ;[bladeGroup, guardGroup, gripGroup, pommelGroup].forEach((part) => homePositions.set(part, part.position.clone()))
  const pickables: THREE.Object3D[] = []
  ;[[bladeGroup, 'blade'], [guardGroup, 'guard'], [gripGroup, 'grip'], [pommelGroup, 'pommel']].forEach(([part, id]) => {
    const object = part as THREE.Object3D
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.userData.partId = id
        pickables.push(child)
      }
    })
  })

  scene.add(new THREE.HemisphereLight(0xc3d2ff, 0x07110f, 1.9))
  const key = new THREE.DirectionalLight(0xffffff, 3.1)
  key.position.set(-4, 7, 9)
  key.castShadow = true
  key.shadow.mapSize.set(1024, 1024)
  scene.add(key)
  const violetRim = new THREE.PointLight(0x7865ff, 42, 26, 2)
  violetRim.position.set(6, 2, 5)
  scene.add(violetRim)
  const cyanRim = new THREE.PointLight(0x27d9d0, 26, 20, 2)
  cyanRim.position.set(-8, -5, 4)
  scene.add(cyanRim)

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 40), new THREE.MeshStandardMaterial({ color: 0x07100e, roughness: 0.8, metalness: 0.12 }))
  floor.position.set(0, -5.4, -2.3)
  floor.rotation.x = -Math.PI / 2.3
  floor.receiveShadow = true
  scene.add(floor)

  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()
  let pointerDown = false
  let dragged = false
  let previousX = 0
  let previousY = 0
  let targetRotationX = world.rotation.x
  let targetRotationY = world.rotation.y
  let targetZoom = 22
  const updatePointer = (event: PointerEvent) => {
    const bounds = renderer.domElement.getBoundingClientRect()
    pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1
    pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1
  }
  const onPointerDown = (event: PointerEvent) => {
    pointerDown = true
    dragged = false
    previousX = event.clientX
    previousY = event.clientY
    renderer.domElement.setPointerCapture(event.pointerId)
  }
  const onPointerMove = (event: PointerEvent) => {
    if (!pointerDown) return
    const deltaX = event.clientX - previousX
    const deltaY = event.clientY - previousY
    if (Math.abs(deltaX) + Math.abs(deltaY) > 2) dragged = true
    targetRotationY += deltaX * 0.008
    targetRotationX = THREE.MathUtils.clamp(targetRotationX + deltaY * 0.006, -0.72, 0.56)
    previousX = event.clientX
    previousY = event.clientY
  }
  const onPointerUp = (event: PointerEvent) => {
    pointerDown = false
    renderer.domElement.releasePointerCapture(event.pointerId)
    if (dragged) return
    updatePointer(event)
    raycaster.setFromCamera(pointer, camera)
    const hit = raycaster.intersectObjects(pickables, false)[0]
    const id = hit?.object.userData.partId as string | undefined
    if (id) activePart.value = partLabels[id] ?? 'M9 刺刀'
  }
  const onWheel = (event: WheelEvent) => {
    event.preventDefault()
    targetZoom = THREE.MathUtils.clamp(targetZoom + event.deltaY * 0.009, 15.5, 29)
  }
  renderer.domElement.addEventListener('pointerdown', onPointerDown)
  renderer.domElement.addEventListener('pointermove', onPointerMove)
  renderer.domElement.addEventListener('pointerup', onPointerUp)
  renderer.domElement.addEventListener('wheel', onWheel, { passive: false })

  const resize = () => {
    const width = host.clientWidth
    const height = host.clientHeight
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
  }
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(host)
  resize()

  setExploded = (value) => {
    const scale = value ? 1.18 : 1
    homePositions.forEach((position, part) => {
      part.userData.explodeTarget = position.clone().multiplyScalar(scale)
    })
  }
  setExploded(false)
  resetCameraView = () => {
    targetRotationX = -0.05
    targetRotationY = -0.18
    targetZoom = 22
  }
  model.userData.sculptRuntime = { nodes: { blade: bladeGroup, guard: guardGroup, grip: gripGroup, pommel: pommelGroup }, setExploded, resetView: resetCameraView }

  const clock = new THREE.Clock()
  let animationFrame = 0
  const render = () => {
    const time = clock.getElapsedTime()
    world.rotation.x = THREE.MathUtils.lerp(world.rotation.x, targetRotationX, 0.09)
    world.rotation.y = THREE.MathUtils.lerp(world.rotation.y, targetRotationY, 0.09)
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZoom, 0.08)
    camera.lookAt(0, -0.04, 0)
    violetRim.intensity = 38 + Math.sin(time * 1.25) * 7
    cyanRim.intensity = 23 + Math.sin(time * 0.9 + 1) * 4
    guardRing.rotation.z = Math.sin(time * 0.35) * 0.025
    homePositions.forEach((position, part) => {
      const target = (part.userData.explodeTarget as THREE.Vector3) ?? position
      part.position.lerp(target, 0.075)
    })
    renderer.render(scene, camera)
    animationFrame = requestAnimationFrame(render)
  }
  render()

  onBeforeUnmount(() => {
    cancelAnimationFrame(animationFrame)
    resizeObserver.disconnect()
    renderer.domElement.removeEventListener('pointerdown', onPointerDown)
    renderer.domElement.removeEventListener('pointermove', onPointerMove)
    renderer.domElement.removeEventListener('pointerup', onPointerUp)
    renderer.domElement.removeEventListener('wheel', onWheel)
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose()
        const materials = Array.isArray(object.material) ? object.material : [object.material]
        materials.forEach((material) => material.dispose())
      }
    })
    roughnessMap.dispose()
    normalMap.dispose()
    gripRoughness.dispose()
    renderer.dispose()
    renderer.domElement.remove()
    setExploded = undefined
    resetCameraView = undefined
  })
})
</script>

<style lang="less" scoped>
.m9-stage { position: relative; width: 100%; height: 100vh; overflow: hidden; background: #06110f; color: #f2f7f6; font-family: "FZJuZhenXinFangS-R-GB", "Microsoft YaHei", sans-serif; }
.m9-stage__backdrop { position: absolute; inset: 0; background: radial-gradient(circle at 68% 42%, rgba(88, 71, 202, 0.3), transparent 27%), radial-gradient(circle at 20% 74%, rgba(18, 203, 175, 0.16), transparent 32%), linear-gradient(118deg, #07120f 0%, #0b1719 48%, #081110 100%); }
.m9-stage__backdrop::before, .m9-stage__backdrop::after { position: absolute; content: ""; border: 1px solid rgba(184, 225, 216, 0.08); border-radius: 50%; }
.m9-stage__backdrop::before { width: 62vw; height: 62vw; top: -34vw; right: -9vw; }
.m9-stage__backdrop::after { width: 44vw; height: 44vw; left: -17vw; bottom: -27vw; }
.m9-stage__canvas { position: absolute; inset: 0; z-index: 1; cursor: grab; }
.m9-stage__canvas:active { cursor: grabbing; }
.m9-stage__canvas :deep(canvas) { display: block; width: 100%; height: 100%; }
.m9-stage__header, .m9-stage__panel, .m9-stage__credit { position: absolute; z-index: 2; }
.m9-stage__header { top: 6.4%; left: 6.2%; pointer-events: none; }
.m9-stage__eyebrow, .m9-stage__panel-label, .m9-stage__credit { margin: 0; color: rgba(196, 231, 222, 0.58); font-size: 12px; letter-spacing: 0.17em; }
.m9-stage__header h1 { margin: 10px 0 6px; font-size: 38px; font-weight: 500; letter-spacing: 0.1em; }
.m9-stage__hint, .m9-stage__meta { margin: 0; color: rgba(226, 240, 237, 0.65); font-size: 14px; line-height: 1.7; }
.m9-stage__panel { right: 5.8%; bottom: 7%; width: 254px; box-sizing: border-box; padding: 21px 22px 20px; border: 1px solid rgba(211, 239, 234, 0.18); border-radius: 18px; background: rgba(8, 22, 20, 0.47); box-shadow: 0 20px 60px rgba(0, 0, 0, 0.22); backdrop-filter: blur(18px); }
.m9-stage__part { margin: 8px 0 4px; font-size: 20px; letter-spacing: 0.04em; }
.m9-stage__controls { display: flex; gap: 8px; margin-top: 18px; }
.m9-stage__controls button { flex: 1; padding: 9px 6px; border: 1px solid rgba(205, 239, 233, 0.25); border-radius: 8px; background: rgba(207, 243, 236, 0.07); color: #e8f8f3; cursor: pointer; font: inherit; font-size: 12px; transition: background 0.25s ease, transform 0.25s ease; }
.m9-stage__controls button:hover { background: rgba(84, 237, 190, 0.19); transform: translateY(-2px); }
.m9-stage__credit { left: 6.2%; bottom: 5.3%; }
</style>
