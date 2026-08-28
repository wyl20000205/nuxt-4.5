import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  AmbientLight,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CatmullRomCurve3,
  Color,
  DoubleSide,
  DynamicDrawUsage,
  FogExp2,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  Line,
  LineBasicMaterial,
  LinearFilter,
  LoadingManager,
  Matrix4,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  OctahedronGeometry,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Points,
  PointsMaterial,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  TorusGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";

type SceneOptions = {
  duration?: number;
  chapters?: number;
  onLoop?: () => void;
  onProgress?: (progress: number) => void;
  onLoadProgress?: (progress: number) => void;
  onReady?: () => void;
};

type ModelRecord = {
  group: Group;
  core: Mesh;
  shell: Mesh;
  ringA: Mesh;
  ringB: Mesh;
  start: Vector3;
  target: Vector3;
  color: Color;
  delay: number;
};

type RouteRecord = {
  line: Line;
  curve: CatmullRomCurve3;
  packet: Mesh;
  delay: number;
};

type PanelRecord = {
  mesh: Mesh<PlaneGeometry, MeshBasicMaterial>;
  start: Vector3;
  target: Vector3;
  delay: number;
  tilt: number;
};

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const range = (value: number, start: number, end: number) =>
  clamp((value - start) / (end - start));
const easeOut = (value: number) => 1 - Math.pow(1 - clamp(value), 3);
const smooth = (value: number) => {
  const x = clamp(value);
  return x * x * (3 - 2 * x);
};

const createSeededRandom = (seed = 9187) => {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
};

const createPanelTexture = (
  eyebrow: string,
  headline: string,
  detail: string,
  accent: string,
) => {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 360;
  const context = canvas.getContext("2d");
  if (!context) return new CanvasTexture(canvas);

  const gradient = context.createLinearGradient(0, 0, 1024, 360);
  gradient.addColorStop(0, "rgba(20,22,34,.96)");
  gradient.addColorStop(1, "rgba(7,9,15,.92)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 1024, 360);

  context.strokeStyle = "rgba(193,198,230,.22)";
  context.lineWidth = 2;
  context.strokeRect(2, 2, 1020, 356);

  context.fillStyle = accent;
  context.fillRect(54, 54, 10, 10);
  context.shadowColor = accent;
  context.shadowBlur = 18;
  context.fillRect(54, 54, 10, 10);
  context.shadowBlur = 0;

  context.font = '600 27px "PingFang SC", "Microsoft YaHei", Arial';
  context.letterSpacing = "3px";
  context.fillStyle = "rgba(181,187,220,.52)";
  context.fillText(eyebrow, 88, 73);

  context.font = '600 48px "PingFang SC", "Microsoft YaHei", Consolas, monospace';
  context.letterSpacing = "0px";
  context.fillStyle = "rgba(247,248,255,.92)";
  context.fillText(headline, 54, 166);

  context.font = '500 24px "PingFang SC", "Microsoft YaHei", Arial';
  context.fillStyle = "rgba(174,181,214,.42)";
  context.fillText(detail, 54, 226);

  context.fillStyle = "rgba(160,166,199,.12)";
  context.fillRect(54, 279, 850, 3);
  context.fillStyle = accent;
  context.fillRect(54, 279, 330, 3);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
};

const createModelLabelTexture = (
  provider: string,
  name: string,
  accent: string,
  caption = "统一入口  /  凭证已接入",
) => {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 250;
  const context = canvas.getContext("2d");
  if (!context) return new CanvasTexture(canvas);

  const gradient = context.createLinearGradient(0, 0, 768, 250);
  gradient.addColorStop(0, "rgba(18,20,31,.94)");
  gradient.addColorStop(1, "rgba(9,11,18,.75)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 768, 250);
  context.strokeStyle = "rgba(196,201,231,.2)";
  context.lineWidth = 2;
  context.strokeRect(2, 2, 764, 246);
  context.fillStyle = accent;
  context.fillRect(34, 34, 8, 8);
  context.font = '600 26px "PingFang SC", "Microsoft YaHei", Arial';
  context.fillStyle = "rgba(173,179,211,.46)";
  context.fillText(provider, 60, 52);
  context.font = '700 58px "PingFang SC", "Microsoft YaHei", Arial';
  context.fillStyle = "rgba(247,248,255,.94)";
  context.fillText(name, 34, 130);
  context.font = '500 23px "PingFang SC", "Microsoft YaHei", Consolas, monospace';
  context.fillStyle = "rgba(159,166,201,.36)";
  context.fillText(caption, 34, 190);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
};

type DataConsoleConfig = {
  title: string;
  subtitle: string;
  metrics: Array<{ label: string; value: string; accent: string }>;
  rows: Array<{ name: string; detail: string; status: string; accent: string }>;
  signals: Array<{ label: string; value: string; amount: number; accent: string }>;
};

const createDataConsoleTexture = (config: DataConsoleConfig) => {
  const canvas = document.createElement("canvas");
  canvas.width = 1600;
  canvas.height = 980;
  const context = canvas.getContext("2d");
  if (!context) return new CanvasTexture(canvas);

  const background = context.createLinearGradient(0, 0, 1600, 980);
  background.addColorStop(0, "rgba(15,18,30,.97)");
  background.addColorStop(0.55, "rgba(8,11,20,.96)");
  background.addColorStop(1, "rgba(4,6,12,.98)");
  context.fillStyle = background;
  context.fillRect(0, 0, 1600, 980);
  context.strokeStyle = "rgba(183,190,225,.2)";
  context.lineWidth = 3;
  context.strokeRect(3, 3, 1594, 974);

  context.fillStyle = "#8e7bff";
  context.fillRect(64, 62, 12, 12);
  context.shadowColor = "rgba(125,98,255,.7)";
  context.shadowBlur = 20;
  context.fillRect(64, 62, 12, 12);
  context.shadowBlur = 0;
  context.font = '700 30px "PingFang SC", "Microsoft YaHei", Arial';
  context.fillStyle = "rgba(238,240,250,.92)";
  context.fillText(config.title, 96, 84);
  context.font = '500 20px "PingFang SC", "Microsoft YaHei", Arial';
  context.fillStyle = "rgba(165,172,205,.43)";
  context.fillText(config.subtitle, 96, 120);
  context.font = "600 18px Consolas, monospace";
  context.textAlign = "right";
  context.fillStyle = "rgba(101,220,255,.58)";
  context.fillText("LIVE  /  数据实时同步", 1534, 84);
  context.textAlign = "left";

  config.metrics.forEach((metric, index) => {
    const x = 64 + index * 496;
    context.fillStyle = "rgba(255,255,255,.032)";
    context.fillRect(x, 168, 458, 142);
    context.fillStyle = metric.accent;
    context.fillRect(x, 168, 458, 4);
    context.font = '500 20px "PingFang SC", "Microsoft YaHei", Arial';
    context.fillStyle = "rgba(165,173,206,.46)";
    context.fillText(metric.label, x + 28, 213);
    context.font = "600 42px Consolas, monospace";
    context.fillStyle = "rgba(246,248,255,.92)";
    context.fillText(metric.value, x + 28, 275);
  });

  context.fillStyle = "rgba(255,255,255,.023)";
  context.fillRect(64, 350, 952, 532);
  context.fillStyle = "rgba(220,224,240,.72)";
  context.font = '600 22px "PingFang SC", "Microsoft YaHei", Arial';
  context.fillText("资源状态", 96, 402);
  context.font = "500 17px Consolas, monospace";
  context.fillStyle = "rgba(151,159,194,.32)";
  context.fillText("NAME", 96, 445);
  context.fillText("CHANNEL", 446, 445);
  context.fillText("STATUS", 838, 445);

  config.rows.forEach((row, index) => {
    const y = 482 + index * 91;
    context.strokeStyle = "rgba(180,187,218,.075)";
    context.beginPath();
    context.moveTo(96, y + 54);
    context.lineTo(982, y + 54);
    context.stroke();
    context.fillStyle = row.accent;
    context.fillRect(96, y + 2, 8, 8);
    context.font = '600 21px "PingFang SC", "Microsoft YaHei", Arial';
    context.fillStyle = "rgba(226,229,242,.76)";
    context.fillText(row.name, 124, y + 13);
    context.font = "500 18px Consolas, monospace";
    context.fillStyle = "rgba(166,173,205,.43)";
    context.fillText(row.detail, 446, y + 13);
    context.fillStyle = row.accent;
    context.fillText(row.status, 838, y + 13);
  });

  context.fillStyle = "rgba(255,255,255,.023)";
  context.fillRect(1050, 350, 486, 532);
  context.fillStyle = "rgba(220,224,240,.72)";
  context.font = '600 22px "PingFang SC", "Microsoft YaHei", Arial';
  context.fillText("实时指标", 1082, 402);
  config.signals.forEach((signal, index) => {
    const y = 480 + index * 116;
    context.font = '500 19px "PingFang SC", "Microsoft YaHei", Arial';
    context.fillStyle = "rgba(175,182,212,.52)";
    context.fillText(signal.label, 1082, y);
    context.font = "600 19px Consolas, monospace";
    context.textAlign = "right";
    context.fillStyle = signal.accent;
    context.fillText(signal.value, 1492, y);
    context.textAlign = "left";
    context.fillStyle = "rgba(180,187,218,.09)";
    context.fillRect(1082, y + 24, 410, 10);
    context.fillStyle = signal.accent;
    context.fillRect(1082, y + 24, 410 * clamp(signal.amount), 10);
  });

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
};

const createDashboardTexture = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 1600;
  canvas.height = 980;
  const context = canvas.getContext("2d");
  if (!context) return new CanvasTexture(canvas);

  const panelGradient = context.createLinearGradient(0, 0, 1600, 980);
  panelGradient.addColorStop(0, "rgba(18,20,32,.98)");
  panelGradient.addColorStop(1, "rgba(5,7,13,.97)");
  context.fillStyle = panelGradient;
  context.fillRect(0, 0, 1600, 980);
  context.strokeStyle = "rgba(185,191,226,.22)";
  context.lineWidth = 3;
  context.strokeRect(3, 3, 1594, 974);

  context.fillStyle = "#8e7bff";
  context.fillRect(64, 62, 12, 12);
  context.font = '700 30px "PingFang SC", "Microsoft YaHei", Arial';
  context.fillStyle = "rgba(237,239,249,.9)";
  context.fillText("统一调用控制台", 96, 84);
  context.font = '500 20px "PingFang SC", "Microsoft YaHei", Arial';
  context.fillStyle = "rgba(165,172,205,.42)";
  context.fillText("智能选路、故障切换与统一计费实时同步", 96, 120);

  const cards = [
    ["调用总量", "128,406", "#8f7cff"],
    ["路由成功率", "99.99%", "#53d9ff"],
    ["切换耗时", "42 ms", "#ff9a69"],
    ["统一费用", "¥ 914.72", "#72e6bd"],
  ];
  cards.forEach(([label, value, color], index) => {
    const x = 64 + index * 370;
    context.fillStyle = "rgba(255,255,255,.035)";
    context.fillRect(x, 170, 336, 150);
    context.fillStyle = color;
    context.fillRect(x, 170, 336, 4);
    context.font = '500 21px "PingFang SC", "Microsoft YaHei", Arial';
    context.fillStyle = "rgba(168,176,207,.48)";
    context.fillText(label, x + 28, 216);
    context.font = "600 38px Consolas, monospace";
    context.fillStyle = "rgba(246,247,253,.92)";
    context.fillText(value, x + 28, 278);
  });

  context.fillStyle = "rgba(255,255,255,.026)";
  context.fillRect(64, 360, 988, 522);
  context.font = '600 23px "PingFang SC", "Microsoft YaHei", Arial';
  context.fillStyle = "rgba(222,225,239,.72)";
  context.fillText("请求延迟趋势", 96, 410);
  for (let index = 0; index < 6; index += 1) {
    const y = 466 + index * 66;
    context.strokeStyle = "rgba(180,186,215,.08)";
    context.beginPath();
    context.moveTo(96, y);
    context.lineTo(1015, y);
    context.stroke();
  }
  const chartGradient = context.createLinearGradient(100, 0, 1000, 0);
  chartGradient.addColorStop(0, "#755fff");
  chartGradient.addColorStop(1, "#53d9ff");
  context.strokeStyle = chartGradient;
  context.lineWidth = 7;
  context.shadowColor = "rgba(97,111,255,.65)";
  context.shadowBlur = 22;
  context.beginPath();
  context.moveTo(98, 790);
  const chartValues = [730, 754, 650, 690, 566, 604, 488, 520, 430, 458, 386, 412, 318];
  chartValues.forEach((value, index) => context.lineTo(98 + index * 74, value));
  context.stroke();
  context.shadowBlur = 0;

  context.fillStyle = "rgba(255,255,255,.026)";
  context.fillRect(1084, 360, 452, 522);
  context.fillStyle = "rgba(222,225,239,.72)";
  context.font = '600 23px "PingFang SC", "Microsoft YaHei", Arial';
  context.fillText("线路健康度", 1116, 410);
  const providers = [
    ["主线路", 0.96, "#8f7cff"],
    ["备用线路", 0.82, "#ff9a69"],
    ["模型响应", 0.91, "#53d9ff"],
    ["计费同步", 0.99, "#72e6bd"],
  ];
  providers.forEach(([name, amount, color], index) => {
    const y = 480 + index * 92;
    context.font = "600 21px Arial";
    context.fillStyle = "rgba(215,219,236,.66)";
    context.fillText(String(name), 1116, y);
    context.fillStyle = "rgba(180,187,218,.1)";
    context.fillRect(1116, y + 24, 350, 12);
    context.fillStyle = String(color);
    context.fillRect(1116, y + 24, 350 * Number(amount), 12);
  });

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
};

export const initFragmentedScene = (
  host: HTMLElement,
  options: SceneOptions = {},
) => {
  const duration = options.duration ?? 10;
  const chapterCount = Math.max(1, options.chapters ?? 1);
  const scene = new Scene();
  scene.background = new Color(0x030409);
  scene.fog = new FogExp2(0x05060b, 0.047);

  const camera = new PerspectiveCamera(46, 1, 0.1, 80);
  camera.position.set(0, 0.25, 13.5);

  const renderer = new WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.24;
  renderer.domElement.className = "fragmented-webgl";
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.appendChild(renderer.domElement);

  const composer = new EffectComposer(renderer);
  composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const renderPass = new RenderPass(scene, camera);
  const bloomPass = new UnrealBloomPass(new Vector2(1, 1), 1.28, 0.72, 0.17);
  composer.addPass(renderPass);
  composer.addPass(bloomPass);

  const cinematicPass = new ShaderPass({
    uniforms: {
      tDiffuse: { value: null },
      uTime: { value: 0 },
      uChaos: { value: 0 },
      uImpact: { value: 0 },
      uTransition: { value: 1 },
      uResolution: { value: new Vector2(1, 1) },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform float uTime;
      uniform float uChaos;
      uniform float uImpact;
      uniform float uTransition;
      uniform vec2 uResolution;
      varying vec2 vUv;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      void main() {
        vec2 centered = vUv - 0.5;
        float radial = length(centered);
        float split = (0.0012 + uChaos * 0.0065) * (0.35 + radial);
        vec2 direction = normalize(centered + vec2(0.0001));
        float red = texture2D(tDiffuse, vUv + direction * split).r;
        float green = texture2D(tDiffuse, vUv).g;
        float blue = texture2D(tDiffuse, vUv - direction * split).b;
        vec3 color = vec3(red, green, blue);
        float scan = sin(vUv.y * uResolution.y * 0.72 + uTime * 8.0) * 0.018;
        float noise = (hash(vUv * uResolution.xy + uTime) - 0.5) * (0.018 + uChaos * 0.045);
        float vignette = smoothstep(0.82, 0.2, radial);
        color = color * (0.9 + vignette * 0.15) + scan + noise;
        color += vec3(0.72, 0.82, 1.0) * uImpact;
        color = mix(color, vec3(0.004, 0.003, 0.014), uTransition * 0.96);
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });
  composer.addPass(cinematicPass);

  const root = new Group();
  const modelLayer = new Group();
  const routeLayer = new Group();
  const panelLayer = new Group();
  const tokenLayer = new Group();
  const tunnelLayer = new Group();
  scene.add(root);
  root.add(tunnelLayer, modelLayer, routeLayer, panelLayer, tokenLayer);

  const connectionGroup = new Group();
  const routingGroup = new Group();
  const manageGroup = new Group();
  const scaleGroup = new Group();
  const brandGroup = new Group();
  connectionGroup.visible = false;
  routingGroup.visible = false;
  manageGroup.visible = false;
  scaleGroup.visible = false;
  brandGroup.visible = false;
  scene.add(connectionGroup, routingGroup, manageGroup, scaleGroup, brandGroup);

  scene.add(new AmbientLight(0x5c5d78, 0.45));
  const violetLight = new PointLight(0x806cff, 34, 22, 2);
  violetLight.position.set(3.5, 3, 5);
  scene.add(violetLight);
  const cyanLight = new PointLight(0x35cbff, 26, 18, 2);
  cyanLight.position.set(-4.5, -2.2, 3);
  scene.add(cyanLight);
  const redLight = new PointLight(0xff496f, 12, 13, 2);
  redLight.position.set(0, -0.5, 4);
  scene.add(redLight);

  const random = createSeededRandom();
  let assetsReady = false;
  let firstFrameRendered = false;
  let readyEmitted = false;
  const loadingManager = new LoadingManager();
  loadingManager.onStart = () => options.onLoadProgress?.(0);
  loadingManager.onProgress = (_url, loaded, total) => {
    options.onLoadProgress?.(total > 0 ? loaded / total : 0);
  };
  loadingManager.onLoad = () => {
    assetsReady = true;
    options.onLoadProgress?.(1);
  };
  loadingManager.onError = () => {
    options.onLoadProgress?.(1);
  };
  const textureLoader = new TextureLoader(loadingManager);
  const textures: Texture[] = [];
  const geometries = new Set<BufferGeometry>();
  const materials = new Set<
    MeshBasicMaterial | MeshPhysicalMaterial | LineBasicMaterial | PointsMaterial | SpriteMaterial | ShaderMaterial
  >();

  const rememberGeometry = <T extends BufferGeometry>(geometry: T) => {
    geometries.add(geometry);
    return geometry;
  };
  const rememberMaterial = <
    T extends MeshBasicMaterial | MeshPhysicalMaterial | LineBasicMaterial | PointsMaterial | SpriteMaterial | ShaderMaterial,
  >(material: T) => {
    materials.add(material);
    return material;
  };

  const tunnelGeometry = rememberGeometry(new TorusGeometry(5.3, 0.014, 5, 6));
  const tunnelVioletMaterial = rememberMaterial(
    new MeshBasicMaterial({
      color: 0x765fff,
      transparent: true,
      opacity: 0.14,
      blending: AdditiveBlending,
      depthWrite: false,
    }),
  );
  const tunnelCyanMaterial = rememberMaterial(
    new MeshBasicMaterial({
      color: 0x43d7ff,
      transparent: true,
      opacity: 0.08,
      blending: AdditiveBlending,
      depthWrite: false,
    }),
  );
  const tunnelGates: Mesh<TorusGeometry, MeshBasicMaterial>[] = [];
  for (let index = 0; index < 22; index += 1) {
    const gate = new Mesh(
      tunnelGeometry,
      index % 4 === 0 ? tunnelCyanMaterial : tunnelVioletMaterial,
    );
    gate.position.z = 5 - index * 2.35;
    gate.rotation.z = index * 0.17;
    gate.scale.setScalar(0.72 + index * 0.016);
    gate.userData.offset = index * 2.35;
    tunnelLayer.add(gate);
    tunnelGates.push(gate);
  }

  const shardCount = 220;
  const shardGeometry = rememberGeometry(new BoxGeometry(0.038, 0.038, 1));
  const shardMaterial = rememberMaterial(
    new MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.56,
      blending: AdditiveBlending,
      depthWrite: false,
    }),
  );
  const dataShards = new InstancedMesh(shardGeometry, shardMaterial, shardCount);
  dataShards.instanceMatrix.setUsage(DynamicDrawUsage);
  dataShards.frustumCulled = false;
  const shardData: Array<{ angle: number; radius: number; depth: number; speed: number; length: number }> = [];
  const shardMatrix = new Matrix4();
  const shardColor = new Color();
  for (let index = 0; index < shardCount; index += 1) {
    shardData.push({
      angle: random() * Math.PI * 2,
      radius: 2.1 + random() * 5.2,
      depth: random() * 42,
      speed: 4.8 + random() * 7.5,
      length: 0.35 + random() * 2.7,
    });
    shardColor.set(index % 5 === 0 ? 0x4edbff : index % 3 === 0 ? 0xa38fff : 0x6f5cff);
    dataShards.setColorAt(index, shardColor);
  }
  dataShards.instanceColor!.needsUpdate = true;
  tunnelLayer.add(dataShards);

  const starCount = 1800;
  const starPositions = new Float32Array(starCount * 3);
  const starColors = new Float32Array(starCount * 3);
  for (let index = 0; index < starCount; index += 1) {
    const offset = index * 3;
    starPositions[offset] = (random() - 0.5) * 34;
    starPositions[offset + 1] = (random() - 0.5) * 20;
    starPositions[offset + 2] = (random() - 0.5) * 30 - 5;
    const violet = random() > 0.72;
    starColors[offset] = violet ? 0.46 : 0.23;
    starColors[offset + 1] = violet ? 0.37 : 0.68;
    starColors[offset + 2] = violet ? 1 : 0.86;
  }
  const starGeometry = rememberGeometry(new BufferGeometry());
  starGeometry.setAttribute("position", new BufferAttribute(starPositions, 3));
  starGeometry.setAttribute("color", new BufferAttribute(starColors, 3));
  const starMaterial = rememberMaterial(
    new PointsMaterial({
      size: 0.035,
      vertexColors: true,
      transparent: true,
      opacity: 0.46,
      blending: AdditiveBlending,
      depthWrite: false,
    }),
  );
  const stars = new Points(starGeometry, starMaterial);
  scene.add(stars);

  const dustCount = 460;
  const dustPositions = new Float32Array(dustCount * 3);
  const dustStarts: Vector3[] = [];
  const dustEnds: Vector3[] = [];
  const dustOffsets: number[] = [];

  const modelDefinitions = [
    { name: "GPT", provider: "OPENAI", icon: "/images/gpt.png", color: 0x8b7cff, target: new Vector3(4.5, 2.45, -0.7), start: new Vector3(11, 6.4, -8), delay: 0.05 },
    { name: "CLAUDE", provider: "ANTHROPIC", icon: "/images/claude.png", color: 0xff9a69, target: new Vector3(-3.65, 1.15, 0.7), start: new Vector3(-10, 5.1, -7), delay: 0.105 },
    { name: "DEEPSEEK", provider: "DEEPSEEK", icon: "/images/deepseek.png", color: 0x52d5ff, target: new Vector3(4.1, -2.35, 0.15), start: new Vector3(10.4, -6.1, -7), delay: 0.16 },
    { name: "GROK", provider: "XAI", icon: "/images/grok.png", color: 0xe8ebff, target: new Vector3(-3.5, -2.6, -0.45), start: new Vector3(-9.2, -6.4, -8), delay: 0.215 },
  ];

  const modelRecords: ModelRecord[] = [];
  const routeRecords: RouteRecord[] = [];
  const smallSphereGeometry = rememberGeometry(new SphereGeometry(0.065, 10, 10));

  for (const definition of modelDefinitions) {
    const color = new Color(definition.color);
    const group = new Group();
    group.position.copy(definition.start);
    group.scale.setScalar(0.001);

    const coreGeometry = rememberGeometry(new IcosahedronGeometry(0.48, 1));
    const coreMaterial = rememberMaterial(
      new MeshPhysicalMaterial({
        color: color.clone().multiplyScalar(0.36),
        emissive: color,
        emissiveIntensity: 1.55,
        metalness: 0.42,
        roughness: 0.18,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        transparent: true,
        opacity: 0.95,
      }),
    );
    const core = new Mesh(coreGeometry, coreMaterial);

    const shellGeometry = rememberGeometry(new IcosahedronGeometry(0.72, 1));
    const shellMaterial = rememberMaterial(
      new MeshBasicMaterial({
        color,
        wireframe: true,
        transparent: true,
        opacity: 0.42,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    );
    const shell = new Mesh(shellGeometry, shellMaterial);

    const ringGeometryA = rememberGeometry(new TorusGeometry(0.9, 0.012, 7, 84));
    const ringGeometryB = rememberGeometry(new TorusGeometry(1.08, 0.007, 6, 72));
    const ringMaterial = rememberMaterial(
      new MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.4,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    );
    const ringMaterialB = rememberMaterial(ringMaterial.clone());
    ringMaterialB.opacity = 0.2;
    const ringA = new Mesh(ringGeometryA, ringMaterial);
    const ringB = new Mesh(ringGeometryB, ringMaterialB);
    ringA.rotation.set(Math.PI * 0.5, 0.2, 0.42);
    ringB.rotation.set(0.35, Math.PI * 0.5, -0.2);

    const labelTexture = createModelLabelTexture(
      definition.provider,
      definition.name,
      `#${color.getHexString()}`,
    );
    textures.push(labelTexture);
    const labelMaterial = rememberMaterial(
      new SpriteMaterial({
        map: labelTexture,
        transparent: true,
        opacity: 0.84,
        depthWrite: false,
      }),
    );
    const label = new Sprite(labelMaterial);
    label.scale.set(2.55, 0.83, 1);
    label.position.set(0, -1.26, 0.18);

    const iconMaterial = rememberMaterial(
      new SpriteMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    );
    const icon = new Sprite(iconMaterial);
    icon.scale.set(0.62, 0.62, 1);
    icon.position.set(0, 0, 0.6);
    textureLoader.load(
      definition.icon,
      (texture) => {
        texture.colorSpace = SRGBColorSpace;
        textures.push(texture);
        iconMaterial.map = texture;
        iconMaterial.opacity = 0.88;
        iconMaterial.needsUpdate = true;
      },
      undefined,
      () => undefined,
    );

    group.add(core, shell, ringA, ringB, label, icon);
    modelLayer.add(group);
    modelRecords.push({
      group,
      core,
      shell,
      ringA,
      ringB,
      start: definition.start,
      target: definition.target,
      color,
      delay: definition.delay,
    });

    const end = definition.target.clone().normalize().multiplyScalar(1.72);
    const midpoint = definition.target.clone().lerp(end, 0.52);
    midpoint.z += definition.target.x > 0 ? 0.75 : -0.5;
    const curve = new CatmullRomCurve3([definition.target.clone(), midpoint, end]);
    const linePoints = curve.getPoints(96);
    const lineGeometry = rememberGeometry(new BufferGeometry().setFromPoints(linePoints));
    lineGeometry.setDrawRange(0, 0);
    const lineMaterial = rememberMaterial(
      new LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    );
    const line = new Line(lineGeometry, lineMaterial);
    const packetMaterial = rememberMaterial(
      new MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    );
    const packet = new Mesh(smallSphereGeometry, packetMaterial);
    routeLayer.add(line, packet);
    routeRecords.push({ line, curve, packet, delay: definition.delay + 0.17 });
  }

  for (let index = 0; index < dustCount; index += 1) {
    const modelIndex = index % modelDefinitions.length;
    const source = modelDefinitions[modelIndex].target;
    const start = source.clone().add(
      new Vector3(
        (random() - 0.5) * 1.3,
        (random() - 0.5) * 1.3,
        (random() - 0.5) * 1.3,
      ),
    );
    const end = source.clone().normalize().multiplyScalar(1.52 + random() * 0.28);
    dustStarts.push(start);
    dustEnds.push(end);
    dustOffsets.push(random());
    const offset = index * 3;
    dustPositions[offset] = start.x;
    dustPositions[offset + 1] = start.y;
    dustPositions[offset + 2] = start.z;
  }
  const dustGeometry = rememberGeometry(new BufferGeometry());
  const dustAttribute = new BufferAttribute(dustPositions, 3);
  dustGeometry.setAttribute("position", dustAttribute);
  const dustMaterial = rememberMaterial(
    new PointsMaterial({
      color: 0xa493ff,
      size: 0.06,
      transparent: true,
      opacity: 0,
      blending: AdditiveBlending,
      depthWrite: false,
    }),
  );
  const tokenDust = new Points(dustGeometry, dustMaterial);
  tokenLayer.add(tokenDust);

  const voidGroup = new Group();
  const voidSphereGeometry = rememberGeometry(new IcosahedronGeometry(1.05, 2));
  const voidSphereMaterial = rememberMaterial(
    new MeshBasicMaterial({
      color: 0x010106,
      transparent: true,
      opacity: 0.98,
      depthWrite: true,
    }),
  );
  const voidSphere = new Mesh(voidSphereGeometry, voidSphereMaterial);
  const energyGeometry = rememberGeometry(new IcosahedronGeometry(1.28, 5));
  const energyMaterial = rememberMaterial(
    new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uChaos: { value: 0 },
        uReveal: { value: 0 },
        uColorA: { value: new Color(0x6d52ff) },
        uColorB: { value: new Color(0x49ddff) },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uChaos;
        varying vec3 vNormalView;
        varying vec3 vViewPosition;
        varying float vWave;

        void main() {
          float wave = sin(position.y * 7.0 + uTime * 3.2) * 0.035;
          wave += sin(position.x * 10.0 - uTime * 4.1) * 0.018 * uChaos;
          vec3 transformed = position + normal * wave;
          vec4 viewPosition = modelViewMatrix * vec4(transformed, 1.0);
          vNormalView = normalize(normalMatrix * normal);
          vViewPosition = -viewPosition.xyz;
          vWave = wave;
          gl_Position = projectionMatrix * viewPosition;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uChaos;
        uniform float uReveal;
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        varying vec3 vNormalView;
        varying vec3 vViewPosition;
        varying float vWave;

        void main() {
          float fresnel = pow(1.0 - max(dot(normalize(vNormalView), normalize(vViewPosition)), 0.0), 2.1);
          float bands = 0.5 + 0.5 * sin((vViewPosition.y + vWave * 12.0) * 12.0 - uTime * 5.0);
          vec3 color = mix(uColorA, uColorB, fresnel + bands * 0.2);
          float alpha = (fresnel * 0.11 + bands * 0.014 + uChaos * 0.018) * uReveal;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
      side: DoubleSide,
    }),
  );
  const energyShell = new Mesh(energyGeometry, energyMaterial);
  energyShell.scale.setScalar(1.08);
  const voidWireMaterial = rememberMaterial(
    new MeshBasicMaterial({
      color: 0x8a78ff,
      wireframe: true,
      transparent: true,
      opacity: 0.08,
      blending: AdditiveBlending,
      depthWrite: false,
    }),
  );
  const voidWire = new Mesh(voidSphereGeometry, voidWireMaterial);
  voidWire.scale.setScalar(1.16);
  voidGroup.add(voidSphere, energyShell, voidWire);

  const voidRings: Mesh[] = [];
  for (let index = 0; index < 7; index += 1) {
    const geometry = rememberGeometry(
      new TorusGeometry(1.45 + index * 0.26, 0.009 + index * 0.002, 6, 112),
    );
    const material = rememberMaterial(
      new MeshBasicMaterial({
        color: index % 2 === 0 ? 0x806cff : 0x43cfff,
        transparent: true,
        opacity: 0.085 - index * 0.01,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    );
    const ring = new Mesh(geometry, material);
    ring.rotation.set(0.5 + index * 0.38, 0.28 + index * 0.57, index * 0.3);
    voidGroup.add(ring);
    voidRings.push(ring);
  }

  const coreFragmentGeometry = rememberGeometry(new OctahedronGeometry(0.12, 0));
  const coreFragmentMaterial = rememberMaterial(
    new MeshBasicMaterial({
      color: 0xa99cff,
      transparent: true,
      opacity: 0.46,
      blending: AdditiveBlending,
      depthWrite: false,
    }),
  );
  const coreFragments: Mesh<OctahedronGeometry, MeshBasicMaterial>[] = [];
  for (let index = 0; index < 36; index += 1) {
    const fragment = new Mesh(coreFragmentGeometry, coreFragmentMaterial);
    fragment.userData.angle = random() * Math.PI * 2;
    fragment.userData.radius = 1.45 + random() * 2.7;
    fragment.userData.height = (random() - 0.5) * 3.6;
    fragment.userData.speed = 0.18 + random() * 0.34;
    fragment.scale.setScalar(0.45 + random() * 1.8);
    voidGroup.add(fragment);
    coreFragments.push(fragment);
  }
  voidGroup.scale.setScalar(0.001);
  root.add(voidGroup);

  const panelDefinitions = [
    { eyebrow: "统一请求 01", headline: "提交 /v1/对话生成", detail: "统一密钥 · 鉴权已通过", accent: "#8b7cff", start: new Vector3(-9, 4.3, -8), target: new Vector3(-4.4, 3.35, 1.2), delay: 0.16, tilt: -0.1 },
    { eyebrow: "访问凭证", headline: "密钥 ···· 8F2A", detail: "一个密钥连接多家主流模型", accent: "#ff9670", start: new Vector3(9, 4.2, -9), target: new Vector3(4.9, 3.7, -0.6), delay: 0.25, tilt: 0.08 },
    { eyebrow: "令牌流", headline: "18,492 枚令牌", detail: "全部模型用量实时汇总", accent: "#55d5ff", start: new Vector3(-9, -4.6, -7), target: new Vector3(-4.6, -3.45, 0.4), delay: 0.38, tilt: 0.06 },
    { eyebrow: "模型能力", headline: "六家模型已连接", detail: "统一格式 · 统一鉴权 · 统一响应", accent: "#ff9a69", start: new Vector3(9, -4.7, -8), target: new Vector3(4.9, -3.55, -0.2), delay: 0.46, tilt: -0.08 },
    { eyebrow: "线路切换", headline: "备用线路已接管", detail: "模型受限时自动完成切换", accent: "#72e6bd", start: new Vector3(0, -7, -10), target: new Vector3(0.4, -3.2, 2.1), delay: 0.57, tilt: 0.02 },
    { eyebrow: "统一账单", headline: "一份调用明细", detail: "全部令牌费用集中可见", accent: "#a08fff", start: new Vector3(0, 7, -10), target: new Vector3(-0.3, 3.4, 1.8), delay: 0.64, tilt: -0.02 },
  ];

  const panelRecords: PanelRecord[] = [];
  for (const definition of panelDefinitions) {
    const texture = createPanelTexture(
      definition.eyebrow,
      definition.headline,
      definition.detail,
      definition.accent,
    );
    textures.push(texture);
    const geometry = rememberGeometry(new PlaneGeometry(3.85, 1.35));
    const material = rememberMaterial(
      new MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0,
        side: DoubleSide,
        depthWrite: false,
      }),
    );
    const mesh = new Mesh(geometry, material);
    mesh.position.copy(definition.start);
    panelLayer.add(mesh);
    panelRecords.push({
      mesh,
      start: definition.start,
      target: definition.target,
      delay: definition.delay,
      tilt: definition.tilt,
    });
  }

  const chapterNodeCoreGeometry = rememberGeometry(new IcosahedronGeometry(0.43, 2));
  const chapterNodeShellGeometry = rememberGeometry(new IcosahedronGeometry(0.68, 1));
  const chapterNodeRingGeometry = rememberGeometry(new TorusGeometry(0.84, 0.011, 6, 72));

  const createExperienceNode = (
    definition: (typeof modelDefinitions)[number],
    caption: string,
  ) => {
    const color = new Color(definition.color);
    const group = new Group();
    const coreMaterial = rememberMaterial(
      new MeshPhysicalMaterial({
        color: color.clone().multiplyScalar(0.4),
        emissive: color,
        emissiveIntensity: 1.45,
        metalness: 0.52,
        roughness: 0.16,
        clearcoat: 1,
        transparent: true,
        opacity: 0.96,
      }),
    );
    const core = new Mesh(chapterNodeCoreGeometry, coreMaterial);
    const shellMaterial = rememberMaterial(
      new MeshBasicMaterial({
        color,
        wireframe: true,
        transparent: true,
        opacity: 0.34,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    );
    const shell = new Mesh(chapterNodeShellGeometry, shellMaterial);
    const ringMaterial = rememberMaterial(
      new MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.32,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    );
    const ring = new Mesh(chapterNodeRingGeometry, ringMaterial);
    ring.rotation.set(0.7, 0.3, 0.1);

    const labelTexture = createModelLabelTexture(
      definition.provider,
      definition.name,
      `#${color.getHexString()}`,
      caption,
    );
    textures.push(labelTexture);
    const labelMaterial = rememberMaterial(
      new SpriteMaterial({ map: labelTexture, transparent: true, opacity: 0.82, depthWrite: false }),
    );
    const label = new Sprite(labelMaterial);
    label.scale.set(2.35, 0.76, 1);
    label.position.set(0, -1.08, 0.15);

    const iconMaterial = rememberMaterial(
      new SpriteMaterial({ transparent: true, opacity: 0.9, depthWrite: false }),
    );
    const icon = new Sprite(iconMaterial);
    icon.scale.set(0.56, 0.56, 1);
    icon.position.z = 0.56;
    textureLoader.load(definition.icon, (texture) => {
      texture.colorSpace = SRGBColorSpace;
      texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
      textures.push(texture);
      iconMaterial.map = texture;
      iconMaterial.needsUpdate = true;
    });

    group.add(core, shell, ring, label, icon);
    return { group, core, shell, ring, coreMaterial, shellMaterial, ringMaterial, labelMaterial, iconMaterial };
  };

  const createImageSprite = (path: string, width: number, height = width) => {
    const material = rememberMaterial(
      new SpriteMaterial({ transparent: true, opacity: 0, depthWrite: false }),
    );
    const sprite = new Sprite(material);
    sprite.scale.set(width, height, 1);
    textureLoader.load(path, (texture) => {
      texture.colorSpace = SRGBColorSpace;
      texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
      textures.push(texture);
      material.map = texture;
      material.needsUpdate = true;
    });
    return { sprite, material };
  };

  const createFlow = (
    parent: Group,
    points: Vector3[],
    color: number,
  ) => {
    const curve = new CatmullRomCurve3(points);
    const geometry = rememberGeometry(new BufferGeometry().setFromPoints(curve.getPoints(128)));
    geometry.setDrawRange(0, 0);
    const lineMaterial = rememberMaterial(
      new LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    );
    const line = new Line(geometry, lineMaterial);
    const packetMaterial = rememberMaterial(
      new MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    );
    const packet = new Mesh(smallSphereGeometry, packetMaterial);
    parent.add(line, packet);
    return { curve, line, lineMaterial, packet, packetMaterial };
  };

  const createDataConsole = (
    parent: Group,
    config: DataConsoleConfig,
    position: Vector3,
    rotationY: number,
  ) => {
    const texture = createDataConsoleTexture(config);
    textures.push(texture);
    const material = rememberMaterial(
      new MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0,
        side: DoubleSide,
        depthWrite: false,
      }),
    );
    const screen = new Mesh(
      rememberGeometry(new PlaneGeometry(10.4, 6.37)),
      material,
    );
    screen.position.copy(position);
    screen.rotation.set(-0.055, rotationY, 0.018);

    const scanMaterial = rememberMaterial(
      new MeshBasicMaterial({
        color: 0x58d9ff,
        transparent: true,
        opacity: 0,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    );
    const scan = new Mesh(
      rememberGeometry(new PlaneGeometry(9.95, 0.024)),
      scanMaterial,
    );
    scan.position.set(0, -2.9, 0.035);
    screen.add(scan);
    parent.add(screen);
    return { screen, material, scan, scanMaterial, basePosition: position.clone() };
  };

  const connectionConsole = createDataConsole(
    connectionGroup,
    {
      title: "多模型接入台",
      subtitle: "一次接入，多家 AI 供应商同步完成",
      metrics: [
        { label: "已接入供应商", value: "06", accent: "#8f7cff" },
        { label: "统一接口", value: "01", accent: "#53d9ff" },
        { label: "适配完成度", value: "100%", accent: "#72e6bd" },
      ],
      rows: [
        { name: "DeepSeek", detail: "/v1/chat/completions", status: "已连接", accent: "#53d9ff" },
        { name: "通义千问", detail: "/v1/chat/completions", status: "已连接", accent: "#8f7cff" },
        { name: "豆包", detail: "/v1/chat/completions", status: "已连接", accent: "#ff9a69" },
        { name: "智谱 GLM", detail: "/v1/chat/completions", status: "已连接", accent: "#72e6bd" },
      ],
      signals: [
        { label: "供应商连接", value: "6 / 6", amount: 1, accent: "#53d9ff" },
        { label: "协议转换", value: "READY", amount: 0.94, accent: "#8f7cff" },
        { label: "凭证通道", value: "ENCRYPTED", amount: 0.88, accent: "#72e6bd" },
      ],
    },
    new Vector3(0.55, -0.25, -3.5),
    -0.1,
  );

  const connectionHub = new Group();
  const connectionHubGeometry = rememberGeometry(new OctahedronGeometry(0.96, 3));
  const connectionHubMaterial = rememberMaterial(
    new MeshBasicMaterial({
      color: 0x010106,
      transparent: true,
      opacity: 0.98,
      depthWrite: true,
    }),
  );
  const connectionHubCore = new Mesh(connectionHubGeometry, connectionHubMaterial);
  const connectionHubWireMaterial = rememberMaterial(
    new MeshBasicMaterial({ color: 0x56d9ff, wireframe: true, transparent: true, opacity: 0.12, blending: AdditiveBlending, depthWrite: false }),
  );
  const connectionHubWire = new Mesh(connectionHubGeometry, connectionHubWireMaterial);
  connectionHubWire.scale.setScalar(1.22);
  const connectionLogo = createImageSprite("/images/logo.png", 0.86);
  connectionLogo.sprite.position.z = 1.02;
  connectionHub.add(connectionHubCore, connectionHubWire, connectionLogo.sprite);
  const connectionHubRings: Mesh<TorusGeometry, MeshBasicMaterial>[] = [];
  for (let index = 0; index < 5; index += 1) {
    const geometry = rememberGeometry(new TorusGeometry(1.35 + index * 0.34, 0.012, 6, 112));
    const material = rememberMaterial(
      new MeshBasicMaterial({ color: index % 2 ? 0x53d9ff : 0x8c76ff, transparent: true, opacity: 0.09, blending: AdditiveBlending, depthWrite: false }),
    );
    const ring = new Mesh(geometry, material);
    ring.rotation.set(index * 0.43 + 0.25, index * 0.36, index * 0.21);
    connectionHub.add(ring);
    connectionHubRings.push(ring);
  }
  connectionGroup.add(connectionHub);

  const connectionStarts = [
    new Vector3(-8, 4.8, -5),
    new Vector3(8.4, 4.1, -6),
    new Vector3(8.2, -4.5, -5),
    new Vector3(-8.4, -4.3, -6),
  ];
  const connectionTargets = [
    new Vector3(-3.8, 2.25, 0),
    new Vector3(3.8, 2.25, -0.4),
    new Vector3(3.8, -2.25, 0.2),
    new Vector3(-3.8, -2.25, -0.2),
  ];
  const connectionNodes = modelDefinitions.map((definition, index) => {
    const node = createExperienceNode(definition, "已连接  /  可调用");
    node.group.position.copy(connectionStarts[index]);
    connectionGroup.add(node.group);
    return { ...node, start: connectionStarts[index], target: connectionTargets[index] };
  });
  const connectionFlows = connectionTargets.map((target, index) =>
    createFlow(
      connectionGroup,
      [
        target.clone(),
        target.clone().multiplyScalar(0.62).add(new Vector3(0, index % 2 ? -0.45 : 0.45, 0.7)),
        new Vector3(0, 0, 0.2),
      ],
      modelDefinitions[index].color,
    ),
  );

  const accountConsole = createDataConsole(
    routingGroup,
    {
      title: "密钥与账单中心",
      subtitle: "密钥、账单、线路在一个后台统一管理",
      metrics: [
        { label: "有效密钥", value: "12", accent: "#8f7cff" },
        { label: "本月账单", value: "¥ 914.72", accent: "#ff9a69" },
        { label: "稳定线路", value: "08", accent: "#53d9ff" },
      ],
      rows: [
        { name: "主业务密钥", detail: "sk-live-••••82A9", status: "使用中", accent: "#72e6bd" },
        { name: "研发环境密钥", detail: "sk-dev-••••19F2", status: "正常", accent: "#53d9ff" },
        { name: "文本模型线路", detail: "CN-NORTH / 24 ms", status: "稳定", accent: "#8f7cff" },
        { name: "推理模型线路", detail: "CN-EAST / 31 ms", status: "稳定", accent: "#ff9a69" },
      ],
      signals: [
        { label: "预算使用", value: "64%", amount: 0.64, accent: "#ff9a69" },
        { label: "密钥健康度", value: "100%", amount: 1, accent: "#72e6bd" },
        { label: "线路可用率", value: "99.99%", amount: 0.96, accent: "#53d9ff" },
      ],
    },
    new Vector3(0.4, -0.25, -3.45),
    -0.08,
  );

  const routeHubGeometry = rememberGeometry(new OctahedronGeometry(0.78, 2));
  const routeHubMaterial = rememberMaterial(
    new MeshBasicMaterial({ color: 0x010106, transparent: true, opacity: 0.98, depthWrite: true }),
  );
  const routeHub = new Mesh(routeHubGeometry, routeHubMaterial);
  routingGroup.add(routeHub);
  const routeHubRings: Mesh<TorusGeometry, MeshBasicMaterial>[] = [];
  for (let index = 0; index < 4; index += 1) {
    const geometry = rememberGeometry(new TorusGeometry(1.1 + index * 0.26, 0.012, 6, 96));
    const material = rememberMaterial(
      new MeshBasicMaterial({ color: index % 2 ? 0x55d9ff : 0x8b75ff, transparent: true, opacity: 0.1, blending: AdditiveBlending, depthWrite: false }),
    );
    const ring = new Mesh(geometry, material);
    ring.rotation.set(index * 0.52, 0.4 + index * 0.35, index * 0.2);
    routingGroup.add(ring);
    routeHubRings.push(ring);
  }
  const routeInputTexture = createPanelTexture("统一请求", "生成一段产品介绍", "策略：质量优先 · 自动降级", "#8b7cff");
  textures.push(routeInputTexture);
  const routeInputMaterial = rememberMaterial(
    new MeshBasicMaterial({ map: routeInputTexture, transparent: true, opacity: 0, side: DoubleSide, depthWrite: false }),
  );
  const routeInput = new Mesh(rememberGeometry(new PlaneGeometry(3.85, 1.35)), routeInputMaterial);
  routeInput.position.set(-5.4, 0.2, 0.5);
  routingGroup.add(routeInput);
  const routeNodePositions = [
    new Vector3(4.7, 3.1, -0.5),
    new Vector3(5.2, 1.0, 0.15),
    new Vector3(5.0, -1.2, -0.2),
    new Vector3(4.5, -3.25, -0.6),
  ];
  const routingNodes = modelDefinitions.map((definition, index) => {
    const node = createExperienceNode(definition, "路由目标  /  在线");
    node.group.position.copy(routeNodePositions[index]);
    node.group.scale.setScalar(0.74);
    routingGroup.add(node.group);
    return node;
  });
  const incomingRoute = createFlow(
    routingGroup,
    [new Vector3(-7.3, 0.1, 0), new Vector3(-3.3, 0.8, 0.8), new Vector3(0, 0, 0.25)],
    0x8b76ff,
  );
  const outgoingRoutes = routeNodePositions.map((position, index) =>
    createFlow(
      routingGroup,
      [new Vector3(0, 0, 0.2), new Vector3(2.2, position.y * 0.44, 0.7), position.clone()],
      modelDefinitions[index].color,
    ),
  );

  const dashboardTexture = createDashboardTexture();
  textures.push(dashboardTexture);
  const dashboardMaterial = rememberMaterial(
    new MeshBasicMaterial({
      map: dashboardTexture,
      transparent: true,
      opacity: 0,
      side: DoubleSide,
      depthWrite: false,
    }),
  );
  const dashboard = new Mesh(
    rememberGeometry(new PlaneGeometry(9.6, 5.88)),
    dashboardMaterial,
  );
  dashboard.position.set(1.25, -0.35, 0);
  dashboard.rotation.set(-0.08, -0.18, 0.025);
  manageGroup.add(dashboard);

  const manageBarGeometry = rememberGeometry(new BoxGeometry(0.14, 0.14, 1));
  const manageBarMaterial = rememberMaterial(
    new MeshPhysicalMaterial({
      color: 0x8069ff,
      emissive: 0x8069ff,
      emissiveIntensity: 1.2,
      metalness: 0.38,
      roughness: 0.18,
      transparent: true,
      opacity: 0.78,
    }),
  );
  const manageBars: Mesh<BoxGeometry, MeshPhysicalMaterial>[] = [];
  for (let index = 0; index < 24; index += 1) {
    const bar = new Mesh(manageBarGeometry, manageBarMaterial);
    const column = index % 12;
    const row = Math.floor(index / 12);
    bar.position.set(-2.55 + column * 0.43, -1.45 + row * 0.38, 0.12);
    bar.rotation.x = Math.PI * 0.5;
    dashboard.add(bar);
    manageBars.push(bar);
  }
  const manageScanMaterial = rememberMaterial(
    new MeshBasicMaterial({
      color: 0x59d9ff,
      transparent: true,
      opacity: 0,
      blending: AdditiveBlending,
      depthWrite: false,
    }),
  );
  const manageScan = new Mesh(rememberGeometry(new PlaneGeometry(9.3, 0.025)), manageScanMaterial);
  manageScan.position.set(0, 0, 0.15);
  dashboard.add(manageScan);
  const manageSatellites = modelDefinitions.map((definition, index) => {
    const node = createExperienceNode(definition, "统一管理  /  正常");
    node.group.position.set(index % 2 ? 5.8 : -4.6, index < 2 ? 2.7 : -2.9, -1.4 - index * 0.25);
    node.group.userData.baseY = node.group.position.y;
    node.group.scale.setScalar(0.56);
    manageGroup.add(node.group);
    return node;
  });

  const scalePointCount = 1500;
  const scalePositions = new Float32Array(scalePointCount * 3);
  const scaleTargets: Vector3[] = [];
  const scaleOffsets: number[] = [];
  for (let index = 0; index < scalePointCount; index += 1) {
    const phi = Math.acos(1 - 2 * random());
    const theta = random() * Math.PI * 2;
    const radius = 2.1 + Math.pow(random(), 0.55) * 7.8;
    const target = new Vector3(
      Math.sin(phi) * Math.cos(theta) * radius,
      Math.cos(phi) * radius * 0.72,
      Math.sin(phi) * Math.sin(theta) * radius,
    );
    scaleTargets.push(target);
    scaleOffsets.push(random());
    const offset = index * 3;
    scalePositions[offset] = target.x * 0.02;
    scalePositions[offset + 1] = target.y * 0.02;
    scalePositions[offset + 2] = target.z * 0.02;
  }
  const scalePointGeometry = rememberGeometry(new BufferGeometry());
  const scalePointAttribute = new BufferAttribute(scalePositions, 3);
  scalePointGeometry.setAttribute("position", scalePointAttribute);
  const scalePointMaterial = rememberMaterial(
    new PointsMaterial({
      color: 0x8b7aff,
      size: 0.055,
      transparent: true,
      opacity: 0,
      blending: AdditiveBlending,
      depthWrite: false,
    }),
  );
  const scaleCloud = new Points(scalePointGeometry, scalePointMaterial);
  scaleGroup.add(scaleCloud);

  const scaleNodeCount = 260;
  const scaleNodeGeometry = rememberGeometry(new IcosahedronGeometry(0.075, 0));
  const scaleNodeMaterial = rememberMaterial(
    new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false }),
  );
  const scaleNodes = new InstancedMesh(scaleNodeGeometry, scaleNodeMaterial, scaleNodeCount);
  scaleNodes.instanceMatrix.setUsage(DynamicDrawUsage);
  scaleNodes.frustumCulled = false;
  const scaleNodeData: Array<{ target: Vector3; offset: number; size: number }> = [];
  for (let index = 0; index < scaleNodeCount; index += 1) {
    const angle = random() * Math.PI * 2;
    const height = (random() - 0.5) * 9;
    const radius = 2.2 + random() * 6.7;
    scaleNodeData.push({
      target: new Vector3(Math.cos(angle) * radius, height, Math.sin(angle) * radius * 0.72),
      offset: random(),
      size: 0.65 + random() * 1.8,
    });
    scaleNodes.setColorAt(index, new Color(index % 5 === 0 ? 0x51dcff : index % 3 === 0 ? 0xa997ff : 0x6f5aff));
  }
  scaleNodes.instanceColor!.needsUpdate = true;
  scaleGroup.add(scaleNodes);
  const scaleNodeMatrix = new Matrix4();
  const scaleNodePosition = new Vector3();
  const scaleShells: Mesh<SphereGeometry, MeshBasicMaterial>[] = [];
  for (let index = 0; index < 5; index += 1) {
    const geometry = rememberGeometry(new SphereGeometry(2.5 + index * 1.25, 24, 16));
    const material = rememberMaterial(
      new MeshBasicMaterial({ color: index % 2 ? 0x4edaff : 0x8068ff, wireframe: true, transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false }),
    );
    const shell = new Mesh(geometry, material);
    shell.scale.y = 0.72;
    scaleGroup.add(shell);
    scaleShells.push(shell);
  }
  const scaleCoreMaterial = rememberMaterial(
    new MeshBasicMaterial({ color: 0x010106, transparent: true, opacity: 0.98, depthWrite: true }),
  );
  const scaleCore = new Mesh(rememberGeometry(new IcosahedronGeometry(0.72, 3)), scaleCoreMaterial);
  scaleGroup.add(scaleCore);

  const brandParticleCount = 1800;
  const brandPositions = new Float32Array(brandParticleCount * 3);
  const brandStarts: Vector3[] = [];
  const brandTargets: Vector3[] = [];
  const brandOffsets: number[] = [];
  for (let index = 0; index < brandParticleCount; index += 1) {
    const start = new Vector3(
      (random() - 0.5) * 22,
      (random() - 0.5) * 13,
      (random() - 0.5) * 17,
    );
    const angle = random() * Math.PI * 2;
    const radius = 1.3 + random() * 3.5;
    const target = new Vector3(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius * 0.64,
      (random() - 0.5) * 1.1,
    );
    brandStarts.push(start);
    brandTargets.push(target);
    brandOffsets.push(random());
    const offset = index * 3;
    brandPositions[offset] = start.x;
    brandPositions[offset + 1] = start.y;
    brandPositions[offset + 2] = start.z;
  }
  const brandParticleGeometry = rememberGeometry(new BufferGeometry());
  const brandParticleAttribute = new BufferAttribute(brandPositions, 3);
  brandParticleGeometry.setAttribute("position", brandParticleAttribute);
  const brandParticleMaterial = rememberMaterial(
    new PointsMaterial({ color: 0x9a89ff, size: 0.06, transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false }),
  );
  const brandParticles = new Points(brandParticleGeometry, brandParticleMaterial);
  brandGroup.add(brandParticles);
  const brandLogo = createImageSprite("/images/logo.png", 2.1);
  brandLogo.sprite.position.z = 0.7;
  brandGroup.add(brandLogo.sprite);
  const brandHaloRings: Mesh<TorusGeometry, MeshBasicMaterial>[] = [];
  for (let index = 0; index < 8; index += 1) {
    const geometry = rememberGeometry(new TorusGeometry(1.7 + index * 0.42, 0.012, 6, 128));
    const material = rememberMaterial(
      new MeshBasicMaterial({ color: index % 2 ? 0x4edbff : 0x8a74ff, transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false }),
    );
    const ring = new Mesh(geometry, material);
    ring.rotation.set(0.35 + index * 0.26, 0.18 + index * 0.31, index * 0.23);
    brandGroup.add(ring);
    brandHaloRings.push(ring);
  }
  const brandModels = modelDefinitions.map((definition, index) => {
    const node = createExperienceNode(definition, "统一平台  /  已连接");
    node.group.scale.setScalar(0.58);
    brandGroup.add(node.group);
    return node;
  });

  const pointer = new Vector2(0, 0);
  const pointerTarget = new Vector2(0, 0);
  const onPointerMove = (event: PointerEvent) => {
    const bounds = host.getBoundingClientRect();
    pointerTarget.x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    pointerTarget.y = ((event.clientY - bounds.top) / bounds.height - 0.5) * -2;
  };
  host.addEventListener("pointermove", onPointerMove, { passive: true });

  let timelineStart = performance.now();
  let previousCycle = 0;
  let disposed = false;
  const origin = new Vector3();

  const render = (now = performance.now()) => {
    if (disposed) return;
    const elapsed = Math.max(0, (now - timelineStart) / 1000);
    const cycle = Math.floor(elapsed / duration);
    const masterTimeline = (elapsed % duration) / duration;
    const chapterFloat = masterTimeline * chapterCount;
    const chapter = Math.min(chapterCount - 1, Math.floor(chapterFloat));
    const timeline = chapterFloat - chapter;
    if (cycle !== previousCycle) {
      previousCycle = cycle;
      options.onLoop?.();
    }
    options.onProgress?.(masterTimeline);

    root.visible = chapter === 0;
    connectionGroup.visible = chapter === 1;
    routingGroup.visible = chapter === 2;
    manageGroup.visible = chapter === 3;
    scaleGroup.visible = chapter === 4;
    brandGroup.visible = chapter === 5;

    pointer.lerp(pointerTarget, 0.045);
    const intro = easeOut(range(timeline, 0.0, 0.19));
    const network = smooth(range(timeline, 0.25, 0.55));
    const chaos = smooth(range(timeline, 0.48, 0.72)) * (1 - smooth(range(timeline, 0.76, 0.9)));
    const finalPull = smooth(range(timeline, 0.76, 0.98));
    const impact = Math.max(0, 1 - Math.abs(timeline - 0.69) / 0.025);
    const transitionIn = 1 - smooth(range(timeline, 0, 0.055));
    const transitionOut = smooth(range(timeline, 0.935, 1));
    const transitionMix = Math.max(transitionIn, transitionOut);
    const tunnelReveal = smooth(range(timeline, 0.0, 0.12)) * (1 - smooth(range(timeline, 0.82, 0.99)));

    const cameraZ = MathUtils.lerp(18.2, 8.35, intro) + finalPull * 7.2;
    camera.position.x = Math.sin(timeline * Math.PI * 2.35) * (0.38 + network * 1.35) + pointer.x * 0.48;
    camera.position.y = 0.32 + Math.cos(timeline * Math.PI * 1.85) * network * 0.68 + pointer.y * 0.34;
    camera.position.z = cameraZ;
    camera.position.x += Math.sin(elapsed * 36) * chaos * 0.13 + Math.sin(elapsed * 79) * impact * 0.16;
    camera.position.y += Math.cos(elapsed * 31) * chaos * 0.11 + Math.cos(elapsed * 71) * impact * 0.14;
    origin.set(
      Math.sin(timeline * Math.PI * 2) * network * 0.42,
      Math.cos(timeline * Math.PI * 1.5) * network * 0.2,
      -network * 0.35,
    );
    camera.lookAt(origin);
    camera.rotation.z += Math.sin(timeline * Math.PI * 2.4) * 0.032 * network + impact * 0.018;
    camera.fov = 52 - intro * 9 + chaos * 5 + finalPull * 11;
    camera.updateProjectionMatrix();

    root.rotation.y = -0.16 + Math.sin(timeline * Math.PI * 1.5) * 0.25;
    root.rotation.x = Math.cos(timeline * Math.PI * 1.2) * 0.065;
    root.scale.setScalar(1 - finalPull * 0.11 + impact * 0.025);

    tunnelGates.forEach((gate, index) => {
      gate.position.z = 6 - ((elapsed * (6.4 + network * 5.8) + gate.userData.offset) % 51);
      gate.rotation.z = index * 0.17 + elapsed * (index % 2 ? -0.055 : 0.07) + chaos * 0.18;
      const pulse = 0.92 + Math.sin(elapsed * 1.8 + index * 0.7) * 0.08;
      gate.scale.setScalar(pulse * (0.72 + index * 0.012));
    });
    tunnelVioletMaterial.opacity = tunnelReveal * (0.08 + network * 0.13 + chaos * 0.08);
    tunnelCyanMaterial.opacity = tunnelReveal * (0.06 + network * 0.11 + impact * 0.18);

    shardData.forEach((data, index) => {
      const travel = (elapsed * data.speed + data.depth) % 46;
      const angle = data.angle + elapsed * (0.045 + (index % 7) * 0.002);
      const radius = data.radius * (1 + Math.sin(elapsed * 0.6 + index) * 0.025);
      const z = 7 - travel;
      const stretch = data.length * (1 + network * 1.4 + chaos * 2.8);
      shardMatrix.makeScale(0.72 + chaos * 0.35, 0.72 + chaos * 0.35, stretch);
      shardMatrix.setPosition(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.72, z);
      dataShards.setMatrixAt(index, shardMatrix);
    });
    dataShards.instanceMatrix.needsUpdate = true;
    shardMaterial.opacity = tunnelReveal * (0.3 + network * 0.34 + chaos * 0.22);

    modelRecords.forEach((record, index) => {
      const local = easeOut(range(timeline, record.delay, record.delay + 0.18));
      const exit = smooth(range(timeline, 0.79 + index * 0.012, 0.97));
      record.group.position.lerpVectors(record.start, record.target, local);
      record.group.position.x += Math.sin(elapsed * (0.72 + index * 0.08) + index) * 0.22 * local;
      record.group.position.y += Math.cos(elapsed * (0.86 + index * 0.07) + index * 1.3) * 0.18 * local;
      record.group.position.multiplyScalar(1 + exit * 0.18);
      const scale = Math.max(0.001, local * (1 - exit * 0.38));
      record.group.scale.setScalar(scale);
      record.group.rotation.y = elapsed * (0.24 + index * 0.035) * (index % 2 ? -1 : 1);
      record.group.rotation.x = Math.sin(elapsed * 0.55 + index) * 0.2;
      record.core.rotation.y += 0.012 * (index % 2 ? -1 : 1);
      record.core.rotation.x += 0.007;
      record.shell.rotation.y -= 0.008;
      record.ringA.rotation.z += 0.009 + index * 0.001;
      record.ringB.rotation.x -= 0.006 + index * 0.001;
      (record.core.material as MeshPhysicalMaterial).emissiveIntensity = 1.25 + Math.sin(elapsed * 3.2 + index) * 0.5 + chaos * 1.1;
    });

    const voidVisibility = smooth(range(timeline, 0.38, 0.57)) * (1 - smooth(range(timeline, 0.86, 0.99)) * 0.65);
    voidGroup.scale.setScalar(Math.max(0.001, voidVisibility * (1 + Math.sin(elapsed * 3) * 0.035)));
    voidGroup.rotation.y = elapsed * -0.16;
    voidGroup.rotation.x = Math.sin(elapsed * 0.5) * 0.12;
    voidWire.rotation.y -= 0.006;
    energyShell.rotation.y = elapsed * 0.24;
    energyShell.rotation.z = Math.sin(elapsed * 0.52) * 0.16;
    energyMaterial.uniforms.uTime.value = elapsed;
    energyMaterial.uniforms.uChaos.value = chaos;
    energyMaterial.uniforms.uReveal.value = voidVisibility;
    voidRings.forEach((ring, index) => {
      ring.rotation.z += (0.003 + index * 0.0017) * (index % 2 ? -1 : 1);
      ring.rotation.x += 0.0015 * (index + 1);
      const ringScale = 1 + Math.sin(elapsed * (1.1 + index * 0.07) + index) * 0.035 + impact * (0.12 + index * 0.025);
      ring.scale.setScalar(ringScale);
    });
    coreFragments.forEach((fragment, index) => {
      const angle = fragment.userData.angle + elapsed * fragment.userData.speed * (index % 2 ? -1 : 1);
      const radius = fragment.userData.radius * (0.8 + chaos * 0.34 + impact * 0.7);
      fragment.position.set(
        Math.cos(angle) * radius,
        fragment.userData.height + Math.sin(elapsed * 1.4 + index) * 0.24,
        Math.sin(angle) * radius * 0.62,
      );
      fragment.rotation.x = elapsed * (0.42 + index * 0.008);
      fragment.rotation.y = elapsed * (0.35 + index * 0.006);
    });
    voidSphereMaterial.opacity = 0.96 + chaos * 0.02;
    voidWireMaterial.opacity = 0.065 + chaos * 0.1 + impact * 0.12;
    coreFragmentMaterial.opacity = voidVisibility * (0.24 + chaos * 0.36 + impact * 0.32);

    routeRecords.forEach((record, index) => {
      const local = smooth(range(timeline, record.delay, record.delay + 0.2));
      const fade = 1 - smooth(range(timeline, 0.82, 0.98));
      record.line.geometry.setDrawRange(0, Math.floor(97 * local));
      (record.line.material as LineBasicMaterial).opacity = local * fade * (0.4 + chaos * 0.42);
      const packetProgress = clamp(((timeline - record.delay) * (2.1 + index * 0.11)) % 1);
      record.packet.position.copy(record.curve.getPoint(packetProgress));
      (record.packet.material as MeshBasicMaterial).opacity = local * fade * (packetProgress > 0.93 ? (1 - packetProgress) * 14 : 0.95);
      record.packet.scale.setScalar(0.7 + chaos * 1.3);
    });

    const dustVisible = smooth(range(timeline, 0.29, 0.47)) * (1 - smooth(range(timeline, 0.84, 0.99)));
    dustMaterial.opacity = dustVisible * (0.35 + chaos * 0.55);
    for (let index = 0; index < dustCount; index += 1) {
      const motion = ((timeline * (2.15 + (index % 5) * 0.13) + dustOffsets[index]) % 1);
      const eased = smooth(motion);
      const start = dustStarts[index];
      const end = dustEnds[index];
      const offset = index * 3;
      dustPositions[offset] = MathUtils.lerp(start.x, end.x, eased) + Math.sin(elapsed * 2.4 + index) * 0.025;
      dustPositions[offset + 1] = MathUtils.lerp(start.y, end.y, eased) + Math.cos(elapsed * 2.1 + index) * 0.025;
      dustPositions[offset + 2] = MathUtils.lerp(start.z, end.z, eased);
    }
    dustAttribute.needsUpdate = true;

    panelRecords.forEach((record, index) => {
      const local = easeOut(range(timeline, record.delay, record.delay + 0.16));
      const exit = smooth(range(timeline, 0.73 + index * 0.018, 0.9 + index * 0.012));
      record.mesh.position.lerpVectors(record.start, record.target, local);
      record.mesh.position.x += exit * (index % 2 ? 2.5 : -2.5);
      record.mesh.position.z += exit * 3.8;
      record.mesh.quaternion.copy(camera.quaternion);
      record.mesh.rotateZ(record.tilt + Math.sin(elapsed * 0.8 + index) * 0.015);
      record.mesh.material.opacity = local * (1 - exit) * 0.88;
      const panelScale = 0.78 + local * 0.22 + exit * 0.18;
      record.mesh.scale.setScalar(panelScale);
    });

    if (chapter === 1) {
      const arrival = easeOut(range(timeline, 0.02, 0.34));
      const consoleReveal = easeOut(range(timeline, 0.03, 0.3));
      const hubReveal = easeOut(range(timeline, 0.18, 0.46));
      const connectionReady = smooth(range(timeline, 0.36, 0.7));
      const connectionExit = smooth(range(timeline, 0.86, 1));
      camera.position.set(
        Math.sin(timeline * Math.PI * 1.8) * 1.15 + pointer.x * 0.4,
        0.35 + Math.cos(timeline * Math.PI * 1.4) * 0.48 + pointer.y * 0.3,
        MathUtils.lerp(16.4, 9.8, easeOut(range(timeline, 0, 0.34))) + connectionExit * 4.4,
      );
      origin.set(0, 0, 0);
      camera.lookAt(origin);
      camera.rotation.z += Math.sin(timeline * Math.PI * 2) * 0.025;
      connectionGroup.rotation.y = Math.sin(timeline * Math.PI * 1.5) * 0.12;
      connectionGroup.scale.setScalar(1 - connectionExit * 0.12);

      connectionConsole.material.opacity = consoleReveal * (1 - connectionExit) * 0.78;
      connectionConsole.screen.position.x = connectionConsole.basePosition.x - (1 - consoleReveal) * 4.8;
      connectionConsole.screen.position.y = connectionConsole.basePosition.y + Math.sin(elapsed * 0.38) * 0.08;
      connectionConsole.screen.position.z = MathUtils.lerp(-7.6, connectionConsole.basePosition.z, consoleReveal);
      connectionConsole.screen.rotation.y = MathUtils.lerp(-0.52, -0.1, consoleReveal) + Math.sin(elapsed * 0.24) * 0.018;
      connectionConsole.screen.rotation.x = -0.055 + Math.sin(elapsed * 0.3) * 0.012;
      connectionConsole.scanMaterial.opacity = connectionReady * (1 - connectionExit) * 0.28;
      connectionConsole.scan.position.y = -2.9 + ((timeline * 2.2) % 1) * 5.8;

      connectionHub.scale.setScalar(Math.max(0.001, hubReveal * (1 + Math.sin(elapsed * 2.8) * 0.035)));
      connectionHub.rotation.y = elapsed * 0.25;
      connectionHub.rotation.x = Math.sin(elapsed * 0.6) * 0.15;
      connectionHubCore.rotation.y += 0.012;
      connectionHubWire.rotation.x -= 0.008;
      connectionHubMaterial.opacity = 0.96 + connectionReady * 0.02;
      connectionLogo.material.opacity = hubReveal * (1 - connectionExit) * 0.96;
      connectionHubRings.forEach((ring, index) => {
        ring.rotation.z += (0.004 + index * 0.0018) * (index % 2 ? -1 : 1);
        ring.rotation.x += 0.0014 * (index + 1);
        ring.scale.setScalar(0.72 + hubReveal * 0.28 + Math.sin(elapsed * 1.2 + index) * 0.025);
      });

      connectionNodes.forEach((node, index) => {
        const nodeArrival = easeOut(range(timeline, 0.04 + index * 0.035, 0.31 + index * 0.04));
        node.group.position.lerpVectors(node.start, node.target, nodeArrival);
        node.group.position.y += Math.sin(elapsed * 0.9 + index) * 0.13 * nodeArrival;
        node.group.scale.setScalar(Math.max(0.001, nodeArrival * (1 - connectionExit * 0.35)));
        node.group.rotation.y = elapsed * (0.18 + index * 0.035) * (index % 2 ? -1 : 1);
        node.core.rotation.x += 0.008;
        node.ring.rotation.z += 0.012 * (index % 2 ? -1 : 1);
        node.coreMaterial.emissiveIntensity = 1.3 + connectionReady * 1.2 + Math.sin(elapsed * 3 + index) * 0.3;
      });
      connectionFlows.forEach((flow, index) => {
        const lineProgress = smooth(range(timeline, 0.28 + index * 0.025, 0.58 + index * 0.025));
        flow.line.geometry.setDrawRange(0, Math.floor(129 * lineProgress));
        flow.lineMaterial.opacity = lineProgress * (1 - connectionExit) * 0.7;
        const packetProgress = ((timeline * 3.2 + index * 0.22) % 1);
        flow.packet.position.copy(flow.curve.getPoint(packetProgress));
        flow.packetMaterial.opacity = connectionReady * (1 - connectionExit) * 0.95;
        flow.packet.scale.setScalar(0.75 + Math.sin(elapsed * 5 + index) * 0.2);
      });
    }

    if (chapter === 2) {
      const routeReveal = easeOut(range(timeline, 0.02, 0.24));
      const consoleReveal = easeOut(range(timeline, 0.02, 0.29));
      const routeLive = smooth(range(timeline, 0.24, 0.52));
      const routeExit = smooth(range(timeline, 0.87, 1));
      camera.position.set(
        MathUtils.lerp(-2.4, 1.15, smooth(range(timeline, 0.05, 0.62))) + pointer.x * 0.35,
        0.45 + Math.sin(timeline * Math.PI * 2) * 0.32 + pointer.y * 0.24,
        MathUtils.lerp(14.8, 10.1, routeReveal) + routeExit * 4.8,
      );
      origin.set(0.6, 0, 0);
      camera.lookAt(origin);
      routingGroup.rotation.y = -0.08 + Math.sin(timeline * Math.PI * 1.25) * 0.08;
      routingGroup.scale.setScalar(1 - routeExit * 0.1);

      accountConsole.material.opacity = consoleReveal * (1 - routeExit) * 0.8;
      accountConsole.screen.position.x = accountConsole.basePosition.x + (1 - consoleReveal) * 4.6;
      accountConsole.screen.position.y = accountConsole.basePosition.y + Math.sin(elapsed * 0.34) * 0.09;
      accountConsole.screen.position.z = MathUtils.lerp(-7.4, accountConsole.basePosition.z, consoleReveal);
      accountConsole.screen.rotation.y = MathUtils.lerp(0.48, -0.08, consoleReveal) + Math.sin(elapsed * 0.23) * 0.018;
      accountConsole.screen.rotation.x = -0.055 + Math.cos(elapsed * 0.27) * 0.012;
      accountConsole.scanMaterial.opacity = routeLive * (1 - routeExit) * 0.3;
      accountConsole.scan.position.y = -2.9 + ((timeline * 2.45) % 1) * 5.8;

      routeHub.scale.setScalar(Math.max(0.001, easeOut(range(timeline, 0.15, 0.38))));
      routeHub.rotation.x = elapsed * 0.32;
      routeHub.rotation.y = elapsed * -0.44;
      routeHubMaterial.opacity = 0.96 + routeLive * 0.02;
      routeHubRings.forEach((ring, index) => {
        ring.rotation.z += (0.008 + index * 0.002) * (index % 2 ? -1 : 1);
        ring.rotation.x += 0.002 * (index + 1);
        ring.scale.setScalar(Math.max(0.001, routeReveal * (0.82 + index * 0.045)));
        ring.material.opacity = routeReveal * (1 - routeExit) * (0.055 + index * 0.012);
      });

      routeInputMaterial.opacity = routeReveal * (1 - routeExit) * 0.9;
      routeInput.position.x = MathUtils.lerp(-8.5, -5.4, routeReveal) - routeExit * 2;
      routeInput.quaternion.copy(camera.quaternion);
      routeInput.rotateZ(-0.025 + Math.sin(elapsed * 0.8) * 0.012);
      routingNodes.forEach((node, index) => {
        const nodeReveal = easeOut(range(timeline, 0.12 + index * 0.035, 0.35 + index * 0.04));
        const activeRoute = Math.floor(timeline * 8) % routingNodes.length === index;
        node.group.scale.setScalar(Math.max(0.001, nodeReveal * (activeRoute ? 0.88 : 0.7) * (1 - routeExit * 0.3)));
        node.group.position.x = routeNodePositions[index].x + Math.sin(elapsed * 0.7 + index) * 0.12;
        node.group.rotation.y = elapsed * (0.2 + index * 0.03);
        node.ring.rotation.z += activeRoute ? 0.028 : 0.009;
        node.coreMaterial.emissiveIntensity = activeRoute ? 3.1 : 1.05;
      });

      const incomingProgress = smooth(range(timeline, 0.14, 0.42));
      incomingRoute.line.geometry.setDrawRange(0, Math.floor(129 * incomingProgress));
      incomingRoute.lineMaterial.opacity = incomingProgress * (1 - routeExit) * 0.82;
      const incomingPacketProgress = (timeline * 3.6) % 1;
      incomingRoute.packet.position.copy(incomingRoute.curve.getPoint(incomingPacketProgress));
      incomingRoute.packetMaterial.opacity = routeLive * (1 - routeExit);
      incomingRoute.packet.scale.setScalar(1.15);
      outgoingRoutes.forEach((flow, index) => {
        const lineProgress = smooth(range(timeline, 0.28 + index * 0.018, 0.52 + index * 0.02));
        const activeRoute = Math.floor(timeline * 8) % outgoingRoutes.length === index;
        flow.line.geometry.setDrawRange(0, Math.floor(129 * lineProgress));
        flow.lineMaterial.opacity = lineProgress * (1 - routeExit) * (activeRoute ? 0.95 : 0.18);
        const packetProgress = (timeline * (3.8 + index * 0.15) + index * 0.14) % 1;
        flow.packet.position.copy(flow.curve.getPoint(packetProgress));
        flow.packetMaterial.opacity = routeLive * (1 - routeExit) * (activeRoute ? 1 : 0.2);
        flow.packet.scale.setScalar(activeRoute ? 1.4 : 0.72);
      });
    }

    if (chapter === 3) {
      const dashboardReveal = easeOut(range(timeline, 0.02, 0.31));
      const dashboardLive = smooth(range(timeline, 0.25, 0.58));
      const dashboardExit = smooth(range(timeline, 0.88, 1));
      camera.position.set(
        -0.6 + Math.sin(timeline * Math.PI * 1.4) * 0.72 + pointer.x * 0.3,
        0.55 + Math.cos(timeline * Math.PI * 1.5) * 0.34 + pointer.y * 0.22,
        MathUtils.lerp(16.2, 10.7, dashboardReveal) + dashboardExit * 5.2,
      );
      origin.set(0.8, -0.3, 0);
      camera.lookAt(origin);
      dashboardMaterial.opacity = dashboardReveal * (1 - dashboardExit) * 0.94;
      manageBarMaterial.opacity = dashboardReveal * (1 - dashboardExit) * 0.78;
      dashboard.position.x = MathUtils.lerp(7.8, 1.25, dashboardReveal) - dashboardExit * 4;
      dashboard.position.y = -0.35 + Math.sin(elapsed * 0.55) * 0.12;
      dashboard.rotation.y = MathUtils.lerp(-0.72, -0.18, dashboardReveal) - dashboardExit * 0.18;
      dashboard.rotation.x = -0.08 + Math.sin(elapsed * 0.4) * 0.02;
      manageScanMaterial.opacity = dashboardLive * (1 - dashboardExit) * 0.72;
      manageScan.position.y = -2.65 + ((timeline * 7.5) % 1) * 5.3;
      manageBars.forEach((bar, index) => {
        const barReveal = smooth(range(timeline, 0.27 + index * 0.006, 0.48 + index * 0.006));
        const height = 0.18 + (0.45 + Math.sin(elapsed * 1.4 + index * 0.52) * 0.3) * barReveal;
        bar.scale.z = Math.max(0.02, height);
        bar.position.z = 0.15 + height * 0.48;
      });
      manageSatellites.forEach((node, index) => {
        const nodeReveal = easeOut(range(timeline, 0.18 + index * 0.025, 0.42 + index * 0.03));
        node.group.scale.setScalar(Math.max(0.001, nodeReveal * 0.56 * (1 - dashboardExit * 0.5)));
        node.group.position.y = node.group.userData.baseY + Math.sin(elapsed * 0.75 + index) * 0.08;
        node.group.rotation.y = elapsed * (0.15 + index * 0.025);
        node.ring.rotation.z += 0.008 + index * 0.001;
        node.coreMaterial.emissiveIntensity = 1.1 + dashboardLive * 0.8;
      });
    }

    if (chapter === 4) {
      const scaleReveal = easeOut(range(timeline, 0.01, 0.3));
      const scaleLive = smooth(range(timeline, 0.24, 0.65));
      const scaleExit = smooth(range(timeline, 0.9, 1));
      camera.position.set(
        Math.sin(timeline * Math.PI * 2.2) * (1.2 + scaleLive * 1.3) + pointer.x * 0.36,
        0.4 + Math.cos(timeline * Math.PI * 1.7) * 0.72 + pointer.y * 0.26,
        MathUtils.lerp(18.5, 11.6, scaleReveal) + scaleExit * 6.2,
      );
      origin.set(0, 0, 0);
      camera.lookAt(origin);
      scaleGroup.rotation.y = elapsed * 0.07;
      scaleGroup.rotation.x = Math.sin(elapsed * 0.16) * 0.08;
      scaleGroup.scale.setScalar(1 - scaleExit * 0.2);
      for (let index = 0; index < scalePointCount; index += 1) {
        const local = easeOut(range(timeline, 0.03 + scaleOffsets[index] * 0.18, 0.28 + scaleOffsets[index] * 0.2));
        const target = scaleTargets[index];
        const expansion = local * (0.72 + scaleLive * 0.4);
        const offset = index * 3;
        scalePositions[offset] = target.x * expansion + Math.sin(elapsed * 0.7 + index) * 0.025;
        scalePositions[offset + 1] = target.y * expansion + Math.cos(elapsed * 0.65 + index) * 0.025;
        scalePositions[offset + 2] = target.z * expansion;
      }
      scalePointAttribute.needsUpdate = true;
      scalePointMaterial.opacity = scaleReveal * (1 - scaleExit) * (0.32 + scaleLive * 0.38);
      scaleNodeData.forEach((data, index) => {
        const nodeReveal = easeOut(range(timeline, 0.12 + data.offset * 0.22, 0.38 + data.offset * 0.24));
        scaleNodePosition.copy(data.target).multiplyScalar(nodeReveal * (0.7 + scaleLive * 0.38));
        scaleNodePosition.y += Math.sin(elapsed * 0.75 + index) * 0.08;
        const size = Math.max(0.001, nodeReveal * data.size * (1 + Math.sin(elapsed * 1.4 + index) * 0.12));
        scaleNodeMatrix.makeScale(size, size, size);
        scaleNodeMatrix.setPosition(scaleNodePosition);
        scaleNodes.setMatrixAt(index, scaleNodeMatrix);
      });
      scaleNodes.instanceMatrix.needsUpdate = true;
      scaleNodeMaterial.opacity = scaleReveal * (1 - scaleExit) * 0.78;
      scaleShells.forEach((shell, index) => {
        const shellReveal = easeOut(range(timeline, 0.1 + index * 0.045, 0.38 + index * 0.055));
        shell.material.opacity = shellReveal * (1 - scaleExit) * (0.035 + scaleLive * 0.045);
        shell.rotation.y = elapsed * (0.08 + index * 0.018) * (index % 2 ? -1 : 1);
        shell.rotation.z = elapsed * 0.025 * (index + 1);
        shell.scale.set(0.72 + shellReveal * 0.28 + scaleLive * 0.08, (0.72 + shellReveal * 0.28 + scaleLive * 0.08) * 0.72, 0.72 + shellReveal * 0.28 + scaleLive * 0.08);
      });
      scaleCore.scale.setScalar(Math.max(0.001, scaleReveal * (1 + Math.sin(elapsed * 2.5) * 0.04)));
      scaleCore.rotation.x = elapsed * 0.35;
      scaleCore.rotation.y = elapsed * -0.42;
      scaleCoreMaterial.opacity = 0.96 + scaleLive * 0.02;
    }

    if (chapter === 5) {
      const brandGather = smooth(range(timeline, 0.02, 0.48));
      const brandReveal = easeOut(range(timeline, 0.26, 0.56));
      const brandHold = 1 - smooth(range(timeline, 0.94, 1));
      camera.position.set(
        Math.sin(timeline * Math.PI * 1.5) * (1.4 - brandReveal * 0.8) + pointer.x * 0.25,
        0.25 + Math.cos(timeline * Math.PI * 1.2) * 0.48 + pointer.y * 0.2,
        MathUtils.lerp(17.8, 9.4, brandReveal) + smooth(range(timeline, 0.82, 1)) * 2.1,
      );
      origin.set(0, 0, 0);
      camera.lookAt(origin);
      brandGroup.rotation.y = Math.sin(timeline * Math.PI * 1.3) * 0.1;
      for (let index = 0; index < brandParticleCount; index += 1) {
        const local = easeOut(range(timeline, 0.02 + brandOffsets[index] * 0.16, 0.46 + brandOffsets[index] * 0.2));
        const start = brandStarts[index];
        const target = brandTargets[index];
        const offset = index * 3;
        brandPositions[offset] = MathUtils.lerp(start.x, target.x, local) + Math.sin(elapsed * 0.8 + index) * 0.025;
        brandPositions[offset + 1] = MathUtils.lerp(start.y, target.y, local) + Math.cos(elapsed * 0.72 + index) * 0.025;
        brandPositions[offset + 2] = MathUtils.lerp(start.z, target.z, local);
      }
      brandParticleAttribute.needsUpdate = true;
      brandParticleMaterial.opacity = (0.2 + brandGather * 0.62) * brandHold;
      brandParticles.rotation.z = elapsed * 0.045;
      brandLogo.material.opacity = brandReveal * brandHold;
      brandLogo.sprite.scale.setScalar(Math.max(0.001, brandReveal * (2.1 + Math.sin(elapsed * 2.2) * 0.05)));
      brandHaloRings.forEach((ring, index) => {
        const ringReveal = easeOut(range(timeline, 0.18 + index * 0.025, 0.5 + index * 0.025));
        ring.material.opacity = ringReveal * brandHold * (0.08 + (index % 3) * 0.035);
        ring.rotation.z += (0.004 + index * 0.0016) * (index % 2 ? -1 : 1);
        ring.rotation.x += 0.001 * (index + 1);
        ring.scale.setScalar(0.75 + ringReveal * 0.25 + Math.sin(elapsed + index) * 0.018);
      });
      brandModels.forEach((node, index) => {
        const nodeReveal = easeOut(range(timeline, 0.03 + index * 0.035, 0.24 + index * 0.04));
        const nodeFade = smooth(range(timeline, 0.44 + index * 0.025, 0.69 + index * 0.025));
        const radius = MathUtils.lerp(7.4, 2.65, brandGather);
        const angle = index * Math.PI * 0.5 + elapsed * (0.18 + index * 0.015);
        node.group.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.64, -0.5 + Math.sin(angle * 2) * 0.4);
        node.group.scale.setScalar(Math.max(0.001, nodeReveal * (1 - nodeFade) * 0.62));
        node.group.rotation.y = elapsed * (0.2 + index * 0.03);
        node.ring.rotation.z += 0.012;
        node.coreMaterial.emissiveIntensity = 1.5 + brandGather * 1.2;
      });
    }

    stars.rotation.y = elapsed * 0.009;
    stars.rotation.x = Math.sin(elapsed * 0.08) * 0.04;
    starMaterial.opacity = 0.28 + intro * 0.25 + chaos * 0.18;
    bloomPass.strength = 1.02 + network * 0.48 + chaos * 0.72 + impact * 0.85 - finalPull * 0.22;
    bloomPass.radius = 0.68 + chaos * 0.16;
    cinematicPass.uniforms.uTime.value = elapsed;
    cinematicPass.uniforms.uChaos.value = chaos;
    cinematicPass.uniforms.uImpact.value = impact * 0.24;
    cinematicPass.uniforms.uTransition.value = transitionMix;
    violetLight.intensity = 23 + Math.sin(elapsed * 2.4) * 4 + chaos * 18;
    cyanLight.intensity = 18 + Math.cos(elapsed * 2.1) * 3 + chaos * 14;
    redLight.intensity = 4 + chaos * 22 + impact * 28;

    composer.render();
    firstFrameRendered = true;
    if (assetsReady && firstFrameRendered && !readyEmitted) {
      readyEmitted = true;
      timelineStart = now;
      previousCycle = 0;
      options.onProgress?.(0);
      options.onReady?.();
    }
  };

  const resize = () => {
    const bounds = host.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    renderer.setSize(bounds.width, bounds.height, false);
    composer.setSize(bounds.width, bounds.height);
    bloomPass.resolution.set(bounds.width, bounds.height);
    cinematicPass.uniforms.uResolution.value.set(
      bounds.width * Math.min(window.devicePixelRatio, 2),
      bounds.height * Math.min(window.devicePixelRatio, 2),
    );
    camera.aspect = bounds.width / bounds.height;
    camera.updateProjectionMatrix();
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  resize();
  renderer.setAnimationLoop(render);

  return () => {
    disposed = true;
    renderer.setAnimationLoop(null);
    host.removeEventListener("pointermove", onPointerMove);
    resizeObserver.disconnect();
    composer.dispose();
    cinematicPass.dispose();
    bloomPass.dispose();
    renderPass.dispose();
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
    textures.forEach((texture) => texture.dispose());
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
    timelineStart = 0;
  };
};
