<template>
  <main id="pages_test">
    <div class="static-grid" aria-hidden="true"></div>
    <div class="background-light" aria-hidden="true"></div>

    <section class="hero-content">
      <p class="eyebrow">
        <span></span>
        HEXAGONAL CRYSTAL
      </p>
      <h1>让智能在绿色脉冲中<br />持续生长</h1>
      <p class="description">
        连续波纹与网格由时间驱动，透明六棱晶体可通过鼠标或触摸自由旋转。
      </p>

      <div class="glass-row">
        <article class="glass-card">
          <strong>绿色波纹场</strong>
          <span>翡翠渐变、静态网格与缓慢流动的光学波纹</span>
        </article>
        <article class="glass-card">
          <strong>六棱水晶</strong>
          <span>透明晶面、双端晶锥与 Three.js 拖动控制</span>
        </article>
      </div>
    </section>

    <section
      ref="prismHost"
      class="prism-stage"
      aria-label="可拖动旋转的绿色发光六棱水晶"
    >
      <div class="prism-halo" aria-hidden="true"></div>
      <div class="corner corner-top" aria-hidden="true"></div>
      <div class="corner corner-bottom" aria-hidden="true"></div>
      <p class="drag-hint">
        <span></span>
        按住拖动旋转
      </p>
    </section>
  </main>
</template>

<script setup lang="ts">
  import { onBeforeUnmount, onMounted, ref } from "vue";
  import type { WebGLRenderer } from "three";

  const prismHost = ref<HTMLElement | null>(null);

  let disposeScene: (() => void) | undefined;

  onMounted(async () => {
    const host = prismHost.value;
    if (!host) return;

    const threeModule = await import("../utils/prism-three").catch(() => null);

    if (!threeModule || !host.isConnected) {
      host.classList.add("render-unavailable");
      return;
    }

    const {
      ACESFilmicToneMapping,
      AdditiveBlending,
      AmbientLight,
      BufferAttribute,
      BufferGeometry,
      Clock,
      ConeGeometry,
      CylinderGeometry,
      DirectionalLight,
      DoubleSide,
      EdgesGeometry,
      Group,
      LineBasicMaterial,
      LineSegments,
      Mesh,
      MeshBasicMaterial,
      MeshPhysicalMaterial,
      PerspectiveCamera,
      PointLight,
      Points,
      PointsMaterial,
      Scene,
      ShaderMaterial,
      SRGBColorSpace,
      TorusGeometry,
      WebGLRenderer,
      OrbitControls,
    } = threeModule;

    let renderer: WebGLRenderer;

    try {
      renderer = new WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      host.classList.add("render-unavailable");
      return;
    }

    const scene = new Scene();
    const camera = new PerspectiveCamera(36, 1, 0.1, 100);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const clock = new Clock();
    const prismGroup = new Group();
    const orbitGroup = new Group();

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.domElement.setAttribute("aria-hidden", "true");
    renderer.domElement.className = "three-canvas";
    host.appendChild(renderer.domElement);

    camera.position.set(4.25, 2.8, 5.8);
    scene.add(prismGroup, orbitGroup);

    const prismGeometry = new CylinderGeometry(0.84, 0.84, 1.72, 6, 1);
    const tipGeometry = new ConeGeometry(0.84, 0.78, 6, 1);
    const coreGeometry = new CylinderGeometry(0.24, 0.24, 1.52, 6, 1);
    prismGeometry.rotateY(Math.PI / 6);
    tipGeometry.rotateY(Math.PI / 6);
    coreGeometry.rotateY(Math.PI / 6);

    const prismMaterial = new MeshPhysicalMaterial({
      color: 0x42ff9b,
      metalness: 0.08,
      roughness: 0.06,
      clearcoat: 1,
      clearcoatRoughness: 0.035,
      transmission: 0.38,
      thickness: 1.25,
      ior: 1.46,
      transparent: true,
      opacity: 0.9,
      emissive: 0x006b38,
      emissiveIntensity: 0.58,
      iridescence: 0.46,
      iridescenceIOR: 1.5,
      flatShading: true,
    });
    const coreMaterial = new MeshBasicMaterial({
      color: 0x39ff91,
      transparent: true,
      opacity: 0.24,
      blending: AdditiveBlending,
      depthWrite: false,
    });

    const prism = new Mesh(prismGeometry, prismMaterial);
    const topTip = new Mesh(tipGeometry, prismMaterial);
    const bottomTip = new Mesh(tipGeometry, prismMaterial);
    const crystalCore = new Mesh(coreGeometry, coreMaterial);
    topTip.position.y = 1.25;
    bottomTip.position.y = -1.25;
    bottomTip.rotation.x = Math.PI;
    prism.castShadow = true;
    prismGroup.add(prism, topTip, bottomTip, crystalCore);

    const glowMaterial = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      side: DoubleSide,
      vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewDirection;

      void main() {
        vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vViewDirection = normalize(-viewPosition.xyz);
        gl_Position = projectionMatrix * viewPosition;
      }
    `,
      fragmentShader: `
      varying vec3 vNormal;
      varying vec3 vViewDirection;

      void main() {
        float fresnel = pow(1.0 - abs(dot(vNormal, vViewDirection)), 2.35);
        vec3 glowColor = mix(vec3(0.0, 0.34, 0.13), vec3(0.34, 1.0, 0.58), fresnel);
        gl_FragColor = vec4(glowColor, fresnel * 0.92);
      }
    `,
    });

    const glowShell = new Mesh(prismGeometry, glowMaterial);
    const topGlow = new Mesh(tipGeometry, glowMaterial);
    const bottomGlow = new Mesh(tipGeometry, glowMaterial);
    glowShell.scale.setScalar(1.028);
    topGlow.position.copy(topTip.position);
    topGlow.scale.setScalar(1.028);
    bottomGlow.position.copy(bottomTip.position);
    bottomGlow.rotation.copy(bottomTip.rotation);
    bottomGlow.scale.setScalar(1.028);
    prismGroup.add(glowShell, topGlow, bottomGlow);

    const edgeGeometry = new EdgesGeometry(prismGeometry, 14);
    const tipEdgeGeometry = new EdgesGeometry(tipGeometry, 14);
    const edgeMaterial = new LineBasicMaterial({
      color: 0x7dffad,
      transparent: true,
      opacity: 0.82,
      blending: AdditiveBlending,
    });
    const edges = new LineSegments(edgeGeometry, edgeMaterial);
    const topEdges = new LineSegments(tipEdgeGeometry, edgeMaterial);
    const bottomEdges = new LineSegments(tipEdgeGeometry, edgeMaterial);
    edges.scale.setScalar(1.008);
    topEdges.position.copy(topTip.position);
    topEdges.scale.setScalar(1.008);
    bottomEdges.position.copy(bottomTip.position);
    bottomEdges.rotation.copy(bottomTip.rotation);
    bottomEdges.scale.setScalar(1.008);
    prismGroup.add(edges, topEdges, bottomEdges);

    const ringMaterial = new MeshBasicMaterial({
      color: 0x5dff9c,
      transparent: true,
      opacity: 0.24,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    const ringMaterialSoft = ringMaterial.clone();
    ringMaterialSoft.opacity = 0.1;

    const ringGeometry = new TorusGeometry(1.54, 0.007, 8, 128);
    const ringGeometryLarge = new TorusGeometry(1.88, 0.004, 8, 128);
    const ringOne = new Mesh(ringGeometry, ringMaterial);
    const ringTwo = new Mesh(ringGeometryLarge, ringMaterialSoft);
    ringOne.rotation.set(1.18, 0.12, 0.46);
    ringTwo.rotation.set(0.48, 1.08, -0.28);
    orbitGroup.add(ringOne, ringTwo);

    const particleCount = 90;
    const particlePositions = new Float32Array(particleCount * 3);

    for (let index = 0; index < particleCount; index += 1) {
      const radius = 1.45 + Math.random() * 1.15;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const offset = index * 3;

      particlePositions[offset] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[offset + 1] = radius * Math.cos(phi) * 0.82;
      particlePositions[offset + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }

    const particleGeometry = new BufferGeometry();
    particleGeometry.setAttribute(
      "position",
      new BufferAttribute(particlePositions, 3),
    );

    const particleMaterial = new PointsMaterial({
      color: 0x75ffae,
      size: 0.025,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.42,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    const particles = new Points(particleGeometry, particleMaterial);
    orbitGroup.add(particles);

    scene.add(new AmbientLight(0x4b9a70, 0.82));

    const keyLight = new DirectionalLight(0xc4ffda, 4.5);
    keyLight.position.set(3.5, 4, 4);
    scene.add(keyLight);

    const rimLight = new PointLight(0x00ff88, 22, 12, 2);
    rimLight.position.set(-3, 1.2, 2.8);
    scene.add(rimLight);

    const lowerLight = new PointLight(0x65ffa4, 13, 10, 2);
    lowerLight.position.set(1.8, -3.5, 1.5);
    scene.add(lowerLight);

    prismGroup.rotation.set(0.22, -0.3, 0.16);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.rotateSpeed = 0.62;
    controls.autoRotate = !reducedMotion.matches;
    controls.autoRotateSpeed = 0.72;
    controls.minPolarAngle = Math.PI * 0.22;
    controls.maxPolarAngle = Math.PI * 0.78;
    controls.target.set(0, 0, 0);
    controls.update();

    const onControlStart = () => host.classList.add("is-dragging");
    const onControlEnd = () => host.classList.remove("is-dragging");
    controls.addEventListener("start", onControlStart);
    controls.addEventListener("end", onControlEnd);

    const resize = () => {
      const bounds = host.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;

      renderer.setSize(bounds.width, bounds.height, false);
      camera.aspect = bounds.width / bounds.height;
      camera.updateProjectionMatrix();
    };

    const render = () => {
      const elapsed = clock.getElapsedTime();
      controls.update();

      if (!reducedMotion.matches) {
        prismGroup.position.y = Math.sin(elapsed * 0.85) * 0.085;
        prismGroup.rotation.z = 0.16 + Math.sin(elapsed * 0.46) * 0.035;
        orbitGroup.rotation.y = elapsed * 0.055;
        orbitGroup.rotation.z = Math.sin(elapsed * 0.24) * 0.08;
        particles.rotation.x = elapsed * 0.025;
        crystalCore.rotation.y = -elapsed * 0.22;
      }

      renderer.render(scene, camera);
    };

    const onVisibilityChange = () => {
      renderer.setAnimationLoop(document.hidden ? null : render);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    document.addEventListener("visibilitychange", onVisibilityChange);
    resize();
    renderer.setAnimationLoop(render);

    disposeScene = () => {
      renderer.setAnimationLoop(null);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      controls.removeEventListener("start", onControlStart);
      controls.removeEventListener("end", onControlEnd);
      controls.dispose();
      resizeObserver.disconnect();

      prismGeometry.dispose();
      tipGeometry.dispose();
      coreGeometry.dispose();
      edgeGeometry.dispose();
      tipEdgeGeometry.dispose();
      ringGeometry.dispose();
      ringGeometryLarge.dispose();
      particleGeometry.dispose();
      prismMaterial.dispose();
      coreMaterial.dispose();
      glowMaterial.dispose();
      edgeMaterial.dispose();
      ringMaterial.dispose();
      ringMaterialSoft.dispose();
      particleMaterial.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  });

  onBeforeUnmount(() => disposeScene?.());

  useHead({
    title: "绿色六棱水晶空间",
  });
</script>

<style scoped lang="less">
  #pages_test {
    position: relative;
    width: 100%;
    height: 100vh;
    min-height: 100vh;
    overflow: hidden;
    isolation: isolate;
    color: #eafff1;
    background:
      radial-gradient(
        circle at 84% 10%,
        rgba(46, 255, 135, 0.18),
        transparent 27%
      ),
      radial-gradient(
        circle at 13% 72%,
        rgba(0, 204, 105, 0.13),
        transparent 30%
      ),
      linear-gradient(180deg, #0a2818 0%, #061c11 54%, #03150c 100%);
  }

  .static-grid,
  .background-light {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .static-grid {
    z-index: 0;
    opacity: 0.76;
    background-image:
      linear-gradient(rgba(102, 255, 162, 0.062) 1px, transparent 1px),
      linear-gradient(90deg, rgba(102, 255, 162, 0.062) 1px, transparent 1px);
    background-position: center top;
    background-size: 106px 106px;
    mask-image: linear-gradient(
      to bottom,
      #000 0%,
      rgba(0, 0, 0, 0.88) 58%,
      transparent 96%
    );
    -webkit-mask-image: linear-gradient(
      to bottom,
      #000 0%,
      rgba(0, 0, 0, 0.88) 58%,
      transparent 96%
    );
  }

  .background-light {
    z-index: 1;
    overflow: hidden;
    background:
      linear-gradient(106deg, rgba(92, 255, 153, 0.055) 0%, transparent 38%),
      radial-gradient(
        ellipse at 58% 42%,
        rgba(31, 244, 121, 0.085),
        transparent 45%
      );
  }

  .background-light::before,
  .background-light::after {
    position: absolute;
    border-radius: 50%;
    opacity: 0.62;
    filter: blur(9px);
    content: "";
    will-change: transform, opacity;
  }

  .background-light::before {
    top: 22%;
    left: -16%;
    width: 78vw;
    height: 72vw;
    background: repeating-radial-gradient(
      ellipse at center,
      transparent 0 9%,
      rgba(54, 255, 137, 0.11) 10%,
      rgba(7, 99, 52, 0.035) 11.5%,
      transparent 14% 21%
    );
    transform: rotate(-13deg) scale(1.18, 0.46);
    animation: ripple-drift 11s ease-in-out infinite alternate;
  }

  .background-light::after {
    top: -31%;
    right: -22%;
    width: 72vw;
    height: 68vw;
    background: repeating-radial-gradient(
      ellipse at center,
      transparent 0 8%,
      rgba(92, 255, 157, 0.1) 9.5%,
      rgba(8, 139, 67, 0.04) 11%,
      transparent 13.5% 20%
    );
    transform: rotate(18deg) scale(1.15, 0.52);
    animation: ripple-drift-reverse 14s ease-in-out infinite alternate;
  }

  .hero-content {
    position: relative;
    z-index: 3;
    width: min(1180px, calc(100% - 64px));
    margin: 0 auto;
    padding: clamp(180px, 22vh, 250px) 0 140px;
  }

  .eyebrow {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0 0 28px;
    color: rgba(169, 255, 201, 0.58);
    font-size: 12px;
    font-weight: 650;
    letter-spacing: 0.2em;
  }

  .eyebrow span {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #62ff9f;
    box-shadow:
      0 0 0 6px rgba(51, 255, 132, 0.1),
      0 0 24px rgba(50, 255, 132, 0.72);
  }

  h1 {
    max-width: 650px;
    margin: 0;
    font-size: clamp(38px, 4.5vw, 64px);
    font-weight: 420;
    line-height: 1.12;
    letter-spacing: -0.055em;
    text-wrap: balance;
    white-space: nowrap;
    text-shadow: 0 16px 56px rgba(32, 255, 123, 0.08);
  }

  .description {
    max-width: 570px;
    margin: 28px 0 0;
    color: rgba(187, 240, 207, 0.65);
    font-size: clamp(16px, 1.8vw, 20px);
    line-height: 1.75;
  }

  .glass-row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
    width: min(650px, 100%);
    margin-top: 62px;
  }

  .glass-card {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 104px;
    padding: 24px 26px;
    border: 1px solid rgba(99, 255, 158, 0.14);
    border-radius: 24px;
    background: rgba(11, 92, 50, 0.16);
    box-shadow:
      inset 0 1px 0 rgba(159, 255, 194, 0.08),
      0 24px 70px rgba(0, 38, 19, 0.32);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  .glass-card strong {
    color: rgba(219, 255, 232, 0.94);
    font-size: 17px;
  }

  .glass-card span {
    color: rgba(172, 230, 194, 0.58);
    font-size: 14px;
    line-height: 1.65;
  }

  .prism-stage {
    position: absolute;
    z-index: 4;
    top: clamp(64px, 8vh, 105px);
    right: clamp(24px, 5vw, 90px);
    width: clamp(380px, 38vw, 560px);
    aspect-ratio: 1;
    overflow: visible;
    cursor: grab;
    touch-action: none;
  }

  .prism-stage.is-dragging {
    cursor: grabbing;
  }

  .prism-stage :deep(.three-canvas) {
    position: absolute;
    inset: 0;
    z-index: 2;
    width: 100%;
    height: 100%;
    outline: none;
  }

  .prism-halo {
    position: absolute;
    z-index: 0;
    inset: 18%;
    border-radius: 50%;
    background: rgba(27, 255, 119, 0.11);
    box-shadow:
      0 0 80px 26px rgba(26, 255, 118, 0.1),
      0 0 180px 68px rgba(0, 205, 93, 0.055);
    filter: blur(24px);
    pointer-events: none;
  }

  .corner {
    position: absolute;
    z-index: 3;
    width: 54px;
    height: 54px;
    opacity: 0.2;
    pointer-events: none;
  }

  .corner-top {
    top: 14%;
    right: 12%;
    border-top: 1px solid #67ffa2;
    border-right: 1px solid #67ffa2;
  }

  .corner-bottom {
    bottom: 15%;
    left: 12%;
    border-bottom: 1px solid #67ffa2;
    border-left: 1px solid #67ffa2;
  }

  .drag-hint {
    position: absolute;
    z-index: 4;
    right: 50%;
    bottom: 8%;
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    color: rgba(170, 255, 201, 0.5);
    font-size: 12px;
    letter-spacing: 0.08em;
    transform: translateX(50%);
    pointer-events: none;
  }

  .drag-hint span {
    width: 18px;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(83, 255, 148, 0.8));
    box-shadow: 0 0 8px rgba(54, 255, 132, 0.5);
  }

  .render-unavailable::after {
    position: absolute;
    inset: 35% 20% auto;
    z-index: 5;
    color: rgba(174, 255, 204, 0.64);
    font-size: 13px;
    line-height: 1.7;
    text-align: center;
    content: "当前浏览器无法初始化 WebGL";
  }

  @keyframes ripple-drift {
    0% {
      opacity: 0.42;
      transform: translate3d(-3%, 1%, 0) rotate(-13deg) scale(1.12, 0.42);
    }

    52% {
      opacity: 0.7;
      transform: translate3d(7%, -4%, 0) rotate(-9deg) scale(1.24, 0.51);
    }

    100% {
      opacity: 0.5;
      transform: translate3d(12%, 3%, 0) rotate(-15deg) scale(1.18, 0.46);
    }
  }

  @keyframes ripple-drift-reverse {
    0% {
      opacity: 0.34;
      transform: translate3d(4%, -2%, 0) rotate(18deg) scale(1.08, 0.48);
    }

    55% {
      opacity: 0.64;
      transform: translate3d(-8%, 5%, 0) rotate(13deg) scale(1.22, 0.56);
    }

    100% {
      opacity: 0.46;
      transform: translate3d(-13%, -1%, 0) rotate(20deg) scale(1.15, 0.52);
    }
  }

  @media (max-width: 980px) {
    .hero-content {
      width: min(100% - 40px, 680px);
      padding: 90px 0 90px;
    }

    .prism-stage {
      position: relative;
      top: auto;
      right: auto;
      z-index: 4;
      width: min(520px, calc(100% - 20px));
      margin: -36px auto 34px;
    }

    h1 {
      max-width: 680px;
    }
  }

  @media (max-width: 620px) {
    .static-grid {
      background-size: 68px 68px;
    }

    .hero-content {
      width: min(100% - 32px, 520px);
      padding-top: 76px;
    }

    h1 {
      font-size: clamp(30px, 9.4vw, 44px);
    }

    .glass-row {
      grid-template-columns: 1fr;
      gap: 12px;
      margin-top: 44px;
    }

    .glass-card {
      min-height: 86px;
      padding: 21px;
      border-radius: 20px;
    }

    .prism-stage {
      width: min(440px, calc(100% - 8px));
      margin-top: -24px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .background-light::before,
    .background-light::after {
      animation: none;
    }

    .drag-hint {
      opacity: 0.7;
    }
  }
</style>
