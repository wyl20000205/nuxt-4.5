<template>
  <main class="map-page">
    <div class="page-grid" aria-hidden="true"></div>
    <div class="ambient ambient-left" aria-hidden="true"></div>
    <div class="ambient ambient-right" aria-hidden="true"></div>

    <header class="topbar">
      <div class="brand">
        <span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i></span>
        <div>
          <p>NATIONAL TRAFFIC OBSERVATORY</p>
          <h1>全国实时访问态势</h1>
        </div>
      </div>

      <div class="top-metrics" aria-label="全国实时指标">
        <article>
          <span>今日访问</span>
          <strong>{{ number(totalVisits) }}</strong>
          <small>较昨日 +12.8%</small>
        </article>
        <article>
          <span>实时请求</span>
          <strong>{{ number(currentQps) }}<em> /s</em></strong>
          <small>{{ activeNodes }} 个节点在线</small>
        </article>
        <article>
          <span>平均延迟</span>
          <strong>{{ latency }}<em> ms</em></strong>
          <small class="healthy">链路健康</small>
        </article>
      </div>

      <div class="clock">
        <i></i>
        <div><strong>{{ nowTime }}</strong><span>{{ nowDate }}</span></div>
      </div>
    </header>

    <section class="dashboard">
      <aside class="panel left-panel" aria-label="访问概览">
        <section class="panel-section">
          <PanelTitle index="01" title="访问概览"><span class="live-chip">LIVE</span></PanelTitle>
          <div class="traffic-total">
            <span>当前吞吐量</span>
            <strong>{{ trafficVolume.toFixed(1) }}</strong><small> GB / min</small>
          </div>
          <div class="sparkline" aria-label="最近二十四个采样点的流量趋势">
            <svg viewBox="0 0 240 74" role="img">
              <defs>
                <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stop-color="#59e5ff" stop-opacity=".34" />
                  <stop offset="1" stop-color="#59e5ff" stop-opacity="0" />
                </linearGradient>
              </defs>
              <path :d="sparkArea" fill="url(#spark-fill)" />
              <polyline :points="sparkPoints" fill="none" stroke="#67e8ff" stroke-width="2" />
            </svg>
            <div><span>00:00</span><span>12:00</span><span>现在</span></div>
          </div>
          <div class="channel-list">
            <div v-for="channel in channels" :key="channel.label">
              <p><span>{{ channel.label }}</span><strong>{{ channel.value }}%</strong></p>
              <span class="bar"><i :style="{ width: `${channel.value}%` }"></i></span>
            </div>
          </div>
        </section>

        <section class="panel-section ranking">
          <PanelTitle index="02" title="热门区域"><span class="muted">实时排行</span></PanelTitle>
          <ol>
            <li v-for="(item, index) in hotRegions" :key="item.id" @click="selectedProvinceId = item.id">
              <span class="rank" :class="{ top: index < 3 }">{{ String(index + 1).padStart(2, '0') }}</span>
              <span>{{ item.name }}</span>
              <span class="rank-bar"><i :style="{ width: `${item.ratio}%` }"></i></span>
              <strong>{{ compact(item.value) }}</strong>
            </li>
          </ol>
        </section>

        <footer class="panel-footer">
          <span><i></i>数据链路正常</span><span>更新于 {{ lastUpdated }}</span>
        </footer>
      </aside>

      <section class="map-stage" aria-label="可旋转缩放的中国三维访问地图">
        <header class="map-toolbar">
          <div class="mode-switch">
            <button :class="{ active: mode === 'traffic' }" @click="mode = 'traffic'">流量态势</button>
            <button :class="{ active: mode === 'risk' }" @click="mode = 'risk'">异常监测</button>
          </div>
          <div class="map-actions">
            <button class="icon-button" title="重置视角" aria-label="重置地图视角" @click="mapScene?.reset()">
              <svg viewBox="0 0 24 24"><path d="M4 4v6h6M20 20v-6h-6M5.1 15a8 8 0 0 0 13.2 2M18.9 9A8 8 0 0 0 5.7 7" /></svg>
            </button>
            <button class="icon-button" :class="{ active: running }" :aria-label="running ? '暂停模拟' : '继续模拟'" @click="running = !running">
              <svg v-if="running" viewBox="0 0 24 24"><path d="M8 5v14M16 5v14" /></svg>
              <svg v-else viewBox="0 0 24 24"><path d="m8 5 11 7-11 7Z" /></svg>
            </button>
          </div>
        </header>

        <div ref="mapHost" class="map-host">
          <div v-if="loading" class="map-message"><i></i><span>正在构建三维地形</span></div>
          <div v-if="mapError" class="map-message error">当前浏览器无法启动 WebGL 地图</div>
          <div
            v-show="hoveredProvince"
            class="map-tooltip"
            :style="{ transform: `translate3d(${tooltip.x}px, ${tooltip.y}px, 0)` }"
          >
            <span>{{ hoveredProvince?.name }}</span>
            <strong>{{ compact(hoveredProvince?.value || 0) }}</strong>
            <small>实时访问</small>
          </div>
        </div>

        <article class="province-card">
          <header>
            <i></i>
            <div><small>SELECTED REGION</small><h2>{{ selectedProvince.name }}</h2></div>
            <strong>#{{ selectedProvince.rank }}</strong>
          </header>
          <dl>
            <div><dt>实时访问</dt><dd>{{ compact(selectedProvince.value) }}</dd></div>
            <div><dt>峰值 QPS</dt><dd>{{ number(selectedProvince.qps) }}</dd></div>
            <div><dt>平均延迟</dt><dd>{{ selectedProvince.latency }} ms</dd></div>
          </dl>
        </article>

        <div class="map-legend">
          <span><i class="line"></i>实时访问链路</span>
          <span><i class="node"></i>边缘节点</span>
          <span><i class="alert"></i>异常请求</span>
        </div>

        <footer class="map-caption">
          <span class="hint"><i></i>拖动旋转 · 滚轮缩放 · 点击查看省份</span>
          <div class="speed">
            <span>流速</span>
            <button v-for="item in [0.5, 1, 2]" :key="item" :class="{ active: speed === item }" @click="speed = item">{{ item }}x</button>
          </div>
        </footer>
      </section>

      <aside class="panel right-panel" aria-label="实时访问事件">
        <section class="panel-section events-section">
          <PanelTitle index="03" title="实时访问流"><span class="event-count">{{ visibleEvents.length }}</span></PanelTitle>
          <nav class="filters" aria-label="事件筛选">
            <button v-for="item in filters" :key="item.value" :class="{ active: filter === item.value }" @click="filter = item.value">{{ item.label }}</button>
          </nav>
          <TransitionGroup name="event" tag="ul" class="event-list" aria-live="polite">
            <li v-for="event in visibleEvents" :key="event.id" :class="event.type">
              <span class="event-icon">
                <svg v-if="event.type === 'normal'" viewBox="0 0 24 24"><path d="m5 12 4 4L19 6" /></svg>
                <svg v-else viewBox="0 0 24 24"><path d="M12 8v5M12 17h.01M10.3 4.6 3.2 17a2 2 0 0 0 1.7 3h14.2a2 2 0 0 0 1.7-3L13.7 4.6a2 2 0 0 0-3.4 0Z" /></svg>
              </span>
              <div>
                <header><strong>{{ event.city }}</strong><span>{{ event.time }}</span></header>
                <p>{{ event.message }}</p>
                <small>{{ event.ip }} · {{ event.duration }} ms</small>
              </div>
            </li>
          </TransitionGroup>
        </section>

        <section class="panel-section health-section">
          <PanelTitle index="04" title="节点健康度"><span class="health-score">98.6%</span></PanelTitle>
          <div class="nodes">
            <article v-for="node in nodes" :key="node.code">
              <div><i :class="node.status"></i><strong>{{ node.city }}</strong></div>
              <span>{{ node.code }}</span><small>{{ node.delay }} ms</small>
            </article>
          </div>
        </section>

        <footer class="risk-footer">
          <div><span>今日拦截</span><strong>{{ number(blocked) }}</strong></div>
          <div><span>风险等级</span><strong class="safe">低</strong></div>
        </footer>
      </aside>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onBeforeUnmount, onMounted, ref, watch } from "vue";
import chinaMap from "@svg-maps/china";
import { createChinaMapScene, type ChinaMapScene, type MapMode, type MapProvince } from "../utils/china-map-three";

useHead({ title: "全国实时访问态势", meta: [{ name: "description", content: "中国三维实时访问流量交互地图" }] });

const PanelTitle = defineComponent({
  props: { index: { type: String, required: true }, title: { type: String, required: true } },
  setup(props, { slots }) {
    return () => h("header", { class: "panel-title" }, [
      h("div", [h("span", props.index), h("h2", props.title)]),
      slots.default?.(),
    ]);
  },
});

type EventType = "normal" | "warning";
type FilterType = "all" | EventType;
interface ProvinceData extends MapProvince { qps: number; latency: number; rank: number }
interface TrafficEvent { id: number; city: string; message: string; time: string; ip: string; duration: number; type: EventType }

const names: Record<string, string> = {
  anhui: "安徽", beijing: "北京", chongqing: "重庆", fujian: "福建", gansu: "甘肃", guangdong: "广东",
  "guangxi-zhuang": "广西", guizhou: "贵州", hainan: "海南", hebei: "河北", heilongjiang: "黑龙江",
  henan: "河南", "hong-kong": "香港", hubei: "湖北", hunan: "湖南", jiangsu: "江苏", jiangxi: "江西",
  jilin: "吉林", liaoning: "辽宁", macau: "澳门", "nei-mongol": "内蒙古", "ningxia-hui": "宁夏",
  quinghai: "青海", shaanxi: "陕西", shandong: "山东", shanghai: "上海", shanxi: "山西", sichuan: "四川",
  tianjin: "天津", "xinjiang-uygur": "新疆", xizang: "西藏", yunnan: "云南", zhejiang: "浙江", taiwan: "台湾",
};
const topValues: Record<string, number> = {
  guangdong: 1642800, shanghai: 1457200, beijing: 1364800, jiangsu: 1189300, zhejiang: 1084600,
  shandong: 827500, sichuan: 741200, hubei: 692400, henan: 624900, fujian: 596800,
};

const provinceData = ref<ProvinceData[]>([
  ...chinaMap.locations.map((item, index) => ({
    id: item.id, name: names[item.id] || item.name,
    value: topValues[item.id] || 180000 + ((index * 79317) % 360000),
    qps: 1200 + ((index * 337) % 5600), latency: 18 + ((index * 7) % 34), rank: 0,
  })),
  { id: "taiwan", name: "台湾", value: 382600, qps: 2140, latency: 36, rank: 0 },
].sort((a, b) => b.value - a.value).map((item, index) => ({ ...item, rank: index + 1 })));

const mapHost = ref<HTMLElement | null>(null);
const loading = ref(true);
const mapError = ref(false);
const running = ref(true);
const mode = ref<MapMode>("traffic");
const speed = ref(1);
const selectedProvinceId = ref("shanghai");
const hoveredProvince = ref<MapProvince | null>(null);
const tooltip = ref({ x: 0, y: 0 });
const totalVisits = ref(12847592);
const currentQps = ref(18642);
const activeNodes = ref(24);
const latency = ref(28);
const trafficVolume = ref(842.6);
const blocked = ref(2847);
const now = ref<Date | null>(null);
const lastUpdated = ref("");
const history = ref([42, 46, 41, 48, 52, 49, 57, 61, 59, 65, 69, 63, 72, 78, 74, 82, 80, 86, 91, 87, 94, 89, 96, 93]);
const filter = ref<FilterType>("all");
const filters: { label: string; value: FilterType }[] = [{ label: "全部", value: "all" }, { label: "正常", value: "normal" }, { label: "异常", value: "warning" }];
const channels = [{ label: "移动端", value: 68 }, { label: "桌面端", value: 24 }, { label: "开放接口", value: 8 }];
const nodes = [
  { city: "上海", code: "EAST 01", delay: 18, status: "online" },
  { city: "北京", code: "NORTH 01", delay: 24, status: "online" },
  { city: "深圳", code: "SOUTH 02", delay: 21, status: "online" },
  { city: "成都", code: "WEST 01", delay: 35, status: "busy" },
];

const cityPool = ["上海", "深圳", "北京", "杭州", "成都", "武汉", "西安", "南京", "厦门", "青岛"];
const normalMessages = ["内容页访问", "开放接口调用", "静态资源请求", "用户登录成功", "数据查询完成"];
const warningMessages = ["高频访问已限流", "异常请求已拦截", "身份校验失败", "访问频率触发阈值"];
let eventId = 0;
const makeEvent = (index: number): TrafficEvent => {
  const warning = index % 5 === 4;
  return {
    id: ++eventId, city: cityPool[index % cityPool.length],
    message: warning ? warningMessages[index % warningMessages.length] : normalMessages[index % normalMessages.length],
    time: new Date(Date.now() - index * 17000).toLocaleTimeString("zh-CN", { hour12: false }),
    ip: `10.${12 + (index % 8)}.${24 + ((index * 11) % 180)}.${38 + ((index * 17) % 200)}`,
    duration: 18 + ((index * 13) % 96), type: warning ? "warning" : "normal",
  };
};
const events = ref(Array.from({ length: 10 }, (_, index) => makeEvent(index)));

const selectedProvince = computed(() => provinceData.value.find((item) => item.id === selectedProvinceId.value) || provinceData.value[0]);
const hotRegions = computed(() => provinceData.value.slice(0, 6).map((item) => ({ ...item, ratio: Math.round(item.value / provinceData.value[0].value * 100) })));
const visibleEvents = computed(() => events.value.filter((item) => filter.value === "all" || item.type === filter.value).slice(0, 8));
const nowTime = computed(() => now.value?.toLocaleTimeString("zh-CN", { hour12: false }) || "00:00:00");
const nowDate = computed(() => now.value?.toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }).replaceAll("/", ".") || "0000.00.00");
const sparkPoints = computed(() => history.value.map((value, index) => `${index / (history.value.length - 1) * 240},${68 - (value - 35) / 65 * 60}`).join(" "));
const sparkArea = computed(() => `M0 74 L${sparkPoints.value.replaceAll(" ", " L")} L240 74Z`);
const number = (value: number) => Math.round(value).toLocaleString("zh-CN");
const compact = (value: number) => value >= 10000 ? `${(value / 10000).toFixed(1)}万` : number(value);

let mapScene: ChinaMapScene | null = null;
let clockTimer = 0;
let dataTimer = 0;

const updateData = () => {
  if (!running.value) return;
  currentQps.value = Math.max(12000, currentQps.value + Math.round((Math.random() - 0.42) * 900 * speed.value));
  totalVisits.value += Math.round(currentQps.value * 1.4 * speed.value);
  trafficVolume.value = Math.max(620, trafficVolume.value + (Math.random() - 0.46) * 24 * speed.value);
  latency.value = Math.max(18, Math.min(58, latency.value + Math.round((Math.random() - 0.5) * 5)));
  if (Math.random() > 0.6) blocked.value += 1;
  history.value = [...history.value.slice(1), Math.max(45, Math.min(99, history.value.at(-1)! + (Math.random() - 0.45) * 9))];
  const randomIndex = Math.random() > 0.78 ? 4 : Math.floor(Math.random() * cityPool.length);
  const nextEvent = makeEvent(randomIndex);
  events.value = [nextEvent, ...events.value].slice(0, 12);
  lastUpdated.value = nextEvent.time;
  provinceData.value = provinceData.value.map((item) => item.id === selectedProvinceId.value
    ? { ...item, value: item.value + Math.round(Math.random() * 820), qps: Math.max(600, item.qps + Math.round((Math.random() - 0.45) * 120)) }
    : item);
};

watch(running, (value) => mapScene?.setRunning(value));
watch(speed, (value) => mapScene?.setSpeed(value));
watch(mode, (value) => mapScene?.setMode(value));
watch(selectedProvinceId, (value) => mapScene?.setSelected(value));

onMounted(() => {
  now.value = new Date();
  lastUpdated.value = now.value.toLocaleTimeString("zh-CN", { hour12: false });
  clockTimer = window.setInterval(() => { now.value = new Date(); }, 1000);
  dataTimer = window.setInterval(updateData, 1450);
  try {
    if (!mapHost.value) return;
    mapScene = createChinaMapScene(mapHost.value, {
      provinces: provinceData.value,
      onHover: (province, point) => {
        hoveredProvince.value = province;
        if (point) tooltip.value = point;
      },
      onSelect: (id) => { selectedProvinceId.value = id; },
    });
    loading.value = false;
  } catch (error) {
    console.error("Failed to initialize China map", error);
    loading.value = false;
    mapError.value = true;
  }
});

onBeforeUnmount(() => {
  window.clearInterval(clockTimer);
  window.clearInterval(dataTimer);
  mapScene?.dispose();
  mapScene = null;
});
</script>

<style lang="less" scoped>
@cyan: #60e8ff;
@orange: #ff7759;
@muted: #71909a;
@line: rgba(105, 219, 240, 0.16);
@panel: rgba(7, 23, 34, 0.8);

.map-page {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  height: 100vh;
  min-height: 680px;
  overflow: hidden;
  color: #eafcff;
  background:
    radial-gradient(circle at 48% 46%, rgba(17, 116, 137, 0.2), transparent 38%),
    linear-gradient(135deg, #050c13, #07141d 48%, #040b12);
  font-family: Inter, "DIN Alternate", "Microsoft YaHei", sans-serif;
  user-select: none;
}

.page-grid {
  position: absolute;
  inset: 0;
  opacity: 0.17;
  background-image: linear-gradient(rgba(77, 193, 215, 0.13) 1px, transparent 1px), linear-gradient(90deg, rgba(77, 193, 215, 0.13) 1px, transparent 1px);
  background-size: 44px 44px;
  mask-image: linear-gradient(to bottom, #000, transparent 86%);
  pointer-events: none;
}

.ambient { position: absolute; border-radius: 50%; filter: blur(110px); pointer-events: none; }
.ambient-left { width: 420px; height: 420px; left: 18%; top: 17%; background: rgba(11, 157, 190, 0.11); }
.ambient-right { width: 320px; height: 320px; right: 5%; bottom: 0; background: rgba(255, 107, 73, 0.055); }

.topbar {
  position: relative;
  z-index: 5;
  display: grid;
  grid-template-columns: minmax(250px, 1fr) auto minmax(180px, 1fr);
  align-items: center;
  min-height: 86px;
  padding: 0 28px;
  border-bottom: 1px solid @line;
  background: rgba(4, 14, 21, 0.78);
  backdrop-filter: blur(18px);
}
.topbar::after { content: ""; position: absolute; right: 28px; bottom: -1px; left: 28px; height: 1px; opacity: 0.45; background: linear-gradient(90deg, @cyan, transparent 22%, transparent 78%, @cyan); }
.brand, .top-metrics, .clock, .panel-title > div, .province-card header, .nodes article > div { display: flex; align-items: center; }
.brand { gap: 14px; }
.brand-mark { position: relative; display: grid; place-items: center; width: 42px; height: 42px; border: 1px solid rgba(96, 232, 255, 0.38); transform: rotate(45deg); }
.brand-mark::before { content: ""; width: 19px; height: 19px; border: 1px solid @cyan; }
.brand-mark i { position: absolute; width: 4px; height: 4px; background: @cyan; box-shadow: 0 0 12px @cyan; }
.brand-mark i:nth-child(1) { top: -2px; left: -2px; }
.brand-mark i:nth-child(2) { right: -2px; bottom: -2px; }
.brand-mark i:nth-child(3) { top: 17px; left: 17px; }
.brand p { margin-bottom: 5px; color: #547784; font: 600 10px/1.2 "Segoe UI", sans-serif; letter-spacing: 0.16em; }
.brand h1 { font-size: 22px; font-weight: 600; letter-spacing: 0.08em; }
.top-metrics { justify-content: center; height: 100%; }
.top-metrics article { min-width: 165px; padding: 0 28px; border-left: 1px solid @line; }
.top-metrics article:last-child { border-right: 1px solid @line; }
.top-metrics span { display: block; margin-bottom: 4px; color: @muted; font-size: 12px; }
.top-metrics strong { display: block; color: #f3fdff; font: 500 22px/1.1 "DIN Alternate", "Segoe UI", sans-serif; letter-spacing: 0.04em; }
.top-metrics em { color: @muted; font-size: 12px; font-style: normal; }
.top-metrics small { color: #4fd9a2; font: 400 11px/1.5 "Segoe UI", sans-serif; }
.top-metrics .healthy::before { content: ""; display: inline-block; width: 5px; height: 5px; margin-right: 5px; border-radius: 50%; background: #4fd9a2; box-shadow: 0 0 7px #4fd9a2; }
.clock { justify-self: end; gap: 10px; }
.clock > i { width: 8px; height: 8px; border-radius: 50%; background: #55e7a6; box-shadow: 0 0 0 5px rgba(85, 231, 166, 0.1), 0 0 14px #55e7a6; animation: live-pulse 2s infinite; }
.clock > div { display: flex; flex-direction: column; align-items: flex-end; }
.clock strong { font: 500 19px/1.2 "DIN Alternate", monospace; letter-spacing: 0.06em; }
.clock span { color: @muted; font: 11px/1.6 monospace; }

.dashboard { position: relative; z-index: 2; display: grid; grid-template-columns: 284px minmax(480px, 1fr) 320px; flex: 1; min-height: 0; gap: 18px; padding: 18px 22px 22px; }
.panel { position: relative; display: flex; flex-direction: column; min-height: 0; border: 1px solid @line; background: @panel; box-shadow: 0 18px 50px rgba(0, 0, 0, 0.22); backdrop-filter: blur(16px); }
.panel::before, .panel::after { content: ""; position: absolute; width: 22px; height: 22px; pointer-events: none; }
.panel::before { top: -1px; left: -1px; border-top: 2px solid @cyan; border-left: 2px solid @cyan; }
.panel::after { right: -1px; bottom: -1px; border-right: 2px solid @cyan; border-bottom: 2px solid @cyan; }
.panel-section { padding: 20px; }
.panel-section + .panel-section { border-top: 1px solid @line; }
.panel-title { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.panel-title > div { gap: 9px; }
.panel-title > div span { color: @cyan; font: 600 10px/1 monospace; }
.panel-title h2 { font-size: 15px; font-weight: 600; letter-spacing: 0.06em; }
.live-chip { padding: 4px 7px; border: 1px solid rgba(79, 217, 162, 0.28); color: #61eab2; background: rgba(79, 217, 162, 0.08); font: 600 9px/1 monospace; letter-spacing: 0.12em; }
.muted { color: @muted; font-size: 11px; }
.traffic-total > span { display: block; margin-bottom: 4px; color: @muted; font-size: 12px; }
.traffic-total strong { color: @cyan; font: 500 34px/1.1 "DIN Alternate", sans-serif; text-shadow: 0 0 22px rgba(96, 232, 255, 0.24); }
.traffic-total small { color: @muted; font-size: 10px; }
.sparkline { margin-top: 17px; }
.sparkline svg { display: block; width: 100%; height: 74px; overflow: visible; }
.sparkline > div { display: flex; justify-content: space-between; margin-top: 4px; color: #4d6b77; font: 9px/1 monospace; }
.channel-list { display: grid; gap: 12px; margin-top: 21px; }
.channel-list p { display: flex; justify-content: space-between; margin-bottom: 7px; color: #9ab3bd; font-size: 11px; }
.channel-list p strong { color: #d9f9ff; font: 500 11px/1 monospace; }
.bar { display: block; height: 3px; background: rgba(123, 213, 229, 0.09); }
.bar i { display: block; height: 100%; background: linear-gradient(90deg, #168fab, @cyan); box-shadow: 0 0 8px rgba(96, 232, 255, 0.45); }
.ranking { flex: 1; min-height: 0; }
.ranking ol { display: grid; gap: 5px; }
.ranking li { display: grid; grid-template-columns: 26px 42px 1fr 48px; align-items: center; gap: 7px; min-height: 32px; padding: 0 6px; cursor: pointer; transition: background 0.2s; }
.ranking li:hover { background: rgba(96, 232, 255, 0.06); }
.ranking .rank { color: #57717a; font: 10px/1 monospace; }
.ranking .rank.top { color: @cyan; }
.ranking li > span:nth-child(2) { font-size: 12px; }
.rank-bar { height: 2px; background: rgba(96, 232, 255, 0.08); }
.rank-bar i { display: block; height: 100%; background: linear-gradient(90deg, #1c8299, @cyan); }
.ranking li strong { color: #91adb6; font: 500 10px/1 monospace; text-align: right; }
.panel-footer, .risk-footer { display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding: 13px 18px; border-top: 1px solid @line; color: #65818b; font: 10px/1.4 "Segoe UI", sans-serif; }
.panel-footer > span:first-child { color: #89aaae; }
.panel-footer i { display: inline-block; width: 5px; height: 5px; margin-right: 6px; border-radius: 50%; background: #4fd9a2; box-shadow: 0 0 6px #4fd9a2; }

.map-stage { position: relative; min-width: 0; min-height: 0; overflow: hidden; border: 1px solid rgba(104, 220, 241, 0.1); background: radial-gradient(circle at 50% 48%, rgba(12, 103, 126, 0.13), transparent 54%); }
.map-stage::before, .map-stage::after { content: ""; position: absolute; z-index: 1; top: 50%; left: 50%; aspect-ratio: 1; border: 1px solid rgba(67, 207, 232, 0.08); border-radius: 50%; transform: translate(-50%, -50%); pointer-events: none; }
.map-stage::before { width: 74%; }
.map-stage::after { width: 49%; }
.map-toolbar { position: absolute; z-index: 5; top: 15px; right: 16px; left: 16px; display: flex; justify-content: space-between; pointer-events: none; }
.mode-switch, .map-actions { display: flex; gap: 3px; pointer-events: auto; }
.mode-switch { padding: 3px; border: 1px solid @line; background: rgba(5, 17, 25, 0.78); }
button { border: 0; color: inherit; font: inherit; cursor: pointer; }
.mode-switch button { padding: 8px 14px; color: #71919c; background: transparent; font-size: 11px; transition: 0.2s; }
.mode-switch button.active { color: #defbff; background: rgba(64, 190, 214, 0.14); box-shadow: inset 0 -1px @cyan; }
.icon-button { display: grid; place-items: center; width: 34px; height: 34px; border: 1px solid @line; background: rgba(5, 17, 25, 0.78); }
.icon-button:hover, .icon-button.active { border-color: rgba(96, 232, 255, 0.42); background: rgba(48, 183, 208, 0.12); }
.icon-button svg { width: 16px; height: 16px; fill: none; stroke: #9cc4cd; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
.map-host { position: absolute; z-index: 2; inset: 0; }
.map-host :deep(.china-map-canvas) { display: block; width: 100%; height: 100%; outline: none; }
.map-message { position: absolute; z-index: 8; display: grid; place-content: center; justify-items: center; inset: 0; gap: 12px; color: #7fa2ac; background: rgba(5, 14, 21, 0.76); font-size: 12px; letter-spacing: 0.08em; }
.map-message i { width: 32px; height: 32px; border: 1px solid rgba(96, 232, 255, 0.15); border-top-color: @cyan; border-radius: 50%; animation: spin 0.9s linear infinite; }
.map-message.error { color: #dfa190; }
.map-tooltip { position: absolute; z-index: 8; top: 0; left: 0; width: 128px; padding: 10px 12px; border-left: 2px solid @cyan; background: rgba(5, 19, 28, 0.94); box-shadow: 0 10px 28px rgba(0, 0, 0, 0.3); pointer-events: none; }
.map-tooltip span, .map-tooltip small { display: block; color: #7898a3; font-size: 10px; }
.map-tooltip strong { display: inline-block; margin: 5px 5px 0 0; color: @cyan; font: 500 18px/1 "DIN Alternate", monospace; }
.province-card { position: absolute; z-index: 4; top: 67px; left: 16px; width: 212px; padding: 15px; border-left: 2px solid @cyan; background: rgba(5, 18, 27, 0.72); backdrop-filter: blur(10px); pointer-events: none; }
.province-card header { gap: 10px; }
.province-card header > i { width: 8px; height: 8px; border-radius: 50%; background: @cyan; box-shadow: 0 0 0 5px rgba(96, 232, 255, 0.08), 0 0 12px @cyan; }
.province-card header small { color: #52727d; font: 8px/1.3 monospace; letter-spacing: 0.12em; }
.province-card h2 { margin-top: 2px; font-size: 17px; font-weight: 600; }
.province-card header > strong { margin-left: auto; color: rgba(96, 232, 255, 0.32); font: 500 18px/1 monospace; }
.province-card dl { display: grid; grid-template-columns: repeat(3, 1fr); margin-top: 13px; padding-top: 11px; border-top: 1px solid @line; }
.province-card dl > div + div { padding-left: 9px; border-left: 1px solid @line; }
.province-card dt { color: #5e7d87; font-size: 9px; }
.province-card dd { margin-top: 5px; color: #b8dce3; font: 500 11px/1 monospace; }
.map-legend { position: absolute; z-index: 4; top: 67px; right: 16px; display: grid; gap: 9px; padding: 11px 13px; border: 1px solid @line; color: #6a8892; background: rgba(5, 17, 25, 0.68); font-size: 9px; pointer-events: none; }
.map-legend span { display: flex; align-items: center; gap: 7px; }
.map-legend i.line { width: 18px; height: 1px; background: @cyan; box-shadow: 0 0 6px @cyan; }
.map-legend i.node, .map-legend i.alert { width: 5px; height: 5px; border-radius: 50%; }
.map-legend i.node { background: @cyan; box-shadow: 0 0 6px @cyan; }
.map-legend i.alert { background: @orange; box-shadow: 0 0 6px @orange; }
.map-caption { position: absolute; z-index: 5; right: 17px; bottom: 14px; left: 17px; display: flex; align-items: center; justify-content: space-between; pointer-events: none; }
.hint { display: flex; align-items: center; gap: 8px; color: #587680; font-size: 10px; }
.hint i { position: relative; width: 12px; height: 17px; border: 1px solid #587680; border-radius: 7px; }
.hint i::before { content: ""; position: absolute; top: 3px; left: 5px; width: 1px; height: 4px; background: @cyan; }
.speed { display: flex; align-items: center; gap: 3px; padding: 3px; border: 1px solid @line; color: #66858f; background: rgba(5, 17, 25, 0.78); pointer-events: auto; }
.speed > span { padding: 0 7px; font-size: 10px; }
.speed button { min-width: 31px; padding: 5px; color: #66858f; background: transparent; font: 10px/1 monospace; }
.speed button.active { color: @cyan; background: rgba(96, 232, 255, 0.1); }

.right-panel { overflow: hidden; }
.events-section { display: flex; flex: 1; flex-direction: column; min-height: 0; padding-bottom: 8px; }
.event-count { display: grid; place-items: center; min-width: 22px; height: 20px; color: @cyan; background: rgba(96, 232, 255, 0.08); font: 10px/1 monospace; }
.filters { display: grid; grid-template-columns: repeat(3, 1fr); margin-bottom: 10px; border-bottom: 1px solid @line; }
.filters button { padding: 8px; color: #607f89; background: transparent; font-size: 10px; }
.filters button.active { color: @cyan; box-shadow: inset 0 -1px @cyan; }
.event-list { min-height: 0; overflow: hidden; }
.event-list li { display: flex; gap: 10px; padding: 11px 5px; border-bottom: 1px solid rgba(108, 216, 236, 0.08); }
.event-icon { display: grid; flex: 0 0 24px; place-items: center; width: 24px; height: 24px; border: 1px solid rgba(96, 232, 255, 0.18); color: @cyan; background: rgba(96, 232, 255, 0.05); }
.event-icon svg { width: 13px; height: 13px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.event-list .warning .event-icon { border-color: rgba(255, 119, 89, 0.24); color: @orange; background: rgba(255, 119, 89, 0.06); }
.event-list li > div { flex: 1; min-width: 0; }
.event-list header { display: flex; justify-content: space-between; }
.event-list strong { font-size: 11px; font-weight: 600; }
.event-list header span, .event-list small { color: #4f6f79; font: 9px/1.3 monospace; }
.event-list p { margin: 4px 0; overflow: hidden; color: #8ca8b0; font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
.event-list .warning p { color: #d59a8c; }
.event-enter-active, .event-leave-active { transition: all 0.35s ease; }
.event-enter-from { opacity: 0; transform: translateY(-12px); }
.event-leave-to { opacity: 0; transform: translateX(18px); }
.health-section { padding-top: 16px; }
.health-section .panel-title { margin-bottom: 15px; }
.health-score { color: #55e7a6; font: 500 11px/1 monospace; }
.nodes { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; }
.nodes article { padding: 9px; border: 1px solid rgba(103, 213, 233, 0.1); background: rgba(38, 92, 105, 0.05); }
.nodes article > div { gap: 6px; }
.nodes strong { font-size: 10px; font-weight: 500; }
.nodes article > span { display: block; margin-top: 5px; color: #4d6b75; font: 8px/1 monospace; }
.nodes small { color: #7395a0; font: 9px/1.5 monospace; }
.nodes i { width: 5px; height: 5px; border-radius: 50%; background: #55e7a6; box-shadow: 0 0 6px #55e7a6; }
.nodes i.busy { background: #ffc65a; box-shadow: 0 0 6px #ffc65a; }
.risk-footer { gap: 12px; }
.risk-footer div { display: flex; align-items: baseline; gap: 8px; }
.risk-footer strong { color: #c8e6eb; font: 500 12px/1 monospace; }
.risk-footer strong.safe { color: #55e7a6; }

@keyframes spin { to { transform: rotate(360deg); } }
@keyframes live-pulse { 50% { box-shadow: 0 0 0 8px rgba(85, 231, 166, 0), 0 0 18px #55e7a6; } }

@media (max-width: 1180px) {
  .dashboard { grid-template-columns: 250px minmax(450px, 1fr) 280px; gap: 12px; padding: 12px; }
  .top-metrics article { min-width: 140px; padding: 0 18px; }
  .panel-section { padding: 16px; }
}

@media (max-width: 940px) {
  .map-page { height: auto; min-height: 100vh; overflow: auto; }
  .topbar { grid-template-columns: 1fr auto; min-height: 78px; }
  .top-metrics { display: none; }
  .dashboard { grid-template-columns: 1fr 1fr; grid-template-rows: minmax(620px, 72vh) auto; }
  .map-stage { grid-column: 1 / -1; grid-row: 1; }
  .left-panel { grid-column: 1; grid-row: 2; }
  .right-panel { grid-column: 2; grid-row: 2; }
  .event-list { max-height: 420px; }
}

@media (max-width: 620px) {
  .map-page.pc { display: flex !important; }
  .map-page { min-height: 100svh; }
  .topbar { padding: 0 15px; }
  .brand p { display: none; }
  .brand h1 { font-size: 17px; }
  .brand-mark { width: 32px; height: 32px; }
  .brand-mark::before { width: 14px; height: 14px; }
  .brand-mark i:nth-child(3) { top: 13px; left: 13px; }
  .clock strong { font-size: 14px; }
  .dashboard { display: flex; flex-direction: column; padding: 8px; }
  .map-stage { flex: none; height: 68vh; min-height: 500px; }
  .left-panel, .right-panel { min-height: auto; }
  .map-legend { display: none; }
  .province-card { top: 62px; left: 10px; width: 190px; }
  .province-card dl { grid-template-columns: 1fr 1fr; }
  .province-card dl > div:last-child { display: none; }
  .map-toolbar { top: 10px; right: 10px; left: 10px; }
  .hint { display: none; }
  .map-caption { justify-content: flex-end; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
}
</style>
