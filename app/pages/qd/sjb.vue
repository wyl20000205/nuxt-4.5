<template>
  <div id="pages_test_sjb">
    <!-- <p>一键测试文本：{{ prompt }}</p> -->
    <div class="model_tabs">
      <p
        :class="{ active: activeSlide === 'text' }"
        role="button"
        tabindex="0"
        @click="activeSlide = 'text'"
        @keydown.enter="activeSlide = 'text'"
      >
        文本模型
      </p>
      <p
        :class="{ active: activeSlide === 'media' }"
        role="button"
        tabindex="0"
        @click="activeSlide = 'media'"
        @keydown.enter="activeSlide = 'media'"
      >
        图像视频模型
      </p>
      <p
        :class="{ active: activeSlide === 'seedream' }"
        role="button"
        tabindex="0"
        @click="activeSlide = 'seedream'"
        @keydown.enter="activeSlide = 'seedream'"
      >
        Seedream 图片测试
      </p>
      <p
        :class="{ active: activeSlide === 'happyhorse' }"
        role="button"
        tabindex="0"
        @click="activeSlide = 'happyhorse'"
        @keydown.enter="activeSlide = 'happyhorse'"
      >
        HappyHorse 视频测试
      </p>
    </div>
    <div class="model_count">
      文本模型有：{{ textModels.length }}，图像视频模型有：{{ mediaModels.length }}，其中
      Seedream 有：{{ seedreamModels.length }}，HappyHorse 有：{{ happyhorseModels.length }}
    </div>
    <div class="model_viewport mt-10">
      <div
        class="model_track"
        :class="{
          show_media: activeSlide === 'media',
          show_seedream: activeSlide === 'seedream',
          show_happyhorse: activeSlide === 'happyhorse',
        }"
      >
        <div v-for="slide in slides" :key="slide.id" class="model_slide">
          <div v-for="model in slide.models" :key="model.id" class="model_item">
            <div class="model_info">
              <strong>{{ model.id }}</strong>
              <span>{{ model.owned_by }}</span>
            </div>
            <button :disabled="testing[model.id]" @click="testModel(model.id)">
              {{ testing[model.id] ? "测试中..." : "点击测试" }}
            </button>
            <p v-if="results[model.id]" class="model_result">
              {{ results[model.id] }}
            </p>
          </div>
        </div>
        <div class="model_slide image_test_seedream">
          <select v-model="imageMode">
            <option value="text">文生图</option>
            <option value="image">图生图</option>
          </select>
          <select v-model="selectedImageModel">
            <option disabled value="">请选择模型</option>
            <option
              v-for="model in seedreamModels"
              :key="model.id"
              :value="model.id"
            >
              {{ model.id }}
            </option>
          </select>
          <input
            v-model="imagePrompt"
            type="text"
            placeholder="请输入生图提示词"
          />
          <label v-if="imageMode === 'image'" class="file_input">
            上传参考图片
            <input type="file" accept="image/*" @change="selectSeedreamImage" />
          </label>
          <button
            :disabled="imageTesting || !canGenerateImage"
            @click="testSeedream"
          >
            {{ imageTesting ? "生成中..." : "测试" }}
          </button>
          <p v-if="imageError" class="image_error">{{ imageError }}</p>
          <div v-if="imageInput || imageResult" class="media_compare">
            <figure v-if="imageMode === 'image' && imageInput">
              <figcaption>原图</figcaption>
              <img :src="imageInput" alt="Seedream 输入图片预览" />
            </figure>
            <figure v-if="imageResult" class="generated_media">
              <figcaption>生成图片</figcaption>
              <img :src="imageResult" alt="Seedream 生成结果" />
            </figure>
          </div>
        </div>
        <div class="model_slide video_test_happyhorse">
          <select v-model="videoMode">
            <option value="text">文生视频</option>
            <option value="image">图生视频</option>
          </select>
          <select v-model="selectedVideoModel">
            <option disabled value="">请选择模型</option>
            <option
              v-for="model in happyhorseModels"
              :key="model.id"
              :value="model.id"
            >
              {{ model.id }}
            </option>
          </select>
          <input
            v-model="videoPrompt"
            type="text"
            placeholder="请输入视频提示词"
          />
          <label v-if="videoMode === 'image'" class="file_input">
            上传首帧图片
            <input type="file" accept="image/*" @change="selectVideoImage" />
          </label>
          <div class="video_options">
            <label>
              时长
              <input v-model.number="videoDuration" type="number" min="1" />
            </label>
            <label>
              清晰度
              <select v-model="videoSize">
                <option value="720P">720P</option>
                <option value="1080P">1080P</option>
              </select>
            </label>
            <label v-if="videoMode === 'text'">
              比例
              <select v-model="videoRatio">
                <option value="16:9">16:9</option>
                <option value="9:16">9:16</option>
              </select>
            </label>
          </div>
          <div class="video_actions">
            <button :disabled="videoCreating || !canCreateVideo" @click="createVideoTask">
              {{ videoCreating ? "创建中..." : "创建视频任务" }}
            </button>
            <button :disabled="videoQuerying || !videoTaskId.trim()" @click="queryVideoTask">
              {{ videoQuerying ? "查询中..." : "查询视频任务" }}
            </button>
          </div>
          <input
            v-model="videoTaskId"
            class="video_task_id"
            type="text"
            placeholder="任务创建后显示 task_id，也可粘贴已有 task_id"
            @change="saveVideoTaskId(videoTaskId)"
          />
          <p v-if="videoTaskStatus">任务状态：{{ videoTaskStatus }}</p>
          <p v-if="videoTaskError" class="image_error">{{ videoTaskError }}</p>
          <div v-if="videoImage || videoResult" class="media_compare">
            <figure v-if="videoMode === 'image' && videoImage">
              <figcaption>输入图片</figcaption>
              <img :src="videoImage" alt="HappyHorse 输入图片预览" />
            </figure>
            <figure v-if="videoResult" class="generated_media">
              <figcaption>生成视频</figcaption>
              <video
                :key="videoResult"
                :src="videoResult"
                controls
                @error="videoTaskError = '视频地址已返回，但浏览器无法加载该视频'"
              ></video>
              <a :href="videoResult" target="_blank" rel="noopener noreferrer">
                打开视频原始地址
              </a>
            </figure>
          </div>
          <pre v-if="videoTaskDetails" class="video_task_details">{{ videoTaskDetails }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  interface Model {
    id: string;
    owned_by: string;
  }

  interface ModelsResponse {
    data: Model[];
  }

  interface CompletionResponse {
    choices: Array<{ message: { content: string } }>;
  }

  interface ImageGenerationResponse {
    data: Array<{ url?: string; b64_json?: string }>;
  }

  type VideoOutput = string | { url?: string; video_url?: string };

  interface VideoTaskData {
    task_id?: string;
    id?: string;
    status?: string;
    url?: string;
    video_url?: string;
    output?: VideoOutput;
  }

  interface VideoTaskResponse extends VideoTaskData {
    data?: VideoTaskData;
  }

  const key = "sk-LwYm9AwcSuzd27MmqJlCRyVMMv7qlpy9uNccmq5553j5L090";
  const base = "https://tp-api.chinadatapay.com:8000";
  const prompt = "hello 你是什么模型";
  const activeSlide = ref<"text" | "media" | "seedream" | "happyhorse">("text");
  const testing = reactive<Record<string, boolean>>({});
  const results = reactive<Record<string, string>>({});
  const imageMode = ref<"text" | "image">("text");
  const selectedImageModel = ref("");
  const imagePrompt = ref("晨曦中的山间村落，水墨风格，竖版手机壁纸");
  const imageInput = ref("");
  const imageTesting = ref(false);
  const imageResult = ref("");
  const imageError = ref("");
  const videoMode = ref<"text" | "image">("text");
  const selectedVideoModel = ref("");
  const videoPrompt = ref(
    "一座由硬纸板和瓶盖搭建的微型城市，在夜晚焕发出生机。一列硬纸板火车缓缓驶过，小灯点缀其间，照亮前路。",
  );
  const videoImage = ref("");
  const videoDuration = ref(5);
  const videoSize = ref("720P");
  const videoRatio = ref("16:9");
  const videoCreating = ref(false);
  const videoQuerying = ref(false);
  const videoTaskId = ref("");
  const videoTaskStatus = ref("");
  const videoTaskError = ref("");
  const videoTaskDetails = ref("");
  const videoResult = ref("");
  const { data: response } = await useFetch<ModelsResponse>(
    base + "/v1/models",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
    },
  );

  const models = computed(() => response.value?.data ?? []);
  const isMediaModel = (model: Model) =>
    /seedance|seedream|happyhorse|^hy\d/i.test(model.id);
  const textModels = computed(() => models.value.filter((model) => !isMediaModel(model)));
  const mediaModels = computed(() => models.value.filter(isMediaModel));
  const seedreamModels = computed(() =>
    mediaModels.value.filter((model) => /seedream/i.test(model.id)),
  );
  const happyhorseModels = computed(() =>
    mediaModels.value.filter((model) => /happyhorse/i.test(model.id)),
  );
  const canGenerateImage = computed(
    () =>
      selectedImageModel.value &&
      imagePrompt.value.trim() &&
      (imageMode.value === "text" || imageInput.value),
  );
  const canCreateVideo = computed(
    () =>
      selectedVideoModel.value &&
      videoPrompt.value.trim() &&
      (videoMode.value === "text" || videoImage.value.trim()),
  );
  const slides = computed(() => [
    { id: "text", models: textModels.value },
    { id: "media", models: mediaModels.value },
  ]);

  onMounted(() => {
    videoTaskId.value = localStorage.getItem("happyhorse_task_id") || "";
  });

  async function testModel(model: string) {
    testing[model] = true;
    results[model] = "";

    try {
      const response = await $fetch<CompletionResponse>(
        base + "/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
          },
          body: {
            model,
            messages: [{ role: "user", content: prompt }],
          },
        },
      );

      results[model] = response.choices?.[0]?.message.content || "无返回内容";
    } catch (error) {
      results[model] = error instanceof Error ? error.message : "请求失败";
    } finally {
      testing[model] = false;
    }
  }

  async function testSeedream() {
    imageTesting.value = true;
    imageResult.value = "";
    imageError.value = "";

    try {
      const body: {
        model: string;
        prompt: string;
        size: string;
        watermark: boolean;
        image?: string;
      } = {
        model: selectedImageModel.value,
        prompt: imagePrompt.value,
        size: "2K",
        watermark: false,
      };

      if (imageMode.value === "image") body.image = imageInput.value;

      const response = await $fetch<ImageGenerationResponse>(
        base + "/v1/images/generations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
          },
          body,
        },
      );
      const image = response.data?.[0];

      imageResult.value =
        image?.url ||
        (image?.b64_json ? `data:image/png;base64,${image.b64_json}` : "");
      if (!imageResult.value) imageError.value = "接口成功，但没有返回图片";
    } catch (error) {
      imageError.value = getFetchError(error);
    } finally {
      imageTesting.value = false;
    }
  }

  function getFetchError(error: unknown) {
    const fetchError = error as {
      data?: { error?: { message?: string } };
      message?: string;
    };
    return fetchError.data?.error?.message || fetchError.message || "请求失败";
  }

  function readImageFile(event: Event) {
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

  async function selectSeedreamImage(event: Event) {
    try {
      imageInput.value = await readImageFile(event);
      imageError.value = "";
    } catch (error) {
      imageError.value = getFetchError(error);
    }
  }

  async function selectVideoImage(event: Event) {
    try {
      videoImage.value = await readImageFile(event);
      videoTaskError.value = "";
    } catch (error) {
      videoTaskError.value = getFetchError(error);
    }
  }

  function getVideoTaskId(response: VideoTaskResponse) {
    return response.task_id || response.id || response.data?.task_id || response.data?.id || "";
  }

  function normalizeVideoUrl(value: string) {
    const markdownUrl = value.match(/^\[[^\]]*\]\((https?:\/\/.+)\)$/)?.[1];
    return (markdownUrl || value).replaceAll("&amp;", "&").replaceAll("\\&", "&");
  }

  function getVideoResult(value: unknown): string {
    if (typeof value === "string") {
      const url = normalizeVideoUrl(value);
      return /\.(mp4|webm|mov)(\?|$)/i.test(url) ? url : "";
    }

    if (Array.isArray(value)) {
      return value.map(getVideoResult).find(Boolean) || "";
    }

    if (!value || typeof value !== "object") return "";

    const data = value as Record<string, unknown>;
    for (const key of ["video_url", "videoUrl", "url", "output"]) {
      const url = getVideoResult(data[key]);
      if (url) return url;
    }

    return Object.values(data).map(getVideoResult).find(Boolean) || "";
  }

  function saveVideoTaskId(taskId: string) {
    videoTaskId.value = taskId;
    if (import.meta.client && taskId) localStorage.setItem("happyhorse_task_id", taskId);
  }

  function applyVideoTaskResponse(response: VideoTaskResponse) {
    const taskId = getVideoTaskId(response);
    const data = response.data || response;
    const result = getVideoResult(response);

    if (taskId) saveVideoTaskId(taskId);
    videoTaskStatus.value = data.status || (result ? "已完成" : "任务已创建");
    videoResult.value = result;
    videoTaskDetails.value = JSON.stringify(response, null, 2);
  }

  async function createVideoTask() {
    videoCreating.value = true;
    videoTaskError.value = "";
    videoResult.value = "";

    const body: {
      model: string;
      prompt: string;
      duration: number;
      size: string;
      image?: string;
      metadata?: { ratio: string };
    } = {
      model: selectedVideoModel.value,
      prompt: videoPrompt.value,
      duration: videoDuration.value,
      size: videoSize.value,
    };

    if (videoMode.value === "image") body.image = videoImage.value;
    else body.metadata = { ratio: videoRatio.value };

    try {
      const response = await $fetch<VideoTaskResponse>(base + "/v1/video/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body,
      });
      applyVideoTaskResponse(response);
    } catch (error) {
      videoTaskError.value = getFetchError(error);
    } finally {
      videoCreating.value = false;
    }
  }

  async function queryVideoTask() {
    videoQuerying.value = true;
    videoTaskError.value = "";

    try {
      const response = await $fetch<VideoTaskResponse>(
        `${base}/v1/video/tasks/${encodeURIComponent(videoTaskId.value)}`,
        {
          headers: { Authorization: `Bearer ${key}` },
        },
      );
      applyVideoTaskResponse(response);
    } catch (error) {
      videoTaskError.value = getFetchError(error);
    } finally {
      videoQuerying.value = false;
    }
  }
</script>

<style lang="less" scoped>
  #pages_test_sjb {
    width: 70%;
    margin: 0 auto;
  }

  .model_tabs {
    display: flex;
    gap: 24px;
    row-gap: 30px;
    margin-top: 24px;
  }

  .model_tabs p {
    padding: 8px 0;
    cursor: pointer;
    border-bottom: 2px solid transparent;
  }

  .model_tabs p.active {
    color: #2563eb;
    border-color: #2563eb;
  }

  .model_count {
    margin-top: 12px;
  }

  .model_viewport {
    overflow: hidden;
  }

  .model_track {
    display: flex;
    align-items: flex-start;
    transition: transform 0.3s ease;
  }

  .model_track.show_media {
    transform: translateX(-100%);
  }

  .model_track.show_seedream {
    transform: translateX(-200%);
  }

  .model_track.show_happyhorse {
    transform: translateX(-300%);
  }

  .model_slide {
    display: grid;
    flex: 0 0 100%;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 22px;
    column-gap: 35px;
  }

  .model_item {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
  }

  .model_info {
    display: flex;
    justify-content: space-between;
    gap: 12px;
  }

  button {
    padding: 8px 12px;
    border-radius: 6px;
    background: #7f7878;
    color: #fff;
  }

  button:disabled {
    cursor: wait;
    opacity: 0.6;
  }

  .model_result {
    white-space: pre-wrap;
  }

  .image_test_seedream,
  .video_test_happyhorse {
    display: flex;
    box-sizing: border-box;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .image_test_seedream select,
  .image_test_seedream input {
    width: min(100%, 720px);
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
  }

  .image_error {
    color: #dc2626;
  }

  .file_input {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .file_input input {
    width: min(100%, 720px);
  }

  .video_test_happyhorse > select,
  .video_test_happyhorse > input {
    width: min(100%, 720px);
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
  }

  .video_options,
  .video_actions {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }

  .video_options label {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .video_options input,
  .video_options select {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 6px;
  }

  .media_compare {
    display: grid;
    width: 100%;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
  }

  .media_compare figure {
    min-width: 0;
    margin: 0;
  }

  .media_compare figcaption {
    margin-bottom: 8px;
    font-weight: 600;
  }

  .media_compare img,
  .media_compare video {
    display: block;
    width: 60%;
    max-height: 30vh;
    object-fit: contain;
    border-radius: 8px;
    background: #f5f5f5;
  }

  .generated_media img,
  .generated_media video {
    margin-left: auto;
  }

  .generated_media a {
    display: inline-block;
    margin-top: 8px;
    color: #2563eb;
  }

  .media_compare > .generated_media:only-child {
    grid-column: 2;
  }

  .video_task_details {
    width: min(100%, 720px);
    overflow: auto;
    padding: 12px;
    border-radius: 8px;
    background: #f5f5f5;
    white-space: pre-wrap;
  }
</style>
