<template>
  <div id="pages_qd_hsyq">
    <div class="tabs">
      <button :class="{ active: activeSlide === 'image' }" @click="activeSlide = 'image'">Seedream 图片测试</button>
      <button :class="{ active: activeSlide === 'video' }" @click="activeSlide = 'video'">Seedance 视频测试</button>
    </div>

    <div class="viewport">
      <div class="track" :class="{ show_video: activeSlide === 'video' }">
        <section class="slide generator">
          <h2>火山方舟 Seedream</h2>
          <select v-model="imageModel">
            <option value="doubao-seedream-5-0-pro-260628">doubao-seedream-5-0-pro-260628</option>
            <option value="doubao-seedream-5-0-260128">doubao-seedream-5-0-260128</option>
          </select>
          <select v-model="imageMode">
            <option value="text">文生图</option>
            <option value="image">图生图</option>
          </select>
          <textarea v-model="imagePrompt" rows="4" placeholder="请输入图片提示词"></textarea>
          <label v-if="imageMode === 'image'" class="file_input">
            上传参考图片
            <input type="file" accept="image/*" @change="selectImage" />
          </label>
          <div class="options">
            <label>尺寸 <select v-model="imageSize"><option value="2K">2K</option></select></label>
            <label v-if="imageModel.includes('seedream-5')">
              格式
              <select v-model="imageFormat">
                <option value="png">PNG</option>
                <option value="jpeg">JPEG</option>
              </select>
            </label>
            <label><input v-model="imageWatermark" type="checkbox" />水印</label>
          </div>
          <button :disabled="imageLoading || !canGenerateImage" @click="generateImage">
            {{ imageLoading ? "生成中..." : "生成图片" }}
          </button>
          <p v-if="imageError" class="error">{{ imageError }}</p>
          <div v-if="imageInput || imageResult" class="compare">
            <figure v-if="imageMode === 'image' && imageInput">
              <figcaption>原图</figcaption>
              <img :src="imageInput" alt="输入图片" />
            </figure>
            <figure v-if="imageResult" class="generated">
              <figcaption>生成图片</figcaption>
              <img :src="imageResult" alt="生成图片" />
            </figure>
          </div>
        </section>

        <section class="slide generator">
          <h2>火山方舟 Seedance</h2>
          <select v-model="videoModel">
            <option value="doubao-seedance-1-0-pro-250528">doubao-seedance-1-0-pro-250528</option>
            <option value="doubao-seedance-2-0-260128">doubao-seedance-2-0-260128</option>
          </select>
          <textarea v-model="videoPrompt" rows="8" placeholder="请输入视频提示词"></textarea>
          <label class="file_input">
            上传参考图片
            <input type="file" accept="image/*" @change="selectVideoImage" />
          </label>
          <input v-model="referenceImage1" type="url" placeholder="参考图片 1 URL" />
          <input v-model="referenceImage2" type="url" placeholder="参考图片 2 URL" />
          <input v-model="referenceVideo" type="url" placeholder="参考视频 URL" />
          <input v-model="referenceAudio" type="url" placeholder="参考音频 URL" />
          <div class="options">
            <label>时长 <input v-model.number="videoDuration" type="number" min="1" /></label>
            <label>
              比例
              <select v-model="videoRatio">
                <option value="16:9">16:9</option>
                <option value="9:16">9:16</option>
              </select>
            </label>
            <label><input v-model="generateAudio" type="checkbox" />生成音频</label>
          </div>
          <div class="actions">
            <button :disabled="videoCreating || !videoPrompt.trim()" @click="createVideoTask">
              {{ videoCreating ? "创建中..." : "创建视频任务" }}
            </button>
            <button :disabled="videoQuerying || !taskId.trim()" @click="queryVideoTask">
              {{ videoQuerying ? "查询中..." : "查询视频任务" }}
            </button>
          </div>
          <input v-model="taskId" type="text" placeholder="task_id" @change="saveTaskId(taskId)" />
          <p v-if="taskStatus">任务状态：{{ taskStatus }}</p>
          <p v-if="videoError" class="error">{{ videoError }}</p>
          <div v-if="videoImage || referenceImage1 || videoResult" class="compare">
            <figure v-if="videoImage || referenceImage1">
              <figcaption>首张参考图</figcaption>
              <img :src="videoImage || normalizeUrl(referenceImage1)" alt="首张参考图" />
            </figure>
            <figure v-if="videoResult" class="generated">
              <figcaption>生成视频</figcaption>
              <video :key="videoResult" :src="videoResult" controls></video>
              <a :href="videoResult" target="_blank" rel="noopener noreferrer">打开视频地址</a>
            </figure>
          </div>
          <pre v-if="taskDetails">{{ taskDetails }}</pre>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  interface ImageResponse {
    data?: Array<{ url?: string; b64_json?: string }>;
  }

  const activeSlide = ref<"image" | "video">("image");
  const imageModel = ref("doubao-seedream-4-0-250828");
  const imageMode = ref<"text" | "image">("text");
  const imagePrompt = ref(
    "收藏级毛绒玩偶短剧，圆润两头身比例，短绒布材质，刺绣五官，软布科幻装备，干净的插图风格，平滑阴影，柔和均匀光照，精致边缘，平滑渐变，画面简洁，高清晰度，角色外形与参考图严格一致，竖屏构图",
  );
  const imageSize = ref("2K");
  const imageFormat = ref("png");
  const imageWatermark = ref(false);
  const imageInput = ref("");
  const imageResult = ref("");
  const imageLoading = ref(false);
  const imageError = ref("");
  const videoModel = ref("doubao-seedance-1-0-pro-250528");
  const videoPrompt = ref(
    "全程使用视频1的第一视角构图，全程使用音频1作为背景音乐。第一人称视角果茶宣传广告，seedance牌「苹苹安安」苹果果茶限定款；首帧为图片1，你的手摘下一颗带晨露的阿克苏红苹果；2-4秒：快速切镜，你的手将苹果块投入雪克杯，加入冰块与茶底，用力摇晃；4-6秒：第一人称成品特写，分层果茶倒入透明杯；6-8秒：第一人称手持举杯，尾帧定格为图片2。背景声音统一为女生音色。",
  );
  const referenceImage1 = ref("");
  const referenceImage2 = ref("");
  const videoImage = ref("");
  const referenceVideo = ref("");
  const referenceAudio = ref("");
  const videoDuration = ref(11);
  const videoRatio = ref("16:9");
  const generateAudio = ref(true);
  const videoCreating = ref(false);
  const videoQuerying = ref(false);
  const taskId = ref("");
  const taskStatus = ref("");
  const taskDetails = ref("");
  const videoResult = ref("");
  const videoError = ref("");

  const canGenerateImage = computed(
    () =>
      imageModel.value &&
      imagePrompt.value.trim() &&
      (imageMode.value === "text" || imageInput.value),
  );

  onMounted(() => {
    taskId.value = localStorage.getItem("volcengine_video_task_id") || "";
  });

  function normalizeUrl(value: string) {
    const markdownUrl = value.match(/^\[[^\]]*\]\((https?:\/\/.+)\)$/)?.[1];
    return (markdownUrl || value).replaceAll("&amp;", "&").replaceAll("\\&", "&");
  }

  function getError(error: unknown) {
    const fetchError = error as {
      data?: {
        message?: string;
        statusMessage?: string;
        error?: { message?: string };
        data?: { error?: { message?: string } };
      };
      message?: string;
    };
    return (
      fetchError.data?.data?.error?.message ||
      fetchError.data?.error?.message ||
      fetchError.data?.statusMessage ||
      fetchError.data?.message ||
      fetchError.message ||
      "请求失败"
    );
  }

  function readImage(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return Promise.resolve("");
    if (!file.type.startsWith("image/")) return Promise.reject(new Error("请选择图片文件"));

    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("读取图片失败"));
      reader.readAsDataURL(file);
    });
  }

  async function selectImage(event: Event) {
    try {
      imageInput.value = await readImage(event);
      imageError.value = "";
    } catch (error) {
      imageError.value = getError(error);
    }
  }

  async function selectVideoImage(event: Event) {
    try {
      videoImage.value = await readImage(event);
      videoError.value = "";
    } catch (error) {
      videoError.value = getError(error);
    }
  }

  async function generateImage() {
    imageLoading.value = true;
    imageError.value = "";
    imageResult.value = "";
    const body: Record<string, unknown> = {
      model: imageModel.value,
      prompt: imagePrompt.value,
      size: imageSize.value,
      watermark: imageWatermark.value,
    };
    if (imageModel.value.includes("seedream-5")) body.output_format = imageFormat.value;
    if (imageMode.value === "image") body.image = imageInput.value;

    try {
      const response = await $fetch<ImageResponse>("/api/hsyq/images/generations", {
        method: "POST",
        body,
      });
      const image = response.data?.[0];
      imageResult.value =
        (image?.url && normalizeUrl(image.url)) ||
        (image?.b64_json ? "data:image/png;base64," + image.b64_json : "");
      if (!imageResult.value) imageError.value = "接口成功，但没有返回图片";
    } catch (error) {
      imageError.value = getError(error);
    } finally {
      imageLoading.value = false;
    }
  }

  function addReference(
    content: Array<Record<string, unknown>>,
    type: "image_url" | "video_url" | "audio_url",
    role: string,
    value: string,
  ) {
    if (!value.trim()) return;
    content.push({ type, role, [type]: { url: normalizeUrl(value.trim()) } });
  }

  async function createVideoTask() {
    videoCreating.value = true;
    videoError.value = "";
    videoResult.value = "";
    const content: Array<Record<string, unknown>> = [
      { text: videoPrompt.value, type: "text" },
    ];
    addReference(content, "image_url", "reference_image", videoImage.value);
    addReference(content, "image_url", "reference_image", referenceImage1.value);
    addReference(content, "image_url", "reference_image", referenceImage2.value);
    addReference(content, "video_url", "reference_video", referenceVideo.value);
    addReference(content, "audio_url", "reference_audio", referenceAudio.value);

    try {
      const response = await $fetch<Record<string, unknown>>(
        "/api/hsyq/contents/generations/tasks",
        {
          method: "POST",
          body: {
            model: videoModel.value,
            content,
            duration: videoDuration.value,
            generate_audio: generateAudio.value,
            ratio: videoRatio.value,
          },
        },
      );
      applyTask(response, "任务已创建");
    } catch (error) {
      videoError.value = getError(error);
    } finally {
      videoCreating.value = false;
    }
  }

  function findString(value: unknown, keys: string[]): string {
    if (!value || typeof value !== "object") return "";
    const data = value as Record<string, unknown>;
    for (const key of keys) {
      if (typeof data[key] === "string") return data[key] as string;
    }
    for (const child of Object.values(data)) {
      const result = findString(child, keys);
      if (result) return result;
    }
    return "";
  }

  function findVideo(value: unknown): string {
    if (typeof value === "string") {
      const url = normalizeUrl(value);
      return /\.(mp4|webm|mov)(\?|$)/i.test(url) ? url : "";
    }
    if (!value || typeof value !== "object") return "";
    for (const child of Object.values(value as Record<string, unknown>)) {
      const result = findVideo(child);
      if (result) return result;
    }
    return "";
  }

  function saveTaskId(value: string) {
    taskId.value = value;
    if (import.meta.client && value) localStorage.setItem("volcengine_video_task_id", value);
  }

  function applyTask(response: Record<string, unknown>, fallbackStatus: string) {
    const id = findString(response, ["id", "task_id"]);
    const result = findVideo(response);
    if (id) saveTaskId(id);
    taskStatus.value = findString(response, ["status"]) || (result ? "succeeded" : fallbackStatus);
    videoResult.value = result;
    taskDetails.value = JSON.stringify(response, null, 2);
  }

  async function queryVideoTask() {
    videoQuerying.value = true;
    videoError.value = "";
    try {
      const response = await $fetch<Record<string, unknown>>(
        "/api/hsyq/contents/generations/tasks/" + encodeURIComponent(taskId.value),
      );
      applyTask(response, "查询完成");
    } catch (error) {
      videoError.value = getError(error);
    } finally {
      videoQuerying.value = false;
    }
  }
</script>

<style lang="less" scoped>
  #pages_qd_hsyq {
    width: 70%;
    margin: 0 auto;
    padding: 32px 0;
  }

  .tabs,
  .actions,
  .options {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }

  .tabs {
    margin-bottom: 24px;
  }

  button {
    padding: 10px 16px;
    border-radius: 7px;
    background: #817979;
    color: #fff;
  }

  button.active {
    background: #2563eb;
  }

  button:disabled {
    cursor: wait;
    opacity: 0.55;
  }

  .viewport {
    overflow: hidden;
  }

  .track {
    display: flex;
    align-items: flex-start;
    transition: transform 0.3s ease;
  }

  .track.show_video {
    transform: translateX(-100%);
  }

  .slide {
    box-sizing: border-box;
    flex: 0 0 100%;
  }

  .generator {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .generator > select,
  .generator > input,
  .generator > textarea {
    box-sizing: border-box;
    width: min(100%, 900px);
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 7px;
  }

  .generator textarea {
    resize: vertical;
  }

  .options label,
  .file_input {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .options input,
  .options select {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 6px;
  }

  .error {
    color: #dc2626;
  }

  .compare {
    display: grid;
    width: 60%;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
  }

  .compare figure {
    min-width: 0;
    margin: 0;
  }

  .compare figcaption {
    margin-bottom: 8px;
    font-weight: 600;
  }

  .compare img,
  .compare video {
    display: block;
    width: 100%;
    max-height: 48vh;
    object-fit: contain;
    border-radius: 8px;
    background: #f5f5f5;
  }

  .compare .generated:only-child {
    grid-column: 2;
  }

  .generated a {
    display: inline-block;
    margin-top: 8px;
    color: #2563eb;
  }

  pre {
    box-sizing: border-box;
    width: min(100%, 900px);
    overflow: auto;
    padding: 12px;
    border-radius: 8px;
    background: #f5f5f5;
    white-space: pre-wrap;
  }
</style>
