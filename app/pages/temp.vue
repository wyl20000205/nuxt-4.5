<template>
  <main class="image-page">
    <section class="generator-card">
      <header>
        <p class="eyebrow">IMAGE STUDIO</p>
        <h1>AI 图片生成</h1>
        <p class="subtitle">输入提示词，也可以添加参考图片进行创作。</p>
      </header>

      <div class="mode-row">
        <span class="mode">{{ sourceImages.length ? "图生图" : "文生图" }}</span>
        <span class="model">{{ model }}</span>
      </div>

      <form @submit.prevent="generate">
        <label class="field">
          <span>参考图片 <small>可选</small></span>
          <div class="source-row">
            <label class="file-picker">
              {{ uploadedImages.length ? `已选择 ${uploadedImages.length} 张` : "上传图片" }}
              <input
                type="file"
                accept="image/*"
                multiple
                @change="selectImages"
              />
            </label>
            <span class="or">或</span>
            <textarea
              v-model="imageInput"
              class="url-input"
              rows="2"
              placeholder="粘贴图片 URL，每行一个"
            />
          </div>
          <div v-if="sourceImages.length" class="reference-previews">
            <div
              v-for="(image, index) in sourceImages"
              :key="`${image}-${index}`"
              class="reference-preview"
            >
              <img :src="image" :alt="`参考图片 ${index + 1}`" />
            </div>
          </div>
        </label>

        <label class="field">
          <span>提示词</span>
          <textarea
            v-model="prompt"
            required
            rows="6"
            placeholder="描述你想生成的画面、风格、光线与构图……"
          />
        </label>

        <label class="field">
          <span>水印</span>
          <select v-model="watermark">
            <option :value="true">true</option>
            <option :value="false">false</option>
          </select>
        </label>

        <label class="field">
          <span>图片尺寸</span>
          <select v-model="size">
            <option value="1K">1K</option>
            <option value="1.5K">1.5K</option>
            <option value="2K">2K</option>
          </select>
        </label>

        <button class="submit-button" :disabled="pending">
          {{ pending ? "生成中…" : "生成图片" }}
        </button>
      </form>

      <p v-if="error" class="error" role="alert">{{ error }}</p>

      <figure v-if="imageUrl" class="result">
        <img :src="imageUrl" alt="生成的图片" />
        <figcaption>生成结果</figcaption>
      </figure>

      <details v-else-if="result" class="response">
        <summary>查看响应数据</summary>
        <pre>{{ result }}</pre>
      </details>
    </section>
  </main>
</template>

<script setup lang="ts">
  type ImageResult = {
    data?: Array<{ url?: string; b64_json?: string }>;
  };

  const model = "dola-seedream-5-0-pro-260628";
  const prompt = ref("");
  const pending = ref(false);
  const watermark = ref(true);
  const size = ref("2K");
  const error = ref("");
  const result = ref<ImageResult>();
  const imageInput = ref("");
  const uploadedImages = ref<string[]>([]);
  const sourceImages = computed(() => [
    ...uploadedImages.value,
    ...imageInput.value
      .split(/\r?\n/)
      .map((url) => url.trim())
      .filter(Boolean),
  ]);
  const imageUrl = computed(() => {
    const image = result.value?.data?.[0];
    return (
      image?.url ||
      (image?.b64_json ? `data:image/png;base64,${image.b64_json}` : "")
    );
  });

  async function selectImages(event: Event) {
    const files = Array.from((event.target as HTMLInputElement).files ?? []);

    try {
      uploadedImages.value = await Promise.all(
        files.map(
          (file) =>
            new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result));
              reader.onerror = () => reject(reader.error);
              reader.readAsDataURL(file);
            }),
        ),
      );
    } catch {
      error.value = "图片读取失败";
    }
  }

  async function generate() {
    pending.value = true;
    error.value = "";
    result.value = undefined;

    try {
      result.value = await $fetch("/api/temp", {
        method: "POST",
        body: {
          model,
          prompt: prompt.value,
          response_format: "url",
          size: size.value,
          stream: false,
          watermark: watermark.value,
          ...(sourceImages.value.length && {
            image:
              sourceImages.value.length === 1
                ? sourceImages.value[0]
                : sourceImages.value,
          }),
        },
      });
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : String(cause);
    } finally {
      pending.value = false;
    }
  }
</script>

<style scoped lang="less">
  .image-page {
    min-height: 100vh;
    padding: 64px 20px;
    color: #172033;
    background:
      radial-gradient(circle at 15% 10%, #e9e5ff 0, transparent 32%),
      radial-gradient(circle at 85% 90%, #dff4ff 0, transparent 30%),
      #f5f7fb;
  }

  .generator-card {
    width: min(760px, 100%);
    margin: 0 auto;
    padding: 36px;
    border: 1px solid rgba(103, 88, 190, 0.12);
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 24px 70px rgba(53, 49, 95, 0.12);
    backdrop-filter: blur(16px);
  }

  .eyebrow {
    margin-bottom: 8px;
    color: #7058d5;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.14em;
  }

  h1 {
    font-size: clamp(28px, 5vw, 40px);
    line-height: 1.2;
  }

  .subtitle {
    margin-top: 10px;
    color: #6f7687;
    line-height: 1.7;
  }

  .mode-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 28px 0 22px;
  }

  .mode {
    padding: 6px 12px;
    border-radius: 999px;
    color: #5c43c2;
    font-size: 13px;
    font-weight: 700;
    background: #eeeaff;
  }

  .model {
    overflow: hidden;
    color: #9298a6;
    font: 12px/1.5 monospace;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  form,
  .field {
    display: grid;
    gap: 12px;
  }

  form {
    gap: 22px;
  }

  .field > span {
    font-size: 14px;
    font-weight: 700;
  }

  .field small {
    color: #969cac;
    font-weight: 400;
  }

  .source-row {
    display: grid;
    grid-template-columns: auto auto 1fr;
    align-items: center;
    gap: 12px;
  }

  .file-picker,
  .url-input,
  select,
  textarea {
    border: 1px solid #dde1eb;
    border-radius: 12px;
    background: #fff;
  }

  .file-picker {
    padding: 11px 16px;
    color: #5c43c2;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
  }

  .file-picker input {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
  }

  .or {
    color: #a2a7b4;
    font-size: 13px;
  }

  .url-input,
  select,
  textarea {
    width: 100%;
    padding: 12px 14px;
    color: #172033;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .reference-preview {
    width: 120px;
    aspect-ratio: 1;
    padding: 5px;
    border: 1px solid #dde1eb;
    border-radius: 14px;
    background: #fff;
  }

  .reference-previews {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .reference-preview img {
    width: 100%;
    height: 100%;
    border-radius: 9px;
    object-fit: cover;
  }

  textarea {
    box-sizing: border-box;
    resize: vertical;
    line-height: 1.65;
  }

  .url-input:focus,
  select:focus,
  textarea:focus {
    border-color: #8069df;
    box-shadow: 0 0 0 4px rgba(112, 88, 213, 0.1);
  }

  .submit-button {
    min-height: 48px;
    border: 0;
    border-radius: 13px;
    color: #fff;
    font-size: 15px;
    font-weight: 700;
    background: linear-gradient(135deg, #8069df, #6045c9);
    box-shadow: 0 12px 24px rgba(96, 69, 201, 0.24);
    cursor: pointer;
  }

  .submit-button:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .error {
    margin-top: 20px;
    padding: 12px 14px;
    border-radius: 10px;
    color: #b4233a;
    background: #fff0f2;
  }

  .result,
  .response {
    margin-top: 28px;
  }

  .result img {
    display: block;
    width: 100%;
    max-height: 720px;
    border-radius: 16px;
    object-fit: contain;
    background: #f0f2f7;
  }

  .result figcaption {
    margin-top: 10px;
    color: #7d8494;
    font-size: 13px;
    text-align: center;
  }

  .response {
    color: #697083;
  }

  .response pre {
    margin-top: 10px;
    padding: 14px;
    overflow: auto;
    border-radius: 12px;
    color: #dbe2f3;
    background: #202536;
    user-select: text;
  }

  @media (max-width: 600px) {
    .image-page {
      padding: 24px 12px;
    }

    .generator-card {
      padding: 24px 18px;
      border-radius: 18px;
    }

    .source-row {
      grid-template-columns: 1fr;
    }

    .file-picker {
      text-align: center;
    }

    .or {
      display: none;
    }
  }
</style>
