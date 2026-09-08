import chinaMap from "@svg-maps/china";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";

export type MapMode = "traffic" | "risk";

export interface MapProvince {
  id: string;
  name: string;
  value: number;
}

export interface ChinaMapScene {
  reset: () => void;
  resize: () => void;
  setMode: (mode: MapMode) => void;
  setRunning: (running: boolean) => void;
  setSelected: (id: string) => void;
  setSpeed: (speed: number) => void;
  dispose: () => void;
}

interface Flow {
  curve: THREE.QuadraticBezierCurve3;
  dot: THREE.Mesh;
  line: THREE.Group;
  offset: number;
  speed: number;
  type: "normal" | "risk";
}

interface Options {
  provinces: MapProvince[];
  onHover: (province: MapProvince | null, point?: { x: number; y: number }) => void;
  onSelect: (id: string) => void;
}

const SCALE = 0.018;
const CAMERA_HOME = new THREE.Vector3(0, -1.25, 17.6);

export function createChinaMapScene(host: HTMLElement, options: Options): ChinaMapScene {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(37, 1, 0.1, 100);
  const controls = new OrbitControls(camera, renderer.domElement);
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const provinceMeshes: THREE.Mesh[] = [];
  const meshGroups = new Map<string, THREE.Mesh[]>();
  const centers = new Map<string, THREE.Vector3>();
  const flows: Flow[] = [];
  const provinceById = new Map(options.provinces.map((item) => [item.id, item]));
  const maxValue = Math.max(...options.provinces.map((item) => item.value));
  let selectedId = "shanghai";
  let hoveredId = "";
  let speed = 1;
  let running = true;
  let mode: MapMode = "traffic";
  let frame = 0;
  let pointerStart = { x: 0, y: 0 };

  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  renderer.domElement.className = "china-map-canvas";
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.appendChild(renderer.domElement);

  camera.position.copy(CAMERA_HOME);
  controls.enableDamping = true;
  controls.dampingFactor = 0.075;
  controls.enablePan = false;
  controls.minDistance = 11;
  controls.maxDistance = 25;
  controls.minPolarAngle = 0.68;
  controls.maxPolarAngle = 2.4;

  scene.add(new THREE.AmbientLight(0x62cfe6, 1.55));
  const keyLight = new THREE.DirectionalLight(0xb1f7ff, 4.6);
  keyLight.position.set(-5, 8, 12);
  const rimLight = new THREE.PointLight(0xff7555, 34, 24, 2);
  rimLight.position.set(6, -4, 8);
  scene.add(keyLight, rimLight);

  const mapGroup = new THREE.Group();
  mapGroup.scale.set(SCALE, -SCALE, SCALE);
  mapGroup.position.set(-774 * SCALE * 0.5, 569 * SCALE * 0.5, 0);
  mapGroup.rotation.x = -0.075;
  scene.add(mapGroup);

  const colorFor = (id: string) => {
    const ratio = (provinceById.get(id)?.value || 180000) / maxValue;
    return new THREE.Color().setHSL(0.53 - ratio * 0.055, 0.73, 0.2 + ratio * 0.14);
  };

  const svgLoader = new SVGLoader();
  const locations = [
    ...chinaMap.locations,
    {
      id: "taiwan",
      name: "Taiwan",
      path: "M657 468C666 477 668 493 664 506C661 517 655 527 650 522C645 515 644 501 646 489C648 478 652 470 657 468Z",
    },
  ];

  locations.forEach((location) => {
    const parsed = svgLoader.parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${location.path}" /></svg>`);
    const shapes = parsed.paths.flatMap((path) => path.toShapes());
    const provinceBox = new THREE.Box3();
    const meshes: THREE.Mesh[] = [];
    const baseColor = colorFor(location.id);

    shapes.forEach((shape) => {
      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: 8,
        bevelEnabled: true,
        bevelSegments: 1,
        bevelSize: 0.55,
        bevelThickness: 0.55,
        curveSegments: 2,
        steps: 1,
      });
      geometry.computeVertexNormals();
      geometry.computeBoundingBox();
      if (geometry.boundingBox) provinceBox.union(geometry.boundingBox);
      const top = new THREE.MeshStandardMaterial({
        color: baseColor.clone(), emissive: baseColor.clone(), emissiveIntensity: 0.32,
        metalness: 0.42, roughness: 0.48, transparent: true, opacity: 0.98,
      });
      const side = new THREE.MeshStandardMaterial({
        color: baseColor.clone().multiplyScalar(0.46), emissive: baseColor.clone(),
        emissiveIntensity: 0.16, metalness: 0.3, roughness: 0.64,
      });
      const mesh = new THREE.Mesh(geometry, [top, side]);
      mesh.userData.provinceId = location.id;
      mesh.userData.targetZ = 0;
      mapGroup.add(mesh);
      provinceMeshes.push(mesh);
      meshes.push(mesh);
    });

    meshGroups.set(location.id, meshes);
    if (!provinceBox.isEmpty()) {
      const center = provinceBox.getCenter(new THREE.Vector3());
      center.z = 0;
      centers.set(location.id, center);
    }
  });

  const refreshMaterials = () => {
    meshGroups.forEach((meshes, id) => {
      const selected = selectedId === id;
      const hovered = hoveredId === id;
      meshes.forEach((mesh) => {
        mesh.userData.targetZ = hovered ? 7 : selected ? 4 : 0;
        const materials = mesh.material as THREE.MeshStandardMaterial[];
        const base = colorFor(id);
        materials[0].color.copy(base).offsetHSL(0, 0.08, hovered || selected ? 0.13 : 0);
        materials[0].emissive.copy(base);
        materials[0].emissiveIntensity = hovered ? 1.05 : selected ? 0.72 : 0.32;
        materials[1].color.copy(base).multiplyScalar(0.46);
        materials[1].emissive.copy(base);
        materials[1].emissiveIntensity = hovered ? 0.5 : 0.16;
      });
    });
  };

  const flowGroup = new THREE.Group();
  mapGroup.add(flowGroup);

  const addFlow = (from: string, to: string, color: number, offset: number, type: Flow["type"]) => {
    const start = centers.get(from);
    const end = centers.get(to);
    if (!start || !end) return;
    const middle = start.clone().lerp(end, 0.5);
    middle.z = 24 + start.distanceTo(end) * 0.16;
    const curve = new THREE.QuadraticBezierCurve3(start.clone().setZ(11), middle, end.clone().setZ(12));
    const arc = new THREE.Group();
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 72, type === "risk" ? 0.9 : 0.58, 8, false),
      new THREE.MeshBasicMaterial({
        color, transparent: true, opacity: type === "risk" ? 0.48 : 0.24,
        blending: THREE.AdditiveBlending, depthWrite: false,
      }),
    );
    const coreGeometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(72));
    const coreMaterial = new THREE.LineDashedMaterial({
      color, transparent: true, opacity: type === "risk" ? 0.76 : 0.48,
      dashSize: 7, gapSize: 3.5, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const core = new THREE.Line(coreGeometry, coreMaterial);
    core.computeLineDistances();
    arc.add(tube, core);
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(type === "risk" ? 2.6 : 2, 12, 12),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.98, blending: THREE.AdditiveBlending, depthWrite: false }),
    );
    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(type === "risk" ? 5.2 : 4, 12, 12),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending, depthWrite: false }),
    );
    dot.add(halo);
    flowGroup.add(arc, dot);
    flows.push({ curve, dot, line: arc, offset, speed: 0.068 + offset * 0.022, type });
  };

  const routes: Array<[string, string, number, number, Flow["type"]]> = [
    ["beijing", "shanghai", 0x58ecff, 0.04, "normal"],
    ["guangdong", "shanghai", 0x58ecff, 0.1, "normal"],
    ["sichuan", "shanghai", 0x58ecff, 0.16, "normal"],
    ["heilongjiang", "beijing", 0x58ecff, 0.22, "normal"],
    ["xinjiang-uygur", "shaanxi", 0x58ecff, 0.28, "normal"],
    ["hubei", "guangdong", 0x58ecff, 0.34, "normal"],
    ["yunnan", "guangdong", 0x58ecff, 0.4, "normal"],
    ["gansu", "beijing", 0x58ecff, 0.46, "normal"],
    ["xizang", "sichuan", 0x58ecff, 0.52, "normal"],
    ["hainan", "guangdong", 0x58ecff, 0.58, "normal"],
    ["liaoning", "beijing", 0x58ecff, 0.64, "normal"],
    ["jilin", "shanghai", 0x58ecff, 0.7, "normal"],
    ["nei-mongol", "beijing", 0x58ecff, 0.76, "normal"],
    ["shaanxi", "hubei", 0x58ecff, 0.82, "normal"],
    ["henan", "shanghai", 0x58ecff, 0.88, "normal"],
    ["hunan", "guangdong", 0x58ecff, 0.94, "normal"],
    ["guizhou", "zhejiang", 0x58ecff, 0.2, "normal"],
    ["guangxi-zhuang", "shanghai", 0x58ecff, 0.48, "normal"],
    ["quinghai", "beijing", 0x58ecff, 0.72, "normal"],
    ["taiwan", "fujian", 0x58ecff, 0.9, "normal"],
    ["zhejiang", "beijing", 0xff7456, 0.12, "risk"],
    ["shandong", "shanghai", 0xff7456, 0.38, "risk"],
    ["jiangxi", "guangdong", 0xff7456, 0.62, "risk"],
    ["hebei", "shanghai", 0xff7456, 0.86, "risk"],
  ];
  routes.forEach((route) => addFlow(...route));

  const nodeMaterial = new THREE.MeshBasicMaterial({
    color: 0x68eaff, transparent: true, opacity: 0.5,
    blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
  });
  const nodeIds = [...new Set(routes.flatMap(([from, to]) => [from, to]))];
  nodeIds.forEach((id) => {
    const center = centers.get(id);
    if (!center) return;
    const node = new THREE.Group();
    const ringOne = new THREE.Mesh(new THREE.RingGeometry(2.5, 3.4, 24), nodeMaterial.clone());
    const ringTwo = new THREE.Mesh(new THREE.RingGeometry(4.2, 4.7, 24), nodeMaterial.clone());
    ringTwo.material.opacity = 0.16;
    node.position.copy(center).setZ(10.5);
    node.add(ringOne, ringTwo);
    flowGroup.add(node);
  });

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(350, 410, 64),
    new THREE.MeshBasicMaterial({ color: 0x1bb9df, transparent: true, opacity: 0.05, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  ring.position.set(387, 284.5, -7);
  flowGroup.add(ring);

  const stars = new Float32Array(300);
  for (let index = 0; index < stars.length; index += 3) {
    stars[index] = (Math.random() - 0.5) * 28;
    stars[index + 1] = (Math.random() - 0.5) * 18;
    stars[index + 2] = -1 - Math.random() * 7;
  }
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute("position", new THREE.BufferAttribute(stars, 3));
  scene.add(new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0x54dfff, size: 0.035, transparent: true, opacity: 0.55, depthWrite: false })));

  const resize = () => {
    const width = Math.max(1, host.clientWidth);
    const height = Math.max(1, host.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  const hitTest = (event: PointerEvent) => {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(provinceMeshes, false)[0];
    const id = hit?.object.userData.provinceId || "";
    if (id !== hoveredId) {
      hoveredId = id;
      refreshMaterials();
    }
    renderer.domElement.style.cursor = id ? "pointer" : "grab";
    options.onHover(provinceById.get(id) || null, {
      x: Math.min(rect.width - 150, Math.max(12, event.clientX - rect.left + 16)),
      y: Math.min(rect.height - 82, Math.max(12, event.clientY - rect.top - 24)),
    });
  };

  const clearHover = () => {
    hoveredId = "";
    options.onHover(null);
    refreshMaterials();
  };
  const pointerDown = (event: PointerEvent) => { pointerStart = { x: event.clientX, y: event.clientY }; };
  const pointerUp = (event: PointerEvent) => {
    if (hoveredId && Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) < 6) {
      options.onSelect(hoveredId);
    }
  };

  renderer.domElement.addEventListener("pointermove", hitTest);
  renderer.domElement.addEventListener("pointerleave", clearHover);
  renderer.domElement.addEventListener("pointerdown", pointerDown);
  renderer.domElement.addEventListener("pointerup", pointerUp);
  refreshMaterials();
  resize();

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const render = (time: number) => {
    controls.update();
    provinceMeshes.forEach((mesh) => {
      mesh.position.z += ((mesh.userData.targetZ || 0) - mesh.position.z) * 0.12;
    });
    if (running && !reducedMotion) {
      const seconds = time * 0.001;
      flows.forEach((flow) => {
        const progress = (seconds * flow.speed * speed + flow.offset) % 1;
        flow.dot.position.copy(flow.curve.getPoint(progress));
        flow.dot.scale.setScalar(0.78 + Math.sin(seconds * 7 + flow.offset * 10) * 0.22);
      });
    }
    renderer.render(scene, camera);
    frame = requestAnimationFrame(render);
  };
  frame = requestAnimationFrame(render);

  return {
    reset() {
      camera.position.copy(CAMERA_HOME);
      controls.target.set(0, 0, 0);
      controls.update();
    },
    resize,
    setMode(nextMode) {
      mode = nextMode;
      flows.forEach((flow) => {
        const visible = mode === "traffic" || flow.type === "risk";
        flow.line.visible = visible;
        flow.dot.visible = visible;
      });
    },
    setRunning(value) { running = value; },
    setSelected(id) { selectedId = id; refreshMaterials(); },
    setSpeed(value) { speed = value; },
    dispose() {
      cancelAnimationFrame(frame);
      controls.dispose();
      renderer.domElement.removeEventListener("pointermove", hitTest);
      renderer.domElement.removeEventListener("pointerleave", clearHover);
      renderer.domElement.removeEventListener("pointerdown", pointerDown);
      renderer.domElement.removeEventListener("pointerup", pointerUp);
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        mesh.geometry?.dispose?.();
        const materials = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
        materials.forEach((material) => material.dispose());
      });
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}
