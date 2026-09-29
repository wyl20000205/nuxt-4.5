<template>
  <Transition name="post_edit" @after-leave="clearNewImages">
    <div
      v-if="post"
      id="post_edit_mask"
      role="dialog"
      aria-modal="true"
      :aria-label="`编辑帖子 #${post.id}`"
      tabindex="-1"
      @keydown.esc="close"
    >
      <div class="bg" @click="close"></div>
      <div class="main">
        <header>
          <strong>编辑帖子</strong>
          <button type="button" @click="close">取消</button>
        </header>
        <div class="body">
          <div class="avatar" aria-hidden="true">
            <i class="yumao icon-a-042_wode-09"></i>
          </div>
          <div class="editor">
            <strong>用户 {{ post.userId }}</strong>
            <div
              ref="content"
              class="content"
              contenteditable="true"
              role="textbox"
              aria-multiline="true"
              aria-label="帖子内容"
              data-placeholder="有什么新鲜事吗？"
              @input="text = ($event.currentTarget as HTMLElement).innerText"
            ></div>
            <div v-if="keptImages.length || newImages.length" class="images">
              <figure v-for="(image, index) in keptImages" :key="image">
                <img :src="imageUrl(image)" :alt="`帖子图片 ${index + 1}`" />
                <button
                  type="button"
                  :aria-label="`移除图片 ${index + 1}`"
                  @click="keptImages.splice(index, 1)"
                >
                  ×
                </button>
              </figure>
              <figure v-for="(image, index) in newImages" :key="image.url">
                <img :src="image.url" :alt="image.file.name" />
                <button
                  type="button"
                  :aria-label="`移除图片 ${image.file.name}`"
                  @click="removeNewImage(index)"
                >
                  ×
                </button>
              </figure>
            </div>
          </div>
        </div>
        <footer>
          <label class="image-trigger" title="添加图片">
            <em class="yumao icon-a-042_tupian-01" aria-hidden="true"></em>
            <span class="sr-only">添加图片</span>
            <input type="file" accept="image/*" multiple @change="addImages" />
          </label>
          <p v-if="error" class="form-error" role="alert">{{ error }}</p>
          <button
            type="button"
            :disabled="
              pending ||
              (!text.trim() && !keptImages.length && !newImages.length)
            "
            @click="save"
          >
            {{ pending ? "保存中" : "保存" }}
          </button>
        </footer>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
  import type { EditablePost } from "~/types/blog";

  const props = defineProps<{ post: EditablePost | null }>();
  const emit = defineEmits<{
    close: [];
    saved: [post: EditablePost];
  }>();

  const content = ref<HTMLElement | null>(null);
  const text = ref("");
  const keptImages = ref<string[]>([]);
  const newImages = ref<{ file: File; url: string }[]>([]);
  const pending = ref(false);
  const error = ref("");
  const imageUrl = (image: string) =>
    /^https?:\/\//i.test(image)
      ? image
      : `/images/${encodeURIComponent(image)}`;
  const clearNewImages = () => {
    newImages.value.forEach(({ url }) => URL.revokeObjectURL(url));
    newImages.value = [];
  };

  watch(
    () => props.post,
    async (post) => {
      if (!post) return;
      clearNewImages();
      text.value = post.text;
      keptImages.value = [...post.images];
      error.value = "";
      await nextTick();
      if (content.value) {
        content.value.textContent = text.value;
        content.value.focus();
      }
    },
    { immediate: true },
  );
  onBeforeUnmount(clearNewImages);

  const close = () => {
    if (!pending.value) emit("close");
  };
  const removeNewImage = (index: number) => {
    const [image] = newImages.value.splice(index, 1);
    if (image) URL.revokeObjectURL(image.url);
  };
  const addImages = (event: Event) => {
    const input = event.currentTarget as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = "";
    if (keptImages.value.length + newImages.value.length + files.length > 9) {
      error.value = "最多添加 9 张图片";
      return;
    }
    if (
      files.some(
        (file) =>
          !file.type.startsWith("image/") || file.size > 10 * 1024 * 1024,
      )
    ) {
      error.value = "仅支持 10MB 内的图片";
      return;
    }
    newImages.value.push(
      ...files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    );
    error.value = "";
  };
  const save = async () => {
    if (!props.post || pending.value) return;
    if (text.value.length > 5000) {
      error.value = "帖子文字最多 5000 字";
      return;
    }
    const body = new FormData();
    body.append("text", text.value);
    body.append("keepImages", JSON.stringify(keptImages.value));
    newImages.value.forEach(({ file }) => body.append("images", file));
    pending.value = true;
    error.value = "";
    try {
      const { post } = await $fetch<{ post: EditablePost }>(
        `/api/blog/post/${props.post.id}`,
        {
          method: "PATCH",
          body,
        },
      );
      emit("saved", post);
      emit("close");
    } catch (cause) {
      error.value =
        (cause as { data?: { message?: string } }).data?.message ||
        "保存失败，请稍后重试";
    } finally {
      pending.value = false;
    }
  };
</script>

<style lang="less" scoped>
  #post_edit_mask {
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
      backdrop-filter: blur(2px);
    }
    .main {
      position: relative;
      box-sizing: border-box;
      width: min(92vw, 620px);
      max-height: 90dvh;
      overflow-y: auto;
      border: 1px solid #dedee2;
      border-radius: 18px;
      background: #fff;
      box-shadow: 0 24px 70px rgba(0, 0, 0, 0.3);
    }
    header {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 58px;
      border-bottom: 1px solid #e5e5e8;
      font-size: 17px;

      button {
        position: absolute;
        right: 18px;
        border: 0;
        background: transparent;
        cursor: pointer;
      }
    }
    .body {
      display: flex;
      gap: 14px;
      min-height: 150px;
      padding: 22px 24px 12px;
    }
    .avatar {
      display: grid;
      flex: 0 0 42px;
      place-items: center;
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: #f1f1f3;
    }
    .editor {
      flex: 1;
      min-width: 0;
    }
    .editor > strong {
      display: block;
      margin-bottom: 4px;
    }
    .content {
      min-height: 48px;
      outline: none;
      font-size: 17px;
      line-height: 24px;
      white-space: pre-wrap;
      overflow-wrap: anywhere;

      &:empty::before {
        content: attr(data-placeholder);
        color: #9a9aa0;
        pointer-events: none;
      }
    }
    .images {
      display: flex;
      gap: 10px;
      margin-top: 12px;
      overflow-x: auto;

      figure {
        position: relative;
        flex: 0 0 auto;
        margin: 0;
      }
      img {
        display: block;
        max-width: 100%;
        max-height: 294px;
        border-radius: 12px;
      }
      button {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 30px;
        height: 30px;
        border: 0;
        border-radius: 50%;
        color: #fff;
        background: rgba(0, 0, 0, 0.72);
        cursor: pointer;
      }
    }
    footer {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 24px 20px;
  .icon-a-042_tupian-01{
    font-size: 34px;

  }
      > button {
        min-width: 76px;
        height: 40px;
        margin-left: auto;
        border: 0;
        border-radius: 10px;
        color: #fff;
        background: #171717;
        font-weight: 700;
        cursor: pointer;

        &:disabled {
          color: #aaaab0;
          background: #f5f5f6;
          cursor: not-allowed;
        }
      }
    }
    .image-trigger {
      cursor: pointer;
      font-size: 23px;
    }
    .image-trigger input {
      display: none;
    }
    .form-error {
      flex: 1;
      margin: 0;
      color: #c92a2a;
      font-size: 14px;
      text-align: right;
    }
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
    }
  }
  .post_edit-enter-active,
  .post_edit-leave-active {
    transition: opacity 0.22s ease;
    .main {
      transition: transform 0.22s ease;
    }
  }
  .post_edit-enter-from,
  .post_edit-leave-to {
    opacity: 0;
    .main {
      transform: translateY(14px) scale(0.98);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .post_edit-enter-active,
    .post_edit-leave-active {
      transition: none;
      .main {
        transition: none;
      }
    }
  }
</style>
