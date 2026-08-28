<script setup lang="ts">
  type DemoId = "get" | "post" | "upload" | "auth";

  interface DemoDefinition {
    id: DemoId;
    label: string;
    method: "GET" | "POST";
    title: string;
    description: string;
  }

  interface ResponseSnapshot {
    status: number;
    statusText: string;
    duration: number;
    headers: Record<string, string>;
    body: string;
  }

  const demos: DemoDefinition[] = [
    {
      id: "get",
      label: "查询参数",
      method: "GET",
      title: "读取查询参数与请求头",
      description: "练习 c.Query、c.DefaultQuery、c.GetHeader 和 c.ClientIP。",
    },
    {
      id: "post",
      label: "JSON Body",
      method: "POST",
      title: "接收并校验 JSON",
      description: "练习结构体、json 标签、binding 标签和 c.ShouldBindJSON。",
    },
    {
      id: "upload",
      label: "文件上传",
      method: "POST",
      title: "上传一个或多个文件",
      description: "练习 c.MultipartForm、FileHeader 和 c.SaveUploadedFile。",
    },
    {
      id: "auth",
      label: "身份验证",
      method: "GET",
      title: "发送 Bearer Token",
      description: "练习 c.GetHeader、鉴权中间件、c.Abort 和 c.Next。",
    },
  ];

  const endpointPaths = reactive<Record<DemoId, string>>({
    get: "/get_test",
    post: "/post_test",
    upload: "/file_test",
    auth: "/auth_test",
  });

  const activeId = ref<DemoId>("get");
  const apiBase = ref("http://127.0.0.1:3003");
  const requestId = ref("gin-learning-001");
  const queryKey = ref("name");
  const queryValue = ref("yumao");
  const jsonBody = ref(`{
  "name": "yumao",
  "age": 20
}`);
  const uploadField = ref("files");
  const selectedFiles = ref<File[]>([]);
  const authToken = ref("");
  const loading = ref(false);
  const responseState = ref<ResponseSnapshot | null>(null);
  const copied = ref(false);

  const activeDemo = computed(
    () => demos.find((demo) => demo.id === activeId.value) as DemoDefinition,
  );

  const currentPath = computed({
    get: () => endpointPaths[activeId.value],
    set: (value: string) => {
      endpointPaths[activeId.value] = value;
    },
  });

  const previewUrl = computed(() => {
    const base = apiBase.value.trim().replace(/\/+$/, "");
    const path = currentPath.value.trim();
    let value = `${base}${path.startsWith("/") ? path : `/${path}`}`;

    if (activeId.value === "get" && queryKey.value.trim()) {
      const separator = value.includes("?") ? "&" : "?";
      value += `${separator}${encodeURIComponent(queryKey.value.trim())}=${encodeURIComponent(queryValue.value)}`;
    }

    return value;
  });

  const selectedFileSize = computed(() =>
    selectedFiles.value.reduce((total, file) => total + file.size, 0),
  );

  const responseTone = computed(() => {
    const status = responseState.value?.status ?? 0;
    if (status >= 200 && status < 300) return "success";
    if (status >= 400) return "error";
    return "neutral";
  });

  const mappings = [
    { label: "查询参数", express: "req.query.name", gin: 'c.Query("name")' },
    { label: "路径参数", express: "req.params.id", gin: 'c.Param("id")' },
    {
      label: "请求头",
      express: 'req.get("Authorization")',
      gin: 'c.GetHeader("Authorization")',
    },
    { label: "JSON Body", express: "req.body", gin: "c.ShouldBindJSON(&body)" },
    {
      label: "返回 JSON",
      express: "res.status(200).json(data)",
      gin: "c.JSON(http.StatusOK, data)",
    },
    {
      label: "停止中间件",
      express: "return res.status(401).json(data)",
      gin: "c.AbortWithStatusJSON(401, data)",
    },
  ];

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const index = Math.min(
      Math.floor(Math.log(bytes) / Math.log(1024)),
      units.length - 1,
    );
    return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
  };

  const prettyBody = (raw: string, contentType: string) => {
    if (!raw) return "响应体为空";
    if (!contentType.includes("json")) return raw;

    try {
      return JSON.stringify(JSON.parse(raw), null, 2);
    } catch {
      return raw;
    }
  };

  const onFilesSelected = (event: Event) => {
    const input = event.target as HTMLInputElement;
    selectedFiles.value = Array.from(input.files ?? []);
  };

  const selectDemo = (id: DemoId) => {
    activeId.value = id;
    responseState.value = null;
  };

  const clearResponse = () => {
    responseState.value = null;
  };

  const copyResponse = async () => {
    if (!responseState.value) return;
    await navigator.clipboard.writeText(responseState.value.body);
    copied.value = true;
    window.setTimeout(() => {
      copied.value = false;
    }, 1400);
  };

  const sendRequest = async () => {
    if (loading.value) return;

    loading.value = true;
    responseState.value = null;
    const startedAt = performance.now();
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15000);

    try {
      const url = new URL(previewUrl.value);
      const headers: Record<string, string> = {
        Accept: "application/json",
      };

      if (requestId.value.trim()) {
        headers["X-Request-ID"] = requestId.value.trim();
      }

      const options: RequestInit = {
        method: activeDemo.value.method,
        headers,
        signal: controller.signal,
      };

      if (activeId.value === "post") {
        const parsedBody = JSON.parse(jsonBody.value);
        headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(parsedBody);
      }

      if (activeId.value === "upload") {
        if (!selectedFiles.value.length) {
          throw new Error("请先选择至少一个文件");
        }

        const formData = new FormData();
        const field = uploadField.value.trim() || "files";
        selectedFiles.value.forEach((file) => formData.append(field, file));
        formData.append("name", "yumao");
        formData.append("age", "28");
        options.body = formData;
      }

      if (activeId.value === "auth") {
        if (!authToken.value.trim()) {
          throw new Error("请输入 Bearer Token");
        }
        headers.Authorization = `Bearer ${authToken.value.trim()}`;
      }

      const response = await fetch(url, options);
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });
      const rawBody = await response.text();

      responseState.value = {
        status: response.status,
        statusText: response.statusText || "HTTP Response",
        duration: Math.round(performance.now() - startedAt),
        headers: responseHeaders,
        body: prettyBody(rawBody, response.headers.get("content-type") ?? ""),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const hint =
        error instanceof TypeError
          ? "\n\n浏览器没有拿到响应。请确认 Gin 已启动、端口正确，并检查跨域 CORS 配置。"
          : "";

      responseState.value = {
        status: 0,
        statusText:
          error instanceof DOMException && error.name === "AbortError"
            ? "请求超时"
            : "请求失败",
        duration: Math.round(performance.now() - startedAt),
        headers: {},
        body: `${message}${hint}`,
      };
    } finally {
      window.clearTimeout(timeoutId);
      loading.value = false;
    }
  };
</script>

<template>
  <main id="go_lab">
    <section class="hero">
      <div class="hero__copy">
        <span class="eyebrow">NODE TO GO · LEARNING LAB</span>
        <h1>Express 到 Gin<br />API 迁移练习</h1>
        <p>
          用同一组请求理解两个框架的差异。先在这里构造请求，再到 Gin
          中实现对应路由。
        </p>
        <div class="runtime-note">
          <span><i class="dot dot--frontend"></i>Nuxt 建议端口 3001</span>
          <span><i class="dot dot--backend"></i>Gin API 端口 3000</span>
        </div>
      </div>

      <div class="api-config">
        <div class="api-config__head">
          <div>
            <span class="section-label">API ORIGIN</span>
            <strong>Gin 服务地址</strong>
          </div>
          <span class="connection-pill">手动连接</span>
        </div>
        <label>
          <span>Base URL</span>
          <input v-model.trim="apiBase" type="url" spellcheck="false" />
        </label>
        <p>前后端端口不同会产生跨域请求，后续可用 Gin 中间件练习 CORS。</p>
      </div>
    </section>

    <section class="lab-shell">
      <nav class="demo-tabs" aria-label="API 练习类型">
        <button
          v-for="demo in demos"
          :key="demo.id"
          type="button"
          :class="{ active: activeId === demo.id }"
          @click="selectDemo(demo.id)"
        >
          <span
            :class="['method-dot', `method-dot--${demo.method.toLowerCase()}`]"
          >
            {{ demo.method }}
          </span>
          {{ demo.label }}
        </button>
      </nav>

      <div class="workspace">
        <form class="panel request-panel" @submit.prevent="sendRequest">
          <header class="panel__header">
            <div>
              <span class="section-label">REQUEST BUILDER</span>
              <h2>{{ activeDemo.title }}</h2>
              <p>{{ activeDemo.description }}</p>
            </div>
          </header>

          <div class="endpoint-row">
            <span
              :class="[
                'method-badge',
                `method-badge--${activeDemo.method.toLowerCase()}`,
              ]"
            >
              {{ activeDemo.method }}
            </span>
            <label class="endpoint-input">
              <span class="sr-only">接口路径</span>
              <input
                v-model.trim="currentPath"
                type="text"
                spellcheck="false"
              />
            </label>
          </div>

          <div class="request-preview">
            <span>完整请求地址</span>
            <code>{{ previewUrl }}</code>
          </div>

          <div class="field-grid">
            <label class="field">
              <span>X-Request-ID</span>
              <input
                v-model="requestId"
                type="text"
                placeholder="gin-learning-001"
              />
              <small>Gin：c.GetHeader("X-Request-ID")</small>
            </label>

            <template v-if="activeId === 'get'">
              <label class="field">
                <span>查询参数名称</span>
                <input v-model="queryKey" type="text" placeholder="name" />
                <small>Express：req.query.name</small>
              </label>
              <label class="field field--wide">
                <span>查询参数值</span>
                <input v-model="queryValue" type="text" placeholder="yumao" />
                <small>Gin：c.Query("name")</small>
              </label>
            </template>

            <label v-else-if="activeId === 'post'" class="field field--wide">
              <span>JSON 请求体</span>
              <textarea
                v-model="jsonBody"
                rows="9"
                spellcheck="false"
              ></textarea>
              <small>请求会自动携带 Content-Type: application/json</small>
            </label>

            <template v-else-if="activeId === 'upload'">
              <label class="field">
                <span>表单字段名</span>
                <input v-model="uploadField" type="text" placeholder="files" />
                <small>Gin：form.File["files"]</small>
              </label>
              <label class="file-picker field--wide">
                <input type="file" multiple @change="onFilesSelected" />
                <span class="file-picker__icon">＋</span>
                <strong>选择一个或多个文件</strong>
                <small>浏览器会自动生成 multipart/form-data boundary</small>
              </label>
              <div v-if="selectedFiles.length" class="file-list field--wide">
                <div
                  v-for="file in selectedFiles"
                  :key="`${file.name}-${file.lastModified}`"
                >
                  <span>{{ file.name }}</span>
                  <small>{{ formatBytes(file.size) }}</small>
                </div>
                <strong
                  >共 {{ selectedFiles.length }} 个文件，{{
                    formatBytes(selectedFileSize)
                  }}</strong
                >
              </div>
            </template>

            <label v-else class="field field--wide">
              <span>Bearer Token</span>
              <input
                v-model="authToken"
                type="password"
                autocomplete="off"
                placeholder="输入本地测试 Token"
              />
              <small>仅用于本次浏览器请求，不会显示在页面结果中</small>
            </label>
          </div>

          <footer class="request-actions">
            <button class="send-button" type="submit" :disabled="loading">
              <span v-if="loading" class="spinner"></span>
              {{ loading ? "请求中" : "发送请求" }}
            </button>
            <button class="quiet-button" type="button" @click="clearResponse">
              清空响应
            </button>
            <span>超时时间 15 秒</span>
          </footer>
        </form>

        <section class="panel response-panel">
          <header class="panel__header response-panel__header">
            <div>
              <span class="section-label">RESPONSE INSPECTOR</span>
              <h2>Gin 响应</h2>
            </div>
            <button
              v-if="responseState"
              type="button"
              class="copy-button"
              @click="copyResponse"
            >
              {{ copied ? "已复制" : "复制 Body" }}
            </button>
          </header>

          <div v-if="!responseState && !loading" class="empty-response">
            <span>↗</span>
            <strong>等待发送请求</strong>
            <p>响应状态、耗时、Headers 和 Body 会显示在这里。</p>
          </div>

          <div v-else-if="loading" class="empty-response">
            <span class="large-spinner"></span>
            <strong>正在等待 Gin</strong>
            <p>{{ previewUrl }}</p>
          </div>

          <div v-else-if="responseState" class="response-content">
            <div class="response-summary">
              <span :class="['status-code', `status-code--${responseTone}`]">
                {{ responseState.status || "ERR" }}
              </span>
              <div>
                <strong>{{ responseState.statusText }}</strong>
                <small>{{ responseState.duration }} ms</small>
              </div>
            </div>

            <details class="response-section" open>
              <summary>
                Response Body
                <span>{{ responseState.body.length }} chars</span>
              </summary>
              <pre>{{ responseState.body }}</pre>
            </details>

            <details class="response-section">
              <summary>
                Response Headers
                <span>{{ Object.keys(responseState.headers).length }}</span>
              </summary>
              <div
                v-if="Object.keys(responseState.headers).length"
                class="header-list"
              >
                <div v-for="(value, key) in responseState.headers" :key="key">
                  <span>{{ key }}</span>
                  <code>{{ value }}</code>
                </div>
              </div>
              <p v-else class="no-headers">没有可读取的响应头</p>
            </details>
          </div>
        </section>
      </div>
    </section>

    <section class="migration-guide">
      <div class="guide-heading">
        <div>
          <span class="section-label">MIGRATION CHEATSHEET</span>
          <h2>Express 与 Gin 对照</h2>
        </div>
        <p>先理解请求数据来自哪里，再选择对应的 Gin 方法。</p>
      </div>

      <div class="mapping-grid">
        <article v-for="item in mappings" :key="item.label">
          <span>{{ item.label }}</span>
          <div>
            <small>Express</small>
            <code>{{ item.express }}</code>
          </div>
          <b>→</b>
          <div>
            <small>Gin</small>
            <code>{{ item.gin }}</code>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>

<style lang="less" scoped>
  #go_lab {
    --ink: #26313d;
    --muted: #6b7280;
    --line: #d8dee5;
    --soft: #f5f7f9;
    --accent: #087f8c;
    min-height: 100vh;
    padding: 24px 16px 48px;
    color: var(--ink);
    background: var(--soft);
    font-family: system-ui, "Microsoft YaHei", sans-serif;

    &,
    * {
      box-sizing: border-box;
    }
    button,
    input,
    textarea {
      font: inherit;
    }
    button {
      cursor: pointer;
    }

    .hero,
    .lab-shell,
    .migration-guide {
      width: min(1100px, 100%);
      margin-inline: auto;
    }

    .hero {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 12px;
      margin-bottom: 12px;
    }

    .hero__copy,
    .api-config,
    .lab-shell,
    .migration-guide {
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #fff;
    }

    .hero__copy {
      padding: 24px;

      h1 {
        margin: 8px 0;
        font-size: clamp(28px, 4vw, 40px);
      }
      > p {
        max-width: 620px;
        margin: 0;
        color: var(--muted);
        line-height: 1.6;
      }
    }

    .eyebrow,
    .section-label,
    .method-dot,
    .method-badge {
      color: var(--accent);
      font:
        700 10px ui-monospace,
        Consolas,
        monospace;
    }

    .runtime-note {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 16px;

      span {
        padding: 5px 8px;
        border-radius: 4px;
        background: var(--soft);
        font-size: 11px;
      }
    }

    .dot {
      display: inline-block;
      width: 6px;
      height: 6px;
      margin-right: 5px;
      border-radius: 50%;
      background: var(--accent);
    }

    .dot--frontend {
      background: #3b82f6;
    }

    .api-config {
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 20px;

      label {
        display: grid;
        gap: 6px;
        margin-top: 16px;
      }
      label span,
      > p {
        color: var(--muted);
        font-size: 11px;
      }
      > p {
        margin: 8px 0 0;
      }
      input {
        height: 40px;
        border: 1px solid var(--line);
        border-radius: 5px;
        padding: 0 10px;
        outline: 0;
      }
      input:focus {
        border-color: var(--accent);
      }
    }

    .api-config__head,
    .guide-heading,
    .panel__header,
    .request-actions,
    .response-summary {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .connection-pill,
    .quiet-button,
    .copy-button {
      border: 0;
      border-radius: 5px;
      color: #536170;
      background: #e9edf1;
    }

    .connection-pill {
      padding: 4px 7px;
      font-size: 10px;
    }
    .lab-shell {
      overflow: hidden;
    }

    .demo-tabs {
      display: flex;
      overflow-x: auto;
      gap: 4px;
      padding: 6px;
      border-bottom: 1px solid var(--line);
      background: var(--soft);

      button {
        min-width: max-content;
        border: 0;
        border-radius: 5px;
        padding: 9px 11px;
        color: var(--muted);
        background: transparent;
        font-size: 12px;
        font-weight: 700;
      }

      button:hover,
      button.active {
        color: var(--ink);
        background: #fff;
      }
    }

    .method-dot {
      margin-right: 6px;
    }
    .method-dot--post,
    .method-badge--post {
      color: #9a6700;
    }
    .workspace {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }
    .panel {
      min-width: 0;
      padding: 22px;
    }
    .request-panel {
      border-right: 1px solid var(--line);
    }

    .panel__header {
      align-items: flex-start;

      h2 {
        margin: 4px 0;
        font-size: 18px;
      }
      p {
        margin: 0;
        color: var(--muted);
        font-size: 11px;
      }
    }

    .endpoint-row {
      display: flex;
      overflow: hidden;
      margin-top: 18px;
      border: 1px solid var(--line);
      border-radius: 6px;
    }

    .endpoint-row:focus-within {
      border-color: var(--accent);
    }
    .method-badge {
      display: grid;
      min-width: 64px;
      border-right: 1px solid var(--line);
      background: var(--soft);
      place-items: center;
    }
    .endpoint-input {
      width: 100%;
    }
    .endpoint-input input {
      width: 100%;
      height: 42px;
      border: 0;
      padding: 0 10px;
      outline: 0;
    }

    .request-preview {
      display: grid;
      gap: 3px;
      overflow: hidden;
      margin: 8px 0 16px;
      padding: 9px 10px;
      border-radius: 5px;
      color: #e7edf3;
      background: #303b46;

      span {
        color: #aeb9c4;
        font-size: 9px;
      }
      code {
        overflow: hidden;
        font-size: 11px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .field-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .field {
      display: grid;
      min-width: 0;
      gap: 5px;

      > span {
        color: #4b5563;
        font-size: 11px;
        font-weight: 700;
      }
      input,
      textarea {
        width: 100%;
        border: 1px solid var(--line);
        border-radius: 5px;
        padding: 9px 10px;
        outline: 0;
      }
      input:focus,
      textarea:focus {
        border-color: var(--accent);
      }
      textarea {
        min-height: 150px;
        resize: vertical;
        font:
          12px/1.5 ui-monospace,
          Consolas,
          monospace;
      }
      small {
        color: #87919d;
        font-size: 9px;
      }
    }

    .field--wide {
      grid-column: 1 / -1;
    }

    .file-picker {
      display: grid;
      position: relative;
      min-height: 110px;
      border: 1px dashed #9aa7b4;
      border-radius: 6px;
      background: var(--soft);
      text-align: center;
      place-content: center;
      gap: 5px;

      input {
        position: absolute;
        opacity: 0;
        inset: 0;
        cursor: pointer;
      }
      small {
        color: var(--muted);
        font-size: 9px;
      }
    }

    .file-picker__icon {
      color: var(--accent);
      font-size: 22px;
    }

    .file-list {
      padding: 8px;
      border: 1px solid var(--line);
      border-radius: 5px;
      background: var(--soft);

      div,
      > strong {
        display: flex;
        justify-content: space-between;
        padding: 4px;
        font-size: 10px;
        gap: 10px;
      }
      div span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      > strong {
        margin-top: 4px;
        border-top: 1px solid var(--line);
      }
    }

    .request-actions {
      justify-content: flex-start;
      margin-top: 18px;
    }
    .request-actions > span {
      margin-left: auto;
      color: var(--muted);
      font-size: 9px;
    }
    .send-button,
    .quiet-button,
    .copy-button {
      height: 36px;
      padding: 0 12px;
      font-size: 11px;
      font-weight: 700;
    }
    .send-button {
      min-width: 100px;
      border: 0;
      border-radius: 5px;
      color: #fff;
      background: var(--accent);
    }
    .send-button:disabled {
      opacity: 0.6;
    }

    .spinner,
    .large-spinner {
      display: inline-block;
      border: 2px solid #cbd5df;
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .spinner {
      width: 12px;
      height: 12px;
      margin-right: 6px;
      border-color: #ffffff66;
      border-top-color: #fff;
    }
    .large-spinner {
      width: 28px;
      height: 28px;
    }
    .response-panel {
      min-height: 500px;
      background: #fafbfc;
    }
    .response-panel__header {
      min-height: 50px;
    }

    .empty-response {
      display: grid;
      min-height: 340px;
      color: var(--muted);
      text-align: center;
      place-content: center;

      > span:first-child:not(.large-spinner) {
        color: var(--accent);
        font-size: 24px;
      }
      strong {
        margin-top: 8px;
        color: #4b5563;
        font-size: 13px;
      }
      p {
        max-width: 340px;
        margin: 6px 0 0;
        font-size: 10px;
        overflow-wrap: anywhere;
      }
    }

    .response-content {
      display: grid;
      gap: 8px;
      margin-top: 12px;
    }
    .response-summary {
      justify-content: flex-start;
      padding: 9px;
      border: 1px solid var(--line);
      border-radius: 6px;
      background: #fff;
    }
    .response-summary > div {
      display: grid;
    }
    .response-summary small {
      color: var(--muted);
      font-size: 9px;
    }

    .status-code {
      min-width: 50px;
      padding: 7px;
      border-radius: 4px;
      text-align: center;
      font:
        800 11px ui-monospace,
        Consolas,
        monospace;
    }

    .status-code--success {
      color: #08705f;
      background: #dcf4ea;
    }
    .status-code--error {
      color: #a13d3d;
      background: #f9e1e1;
    }
    .status-code--neutral {
      color: #8a6015;
      background: #f8ecd3;
    }

    .response-section {
      overflow: hidden;
      border: 1px solid var(--line);
      border-radius: 6px;
      background: #fff;

      summary {
        display: flex;
        justify-content: space-between;
        padding: 10px;
        cursor: pointer;
        font-size: 10px;
        font-weight: 700;
      }
      summary span {
        color: var(--muted);
        font-weight: 400;
      }
      pre {
        overflow: auto;
        max-height: 280px;
        margin: 0;
        padding: 11px;
        border-top: 1px solid var(--line);
        color: #e7edf3;
        background: #303b46;
        font:
          10px/1.6 ui-monospace,
          Consolas,
          monospace;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
      }
    }

    .header-list {
      padding: 0 10px 8px;
      border-top: 1px solid var(--line);

      div {
        display: grid;
        grid-template-columns: 110px 1fr;
        gap: 8px;
        padding: 6px 0;
        border-bottom: 1px solid #edf0f2;
      }
      span,
      code {
        font-size: 9px;
        overflow-wrap: anywhere;
      }
      span {
        color: var(--muted);
        font-weight: 700;
      }
    }

    .no-headers {
      margin: 0;
      padding: 10px;
      border-top: 1px solid var(--line);
      color: var(--muted);
      font-size: 10px;
    }
    .migration-guide {
      margin-top: 12px;
      padding: 22px;
    }
    .guide-heading {
      margin-bottom: 14px;
    }
    .guide-heading h2 {
      margin: 4px 0 0;
      font-size: 18px;
    }
    .guide-heading p {
      margin: 0;
      color: var(--muted);
      font-size: 11px;
    }
    .mapping-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
    }

    .mapping-grid article {
      display: grid;
      grid-template-columns: 70px 1fr auto 1fr;
      align-items: center;
      gap: 7px;
      padding: 9px;
      border: 1px solid var(--line);
      border-radius: 5px;
      font-size: 9px;

      div {
        display: grid;
        min-width: 0;
      }
      small {
        color: var(--muted);
      }
      code {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .sr-only {
      position: absolute;
      overflow: hidden;
      width: 1px;
      height: 1px;
      clip: rect(0, 0, 0, 0);
    }
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 800px) {
    #go_lab {
      .hero,
      .workspace,
      .mapping-grid {
        grid-template-columns: 1fr;
      }
      .request-panel {
        border-right: 0;
        border-bottom: 1px solid var(--line);
      }
    }
  }

  @media (max-width: 560px) {
    #go_lab {
      padding: 10px 8px 30px;
      .hero__copy,
      .api-config,
      .panel,
      .migration-guide {
        padding: 16px;
      }
      .field-grid,
      .mapping-grid article {
        grid-template-columns: 1fr;
      }
      .field--wide {
        grid-column: auto;
      }
      .guide-heading,
      .request-actions {
        align-items: flex-start;
        flex-wrap: wrap;
      }
      .request-actions > span {
        width: 100%;
        margin-left: 0;
      }
    }
  }
</style>
