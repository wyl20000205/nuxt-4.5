import { readFile } from "node:fs/promises";

const source = await readFile(new URL("./server/api/shangtang.ts", import.meta.url), "utf8");
const apiKey = source.match(/const apiKey = "([^"]+)"/)?.[1];
if (!apiKey) throw new Error("API key not found in server/api/shangtang.ts");

const baseUrl = "https://api.senseaudio.cn";
const textOnly = process.argv.includes("--text-only");
const videoOnly = process.argv.includes("--video-only");
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
  ["senseaudio-image-2.0-260319", "1024x1024"],
  ["doubao-seedream-5-0-260128", "2048x2048"],
  ["sensenova-u1-fast", "2048x2048"],
];
const results = { testedAt: new Date().toISOString(), baseUrl, models: {}, text: [], image: [], video: [], negative: [] };
const authHeaders = { authorization: `Bearer ${apiKey}`, "content-type": "application/json" };
const shownHeaders = { Authorization: "Bearer <REDACTED>", "Content-Type": "application/json" };

function fields(value, prefix = "", output = new Set()) {
  if (!value || typeof value !== "object") return [...output];
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    output.add(path);
    if (Array.isArray(child) && child[0]) fields(child[0], `${path}[]`, output);
    else fields(child, path, output);
  }
  return [...output].sort();
}

async function jsonRequest(name, path, options = {}) {
  const started = performance.now();
  try {
    const url = path.startsWith("http") ? path : `${baseUrl}${path}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(600000), ...options });
    const text = await response.text();
    let body;
    try { body = text ? JSON.parse(text) : {}; } catch { body = { raw: text }; }
    return {
      name,
      status: response.status,
      ok: response.ok,
      durationMs: Math.round(performance.now() - started),
      responseHeaders: Object.fromEntries(response.headers),
      responseFields: fields(body),
      response: body,
    };
  } catch (error) {
    return { name, status: 0, ok: false, durationMs: Math.round(performance.now() - started), error: String(error) };
  }
}

for (const mode of videoOnly ? ["video"] : ["llm", "image"]) {
  const item = await jsonRequest(`models-${mode}`, `/v1/models?mode=${mode}`, { headers: { authorization: `Bearer ${apiKey}` } });
  if (Array.isArray(item.response?.data)) {
    item.response = {
      object: item.response.object,
      modelCount: item.response.data.length,
      models: item.response.data.map(({ id, display_name, mode, owned_by }) => ({ id, display_name, mode, owned_by })),
      first_id: item.response.first_id,
      last_id: item.response.last_id,
      has_more: item.response.has_more,
    };
  }
  results.models[mode] = item;
}

if (!videoOnly) for (const model of textModels) {
  const request = {
    model,
    messages: [
      { role: "system", content: "你是接口测试助手。" },
      { role: "user", content: "只回答 OK" },
    ],
    temperature: 0,
    max_tokens: 16,
    stream: true,
    stream_options: { include_usage: true },
  };
  const started = performance.now();
  try {
    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(180000),
    });
    const headersMs = Math.round(performance.now() - started);
    const raw = await response.text();
    const events = raw.split(/\r?\n/).filter((line) => line.startsWith("data:")).map((line) => line.slice(5).trim());
    const done = events.includes("[DONE]");
    const chunks = events.filter((event) => event !== "[DONE]").map((event) => {
      try { return JSON.parse(event); } catch { return { raw: event }; }
    });
    const content = chunks.map((chunk) => chunk.choices?.[0]?.delta?.content || "").join("");
    results.text.push({
      model,
      request: { url: `${baseUrl}/v1/chat/completions`, method: "POST", headers: shownHeaders, body: request },
      status: response.status,
      ok: response.ok,
      headersMs,
      durationMs: Math.round(performance.now() - started),
      responseHeaders: Object.fromEntries(response.headers),
      eventCount: chunks.length,
      done,
      responseFields: fields(chunks[0] || {}),
      finalFields: fields(chunks.at(-1) || {}),
      usage: chunks.findLast((chunk) => chunk.usage)?.usage,
      content,
      firstEvent: chunks[0],
      finalEvent: chunks.at(-1),
    });
  } catch (error) {
    results.text.push({ model, status: 0, ok: false, durationMs: Math.round(performance.now() - started), error: String(error), request });
  }
}

if (!textOnly && !videoOnly) {
  for (const [model, size] of imageModels) {
    const body = { model, prompt: "A simple blue circle centered on a white background, clean test image.", size, seed: 42 };
    const item = await jsonRequest(model, "/v1/image/sync", { method: "POST", headers: authHeaders, body: JSON.stringify(body) });
    item.request = { url: `${baseUrl}/v1/image/sync`, method: "POST", headers: shownHeaders, body };
    if (item.ok && item.response?.url) {
      item.assetCheck = await jsonRequest("generated-asset", item.response.url, { method: "HEAD" });
      item.response.url = item.response.url.replace(/\?.*$/, "?<REDACTED>");
    }
    results.image.push(item);
  }

  results.negative.push(await jsonRequest("missing-authorization", "/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ model: "senseaudio-s2", messages: [{ role: "user", content: "test" }] }),
  }));
  results.negative.push(await jsonRequest("invalid-text-model", "/v1/chat/completions", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ model: "invalid-model-for-contract-test", messages: [{ role: "user", content: "test" }] }),
  }));
  results.negative.push(await jsonRequest("invalid-image-size", "/v1/image/sync", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ model: "senseaudio-image-2.0-260319", prompt: "test", size: "123x456" }),
  }));
  results.negative.push(await jsonRequest("missing-image-prompt", "/v1/image/sync", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ model: "senseaudio-image-2.0-260319", size: "1024x1024" }),
  }));
}

if (videoOnly) {
  const videoCases = [
    {
      name: "text-to-video",
      body: {
        model: "doubao-seedance-2-0-260128",
        content: [{ type: "text", text: "白色背景上的蓝色圆球缓慢旋转，固定镜头，简洁测试视频" }],
        duration: 4,
        resolution: "480p",
        ratio: "16:9",
        timeout: 3600,
        watermark: false,
        provider_specific: { generate_audio: false },
      },
    },
    {
      name: "image-to-video",
      body: {
        model: "doubao-seedance-2-0-260128",
        content: [
          { type: "text", text: "蓝色圆球轻微旋转，镜头缓慢靠近" },
          { type: "image", url: "https://dynamic.senseaudio.cn/image/2df974d6-9347-4b81-9fd2-9658030fca26", role: "first_frame" },
        ],
        duration: 4,
        resolution: "480p",
        ratio: "1:1",
        watermark: true,
        provider_specific: { generate_audio: true },
      },
    },
  ];

  for (const test of videoCases) {
    const created = await jsonRequest(test.name, "/v1/video/create", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(test.body),
    });
    created.request = { url: `${baseUrl}/v1/video/create`, method: "POST", headers: shownHeaders, body: test.body };
    const taskId = created.response?.task_id;
    const timeline = [];
    const pollStarted = performance.now();
    let final;
    if (created.ok && taskId) {
      for (let attempt = 1; attempt <= 180; attempt++) {
        const current = await jsonRequest(`${test.name}-status`, `/v1/video/status?id=${encodeURIComponent(taskId)}`, {
          headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
        });
        const snapshot = { attempt, elapsedMs: Math.round(performance.now() - pollStarted), http: current.status, status: current.response?.status, progress: current.response?.progress };
        const previous = timeline.at(-1);
        if (!previous || previous.status !== snapshot.status || previous.progress !== snapshot.progress || attempt === 1) timeline.push(snapshot);
        final = current;
        if (["completed", "failed"].includes(current.response?.status) || !current.ok) break;
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
    if (final?.response?.video_url) {
      final.assetCheck = await jsonRequest(`${test.name}-asset`, final.response.video_url, { method: "HEAD" });
    }
    results.video.push({ created, taskId, pollingDurationMs: Math.round(performance.now() - pollStarted), timeline, final });
  }

  const invalidCases = [
    ["invalid-video-model", { model: "invalid-video-model", content: [{ type: "text", text: "test" }], duration: 4, resolution: "480p", ratio: "16:9" }],
    ["duration-below-minimum", { model: "doubao-seedance-2-0-260128", content: [{ type: "text", text: "test" }], duration: 3, resolution: "480p", ratio: "16:9" }],
    ["duration-above-maximum", { model: "doubao-seedance-2-0-260128", content: [{ type: "text", text: "test" }], duration: 16, resolution: "480p", ratio: "16:9" }],
    ["invalid-resolution", { model: "doubao-seedance-2-0-260128", content: [{ type: "text", text: "test" }], duration: 4, resolution: "360p", ratio: "16:9" }],
    ["invalid-ratio", { model: "doubao-seedance-2-0-260128", content: [{ type: "text", text: "test" }], duration: 4, resolution: "480p", ratio: "2:1" }],
    ["timeout-below-minimum", { model: "doubao-seedance-2-0-260128", content: [{ type: "text", text: "test" }], duration: 4, resolution: "480p", ratio: "16:9", timeout: 3599 }],
    ["empty-content", { model: "doubao-seedance-2-0-260128", content: [], duration: 4, resolution: "480p", ratio: "16:9" }],
  ];
  for (const [name, body] of invalidCases) {
    const item = await jsonRequest(name, "/v1/video/create", { method: "POST", headers: authHeaders, body: JSON.stringify(body) });
    item.request = { url: `${baseUrl}/v1/video/create`, method: "POST", headers: shownHeaders, body };
    results.negative.push(item);
  }
}

console.log(JSON.stringify(textOnly ? {
  testedAt: results.testedAt,
  text: results.text.map(({ model, status, ok, headersMs, durationMs, eventCount, done, responseFields, finalFields, usage, content, error }) => ({
    model, status, ok, headersMs, durationMs, eventCount, done, responseFields, finalFields, usage, content, error,
  })),
} : results, null, 2));
