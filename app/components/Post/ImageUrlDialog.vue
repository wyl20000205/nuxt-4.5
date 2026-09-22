<template>
  <Transition name="post_image_url">
    <div
      v-if="post"
      ref="dialog"
      id="post_image_url_mask"
      role="dialog"
      aria-modal="true"
      :aria-label="`编辑帖子 #${post.id} 的图片地址`"
      tabindex="-1"
      @keydown.esc="close"
    >
      <div class="bg" @click="close"></div>
      <div class="main">
        <header>
          <strong>图片地址编辑</strong>
          <button type="button" @click="close">取消</button>
        </header>
        <div class="body">
          <p>每张图片的旧地址来自数据库。新地址留空则保留原图。</p>
          <div v-for="(row, index) in rows" :key="index" class="image-row">
            <label>
              <span>图片 {{ index + 1 }} · 旧地址</span>
              <input :value="row.old" type="text" readonly placeholder="无" />
            </label>
            <label>
              <span>新 URL</span>
              <input v-model.trim="row.next" type="url" maxlength="4096" :disabled="pending" placeholder="https://example.com/image.jpg" />
            </label>
            <button v-if="!row.old" type="button" :disabled="pending" @click="rows.splice(index, 1)">移除</button>
          </div>
          <button class="add" type="button" :disabled="pending || rows.length >= 9" @click="rows.push({ old: '', next: '' })">
            添加外链图片
          </button>
          <p v-if="error" class="form-error" role="alert">{{ error }}</p>
        </div>
        <footer>
          <button type="button" :disabled="pending" @click="save">
            {{ pending ? "保存中" : "保存" }}
          </button>
        </footer>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
  type EditablePost = { id: number; text: string; images: string[] }
  const props = defineProps<{ post: EditablePost | null }>()
  const emit = defineEmits<{ close: []; saved: [post: EditablePost] }>()
  const dialog = ref<HTMLElement | null>(null)
  const originalImages = ref<string[]>([])
  const rows = ref<{ old: string; next: string }[]>([])
  const pending = ref(false)
  const error = ref("")

  watch(() => props.post, async (post) => {
    if (!post) return
    originalImages.value = [...post.images]
    rows.value = post.images.length
      ? post.images.map((old) => ({ old, next: "" }))
      : [{ old: "", next: "" }]
    error.value = ""
    await nextTick()
    dialog.value?.querySelector<HTMLInputElement>('input[type="url"]')?.focus()
  }, { immediate: true })

  const close = () => {
    if (!pending.value) emit("close")
  }

  const save = async () => {
    if (!props.post || pending.value) return
    const images = rows.value.map(({ old, next }) => next.trim() || old)
    if (images.some((image) => !image)) {
      error.value = "请填写新图片的 URL"
      return
    }
    if (JSON.stringify(images) === JSON.stringify(originalImages.value)) {
      error.value = "图片地址没有变化"
      return
    }

    pending.value = true
    error.value = ""
    try {
      const { post } = await $fetch<{ post: EditablePost }>(`/api/blog/post/${props.post.id}/images`, {
        method: "PATCH",
        body: { expectedImages: originalImages.value, images },
      })
      emit("saved", post)
      emit("close")
    } catch (cause) {
      error.value = (cause as { data?: { message?: string } }).data?.message || "保存失败，请稍后重试"
    } finally {
      pending.value = false
    }
  }
</script>

<style lang="less" scoped>
  #post_image_url_mask {
    position: fixed;
    z-index: 1100;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 20px;
    color: #171717;

    .bg {
      position: absolute;
      inset: 0;
      background: rgba(8, 8, 10, 0.68);
    }
    .main {
      position: relative;
      box-sizing: border-box;
      width: min(92vw, 720px);
      max-height: 90dvh;
      overflow-y: auto;
      border-radius: 16px;
      background: #fff;
    }
    header,
    footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 22px;
    }
    header {
      border-bottom: 1px solid #e5e5e8;
      button { border: 0; background: transparent; cursor: pointer; }
    }
    footer { justify-content: flex-end; border-top: 1px solid #e5e5e8; }
    footer button {
      padding: 9px 22px;
      border: 0;
      border-radius: 8px;
      color: #fff;
      background: #171717;
      cursor: pointer;
    }
    .body { display: grid; gap: 14px; padding: 18px 22px; }
    .body > p { margin: 0; color: #66666c; font-size: 13px; }
    .image-row {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      align-items: end;
      gap: 10px;
    }
    label { display: grid; gap: 5px; min-width: 0; font-size: 13px; }
    input {
      box-sizing: border-box;
      width: 100%;
      padding: 9px 10px;
      border: 1px solid #d7d7db;
      border-radius: 8px;
      color: #171717;
      background: #fff;
    }
    input[readonly] { color: #77777d; background: #f5f5f6; }
    .image-row > button,
    .add {
      padding: 9px 10px;
      border: 1px solid #d7d7db;
      border-radius: 8px;
      background: #fff;
      cursor: pointer;
    }
    .image-row > button { grid-column: 2; justify-self: end; }
    .add { justify-self: start; }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    .body > .form-error { color: #c92a2a; }

    @media (max-width: 620px) {
      .image-row { grid-template-columns: 1fr; }
      .image-row > button { grid-column: 1; }
    }
  }
  .post_image_url-enter-active,
  .post_image_url-leave-active { transition: opacity 0.2s ease; }
  .post_image_url-enter-from,
  .post_image_url-leave-to { opacity: 0; }
</style>
