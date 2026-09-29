<template>
  <main id="pages_shangtang">
    <section class="console-card">
      <header>
        <p class="eyebrow">SENSEAUDIO</p>
        <h1>文本、图片与视频生成</h1>
        <p class="description">填写参数即可生成内容，页面同时保留完整响应 JSON。</p>
      </header>

      <nav class="tabs" aria-label="生成类型">
        <button v-for="item in types" :key="item.value" :class="{ active: type === item.value }" @click="type = item.value">
          {{ item.label }}
        </button>
      </nav>

      <section v-if="type === 'text'" class="form-grid">
        <label class="field full">
          <span>模型</span>
          <select v-model="textForm.model">
            <option v-for="model in textModels" :key="model" :value="model">{{ model }}</option>
          </select>
        </label>
        <label class="field full"><span>问题</span><textarea v-model="textForm.prompt" rows="6" placeholder="请输入要生成的文本内容" /></label>
        <label class="field full"><span>系统提示词</span><textarea v-model="textForm.system" rows="3" /></label>
        <div v-if="textMessages.length || (pending && textResult)" class="chat-history full">
          <article v-for="(message, index) in textMessages" :key="index" :class="['message', message.role]">
            <strong>{{ message.role === 'user' ? '用户' : '助手' }}</strong>
            <p>{{ message.content }}</p>
          </article>
          <article v-if="pending && textResult" class="message assistant">
            <strong>助手</strong><p>{{ textResult }}</p>
          </article>
          <button class="clear-button" type="button" @click="textMessages = []">清空对话</button>
        </div>
        <label class="field"><span>随机性 {{ textForm.temperature }}</span><input v-model.number="textForm.temperature" type="range" min="0" max="2" step="0.1" /></label>
      </section>

      <section v-else-if="type === 'image'" class="form-grid">
        <label class="field full">
          <span>模型</span>
          <select v-model="imageForm.model">
            <option v-for="model in imageModels" :key="model" :value="model">{{ model }}</option>
          </select>
        </label>
        <label class="field full"><span>提示词</span><textarea v-model="imageForm.prompt" rows="6" placeholder="描述要生成或修改的图片" /></label>
        <label class="field"><span>尺寸</span><input v-model="imageForm.size" placeholder="1024x1024" /></label>
        <label class="field"><span>随机种子，可留空</span><input v-model="imageForm.seed" type="number" placeholder="随机" /></label>
        <label class="field full"><span>参考图片 URL，可留空</span><input v-model="imageForm.reference" type="url" placeholder="https://example.com/image.jpg" /></label>
        <label class="upload full"><span>或上传参考图片</span><input type="file" accept="image/*" @change="selectReference($event, 'image')" /></label>
        <img v-if="imageForm.reference" class="preview" :src="imageForm.reference" alt="图片参考图预览" />
      </section>

      <section v-else class="form-grid">
        <label class="field full"><span>模型</span><input v-model="videoForm.model" /></label>
        <label class="field full"><span>提示词</span><textarea v-model="videoForm.prompt" rows="6" placeholder="描述视频内容和镜头运动" /></label>
        <label class="field full"><span>首帧图片 URL，可留空</span><input v-model="videoForm.reference" type="url" placeholder="https://example.com/first-frame.jpg" /></label>
        <label class="upload full"><span>或上传首帧图片</span><input type="file" accept="image/*" @change="selectReference($event, 'video')" /></label>
        <img v-if="videoForm.reference" class="preview" :src="videoForm.reference" alt="视频首帧预览" />
        <label class="field"><span>时长（秒）</span><input v-model.number="videoForm.duration" type="number" min="1" /></label>
        <label class="field"><span>分辨率</span><select v-model="videoForm.resolution"><option>720p</option><option>1080p</option></select></label>
        <label class="field"><span>画面比例</span><select v-model="videoForm.ratio"><option>16:9</option><option>9:16</option><option>1:1</option></select></label>
        <label class="field"><span>水印</span><select v-model="videoForm.watermark"><option :value="true">开启</option><option :value="false">关闭</option></select></label>
        <label class="check full"><input v-model="videoForm.generateAudio" type="checkbox" /> 同时生成音频</label>
      </section>

      <details class="advanced">
        <summary>附加请求字段 JSON</summary>
        <p>这里的字段会覆盖上方表单中的同名字段。</p>
        <textarea v-model="customJson" rows="6" spellcheck="false" />
      </details>

      <button class="send-button" :disabled="pending || polling" @click="send">
        {{ pending ? "正在提交" : polling ? "视频生成中" : "开始生成" }}
      </button>
      <p v-if="polling" class="notice">正在查询视频进度，通常需要几分钟。</p>
      <p v-if="error" class="error" role="alert">{{ error }}</p>

      <section v-if="imageResult || videoResult" class="result-panel">
        <h2>生成结果</h2>
        <img v-if="imageResult" class="generated-image" :src="imageResult" alt="生成图片" />
        <video v-if="videoResult" class="generated-video" :src="videoResult" controls playsinline />
      </section>

      <section class="response-panel">
        <div class="response-head">
          <h2>响应 JSON</h2>
          <span v-if="status" :class="['status', { failed: status >= 400 }]">HTTP {{ status }}</span>
        </div>
        <pre>{{ formattedResponse }}</pre>
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
  type ApiType = "text" | "image" | "video";

  const types: { value: ApiType; label: string }[] = [
    { value: "text", label: "文本" },
    { value: "image", label: "图片" },
    { value: "video", label: "视频" },
  ];
  const textModels = [
    "senseaudio-s2",
    "senseaudio-s2-flash",
    "senseaudio-s2-lite",
    "sensenova-6.8-flash-lite",
    "deepseek-v4.1-flash",
    "deepseek-v4-flash-0731",
    "glm-5.3-flash",
    "qwen3.8-27b",
    "qwen3.6-35b-a3b",
  ];
  const imageModels = [
    "senseaudio-image-2.0-260319",
    "doubao-seedream-5-0-260128",
    "sensenova-u1-fast",
  ];
  const type = ref<ApiType>("text");
  const textMessages = ref<{ role: "user" | "assistant"; content: string }[]>([]);
  const textForm = reactive({ model: "senseaudio-s2", prompt: "", system: "你是一个严谨的人工智能助手。", temperature: 0.7 });
  const imageForm = reactive({ model: "senseaudio-image-2.0-260319", prompt: "", reference: "", size: "1024x1024", seed: "" });
  const videoForm = reactive({ model: "doubao-seedance-2-0-260128", prompt: "", reference: "", duration: 10, resolution: "720p", ratio: "16:9", watermark: true, generateAudio: true });
  const customJson = ref("{}");
  const responseBody = ref<any>();
  const status = ref(0);
  const pending = ref(false);
  const polling = ref(false);
  const error = ref("");
  let pollTimer: ReturnType<typeof setTimeout> | undefined;

  const formattedResponse = computed(() => responseBody.value === undefined ? "等待请求…" : JSON.stringify(responseBody.value, null, 2));
  const textResult = computed(() => responseBody.value?.content || responseBody.value?.choices?.[0]?.message?.content || "");
  const imageResult = computed(() => responseBody.value?.url || responseBody.value?.data?.[0]?.url || "");
  const videoResult = computed(() => responseBody.value?.video_url || "");

  watch(type, resetResponse);
  onBeforeUnmount(stopPolling);

  function resetResponse() {
    stopPolling();
    responseBody.value = undefined;
    status.value = 0;
    error.value = "";
  }

  function stopPolling() {
    if (pollTimer) clearTimeout(pollTimer);
    pollTimer = undefined;
    polling.value = false;
  }

  function selectReference(event: Event, target: "image" | "video") {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => target === "image" ? imageForm.reference = String(reader.result) : videoForm.reference = String(reader.result);
    reader.onerror = () => error.value = "参考图片读取失败";
    reader.readAsDataURL(file);
  }

  function requestBody() {
    const extras = JSON.parse(customJson.value || "{}");
    if (!extras || Array.isArray(extras) || typeof extras !== "object") throw new Error("附加请求字段必须是 JSON 对象");

    let body: Record<string, unknown>;
    if (type.value === "text") {
      body = {
        model: textForm.model,
        messages: [
          ...(textForm.system ? [{ role: "system", content: textForm.system }] : []),
          ...textMessages.value,
          { role: "user", content: textForm.prompt },
        ],
        temperature: textForm.temperature,
        stream: true,
      };
    } else if (type.value === "image") {
      body = { model: imageForm.model, prompt: imageForm.prompt, size: imageForm.size };
      if (imageForm.reference) body.reference = imageForm.reference;
      if (imageForm.seed !== "") body.seed = Number(imageForm.seed);
    } else {
      body = {
        model: videoForm.model,
        content: [{ type: "text", text: videoForm.prompt }, ...(videoForm.reference ? [{ type: "image", url: videoForm.reference, role: "first_frame" }] : [])],
        duration: videoForm.duration,
        resolution: videoForm.resolution,
        ratio: videoForm.ratio,
        watermark: videoForm.watermark,
        provider_specific: { generate_audio: videoForm.generateAudio },
      };
    }
    return { ...body, ...extras };
  }

  async function readResponse(response: Response) {
    const text = await response.text();
    try { return text ? JSON.parse(text) : {}; } catch { return { raw: text }; }
  }

  async function readTextStream(response: Response) {
    if (!response.body) {
      responseBody.value = await readResponse(response);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const events: any[] = [];
    let buffer = "";
    let content = "";
    const consume = (line: string) => {
      if (!line.startsWith("data:")) return;
      const data = line.slice(5).trim();
      if (!data || data === "[DONE]") return;
      try {
        const event = JSON.parse(data);
        events.push(event);
        content += event.choices?.[0]?.delta?.content || event.choices?.[0]?.message?.content || "";
        responseBody.value = { stream: true, content, events: [...events] };
      } catch {
        events.push({ raw: data });
        responseBody.value = { stream: true, content, events: [...events] };
      }
    };

    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() || "";
      lines.forEach(consume);
      if (done) break;
    }
    if (buffer) consume(buffer);
  }

  async function send() {
    resetResponse();
    const prompt = type.value === "text" ? textForm.prompt : type.value === "image" ? imageForm.prompt : videoForm.prompt;
    if (!prompt.trim()) return void (error.value = "请先填写提示词");

    let body: Record<string, unknown>;
    try { body = requestBody(); } catch (cause) {
      error.value = cause instanceof Error ? cause.message : "附加请求字段 JSON 无效";
      return;
    }

    pending.value = true;
    const userPrompt = textForm.prompt;
    if (type.value === "text") {
      textMessages.value.push({ role: "user", content: userPrompt });
      textForm.prompt = "";
    }
    try {
      const response = await fetch(`/api/shangtang?type=${type.value}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      status.value = response.status;
      if (type.value === "text" && response.ok) {
        await readTextStream(response);
        if (textResult.value) textMessages.value.push({ role: "assistant", content: textResult.value });
      }
      else responseBody.value = await readResponse(response);
      if (!response.ok) throw new Error(responseBody.value?.message || responseBody.value?.statusMessage || "请求失败");
      if (type.value === "video" && responseBody.value?.task_id) {
        polling.value = true;
        pollTimer = setTimeout(() => void pollVideo(responseBody.value.task_id), 1500);
      }
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : String(cause);
    } finally {
      pending.value = false;
    }
  }

  async function pollVideo(taskId: string) {
    try {
      const response = await fetch(`/api/shangtang?type=video-status&id=${encodeURIComponent(taskId)}`);
      status.value = response.status;
      responseBody.value = await readResponse(response);
      if (!response.ok) throw new Error(responseBody.value?.message || "查询视频状态失败");
      if (["pending", "processing"].includes(responseBody.value?.status)) {
        pollTimer = setTimeout(() => void pollVideo(taskId), 5000);
      } else {
        stopPolling();
        if (responseBody.value?.status === "failed") error.value = responseBody.value?.error_message || "视频生成失败";
      }
    } catch (cause) {
      stopPolling();
      error.value = cause instanceof Error ? cause.message : String(cause);
    }
  }
</script>

<style scoped lang="less">
  #pages_shangtang { min-height: 100vh; padding: 48px 20px; color: #182033; background: #f3f5fa; }
  .console-card { width: min(920px, 100%); box-sizing: border-box; margin: auto; padding: 34px; border: 1px solid #e1e5ee; border-radius: 20px; background: #fff; box-shadow: 0 20px 60px rgba(35, 43, 74, .09); }
  .eyebrow { margin: 0; color: #6954d9; font-size: 12px; font-weight: 800; letter-spacing: .14em; }
  h1 { margin: 8px 0 0; font-size: clamp(26px, 4vw, 38px); }
  h2 { font-size: 16px; }
  .description, .advanced p, .notice { color: #6e7688; line-height: 1.7; }
  .tabs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 28px 0 8px; padding: 5px; border-radius: 14px; background: #f1f2f7; }
  .tabs button { padding: 11px; border: 0; border-radius: 10px; color: #596174; background: transparent; cursor: pointer; }
  .tabs button.active { color: #fff; font-weight: 700; background: #6954d9; }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  .field { display: grid; gap: 8px; }
  .field span, .upload span { font-size: 14px; font-weight: 700; }
  .full, .preview { grid-column: 1 / -1; }
  input, select, textarea { box-sizing: border-box; width: 100%; border: 1px solid #d9deea; border-radius: 11px; color: #182033; background: #fff; outline: none; }
  input, select { min-height: 44px; padding: 10px 12px; }
  input[type="range"], input[type="checkbox"] { width: auto; min-height: 0; accent-color: #6954d9; }
  textarea { padding: 13px; resize: vertical; font: inherit; }
  input:focus, select:focus, textarea:focus { border-color: #7560db; box-shadow: 0 0 0 4px rgba(105, 84, 217, .1); }
  .upload { display: grid; gap: 9px; padding: 16px; border: 1px dashed #b8bfd0; border-radius: 12px; background: #fafbfe; }
  .upload input { border: 0; padding: 0; }
  .preview, .generated-image, .generated-video { display: block; max-width: 100%; max-height: 520px; margin: 0 auto; border-radius: 14px; object-fit: contain; background: #eef0f5; }
  .check { display: flex; align-items: center; gap: 8px; font-size: 14px; }
  .chat-history { display: grid; gap: 12px; padding: 16px; border-radius: 14px; background: #f7f8fb; }
  .message { width: min(78%, 640px); padding: 12px 14px; border-radius: 14px; background: #fff; box-shadow: 0 3px 12px rgba(35, 43, 74, .06); }
  .message.user { justify-self: end; color: #fff; background: #6954d9; }
  .message p { margin: 6px 0 0; line-height: 1.7; white-space: pre-wrap; }
  .clear-button { justify-self: center; padding: 7px 12px; border: 1px solid #d9deea; border-radius: 9px; color: #596174; background: #fff; cursor: pointer; }
  .advanced { margin-top: 24px; padding: 15px; border: 1px solid #e1e5ee; border-radius: 12px; }
  .advanced summary { font-weight: 700; cursor: pointer; }
  .advanced textarea { margin-top: 10px; font: 13px/1.6 Consolas, monospace; }
  .send-button { width: 100%; min-height: 50px; margin-top: 20px; border: 0; border-radius: 12px; color: #fff; font-size: 15px; font-weight: 700; background: #6954d9; cursor: pointer; }
  .send-button:disabled { opacity: .55; cursor: wait; }
  .notice, .error { margin-top: 14px; padding: 12px 14px; border-radius: 10px; background: #f4f2ff; }
  .error { color: #b4233a; background: #fff0f2; }
  .result-panel, .response-panel { margin-top: 28px; }
  .text-result { padding: 18px; border-radius: 14px; line-height: 1.8; white-space: pre-wrap; background: #f7f8fb; }
  .response-head { display: flex; align-items: center; justify-content: space-between; }
  .status { padding: 5px 9px; border-radius: 999px; color: #147a48; font-size: 12px; font-weight: 700; background: #e7f8ef; }
  .status.failed { color: #b4233a; background: #fff0f2; }
  pre { min-height: 150px; max-height: 560px; padding: 18px; overflow: auto; border-radius: 14px; color: #dfe6f4; background: #1f2533; font: 13px/1.65 Consolas, monospace; white-space: pre-wrap; word-break: break-word; user-select: text; }
  @media (max-width: 600px) { #pages_shangtang { padding: 20px 12px; } .console-card { padding: 24px 18px; } .form-grid { grid-template-columns: 1fr; } .full, .preview { grid-column: auto; } }
</style>
