<template>
  <div id="pages_editor">
    <header class="editor_header">
      <div class="header_side brand_area">
        <strong>江苏久引剪辑</strong>
        <!-- <button type="button">菜单</button> -->
        <!-- <span>已自动保存</span> -->
      </div>

      <label class="project_name">
        <span class="sr_only">项目名称</span>
        <input v-model="projectName" aria-label="项目名称" />
      </label>

      <div class="header_side header_actions">
        <!-- <button type="button" :disabled="!canUndo" @click="undo">撤销</button> -->
        <!-- <button type="button" :disabled="!canRedo" @click="redo">重做</button> -->
        <button type="button" @click="notify('分享链接已复制')">分享</button>
        <button type="button" class="primary" @click="startExport">导出</button>
        <button @click="go_user">返回</button>
      </div>
    </header>

    <main class="editor_main">
      <section class="workbench">
        <aside class="panel media_panel">
          <nav class="media_tabs" aria-label="素材工具">
            <button
              v-for="tab in mediaTabs"
              :key="tab"
              type="button"
              :class="{ active: mediaTab === tab }"
              @click="mediaTab = tab"
            >
              {{ tab }}
            </button>
          </nav>

          <div v-if="mediaTab === '素材'" class="media_content">
            <div class="media_toolbar">
              <div class="import_actions">
                <button type="button" class="primary" @click="pickFiles">导入素材</button>
                <button type="button" :disabled="exampleLoading" @click="loadExampleAsset">
                  {{ exampleLoading ? '读取中' : '载入示例' }}
                </button>
              </div>
              <input
                ref="fileInput"
                class="sr_only"
                type="file"
                accept="video/*,audio/*,image/*"
                multiple
                @change="importFiles"
              />
              <span>{{ assets.length }} 个文件</span>
            </div>

            <div class="asset_grid">
              <article
                v-for="asset in assets"
                :key="asset.id"
                class="asset_card"
                draggable="true"
                @dragstart="dragAsset($event, asset.id)"
              >
                <div class="asset_preview" :class="asset.type" :style="assetPreviewStyle(asset)">
                  <strong v-if="asset.type === 'audio' || asset.thumbnails.length === 0">
                    {{ asset.type === 'video' ? '正在生成封面' : mediaTypeName(asset.type) }}
                  </strong>
                  <small>{{ formatTime(asset.duration) }}</small>
                </div>
                <div class="asset_info">
                  <span :title="asset.name">{{ asset.name }}</span>
                  <button type="button" :disabled="asset.duration <= 0" @click="addToTimeline(asset)">
                    {{ asset.duration > 0 ? '添加' : '处理中' }}
                  </button>
                </div>
              </article>
            </div>

            <!-- <div class="drop_tip">
              <strong>本地素材库</strong>
              <p>支持视频、音频和图片，可点击添加，也可拖到时间线。</p>
            </div> -->
          </div>

          <div v-else class="placeholder">
            <strong>{{ mediaTab }}</strong>
            <p>打开江苏九引智能体自动辅助编辑</p>
            <button type="button" @click="mediaTab = '素材'">返回素材</button>
          </div>
        </aside>

        <section class="panel player_panel">
          <div class="panel_title">
            <!-- <span>播放器</span> -->
            <small>{{ previewClip?.name || '空项目' }}</small>
          </div>

          <div class="player_stage">
            <div v-if="previewClip" class="video_canvas">
              <video
                v-if="previewClip.type === 'video'"
                ref="videoElement"
                :key="previewClip.id"
                :src="previewClip.url"
                preload="metadata"
                playsinline
                :muted="previewClip.muted"
                :style="videoStyle"
                @loadedmetadata="onMetadata"
              ></video>
              <img
                v-else-if="previewClip.type === 'image'"
                :key="previewClip.id"
                :src="previewClip.url"
                :alt="previewClip.name"
                :style="videoStyle"
              />
              <div v-else class="audio_preview">音频片段</div>
            </div>
            <div v-else class="empty_player">
              <strong>预览窗口</strong>
              <span>将素材添加到时间线后开始编辑</span>
            </div>
          </div>

          <div class="player_controls">
            <span>{{ formatTime(currentTime, true) }} / {{ formatTime(totalDuration, true) }}</span>
            <div>
              <button type="button" @click="seek(currentTime - 5)">后退 5 秒</button>
              <button type="button" class="play" :disabled="playbackClips.length === 0" @click="togglePlay">
                {{ playing ? '暂停' : '播放' }}
              </button>
              <button type="button" @click="seek(currentTime + 5)">前进 5 秒</button>
            </div>
            <div class="view_actions">
              <button type="button" @click="fitMode = fitMode === 'contain' ? 'cover' : 'contain'">
                {{ fitMode === 'contain' ? '适应' : '填充' }}
              </button>
              <button type="button" @click="fullscreen">全屏</button>
            </div>
          </div>
        </section>

        <aside class="panel inspector_panel">
          <nav class="inspector_tabs" aria-label="片段属性">
            <button
              v-for="tab in inspectorTabs"
              :key="tab"
              type="button"
              :class="{ active: inspectorTab === tab }"
              @click="inspectorTab = tab"
            >
              {{ tab }}
            </button>
          </nav>

          <div v-if="selectedClip" class="inspector_content">
            <div class="clip_summary">
              <span>{{ mediaTypeName(selectedClip.type) }}</span>
              <div>
                <strong>{{ selectedClip.name }}</strong>
                <small>{{ formatTime(selectedClip.end - selectedClip.start) }}</small>
              </div>
            </div>

            <section v-if="inspectorTab === '画面'" class="settings">
              <h3>基础画面</h3>
              <label class="range_row">
                <span>缩放 <em>{{ selectedClip.scale }}%</em></span>
                <input v-model.number="selectedClip.scale" type="range" min="50" max="180" />
              </label>
              <label class="range_row">
                <span>旋转 <em>{{ selectedClip.rotation }}°</em></span>
                <input v-model.number="selectedClip.rotation" type="range" min="-180" max="180" />
              </label>
              <label class="range_row">
                <span>不透明度 <em>{{ selectedClip.opacity }}%</em></span>
                <input v-model.number="selectedClip.opacity" type="range" min="10" max="100" />
              </label>
              <button type="button" class="wide_button" @click="resetPicture">重置画面参数</button>
            </section>

            <section v-if="inspectorTab === '画面'" class="settings">
              <h3>裁切范围</h3>
              <label class="number_row">
                <span>素材起点</span>
                <input
                  v-model.number="selectedClip.trimStart"
                  type="number"
                  min="0"
                  :max="Math.max(0, selectedClip.trimEnd - 0.2)"
                  step="0.1"
                  @change="updateDuration"
                />
              </label>
              <label class="number_row">
                <span>素材终点</span>
                <input
                  v-model.number="selectedClip.trimEnd"
                  type="number"
                  :min="selectedClip.trimStart + 0.2"
                  :max="selectedClip.sourceDuration"
                  step="0.1"
                  @change="updateDuration"
                />
              </label>
            </section>

            <section v-else-if="inspectorTab === '音频'" class="settings">
              <h3>声音设置</h3>
              <label class="range_row">
                <span>音量 <em>{{ selectedClip.volume }}%</em></span>
                <input v-model.number="selectedClip.volume" type="range" min="0" max="200" @input="syncVolume" />
              </label>
              <button type="button" class="wide_button" @click="selectedClip.muted = !selectedClip.muted">
                {{ selectedClip.muted ? '恢复声音' : '关闭声音' }}
              </button>
            </section>

            <section v-else-if="inspectorTab === '变速'" class="settings">
              <h3>播放速度</h3>
              <label class="range_row">
                <span>速度 <em>{{ selectedClip.speed.toFixed(1) }} 倍</em></span>
                <input
                  v-model.number="selectedClip.speed"
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  @input="updateDuration"
                />
              </label>
              <div class="speed_buttons">
                <button v-for="rate in [0.5, 1, 1.5, 2]" :key="rate" type="button" @click="setSpeed(rate)">
                  {{ rate }} 倍
                </button>
              </div>
            </section>

            <section class="settings clip_info">
              <h3>片段信息</h3>
              <p><span>开始</span><strong>{{ formatTime(selectedClip.start, true) }}</strong></p>
              <p><span>结束</span><strong>{{ formatTime(selectedClip.end, true) }}</strong></p>
              <p><span>画布</span><strong>16:9 · 30 帧/秒</strong></p>
            </section>
          </div>

          <div v-else class="draft_info">
            <strong>草稿参数</strong>
            <p><span>草稿名称</span><em>{{ projectName }}</em></p>
            <p><span>画布比例</span><em>16:9</em></p>
            <p><span>草稿帧率</span><em>30 帧/秒</em></p>
          </div>
        </aside>
      </section>

      <footer class="panel timeline_panel">
        <div class="timeline_toolbar">
          <div>
            <button type="button" @click="pickFiles">添加素材</button>
            <button type="button" :disabled="!selectedClip" @click="splitClip">分割</button>
            <button type="button" :disabled="!selectedClip" @click="deleteClip">删除</button>
            <button type="button" :disabled="!canUndo" @click="undo">撤销</button>
            <button type="button" :disabled="!canRedo" @click="redo">重做</button>
          </div>
          <span>{{ clips.length }} 个片段</span>
          <label>
            时间线缩放
            <input v-model.number="pixelsPerSecond" type="range" min="35" max="130" step="5" />
          </label>
        </div>

        <div class="timeline_body">
          <div class="track_labels">
            <div class="ruler_label">时间</div>
            <strong v-for="track in tracks" :key="track.id">
              {{ track.name }}
              <small>{{ track.description }}</small>
            </strong>
          </div>

          <div class="timeline_scroll">
            <div
              ref="timelineContent"
              class="timeline_content"
              :style="{ width: `${timelineWidth}px` }"
              @click="seekByClick"
              @dragover.prevent
            >
              <div class="ruler">
                <span
                  v-for="mark in rulerMarks"
                  :key="mark"
                  :class="{ major: mark % 5 === 0 }"
                  :style="{ left: `${mark * pixelsPerSecond}px` }"
                >
                  {{ mark % 5 === 0 ? rulerLabel(mark) : '' }}
                </span>
              </div>

              <div
                v-for="track in tracks"
                :key="track.id"
                class="track_lane"
                :class="track.kind"
                @dragover.prevent
                @drop.stop="dropAsset($event, track.id)"
              >
                <button
                  v-for="clip in clipsForTrack(track.id)"
                  :key="clip.id"
                  type="button"
                  class="timeline_clip"
                  :class="[{ selected: selectedClipId === clip.id }, clip.type]"
                  :style="clipPosition(clip)"
                  @pointerdown.stop="startClipDrag($event, clip)"
                >
                  <span>{{ clip.name }}</span>
                  <i class="clip_frames">
                    <b
                      v-for="(frame, index) in clipThumbnails(clip)"
                      :key="`${clip.id}_${index}`"
                      :style="{ backgroundImage: `url(${frame})` }"
                    ></b>
                  </i>
                  <em></em>
                </button>
                <div v-if="track.id === 'main' && clipsForTrack(track.id).length === 0" class="empty_track">
                  将素材拖到主轨道，或点击素材上的添加
                </div>
              </div>

              <div
                class="playhead"
                :style="{ left: `${currentTime * pixelsPerSecond}px` }"
                @pointerdown.stop="dragPlayhead"
              >
                <span></span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>

    <div v-if="toast" class="toast" role="status">{{ toast }}</div>

    <div v-if="exporting" class="export_mask" role="dialog" aria-modal="true" aria-label="导出进度">
      <div class="export_dialog">
        <strong>{{ exportTitle }}</strong>
        <p>{{ exportMessage }}</p>
        <div class="progress"><span :style="{ width: `${exportProgress}%` }"></span></div>
        <em>{{ exportProgress }}%</em>
        <button v-if="exportProgress < 100" type="button" @click="cancelExport">取消导出</button>
        <div v-else class="export_actions">
          <a class="primary" :href="exportDownloadUrl" :download="exportFilename">下载视频</a>
          <button type="button" @click="exporting = false">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

type MediaType = 'video' | 'audio' | 'image'

interface Asset {
  id: string
  name: string
  type: MediaType
  url: string
  duration: number
  thumbnails: string[]
}

interface Clip extends Asset {
  assetId: string
  trackId: string
  start: number
  end: number
  trimStart: number
  trimEnd: number
  sourceDuration: number
  volume: number
  muted: boolean
  speed: number
  scale: number
  rotation: number
  opacity: number
}

interface Track {
  id: string
  name: string
  description: string
  kind: 'visual' | 'audio' | 'text'
}

interface Snapshot {
  clips: Clip[]
  selectedClipId: string
  currentTime: number
}

const projectName = ref('8月27日视频草稿')
const mediaTabs = ['素材', '智能体']
const inspectorTabs = ['画面', '音频', '变速']
const tracks: Track[] = [
  { id: 'main', name: '主视频', description: '连续播放', kind: 'visual' },
  { id: 'overlay', name: '画中画', description: '叠加画面', kind: 'visual' },
  { id: 'audio', name: '音频', description: '声音与配乐', kind: 'audio' },
  { id: 'text', name: '文字', description: '字幕与标题', kind: 'text' },
]
const mediaTab = ref('素材')
const inspectorTab = ref('画面')
const fileInput = ref<HTMLInputElement | null>(null)
const videoElement = ref<HTMLVideoElement | null>(null)
const timelineContent = ref<HTMLElement | null>(null)
const fitMode = ref<'contain' | 'cover'>('contain')
const playing = ref(false)
const currentTime = ref(0)
const pixelsPerSecond = ref(70)
const toast = ref('')
const exporting = ref(false)
const exportProgress = ref(0)
const exportTitle = ref('正在准备导出')
const exportMessage = ref('正在读取时间线中的媒体素材。')
const exportDownloadUrl = ref('')
const exportFilename = ref('')
const exampleLoading = ref(false)
const undoStack = ref<Snapshot[]>([])
const redoStack = ref<Snapshot[]>([])
const objectUrls = new Set<string>()
let clipIndex = 1
let toastTimer: ReturnType<typeof setTimeout> | undefined
let playbackFrame = 0
let playbackStartedAt = 0
let playbackStartTime = 0
let exportCancelled = false
let clipboardClip: Clip | null = null
let go_user = ()=>{
  useRouter().push('/user')
}
const assets = ref<Asset[]>([])
const clips = ref<Clip[]>([])

const selectedClipId = ref('')
const selectedClip = computed(() => clips.value.find((clip) => clip.id === selectedClipId.value) || null)
const projectDuration = computed(() => clips.value.reduce((end, clip) => Math.max(end, clip.end), 0))
const totalDuration = computed(() => Math.max(15, Math.ceil(projectDuration.value + 1)))
const timelineWidth = computed(() => Math.max(900, totalDuration.value * pixelsPerSecond.value))
const rulerMarks = computed(() => Array.from({ length: totalDuration.value + 1 }, (_, index) => index))
const canUndo = computed(() => undoStack.value.length > 0)
const canRedo = computed(() => redoStack.value.length > 0)
const playbackClips = computed(() =>
  clips.value
    .filter((clip) => clip.trackId === 'main' && (clip.type === 'video' || clip.type === 'image'))
    .sort((a, b) => a.start - b.start),
)
const previewClip = computed(() => {
  const active = [...clips.value]
    .filter(
      (clip) =>
        (clip.trackId === 'main' || clip.trackId === 'overlay') &&
        clip.type !== 'audio' &&
        currentTime.value >= clip.start &&
        currentTime.value < clip.end,
    )
    .sort((a, b) => (a.trackId === 'overlay' ? 1 : 0) - (b.trackId === 'overlay' ? 1 : 0))
    .at(-1)
  if (active) return active
  if (!playing.value && selectedClip.value?.type !== 'audio') return selectedClip.value
  return null
})
const videoStyle = computed(() => ({
  objectFit: fitMode.value,
  opacity: (previewClip.value?.opacity || 100) / 100,
  transform: `scale(${(previewClip.value?.scale || 100) / 100}) rotate(${previewClip.value?.rotation || 0}deg)`,
}))

function snapshot(): Snapshot {
  return {
    clips: JSON.parse(JSON.stringify(clips.value)) as Clip[],
    selectedClipId: selectedClipId.value,
    currentTime: currentTime.value,
  }
}

function saveHistory() {
  undoStack.value.push(snapshot())
  if (undoStack.value.length > 30) undoStack.value.shift()
  redoStack.value = []
}

function restore(state: Snapshot) {
  clips.value = JSON.parse(JSON.stringify(state.clips)) as Clip[]
  selectedClipId.value = state.selectedClipId
  currentTime.value = state.currentTime
  nextTick(syncVideo)
}

function undo() {
  const state = undoStack.value.pop()
  if (!state) return
  redoStack.value.push(snapshot())
  restore(state)
}

function redo() {
  const state = redoStack.value.pop()
  if (!state) return
  undoStack.value.push(snapshot())
  restore(state)
}

function pickFiles() {
  fileInput.value?.click()
}

function fileType(file: File): MediaType | null {
  if (file.type.startsWith('video/')) return 'video'
  if (file.type.startsWith('audio/')) return 'audio'
  if (file.type.startsWith('image/')) return 'image'
  return null
}

function waitForMediaEvent(media: HTMLMediaElement, eventName: 'loadedmetadata' | 'seeked') {
  return new Promise<void>((resolve, reject) => {
    const done = () => {
      cleanup()
      resolve()
    }
    const failed = () => {
      cleanup()
      reject(new Error('媒体文件读取失败'))
    }
    const cleanup = () => {
      media.removeEventListener(eventName, done)
      media.removeEventListener('error', failed)
    }
    media.addEventListener(eventName, done, { once: true })
    media.addEventListener('error', failed, { once: true })
  })
}

async function generateVideoThumbnails(asset: Asset) {
  const video = document.createElement('video')
  video.preload = 'auto'
  video.muted = true
  video.playsInline = true
  video.src = asset.url
  try {
    if (video.readyState < 1) await waitForMediaEvent(video, 'loadedmetadata')
    asset.duration = Math.max(0.2, video.duration)
    const canvas = document.createElement('canvas')
    canvas.width = 240
    canvas.height = 135
    const context = canvas.getContext('2d')
    if (!context) return
    const points = [0.08, 0.34, 0.62, 0.88]
    for (const point of points) {
      video.currentTime = Math.min(Math.max(0.02, asset.duration * point), Math.max(0.02, asset.duration - 0.05))
      await waitForMediaEvent(video, 'seeked')
      context.fillStyle = '#101a17'
      context.fillRect(0, 0, canvas.width, canvas.height)
      const ratio = Math.min(canvas.width / video.videoWidth, canvas.height / video.videoHeight)
      const width = video.videoWidth * ratio
      const height = video.videoHeight * ratio
      context.drawImage(video, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height)
      asset.thumbnails.push(canvas.toDataURL('image/jpeg', 0.78))
    }
  } catch {
    notify(`无法读取 ${asset.name} 的视频封面`)
  } finally {
    video.removeAttribute('src')
    video.load()
  }
}

async function importFiles(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files || [])
  for (const file of files) {
    const type = fileType(file)
    if (!type) continue
    const url = URL.createObjectURL(file)
    objectUrls.add(url)
    const asset: Asset = {
      id: `asset_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: file.name,
      type,
      url,
      duration: type === 'image' ? 5 : 0,
      thumbnails: type === 'image' ? [url] : [],
    }
    assets.value.push(asset)
    if (type === 'video') {
      await generateVideoThumbnails(asset)
    } else if (type === 'audio') {
      const media = document.createElement('audio')
      media.preload = 'metadata'
      media.src = url
      try {
        if (media.readyState < 1) await waitForMediaEvent(media, 'loadedmetadata')
        asset.duration = Math.max(0.2, media.duration)
      } catch {
        asset.duration = 5
      }
    }
  }
  if (files.length) notify(`已导入 ${files.length} 个素材`)
  input.value = ''
}

function assetPreviewStyle(asset: Asset) {
  const frame = asset.thumbnails[0]
  return frame ? { backgroundImage: `url(${frame})` } : undefined
}

async function loadExampleAsset() {
  const existing = assets.value.find((asset) => asset.url === '/video-test.mp4')
  if (existing) {
    notify('示例素材已经在素材库中')
    return
  }
  exampleLoading.value = true
  const asset: Asset = {
    id: `asset_example_${Date.now()}`,
    name: 'video-test.mp4',
    type: 'video',
    url: '/video-test.mp4',
    duration: 0,
    thumbnails: [],
  }
  assets.value.push(asset)
  await generateVideoThumbnails(asset)
  exampleLoading.value = false
  notify('示例素材已载入')
}

function defaultTrackFor(asset: Asset) {
  return asset.type === 'audio' ? 'audio' : 'main'
}

function isTrackCompatible(asset: Asset | Clip, trackId: string) {
  if (asset.type === 'audio') return trackId === 'audio'
  return trackId === 'main' || trackId === 'overlay'
}

function makeClip(asset: Asset, start: number, trackId: string): Clip {
  const duration = Math.max(0.2, asset.duration)
  return {
    ...asset,
    id: `clip_${Date.now()}_${clipIndex++}`,
    assetId: asset.id,
    trackId,
    start,
    end: start + duration,
    trimStart: 0,
    trimEnd: duration,
    sourceDuration: duration,
    volume: 100,
    muted: false,
    speed: 1,
    scale: 100,
    rotation: 0,
    opacity: 100,
  }
}

function addToTimeline(asset: Asset, targetTime?: number, requestedTrackId?: string) {
  const trackId = requestedTrackId || defaultTrackFor(asset)
  if (!isTrackCompatible(asset, trackId)) {
    notify('该素材类型无法放入这条轨道')
    return
  }
  saveHistory()
  const appendTime = clips.value
    .filter((clip) => clip.trackId === trackId)
    .reduce((end, clip) => Math.max(end, clip.end), 0)
  const clip = makeClip(asset, Math.max(0, targetTime ?? appendTime), trackId)
  clips.value.push(clip)
  clips.value.sort((a, b) => a.start - b.start)
  selectedClipId.value = clip.id
  currentTime.value = clip.start
  nextTick(syncVideo)
  notify('素材已添加到时间线')
}

function dragAsset(event: DragEvent, assetId: string) {
  event.dataTransfer?.setData('text/plain', assetId)
}

function dropAsset(event: DragEvent, trackId: string) {
  const asset = assets.value.find((item) => item.id === event.dataTransfer?.getData('text/plain'))
  if (!asset || !timelineContent.value) return
  const rect = timelineContent.value.getBoundingClientRect()
  addToTimeline(asset, (event.clientX - rect.left) / pixelsPerSecond.value, trackId)
}

function clipsForTrack(trackId: string) {
  return clips.value.filter((clip) => clip.trackId === trackId).sort((a, b) => a.start - b.start)
}

function clipThumbnails(clip: Clip) {
  if (clip.type === 'audio') return []
  const asset = assets.value.find((item) => item.id === clip.assetId)
  return asset?.thumbnails.length ? asset.thumbnails : clip.thumbnails
}

function selectClip(id: string) {
  selectedClipId.value = id
  const clip = selectedClip.value
  if (clip && (currentTime.value < clip.start || currentTime.value > clip.end)) currentTime.value = clip.start
  nextTick(syncVideo)
}

function startClipDrag(event: PointerEvent, clip: Clip) {
  if (event.button !== 0) return
  event.preventDefault()
  selectClip(clip.id)
  const startX = event.clientX
  const originalStart = clip.start
  const clipDuration = clip.end - clip.start
  let historySaved = false

  const move = (moveEvent: PointerEvent) => {
    const delta = (moveEvent.clientX - startX) / pixelsPerSecond.value
    if (!historySaved && Math.abs(delta) > 0.03) {
      saveHistory()
      historySaved = true
    }
    if (!historySaved) return
    clip.start = Math.max(0, Math.round((originalStart + delta) * 20) / 20)
    clip.end = clip.start + clipDuration
    currentTime.value = clip.start

    if (timelineContent.value) {
      const rect = timelineContent.value.getBoundingClientRect()
      const index = Math.floor((moveEvent.clientY - rect.top - 34) / 64)
      const target = tracks[index]
      if (target && isTrackCompatible(clip, target.id)) clip.trackId = target.id
    }
  }

  const stop = () => {
    window.removeEventListener('pointermove', move)
    window.removeEventListener('pointerup', stop)
    clips.value.sort((a, b) => a.start - b.start)
    if (historySaved) notify(`片段已移动到 ${formatTime(clip.start, true)}`)
  }

  window.addEventListener('pointermove', move)
  window.addEventListener('pointerup', stop)
}

function removeSelectedClip(save = true) {
  const clip = selectedClip.value
  if (!clip) return
  if (save) saveHistory()
  const index = clips.value.findIndex((item) => item.id === clip.id)
  clips.value.splice(index, 1)
  const next = clips.value[Math.min(index, clips.value.length - 1)]
  selectedClipId.value = next?.id || ''
  currentTime.value = next?.start || 0
}

function deleteClip() {
  removeSelectedClip(true)
  notify('已删除片段')
}

function copyClip() {
  if (!selectedClip.value) return
  clipboardClip = JSON.parse(JSON.stringify(selectedClip.value)) as Clip
  notify('已复制片段')
}

function cutClip() {
  if (!selectedClip.value) return
  clipboardClip = JSON.parse(JSON.stringify(selectedClip.value)) as Clip
  saveHistory()
  removeSelectedClip(false)
  notify('已剪切片段')
}

function pasteClip() {
  if (!clipboardClip) return
  saveHistory()
  const duration = clipboardClip.end - clipboardClip.start
  const clip: Clip = {
    ...JSON.parse(JSON.stringify(clipboardClip)),
    id: `clip_${Date.now()}_${clipIndex++}`,
    start: currentTime.value,
    end: currentTime.value + duration,
  }
  clips.value.push(clip)
  clips.value.sort((a, b) => a.start - b.start)
  selectedClipId.value = clip.id
  notify('已粘贴片段')
}

function splitClip() {
  const clip = selectedClip.value
  if (!clip || currentTime.value <= clip.start + 0.1 || currentTime.value >= clip.end - 0.1) {
    notify('请把播放头移到片段中间')
    return
  }
  saveHistory()
  const sourcePoint = clip.trimStart + (currentTime.value - clip.start) * clip.speed
  const second: Clip = {
    ...clip,
    id: `clip_${Date.now()}_${clipIndex++}`,
    start: currentTime.value,
    trimStart: sourcePoint,
  }
  clip.end = currentTime.value
  clip.trimEnd = sourcePoint
  clips.value.push(second)
  clips.value.sort((a, b) => a.start - b.start)
  selectedClipId.value = second.id
  notify('片段已分割')
}

function updateDuration() {
  const clip = selectedClip.value
  if (!clip) return
  clip.trimStart = Math.max(0, Math.min(clip.trimStart, clip.sourceDuration - 0.2))
  clip.trimEnd = Math.max(clip.trimStart + 0.2, Math.min(clip.trimEnd, clip.sourceDuration))
  clip.speed = Math.max(0.5, Math.min(3, clip.speed))
  clip.end = clip.start + (clip.trimEnd - clip.trimStart) / clip.speed
  if (videoElement.value) videoElement.value.playbackRate = clip.speed
}

function setSpeed(rate: number) {
  if (!selectedClip.value) return
  selectedClip.value.speed = rate
  updateDuration()
}

function resetPicture() {
  if (!selectedClip.value) return
  selectedClip.value.scale = 100
  selectedClip.value.rotation = 0
  selectedClip.value.opacity = 100
}

function onMetadata() {
  const video = videoElement.value
  const clip = previewClip.value
  if (!video || !clip) return
  video.playbackRate = clip.speed
  syncVolume()
  syncVideo()
  if (playing.value) video.play().catch(() => undefined)
}

function syncVolume() {
  if (videoElement.value && previewClip.value) {
    videoElement.value.volume = Math.min(1, previewClip.value.volume / 100)
  }
}

function syncVideo() {
  const video = videoElement.value
  const clip = previewClip.value
  if (!video || !clip || !Number.isFinite(video.duration)) return
  const localTime = clip.trimStart + Math.max(0, currentTime.value - clip.start) * clip.speed
  const target = Math.min(clip.trimEnd, Math.max(clip.trimStart, localTime))
  if (Math.abs(video.currentTime - target) > 0.18) video.currentTime = target
  video.playbackRate = clip.speed
  syncVolume()
}

function stopPlayback() {
  playing.value = false
  cancelAnimationFrame(playbackFrame)
  videoElement.value?.pause()
}

function runPlaybackClock(now: number) {
  if (!playing.value) return
  currentTime.value = playbackStartTime + (now - playbackStartedAt) / 1000
  if (currentTime.value >= projectDuration.value) {
    currentTime.value = projectDuration.value
    stopPlayback()
    return
  }
  const activeMain = playbackClips.value.find(
    (clip) => currentTime.value >= clip.start && currentTime.value < clip.end,
  )
  if (activeMain && selectedClipId.value !== activeMain.id) selectedClipId.value = activeMain.id
  syncVideo()
  playbackFrame = requestAnimationFrame(runPlaybackClock)
}

async function togglePlay() {
  if (playing.value) {
    stopPlayback()
    return
  }
  if (playbackClips.value.length === 0) return
  if (currentTime.value >= projectDuration.value || currentTime.value < playbackClips.value[0].start) {
    currentTime.value = playbackClips.value[0].start
  }
  playing.value = true
  playbackStartTime = currentTime.value
  playbackStartedAt = performance.now()
  syncVideo()
  await videoElement.value?.play().catch(() => undefined)
  playbackFrame = requestAnimationFrame(runPlaybackClock)
}

function seek(time: number) {
  currentTime.value = Math.max(0, Math.min(time, totalDuration.value))
  const active = playbackClips.value.find(
    (clip) => currentTime.value >= clip.start && currentTime.value <= clip.end,
  )
  if (active && active.id !== selectedClipId.value) selectedClipId.value = active.id
  if (playing.value) {
    playbackStartTime = currentTime.value
    playbackStartedAt = performance.now()
  }
  nextTick(syncVideo)
}

function seekByClick(event: MouseEvent) {
  if (!timelineContent.value) return
  const rect = timelineContent.value.getBoundingClientRect()
  seek((event.clientX - rect.left) / pixelsPerSecond.value)
}

function dragPlayhead(event: PointerEvent) {
  const move = (moveEvent: PointerEvent) => {
    if (!timelineContent.value) return
    const rect = timelineContent.value.getBoundingClientRect()
    seek((moveEvent.clientX - rect.left) / pixelsPerSecond.value)
  }
  const stop = () => {
    window.removeEventListener('pointermove', move)
    window.removeEventListener('pointerup', stop)
  }
  window.addEventListener('pointermove', move)
  window.addEventListener('pointerup', stop)
  move(event)
}

function clipPosition(clip: Clip) {
  return {
    left: `${clip.start * pixelsPerSecond.value}px`,
    width: `${Math.max(48, (clip.end - clip.start) * pixelsPerSecond.value)}px`,
  }
}

function formatTime(seconds: number, frames = false) {
  const safe = Number.isFinite(seconds) ? Math.max(0, seconds) : 0
  const minutes = Math.floor(safe / 60)
  const remain = Math.floor(safe % 60)
  const base = `${String(minutes).padStart(2, '0')}:${String(remain).padStart(2, '0')}`
  return frames ? `${base}:${String(Math.floor((safe % 1) * 30)).padStart(2, '0')}` : base
}

function rulerLabel(seconds: number) {
  return formatTime(seconds)
}

function mediaTypeName(type: MediaType) {
  return type === 'audio' ? '音频' : type === 'image' ? '图片' : '视频'
}

async function fullscreen() {
  const target = document.querySelector('.player_stage') as HTMLElement | null
  if (!target) return
  if (document.fullscreenElement) await document.exitFullscreen()
  else await target.requestFullscreen()
}

function notify(message: string) {
  toast.value = message
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = ''), 2200)
}

interface ExportSource {
  clip: Clip
  element: HTMLMediaElement | HTMLImageElement
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('图片素材读取失败'))
    image.src = url
  })
}

async function prepareExportSource(
  clip: Clip,
  audioContext: AudioContext,
  destination: MediaStreamAudioDestinationNode,
): Promise<ExportSource> {
  if (clip.type === 'image') return { clip, element: await loadImage(clip.url) }

  const media = document.createElement(clip.type === 'audio' ? 'audio' : 'video')
  media.preload = 'auto'
  media.src = clip.url
  if (media instanceof HTMLVideoElement) media.playsInline = true
  if (media.readyState < 1) await waitForMediaEvent(media, 'loadedmetadata')
  media.playbackRate = clip.speed
  const source = audioContext.createMediaElementSource(media)
  const gain = audioContext.createGain()
  gain.gain.value = clip.muted ? 0 : Math.min(2, clip.volume / 100)
  source.connect(gain)
  gain.connect(destination)
  return { clip, element: media }
}

function syncExportMedia(source: ExportSource, time: number) {
  if (!(source.element instanceof HTMLMediaElement)) return
  const { clip, element } = source
  const active = time >= clip.start && time < clip.end
  if (!active) {
    if (!element.paused) element.pause()
    return
  }
  const localTime = clip.trimStart + (time - clip.start) * clip.speed
  if (Math.abs(element.currentTime - localTime) > 0.2) element.currentTime = localTime
  element.playbackRate = clip.speed
  if (element.paused) element.play().catch(() => undefined)
}

function drawExportVisual(context: CanvasRenderingContext2D, source: ExportSource) {
  const { clip, element } = source
  if (clip.type === 'audio' || element instanceof HTMLAudioElement) return
  const sourceWidth = element instanceof HTMLVideoElement ? element.videoWidth : element.naturalWidth
  const sourceHeight = element instanceof HTMLVideoElement ? element.videoHeight : element.naturalHeight
  if (!sourceWidth || !sourceHeight) return

  const canvas = context.canvas
  const ratio = Math.min(canvas.width / sourceWidth, canvas.height / sourceHeight)
  const width = sourceWidth * ratio
  const height = sourceHeight * ratio
  context.save()
  context.globalAlpha = clip.opacity / 100
  context.translate(canvas.width / 2, canvas.height / 2)
  context.rotate((clip.rotation * Math.PI) / 180)
  context.scale(clip.scale / 100, clip.scale / 100)
  context.drawImage(element, -width / 2, -height / 2, width, height)
  context.restore()
}

async function startExport() {
  if (exporting.value) return
  if (clips.value.length === 0 || projectDuration.value <= 0) {
    notify('时间线为空，无法导出')
    return
  }
  if (typeof MediaRecorder === 'undefined' || !HTMLCanvasElement.prototype.captureStream) {
    notify('当前浏览器不支持视频编码')
    return
  }

  stopPlayback()
  exporting.value = true
  exportCancelled = false
  exportProgress.value = 0
  if (exportDownloadUrl.value) URL.revokeObjectURL(exportDownloadUrl.value)
  exportDownloadUrl.value = ''
  exportFilename.value = ''
  exportTitle.value = '正在准备导出'
  exportMessage.value = '正在读取素材并创建编码器。'

  const canvas = document.createElement('canvas')
  canvas.width = 960
  canvas.height = 540
  const context = canvas.getContext('2d')
  if (!context) {
    exporting.value = false
    notify('无法创建导出画布')
    return
  }

  const audioContext = new AudioContext()
  await audioContext.resume()
  const audioDestination = audioContext.createMediaStreamDestination()

  try {
    const sources = await Promise.all(
      clips.value
        .filter((clip) => clip.trackId !== 'text')
        .map((clip) => prepareExportSource(clip, audioContext, audioDestination)),
    )
    if (exportCancelled) {
      exporting.value = false
      await audioContext.close()
      return
    }

    const canvasStream = canvas.captureStream(30)
    const outputStream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...audioDestination.stream.getAudioTracks(),
    ])
    const mimeType = [
      'video/mp4;codecs=avc1,opus',
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
    ].find((type) => MediaRecorder.isTypeSupported(type))
    const recorder = new MediaRecorder(outputStream, {
      ...(mimeType ? { mimeType } : {}),
      videoBitsPerSecond: 5_000_000,
    })
    const chunks: BlobPart[] = []
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data)
    }
    const recorded = new Promise<Blob>((resolve) => {
      recorder.onstop = () => resolve(new Blob(chunks, { type: recorder.mimeType }))
    })

    exportTitle.value = '正在导出视频'
    exportMessage.value = '正在按时间线实时合成画面与声音，请保持页面开启。'
    recorder.start(250)
    const startedAt = performance.now()

    await new Promise<void>((resolve) => {
      const render = (now: number) => {
        const time = Math.min(projectDuration.value, (now - startedAt) / 1000)
        context.fillStyle = '#101a17'
        context.fillRect(0, 0, canvas.width, canvas.height)

        sources.forEach((source) => syncExportMedia(source, time))
        const visuals = sources
          .filter(
            (source) =>
              source.clip.type !== 'audio' &&
              time >= source.clip.start &&
              time < source.clip.end,
          )
          .sort((a, b) => (a.clip.trackId === 'overlay' ? 1 : 0) - (b.clip.trackId === 'overlay' ? 1 : 0))
        visuals.forEach((source) => drawExportVisual(context, source))
        exportProgress.value = Math.min(99, Math.round((time / projectDuration.value) * 100))

        if (exportCancelled || time >= projectDuration.value) {
          sources.forEach((source) => {
            if (source.element instanceof HTMLMediaElement) source.element.pause()
          })
          resolve()
          return
        }
        requestAnimationFrame(render)
      }
      requestAnimationFrame(render)
    })

    recorder.stop()
    const blob = await recorded
    outputStream.getTracks().forEach((track) => track.stop())
    await audioContext.close()
    if (exportCancelled) {
      exporting.value = false
      notify('导出已取消')
      return
    }

    const extension = recorder.mimeType.includes('mp4') ? 'mp4' : 'webm'
    exportDownloadUrl.value = URL.createObjectURL(blob)
    exportFilename.value = `${projectName.value.replace(/[\\/:*?"<>|]/g, '_') || 'video'}.${extension}`
    exportProgress.value = 100
    exportTitle.value = '视频已导出'
    exportMessage.value = `已生成 ${extension.toUpperCase()} 文件，点击下方按钮保存到本地。`
  } catch (error) {
    await audioContext.close().catch(() => undefined)
    exporting.value = false
    notify(error instanceof Error ? error.message : '视频导出失败')
  }
}

function cancelExport() {
  exportCancelled = true
  exportTitle.value = '正在取消导出'
  exportMessage.value = '正在停止编码并释放媒体资源。'
}

function handleKeyboard(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null
  const typing =
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target?.isContentEditable
  if (event.code === 'Space' && !typing) {
    event.preventDefault()
    togglePlay()
    return
  }
  if (!(event.ctrlKey || event.metaKey) || typing) return
  const key = event.key.toLowerCase()
  if (key === 'c') {
    event.preventDefault()
    copyClip()
  } else if (key === 'x') {
    event.preventDefault()
    cutClip()
  } else if (key === 'v') {
    event.preventDefault()
    pasteClip()
  } else if (key === 'z') {
    event.preventDefault()
    event.shiftKey ? redo() : undo()
  } else if (key === 'y') {
    event.preventDefault()
    redo()
  }
}

watch(() => previewClip.value?.id, () => {
  nextTick(() => {
    syncVideo()
    if (playing.value) videoElement.value?.play().catch(() => undefined)
  })
})

onMounted(() => window.addEventListener('keydown', handleKeyboard))

onBeforeUnmount(() => {
  stopPlayback()
  window.removeEventListener('keydown', handleKeyboard)
  objectUrls.forEach((url) => URL.revokeObjectURL(url))
  if (toastTimer) clearTimeout(toastTimer)
  exportCancelled = true
  if (exportDownloadUrl.value) URL.revokeObjectURL(exportDownloadUrl.value)
})
</script>

<style scoped lang="less">
#pages_editor {
  --bg: #0f1513;
  --panel: #1c2522;
  --panel-2: #25312d;
  --line: #3a4b45;
  --muted: #9aafa7;
  --accent: #8be7bf;
  width: 100%;
  height: 100vh;
  min-width: 1080px;
  overflow: hidden;
  color: #effaf5;
  background: var(--bg);
  font-family: "FZJuZhenXinFangS-R-GB", "Microsoft YaHei", sans-serif;
  font-size: 13px;
}

button,
input {
  font: inherit;
}

button {
  padding: 7px 11px;
  color: inherit;
  background: #2a3833;
  border: 1px solid #40534c;
  border-radius: 6px;
  cursor: pointer;
}

button:hover {
  background: #354a42;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.35;
}

button.primary {
  color: #102a20;
  font-weight: 700;
  background: var(--accent);
  border-color: var(--accent);
}

.sr_only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.editor_header {
  display: grid;
  grid-template-columns: 1fr minmax(200px, 340px) 1fr;
  align-items: center;
  height: 52px;
  padding: 0 14px;
  background: #101714;
  border-bottom: 1px solid #2e3c37;
}

.header_side {
  display: flex;
  align-items: center;
  gap: 9px;
}

.brand_area strong {
  font-size: 18px;
  letter-spacing: 1px;
}

.brand_area span {
  color: var(--muted);
}

.header_actions {
  justify-content: flex-end;
}

.project_name input {
  width: 100%;
  padding: 7px;
  color: #fff;
  text-align: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  outline: none;
}

.project_name input:focus {
  background: #1b1d20;
  border-color: var(--line);
}

.editor_main {
  display: grid;
  grid-template-rows: minmax(340px, 53%) minmax(300px, 47%);
  height: calc(100vh - 52px);
  padding: 8px;
  gap: 8px;
  box-sizing: border-box;
}

.panel {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  background: var(--panel);
  border: 1px solid #2d3a35;
  border-radius: 8px;
}

.workbench {
  display: grid;
  grid-template-columns: minmax(285px, 350px) minmax(420px, 1fr) minmax(275px, 330px);
  min-height: 0;
  gap: 8px;
}

.media_panel,
.player_panel,
.inspector_panel {
  display: flex;
  flex-direction: column;
}

.media_tabs,
.inspector_tabs {
  display: flex;
  flex: 0 0 54px;
  overflow-x: auto;
  background: var(--panel-2);
  border-bottom: 1px solid var(--line);
}

.media_tabs button,
.inspector_tabs button {
  position: relative;
  flex: 1;
  min-width: 48px;
  padding: 0 8px;
  color: #c4c8ce;
  background: transparent;
  border: 0;
  border-radius: 0;
  font-size: 20px;
}

.media_tabs button.active,
.inspector_tabs button.active {
  color: var(--accent);
}

.media_tabs button.active::after,
.inspector_tabs button.active::after {
  position: absolute;
  right: 10px;
  bottom: 0;
  left: 10px;
  height: 2px;
  content: "";
  background: var(--accent);
}

.media_content,
.inspector_content {
  flex: 1;
  min-height: 0;
  padding: 14px;
  overflow: auto;
}

.media_toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  color: var(--muted);
}

.import_actions {
  display: flex;
  gap: 6px;
  font-size: 20px;
}

.import_actions button {
  padding: 6px 9px;
  font-size: 11px;
}

.asset_grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.asset_card {
  min-width: 0;
  overflow: hidden;
  background: #151e1a;
  border: 1px solid transparent;
  border-radius: 7px;
  cursor: grab;
}

.asset_card:hover {
  border-color: #6d9384;
}

.asset_preview {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 16 / 9;
  color: #c8ddd4;
  background-color: #15241e;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}

.asset_preview.audio {
  background: linear-gradient(140deg, #3a6957, #1b352b);
}

.asset_preview small {
  position: absolute;
  right: 6px;
  bottom: 5px;
  padding: 2px 4px;
  font-size: 10px;
  background: rgba(0, 0, 0, 0.68);
  border-radius: 3px;
}

.asset_info {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px;
}

.asset_info span {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.asset_info button {
  padding: 3px 6px;
  color: var(--accent);
  font-size: 11px;
  background: transparent;
  border-color: #477362;
}

.drop_tip,
.placeholder {
  margin-top: 18px;
  padding: 20px;
  color: var(--muted);
  text-align: center;
  background: #1a1c1f;
  border: 1px dashed #3d4147;
  border-radius: 8px;
  font-size: 20px;
}

.drop_tip p,
.placeholder p {
  margin: 8px 0 0;
  font-size: 18px;
  line-height: 1.7;
}

.placeholder {
  margin: 18px;
}

.placeholder button {
  margin-top: 14px;
}

.panel_title {
  display: flex;
  flex: 0 0 54px;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: var(--panel-2);
  border-bottom: 1px solid var(--line);
}

.panel_title small {
  max-width: 60%;
  overflow: hidden;
  color: var(--muted);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.player_stage {
  display: flex;
  flex: 1;
  min-height: 0;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: radial-gradient(circle, #26342f 0, #121916 62%);
}

.video_canvas {
  display: flex;
  width: min(88%, 820px);
  max-height: 88%;
  aspect-ratio: 16 / 9;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #050506;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.38);
}

.video_canvas video,
.video_canvas img {
  width: 100%;
  height: 100%;
  transition: 0.18s ease;
}

.audio_preview {
  color: var(--accent);
  font-size: 18px;
}

.empty_player {
  display: grid;
  gap: 9px;
  color: var(--muted);
  text-align: center;
}

.empty_player strong {
  color: #dde0e4;
  font-size: 18px;
}

.player_controls {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  flex: 0 0 54px;
  align-items: center;
  padding: 0 14px;
  color: var(--accent);
  border-top: 1px solid #303338;
}

.player_controls > div {
  display: flex;
  gap: 7px;
}

.player_controls button {
  padding: 5px 8px;
  color: #c7cbd1;
  font-size: 11px;
  background: transparent;
  border-color: transparent;
}

.player_controls button.play {
  min-width: 56px;
  color: #062d32;
  font-weight: 700;
  background: var(--accent);
}

.player_controls .view_actions {
  justify-content: flex-end;
}

.clip_summary {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #181a1d;
  border-radius: 7px;
}

.clip_summary > span {
  padding: 5px 7px;
  color: var(--accent);
  background: rgba(139, 231, 191, 0.14);
  border-radius: 4px;
}

.clip_summary div {
  min-width: 0;
}

.clip_summary strong,
.clip_summary small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.clip_summary small {
  margin-top: 3px;
  color: var(--muted);
}

.settings {
  padding: 18px 2px;
  border-bottom: 1px solid #303338;
}

.settings h3 {
  margin: 0 0 17px;
  font-size: 13px;
}

.range_row {
  display: block;
  margin-bottom: 18px;
}

.range_row span,
.number_row,
.clip_info p,
.draft_info p {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.range_row em,
.draft_info em {
  color: var(--muted);
  font-style: normal;
}

input[type='range'] {
  width: 100%;
  height: 4px;
  margin-top: 10px;
  accent-color: var(--accent);
  cursor: pointer;
}

.number_row {
  margin-bottom: 10px;
}

.number_row input {
  width: 82px;
  padding: 6px;
  color: #fff;
  text-align: right;
  background: #17191c;
  border: 1px solid #3a3e44;
  border-radius: 5px;
}

.wide_button {
  width: 100%;
}

.speed_buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 5px;
}

.speed_buttons button {
  padding: 6px 2px;
  font-size: 11px;
}

.clip_info p,
.draft_info p {
  margin: 12px 0;
  color: var(--muted);
}

.clip_info strong,
.draft_info em {
  color: #dde0e4;
  font-weight: 400;
}

.draft_info {
  padding: 22px 16px;
}

.draft_info > strong {
  display: block;
  padding-bottom: 14px;
  border-bottom: 1px solid #303338;
}

.timeline_panel {
  display: flex;
  flex-direction: column;
}

.timeline_toolbar {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  flex: 0 0 44px;
  align-items: center;
  padding: 0 12px;
  border-bottom: 1px solid var(--line);
}

.timeline_toolbar > div {
  display: flex;
  gap: 7px;
}

.timeline_toolbar button {
  padding: 5px 9px;
  font-size: 11px;
}

.timeline_toolbar > span,
.timeline_toolbar label {
  color: var(--muted);
  font-size: 11px;
}

.timeline_toolbar label {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.timeline_toolbar input {
  width: 130px;
  margin: 0;
}

.timeline_body {
  display: flex;
  flex: 1;
  min-height: 0;
  background: #191b1e;
}

.track_labels {
  z-index: 2;
  flex: 0 0 112px;
  background: #1d1f22;
  border-right: 1px solid var(--line);
}

.track_labels > div {
  display: flex;
  height: 34px;
  align-items: center;
  padding-left: 14px;
  color: #737983;
  font-size: 10px;
  border-bottom: 1px solid #2a2d31;
  box-sizing: border-box;
}

.track_labels > strong {
  display: flex;
  height: 64px;
  flex-direction: column;
  justify-content: center;
  padding: 0 14px;
  font-size: 12px;
  border-bottom: 1px solid #2a2d31;
  box-sizing: border-box;
}

.track_labels small {
  margin-top: 5px;
  color: var(--muted);
  font-weight: 400;
}

.timeline_scroll {
  flex: 1;
  min-width: 0;
  overflow: auto;
}

.timeline_content {
  position: relative;
  height: 100%;
  min-height: 290px;
  cursor: crosshair;
  background-image: linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 70px 100%;
}

.ruler {
  position: relative;
  height: 34px;
  border-bottom: 1px solid #2a2d31;
}

.ruler span {
  position: absolute;
  top: 23px;
  width: 1px;
  height: 6px;
  color: #737983;
  font-size: 9px;
  text-indent: 3px;
  white-space: nowrap;
  background: #565c64;
}

.ruler span.major {
  top: 16px;
  height: 13px;
}

.track_lane {
  position: relative;
  height: 64px;
  border-bottom: 1px solid #2a2d31;
}

.track_lane.audio {
  background: rgba(139, 231, 191, 0.025);
}

.track_lane.text {
  background: rgba(255, 255, 255, 0.012);
}

.timeline_clip {
  position: absolute;
  top: 5px;
  height: 54px;
  padding: 0;
  overflow: hidden;
  color: #effff7;
  text-align: left;
  background: #2d6650;
  border: 2px solid #66bd98;
  border-radius: 5px;
  cursor: grab;
  touch-action: none;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.25);
}

.timeline_clip:active {
  cursor: grabbing;
}

.timeline_clip.selected {
  border-color: #f2fff9;
  box-shadow: 0 0 0 2px var(--accent);
}

.timeline_clip > span {
  display: block;
  height: 18px;
  padding: 1px 7px;
  overflow: hidden;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: #397b60;
  box-sizing: border-box;
}

.timeline_clip > .clip_frames {
  display: flex;
  height: 24px;
  overflow: hidden;
  opacity: 0.9;
  background: #254c3d;
}

.timeline_clip > .clip_frames b {
  display: inline-block;
  width: 25%;
  height: 100%;
  background-position: center;
  background-size: cover;
}

.timeline_clip > em {
  display: block;
  height: 8px;
  background:
    linear-gradient(135deg, transparent 45%, #a9f2d2 46%, #a9f2d2 54%, transparent 55%) 0 0 / 12px 8px repeat-x,
    #234d3c;
}

.timeline_clip.audio {
  background: #365847;
  border-color: #78be9f;
}

.timeline_clip.audio > .clip_frames {
  height: 24px;
  background: repeating-linear-gradient(90deg, #75c5a2 0 2px, transparent 2px 7px);
}

.empty_track {
  position: absolute;
  inset: 8px 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #737983;
  border: 1px dashed #3b3f45;
  border-radius: 7px;
}

.playhead {
  position: absolute;
  z-index: 5;
  top: 0;
  bottom: 0;
  width: 1px;
  background: #fff;
  cursor: col-resize;
}

.playhead span {
  position: absolute;
  top: 0;
  left: -5px;
  width: 11px;
  height: 9px;
  background: #fff;
  border-radius: 2px 2px 5px 5px;
}

.toast {
  position: fixed;
  z-index: 50;
  bottom: 26px;
  left: 50%;
  padding: 10px 18px;
  background: #292c30;
  border: 1px solid #50555c;
  border-radius: 7px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
  transform: translateX(-50%);
}

.export_mask {
  position: fixed;
  z-index: 100;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(5, 6, 7, 0.76);
  backdrop-filter: blur(4px);
}

.export_dialog {
  width: min(430px, calc(100vw - 40px));
  padding: 28px;
  text-align: center;
  background: #25282c;
  border: 1px solid #474c53;
  border-radius: 12px;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.54);
}

.export_dialog strong {
  font-size: 18px;
}

.export_dialog p {
  margin: 12px 0 22px;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.7;
}

.progress {
  height: 8px;
  overflow: hidden;
  background: #151719;
  border-radius: 8px;
}

.progress span {
  display: block;
  height: 100%;
  background: var(--accent);
  border-radius: inherit;
  transition: width 0.12s linear;
}

.export_dialog em {
  display: block;
  margin: 10px 0 18px;
  color: var(--accent);
  font-style: normal;
}

.export_actions {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.export_actions a {
  display: inline-flex;
  align-items: center;
  padding: 7px 12px;
  color: #102a20;
  font-weight: 700;
  text-decoration: none;
  background: var(--accent);
  border-radius: 6px;
}

@media (max-width: 1280px) {
  .workbench {
    grid-template-columns: 285px minmax(400px, 1fr) 280px;
  }

  .asset_grid {
    grid-template-columns: 1fr;
  }

  .brand_area span,
  .timeline_toolbar > span {
    display: none;
  }
}
</style>
