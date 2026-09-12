<template>
  <div id="pages_blog">
    <SiteHead @select="handleAsideSelect" />
    <aside class="pc">
      <p class="logo" aria-label="HUALUO">
        <svg
          viewBox="0 0 176 46"
          role="img"
          aria-hidden="true"
          focusable="false"
        >
          <text class="logo-text" x="10" y="29" transform="skewX(-8)">
            HUALUO
          </text>
          <path class="logo-line" d="M7 38 H132 L148 32" />
        </svg>
      </p>
      <button
        v-for="item in item_nav"
        v-show="item.display"
        :key="item.text"
        class="nav-item"
        :class="{ 'is-selected': select_item === item.text }"
        type="button"
        :aria-current="select_item === item.text ? 'page' : undefined"
        @click="handleAsideSelect(item.text)"
      >
        <i :class="['item-icon', 'yumao', item.icon]" aria-hidden="true"></i>
        <span>{{ item.text }}</span>
      </button>
    </aside>
    <main>
      <div class="head pc">
        <div class="l"><p>最新文章</p></div>
        <!-- <div class="r">
          <p class="inp" :class="{ 'is-open': search_open }">
            <button
              class="search-trigger"
              type="button"
              :aria-label="search_open ? '搜索文章' : '展开搜索'"
              :aria-expanded="search_open"
              @click="handleSearch"
            >
              <i class="yumao icon-a-042_sousuo" aria-hidden="true"></i>
            </button>
            <input
              ref="search_input"
              type="text"
              maxlength="12"
              placeholder="搜索文章"
              aria-label="搜索文章"
              @keydown.esc="closeSearch"
              @input="removeSpaces"
              class="text-xl"
            />
            <button
              class="close-trigger"
              type="button"
              aria-label="关闭搜索"
              :tabindex="search_open ? 0 : -1"
              @click="closeSearch"
            >
              <i class="yumao icon-close" aria-hidden="true"></i>
            </button>
          </p>
        </div> -->
      </div>
      <div
        ref="post_scroll"
        class="main"
        :aria-busy="home_loading || bottom_loading"
        @scroll.passive="handleMainScroll"
      >
        <div class="send_head">
          <p class="img" :class="{ 'is-loaded': home_avatar_loaded }">
            <i
              class="avatar-placeholder yumao icon-a-042_wode-09"
              aria-hidden="true"
            ></i>
            <NuxtImg
              ref="home_avatar_image"
              :src="qq_img"
              alt="用户头像"
              loading="lazy"
              format="webp"
              quality="40"
              @load="home_avatar_loaded = true"
              @error="home_avatar_loaded = false"
            />
          </p>
          <p class="prompt" @click="handleAsideSelect('发帖')">
            今天有什么有趣的事吗？🤔
          </p>
          <p class="action">
            <button type="button" @click="openSendArticle">发帖</button>
          </p>
        </div>
        <div
          class="loading"
          :class="{ 'is-visible': home_loading }"
          :aria-hidden="!home_loading"
        >
          <p class="yumao icon-jiazai"></p>
        </div>
        <SkeletonBlog v-if="posts_loading" />
        <div v-else class="item_box">
          <div
            v-for="post in post_items"
            :key="post.id"
            class="item"
            :data-post-id="post.id"
          >
            <div class="item_content">
              <p
                class="l"
                :class="{ 'is-loaded': post_avatar_loaded[post.id] }"
              >
                <i
                  class="avatar-placeholder yumao icon-a-042_wode-09"
                  aria-hidden="true"
                ></i>
                <NuxtImg
                  v-if="visible_post_ids.has(post.id)"
                  :src="post.avatar"
                  :alt="`${post.author} 的头像`"
                  :data-post-avatar-id="post.id"
                  loading="lazy"
                  @load="post_avatar_loaded[post.id] = true"
                  @error="post_avatar_loaded[post.id] = false"
                  quality="40"
                  format="webp"
                />
                <i
                  class="avatar-add yumao icon-jiahao1"
                  aria-label="关注用户"
                ></i>
              </p>
              <div class="r">
                <div class="h">
                  <p class="h_l">
                    <em class="name">{{ post.author }}</em
                    ><em class="time">{{ formatPostTime(post.time) }}</em>
                  </p>
                  <p class="h_r" aria-label="更多操作">
                    <em
                      class="yumao icon-gengduo"
                      role="button"
                      tabindex="0"
                      aria-haspopup="menu"
                    ></em>
                    <span class="more-menu" role="menu">
                      <em role="menuitem" tabindex="0">不感兴趣</em>
                      <em role="menuitem" tabindex="0">举报</em>
                    </span>
                  </p>
                </div>
                <pre class="m">{{ post.content }}</pre>
                <picture
                  v-if="post.img_list?.length"
                  class="img_box"
                  @pointerdown="handleGalleryPointerDown"
                  @pointermove="handleGalleryPointerMove"
                  @pointerup="handleGalleryPointerUp"
                  @pointercancel="handleGalleryPointerUp"
                >
                  <span
                    v-for="(image, index) in post.img_list"
                    :key="`${post.id}-${index}`"
                    class="img"
                  >
                    <NuxtImg
                      v-if="visible_post_ids.has(post.id)"
                      :src="getPostImageSrc(image)"
                      :alt="`${post.author} 的图片 ${index + 1}`"
                      :provider="isRemoteImage(image) ? 'weserv' : undefined"
                      :format="isRemoteImage(image) ? 'webp' : undefined"
                      quality="70"
                      loading="lazy"
                      densities="1x"
                      decoding="async"
                      draggable="false"
                      @click="
                        openImagePreview(
                          image,
                          `${post.author} 的图片 ${index + 1}`,
                        )
                      "
                    />
                  </span>
                </picture>
                <div class="b">
                  <em
                    class="num_love"
                    :class="{ 'is-liked': isPostLiked(post.id) }"
                    role="button"
                    tabindex="0"
                    :aria-pressed="isPostLiked(post.id)"
                    @click.stop="handlePostLike(post)"
                    @keydown.enter.stop="handlePostLike(post)"
                  >
                    <Transition name="like-icon" mode="out-in">
                      <i
                        :key="isPostLiked(post.id) ? 'liked' : 'unliked'"
                        :class="[
                          'yumao',
                          isPostLiked(post.id)
                            ? 'icon-hongxin1'
                            : 'icon-a-042_dianzan-02',
                        ]"
                      ></i>
                    </Transition>
                    <span class="like-count" aria-live="polite">
                      <span
                        v-for="(digit, digit_index) in String(post.likes).split(
                          '',
                        )"
                        :key="`${post.id}-${digit_index}`"
                        class="like-digit"
                      >
                        <Transition
                          :name="
                            like_transition_direction[post.id] === 'down'
                              ? 'like-count-down'
                              : 'like-count'
                          "
                        >
                          <span :key="digit" class="like-count-value">{{
                            digit
                          }}</span>
                        </Transition>
                      </span>
                    </span>
                  </em>
                  <em class="num_reply"
                    ><i class="yumao icon-a-042_xiaoxi"></i
                    ><i>{{ post.replies }}</i></em
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          class="item_bottom"
          :class="{ 'is-visible': bottom_loading }"
          :aria-hidden="!bottom_loading"
        >
          <p class="yumao icon-jiazai"></p>
        </div>
      </div>
    </main>
    <Transition name="image-preview">
      <div
        v-show="preview_open"
        id="look_img_mask"
        ref="preview_dialog"
        class="mask"
        role="dialog"
        aria-modal="true"
        aria-label="图片预览"
        :aria-hidden="!preview_open"
        tabindex="-1"
        @keydown.esc="closeImagePreview"
        @wheel.prevent
      >
        <div class="bg" @click="closeImagePreview"></div>
        <div class="preview-main">
          <em
            class="preview-close yumao icon-close"
            role="button"
            tabindex="0"
            aria-label="关闭图片预览"
            title="关闭"
            @click="closeImagePreview"
            @keydown.enter="closeImagePreview"
            @keydown.space.prevent="closeImagePreview"
          ></em>
          <p class="preview-stage">
            <img
              class="preview-image"
              :class="`is-${preview_orientation}`"
              :src="preview_src"
              :alt="preview_alt"
              draggable="false"
              :style="{
                transform: `rotate(${preview_rotation}deg) scale(${preview_scale})`,
              }"
              @load="handlePreviewImageLoad"
            />
          </p>
          <p class="preview-tools" aria-label="图片调整工具">
            <em
              class="preview-control"
              role="button"
              tabindex="0"
              aria-label="顺时针旋转"
              title="顺时针旋转"
              @click="rotatePreview(90)"
              @keydown.enter="rotatePreview(90)"
              @keydown.space.prevent="rotatePreview(90)"
              >↻</em
            >
            <em
              class="preview-control"
              role="button"
              tabindex="0"
              aria-label="逆时针旋转"
              title="逆时针旋转"
              @click="rotatePreview(-90)"
              @keydown.enter="rotatePreview(-90)"
              @keydown.space.prevent="rotatePreview(-90)"
              >↺</em
            >
            <em
              class="preview-control"
              :class="{ 'is-disabled': preview_scale >= 3 }"
              role="button"
              tabindex="0"
              aria-label="放大图片"
              :aria-disabled="preview_scale >= 3"
              title="放大"
              @click="zoomPreview(0.25)"
              @keydown.enter="zoomPreview(0.25)"
              @keydown.space.prevent="zoomPreview(0.25)"
              >＋</em
            >
            <em
              class="preview-control"
              :class="{ 'is-disabled': preview_scale <= 0.5 }"
              role="button"
              tabindex="0"
              aria-label="缩小图片"
              :aria-disabled="preview_scale <= 0.5"
              title="缩小"
              @click="zoomPreview(-0.25)"
              @keydown.enter="zoomPreview(-0.25)"
              @keydown.space.prevent="zoomPreview(-0.25)"
              >−</em
            >
          </p>
        </div>
      </div>
    </Transition>
    <Transition name="send_article_preview">
      <div
        v-if="send_article_open"
        id="send_article_mask"
        ref="send_article_dialog"
        class="mask"
        role="dialog"
        aria-modal="true"
        aria-label="新建帖子"
        tabindex="-1"
        @keydown.esc="closeSendArticle"
      >
        <div class="bg" @click="closeSendArticle"></div>
        <div class="main send-article-main">
          <header>
            <strong>新建帖子</strong>
            <button
              class="send-cancel text-xl"
              type="button"
              @click="closeSendArticle"
            >
              取消
            </button>
          </header>
          <div class="send-article-body">
            <img :src="qq_img" alt="用户头像" />
            <div class="send-editor">
              <strong>Hualuo</strong>
              <div
                class="send-content"
                contenteditable="true"
                role="textbox"
                aria-multiline="true"
                data-placeholder="有什么新鲜事吗？"
                aria-label="帖子内容"
                @input="handleSendArticleInput"
              ></div>
              <div
                v-if="send_article_images.length"
                class="send-images"
                @pointerdown="handleGalleryPointerDown"
                @pointermove="handleGalleryPointerMove"
                @pointerup="handleGalleryPointerUp"
                @pointercancel="handleGalleryPointerUp"
              >
                <figure
                  v-for="(image, index) in send_article_images"
                  :key="image.url"
                >
                  <img :src="image.url" :alt="image.name" />
                  <button
                    type="button"
                    :aria-label="`移除图片 ${image.name}`"
                    @click="removeSendImage(index)"
                  >
                    <em class="yumao icon-close" aria-hidden="true"></em>
                  </button>
                </figure>
              </div>
            </div>
          </div>
          <footer>
            <label class="send-image-trigger" title="添加图片">
              <em
                class="yumao icon-a-042_tupian-01 text-3xl"
                aria-hidden="true"
              ></em>
              <span class="sr-only">添加图片</span>
              <input
                type="file"
                accept="image/*"
                multiple
                @change="handleSendImages"
              />
            </label>
            <p v-if="send_article_error" class="form-error" role="alert">
              {{ send_article_error }}
            </p>
            <button
              type="button"
              @click="todo"
              :disabled="
                send_article_pending ||
                (!send_article_text.trim() && !send_article_images.length)
              "
            >
              {{ send_article_pending ? "发布中" : "发布" }}
            </button>
          </footer>
        </div>
      </div>
    </Transition>

    <Transition name="login_preview">
      <div
        v-if="login_open"
        id="login_preview"
        role="dialog"
        aria-modal="true"
        aria-label="密钥登录"
        tabindex="-1"
        @keydown.esc="closeLogin"
      >
        <div class="bg" @click="closeLogin"></div>
        <div class="main login-main">
          <input
            ref="login_key_input"
            v-model="login_key"
            type="password"
            placeholder="请输入密钥"
            aria-label="请输入密钥"
            autocomplete="current-password"
            @keyup.enter="login_todo"
          />
          <button
            type="button"
            :disabled="login_pending || !login_key"
            @click="login_todo"
          >
            {{ login_pending ? "验证中" : "验证" }}
          </button>
          <p v-if="login_error" class="form-error" role="alert">
            {{ login_error }}
          </p>
        </div>
      </div>
    </Transition>
    
    <Transition name="skeleton_preview">
      <div>
        <div class="bg"></div>
        <div class="main"></div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import { useIndexStore } from "~/stores/index";

  type PostItem = {
    id: number;
    author: string;
    avatar: string;
    time: number;
    content: string;
    img_list?: string[];
    likes: number;
    replies: number;
  };

  type StoredPost = {
    id: number;
    user_id: number;
    text: string;
    img_list: string[];
    time: number;
  };

  type PreviewOrientation = "portrait" | "landscape" | "square";

  const { item_nav } = storeToRefs(useIndexStore());

  type SendArticleImage = {
    name: string;
    url: string;
    file: File;
  };

  const qq_img = "https://q1.qlogo.cn/g?b=qq&nk=1799498990&s=640";
  const home_avatar_loaded = ref(false);
  const post_avatar_loaded = reactive<Record<number, boolean>>({});
  const visible_post_ids = reactive(new Set<number>());
  const liked_post_ids = ref<Set<number>>(new Set());
  const like_transition_direction = reactive<Record<number, "up" | "down">>({});
  const post_items = ref<PostItem[]>([
    {
      id: 2,
      author: "Mori",
      avatar: "https://q1.qlogo.cn/g?b=qq&nk=10000&s=640",
      time: 1786938480000,
      content: "周末去逛了旧书店，带回一本很喜欢的散文集。",
      likes: 46,
      replies: 9,
    },
    {
      id: 3,
      author: "Sora",
      avatar: "https://q1.qlogo.cn/g?b=qq&nk=123456&s=640",
      time: 1786935600000,
      content:
        "正在尝试把每日计划缩减到三件真正重要的事。\n完成感比忙碌更重要。",
      likes: 72,
      replies: 18,
    },
    {
      id: 4,
      author: "Nina",
      avatar: "https://q1.qlogo.cn/g?b=qq&nk=888888&s=640",
      time: 1786928400000,
      content: "分享一首适合通勤路上循环的歌，节奏轻快，心情也会亮一点。",
      likes: 35,
      replies: 4,
    },
    {
      id: 5,
      author: "阿岚",
      avatar: "https://q1.qlogo.cn/g?b=qq&nk=5201314&s=640",
      time: 1786885200000,
      content: "雨天在窗边喝咖啡，看着街道慢慢安静下来。",
      likes: 109,
      replies: 23,
    },
    {
      id: 6,
      author: "Kiki",
      avatar: "https://q1.qlogo.cn/g?b=qq&nk=246810&s=640",
      time: 1786876920000,
      content:
        "今天把房间收拾了一遍。\n桌面干净以后，思路也清楚了不少。\n晚上想做一道简单的番茄鸡蛋面。",
      likes: 18,
      replies: 3,
    },
  ]);
  const select_item = ref("首页");
  const posts_loading = ref(true);
  const home_loading = ref(false);
  const bottom_loading = ref(false);
  const search_open = ref(false);
  const search_input = ref<HTMLInputElement | null>(null);
  const home_avatar_image = ref<HTMLImageElement | null>(null);
  const post_scroll = ref<HTMLElement | null>(null);
  const send_article_dialog = ref<HTMLElement | null>(null);
  const send_article_open = ref(false);
  const send_article_text = ref("");
  const send_article_images = ref<SendArticleImage[]>([]);
  const send_article_pending = ref(false);
  const send_article_error = ref("");
  const login_open = ref(false);
  const login_key = ref("");
  const login_key_input = ref<HTMLInputElement | null>(null);
  const login_pending = ref(false);
  const login_error = ref("");
  const preview_dialog = ref<HTMLElement | null>(null);
  const preview_open = ref(false);
  const preview_src = ref("");
  const preview_alt = ref("");
  const preview_rotation = ref(0);
  const preview_scale = ref(1);
  const preview_orientation = ref<PreviewOrientation>("square");
  let homeLoadingTimer: number | undefined;
  let bottomLoadingTimer: number | undefined;
  let bottomReached = false;
  let postImageObserver: IntersectionObserver | undefined;

  const formatPostTime = (value: number) => {
    const timestamp = value < 1_000_000_000_000 ? value * 1000 : value;
    const date = new Date(timestamp);
    const now = new Date();

    if (Number.isNaN(date.getTime())) return "";

    const elapsed = now.getTime() - timestamp;
    if (elapsed >= 0 && elapsed < 60_000) return "刚刚";
    if (elapsed >= 0 && elapsed < 3_600_000)
      return `${Math.floor(elapsed / 60_000)}分钟前`;
    if (elapsed >= 0 && elapsed < 86_400_000)
      return `${Math.floor(elapsed / 3_600_000)}小时前`;

    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).getTime();
    const postStart = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    ).getTime();
    const dayDistance = Math.round((todayStart - postStart) / 86_400_000);
    if (dayDistance === 1) return "昨天";
    if (dayDistance > 1 && dayDistance < 7) return `${dayDistance}天前`;
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const isRemoteImage = (image: string) => /^https?:\/\//i.test(image);
  const getPostImageSrc = (image: string) =>
    isRemoteImage(image) ? image : `/images/${image}`;

  const isPostLiked = (postId: number) => liked_post_ids.value.has(postId);

  const handlePostLike = (post: PostItem) => {
    const nextLikedPostIds = new Set(liked_post_ids.value);

    if (nextLikedPostIds.has(post.id)) {
      nextLikedPostIds.delete(post.id);
      post.likes = Math.max(0, post.likes - 1);
      like_transition_direction[post.id] = "down";
    } else {
      nextLikedPostIds.add(post.id);
      post.likes += 1;
      like_transition_direction[post.id] = "up";
    }

    liked_post_ids.value = nextLikedPostIds;
  };

  let active_gallery: HTMLElement | null = null;
  let active_gallery_pointer_id: number | null = null;
  let gallery_start_x = 0;
  let gallery_start_scroll_left = 0;
  let gallery_last_x = 0;
  let gallery_animation_frame: number | undefined;
  let gallery_was_dragged = false;

  const openImagePreview = async (image: string, alt: string) => {
    if (gallery_was_dragged) {
      gallery_was_dragged = false;
      return;
    }

    preview_src.value = getPostImageSrc(image);
    preview_alt.value = alt;
    preview_rotation.value = 0;
    preview_scale.value = 1;
    preview_orientation.value = "square";
    preview_open.value = true;
    await nextTick();
    preview_dialog.value?.focus();
  };

  const closeImagePreview = () => {
    preview_open.value = false;
  };

  const clearSendImages = () => {
    send_article_images.value.forEach(({ url }) => URL.revokeObjectURL(url));
    send_article_images.value = [];
  };

  const openSendArticle = async () => {
    send_article_open.value = true;
    await nextTick();
    send_article_dialog.value
      ?.querySelector<HTMLElement>(".send-content")
      ?.focus();
  };

  const closeSendArticle = () => {
    const editor =
      send_article_dialog.value?.querySelector<HTMLElement>(".send-content");
    if (editor) editor.textContent = "";
    send_article_open.value = false;
    send_article_text.value = "";
    send_article_error.value = "";
    clearSendImages();
  };

  const openLogin = async () => {
    login_open.value = true;
    await nextTick();
    login_key_input.value?.focus();
  };

  const closeLogin = () => {
    login_open.value = false;
    login_key.value = "";
    login_error.value = "";
  };

  const login_todo = async () => {
    if (!login_key.value || login_pending.value) return;

    login_pending.value = true;
    login_error.value = "";
    try {
      await $fetch("/api/blog/login", {
        method: "POST",
        body: { password: login_key.value },
      });
      closeLogin();
    } catch {
      login_error.value = "密钥错误";
    } finally {
      login_pending.value = false;
    }
  };

  const handleSendImages = (event: Event) => {
    const input = event.currentTarget as HTMLInputElement;
    const images = Array.from(input.files ?? [])
      .filter(({ type }) => type.startsWith("image/"))
      .map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
        file,
      }));
    send_article_images.value.push(...images);
    input.value = "";
  };

  const handleSendArticleInput = (event: Event) => {
    send_article_text.value = (event.currentTarget as HTMLElement).innerText;
  };

  const removeSendImage = (index: number) => {
    const [image] = send_article_images.value.splice(index, 1);
    if (image) URL.revokeObjectURL(image.url);
  };

  const todo = async () => {
    if (
      send_article_pending.value ||
      (!send_article_text.value.trim() && !send_article_images.value.length)
    ) {
      return;
    }

    const body = new FormData();
    body.append("text", send_article_text.value);
    send_article_images.value.forEach(({ file }) =>
      body.append("images", file),
    );

    send_article_pending.value = true;
    send_article_error.value = "";
    try {
      const { post } = await $fetch<{
        post: {
          id: number;
          text: string;
          img_list: string[];
          time: number;
        };
      }>("/api/blog/post", { method: "POST", body });
      const postId = -post.id;
      post_items.value.unshift({
        id: postId,
        author: "Hualuo",
        avatar: qq_img,
        time: post.time,
        content: post.text,
        img_list: post.img_list,
        likes: 0,
        replies: 0,
      });
      visible_post_ids.add(postId);
      closeSendArticle();
      post_scroll.value?.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      const statusCode = (error as { statusCode?: number }).statusCode;
      send_article_error.value =
        statusCode === 401 ? "请先登录" : "发布失败，请稍后重试";
    } finally {
      send_article_pending.value = false;
    }
  };

  const handlePreviewImageLoad = (event: Event) => {
    const image = event.currentTarget as HTMLImageElement;

    if (image.naturalHeight > image.naturalWidth) {
      preview_orientation.value = "portrait";
      return;
    }

    preview_orientation.value =
      image.naturalWidth > image.naturalHeight ? "landscape" : "square";
  };

  const rotatePreview = (degrees: number) => {
    preview_rotation.value += degrees;
  };

  const zoomPreview = (amount: number) => {
    preview_scale.value = Math.min(
      3,
      Math.max(0.5, Number((preview_scale.value + amount).toFixed(2))),
    );
  };

  const handleGalleryPointerDown = (event: PointerEvent) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;

    const gallery = event.currentTarget as HTMLElement;
    active_gallery = gallery;
    active_gallery_pointer_id = event.pointerId;
    gallery_start_x = event.clientX;
    gallery_start_scroll_left = gallery.scrollLeft;
    gallery_last_x = event.clientX;
    gallery_was_dragged = false;
  };

  const handleGalleryPointerMove = (event: PointerEvent) => {
    if (
      active_gallery !== event.currentTarget ||
      active_gallery_pointer_id !== event.pointerId
    ) {
      return;
    }

    const distance = event.clientX - gallery_start_x;
    if (Math.abs(distance) > 3) {
      if (active_gallery.classList.contains("img_box")) {
        gallery_was_dragged = true;
      }
      if (!active_gallery.hasPointerCapture(event.pointerId)) {
        active_gallery.setPointerCapture(event.pointerId);
      }
      event.preventDefault();
    }
    gallery_last_x = event.clientX;

    if (gallery_animation_frame !== undefined) return;
    gallery_animation_frame = window.requestAnimationFrame(() => {
      if (active_gallery) {
        active_gallery.scrollLeft =
          gallery_start_scroll_left - (gallery_last_x - gallery_start_x);
      }
      gallery_animation_frame = undefined;
    });
  };

  const handleGalleryPointerUp = (event: PointerEvent) => {
    if (
      active_gallery !== event.currentTarget ||
      active_gallery_pointer_id !== event.pointerId
    ) {
      return;
    }

    if (active_gallery.hasPointerCapture(event.pointerId)) {
      active_gallery.releasePointerCapture(event.pointerId);
    }
    active_gallery.scrollLeft =
      gallery_start_scroll_left - (gallery_last_x - gallery_start_x);
    if (gallery_animation_frame !== undefined) {
      window.cancelAnimationFrame(gallery_animation_frame);
      gallery_animation_frame = undefined;
    }
    active_gallery = null;
    active_gallery_pointer_id = null;
  };

  const syncHomeAvatarLoadState = () => {
    const homeImage = home_avatar_image.value;
    if (homeImage?.complete && homeImage.naturalWidth > 0) {
      home_avatar_loaded.value = true;
    }
  };

  onMounted(async () => {
    try {
      const { posts } = await $fetch<{ posts: StoredPost[] }>("/api/blog/post");
      post_items.value.unshift(
        ...posts.map((post) => ({
          id: -post.id,
          author: "Hualuo",
          avatar: qq_img,
          time: post.time,
          content: post.text,
          img_list: post.img_list,
          likes: 0,
          replies: 0,
        })),
      );
      posts_loading.value = false;
    } catch (error) {
      console.error("加载帖子失败", error);
      showError({
        statusCode: 503,
        statusMessage: "文章暂时无法加载",
        message:
          import.meta.dev && error instanceof Error
            ? error.message
            : "服务器未能返回文章数据，请稍后重试。",
      });
      return;
    }

    await nextTick();
    syncHomeAvatarLoadState();
    const root = post_scroll.value;
    if (!root) return;

    postImageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const postId = Number((entry.target as HTMLElement).dataset.postId);
          if (Number.isFinite(postId)) visible_post_ids.add(postId);
          postImageObserver?.unobserve(entry.target);
        });
      },
      { root, threshold: 0.01 },
    );
    root
      .querySelectorAll<HTMLElement>("[data-post-id]")
      .forEach((item) => postImageObserver?.observe(item));
  });

  onBeforeUnmount(() => {
    postImageObserver?.disconnect();
    clearSendImages();
    if (homeLoadingTimer !== undefined) window.clearTimeout(homeLoadingTimer);
    if (bottomLoadingTimer !== undefined)
      window.clearTimeout(bottomLoadingTimer);
    if (gallery_animation_frame !== undefined)
      window.cancelAnimationFrame(gallery_animation_frame);
  });

  const stopHomeLoading = () => {
    if (homeLoadingTimer !== undefined) window.clearTimeout(homeLoadingTimer);
    homeLoadingTimer = undefined;
    home_loading.value = false;
  };

  const startHomeLoading = () => {
    stopHomeLoading();
    home_loading.value = true;
    homeLoadingTimer = window.setTimeout(() => {
      home_loading.value = false;
      homeLoadingTimer = undefined;
    }, 2000);
  };

  const handleAsideSelect = (text: string) => {
    if (text === "发帖") {
      openSendArticle();
      return;
    }
    if (text === "登录") {
      openLogin();
      return;
    }

    select_item.value = text;
    if (text === "首页") {
      startHomeLoading();
      return;
    }
    stopHomeLoading();
  };

  const startBottomLoading = () => {
    if (bottomLoadingTimer !== undefined)
      window.clearTimeout(bottomLoadingTimer);
    bottom_loading.value = true;
    bottomLoadingTimer = window.setTimeout(() => {
      bottom_loading.value = false;
      bottomLoadingTimer = undefined;
    }, 2000);
  };

  const handleMainScroll = (event: Event) => {
    const element = event.currentTarget as HTMLElement;
    const distanceToBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight;
    const reachedBottom = distanceToBottom <= 4;

    if (reachedBottom && !bottomReached) {
      bottomReached = true;
      startBottomLoading();
      return;
    }

    if (!reachedBottom) bottomReached = false;
  };

  useHead({
    title: "华落博客-门户首页",
    link: [
      {
        key: "favicon",
        rel: "icon",
        type: "image/x-icon",
        sizes: "32x32",
        href: "/favicon.ico?v=20260816-2",
      },
      { rel: "stylesheet", href: "/css/public.css" },
      {
        key: "aside-iconfont",
        rel: "stylesheet",
        href: "https://at.alicdn.com/t/c/font_5223671_xx31qirzc7r.css?spm=a313x.manage_type_myprojects.i1.9.6a243a81NbbaTu&file=font_5223671_xx31qirzc7r.css",
      },
    ],
  });
</script>

<style scoped lang="less">
  #pages_blog {
    position: relative;
    min-height: 100vh;
    color: #fff;

    aside {
      position: fixed;
      top: 0;
      left: 0;
      box-sizing: border-box;
      width: 280px;
      min-height: 100dvh;
      padding: 36px 24px;
      overflow: hidden;
      border-right: 1px solid rgba(255, 255, 255, 0.09);

      &::before {
        position: absolute;
        top: -90px;
        left: -110px;
        width: 260px;
        height: 260px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.035);
        filter: blur(2px);
        content: "";
        pointer-events: none;
      }

      &::after {
        position: absolute;
        top: 36px;
        right: -1px;
        width: 1px;
        height: 110px;
        background: linear-gradient(transparent, #9f9fa7, transparent);
        content: "";
        opacity: 0.55;
        pointer-events: none;
      }

      > p,
      > button {
        position: relative;
        z-index: 1;
        cursor: pointer;
        transition:
          color 0.25s ease,
          background-color 0.25s ease,
          border-color 0.25s ease,
          transform 0.25s ease;
      }

      .logo {
        width: 176px;
        height: 46px;
        margin: 0 8px 30px;
        cursor: default;

        svg {
          display: block;
          width: 100%;
          height: 100%;
          overflow: visible;
        }

        .logo-text {
          fill: transparent;
          stroke: #111;
          stroke-width: 1;
          stroke-linejoin: round;
          stroke-dasharray: 340;
          stroke-dashoffset: 340;
          font-family: "Arial Black", Arial, sans-serif;
          font-size: 25px;
          font-style: italic;
          font-weight: 900;
          letter-spacing: 2.5px;
          paint-order: stroke fill;
          animation:
            logo-draw 1.8s cubic-bezier(0.65, 0, 0.35, 1) forwards,
            logo-fill 0.65s ease 1.35s forwards;
        }

        .logo-line {
          fill: none;
          stroke: #777;
          stroke-width: 1.2;
          stroke-linecap: round;
          stroke-dasharray: 150;
          stroke-dashoffset: 150;
          opacity: 0.7;
          transform: translateX(-5px);
          animation: logo-line-draw 0.75s ease 1.35s forwards;
        }
      }

      .nav-item {
        display: flex;
        align-items: center;
        gap: 16px;
        box-sizing: border-box;
        min-height: 34px;
        margin-bottom: 8px;
        padding: 0 18px;
        border: 1px solid transparent;
        border-radius: 8px;
        width: 100%;
        color: black;
        background: transparent;
        font-size: 17px;
        font-weight: 500;
        letter-spacing: 0.04em;
        text-align: left;

        .item-icon {
          display: inline-flex;
          flex: 0 0 24px;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          color: currentColor;
          font-family: "yumao" !important;
          font-size: 24px;
          font-style: normal;
          transition:
            color 0.25s ease,
            transform 0.25s ease;
        }

        &:not(.is-selected):hover {
          border-color: #f6f6f6;
          background: #f6f6f6;
          transform: translateX(2px);
        }
      }

      .is-selected {
        color: #111;
        border-color: #f0f0f0;
        background: #f0f0f0;
        font-weight: 700;

        &::after {
          position: absolute;
          top: 50%;
          right: 14px;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #1d1d1f;
          box-shadow: 0 0 8px rgba(0, 0, 0, 0.25);
          content: "";
          transform: translateY(-50%);
        }
      }
    }
    main {
      position: fixed;
      display: flex;
      flex-direction: column;
      top: 0;
      left: 50%;
      width: 680px;
      height: 100vh;
      height: 100dvh;
      margin: 0;
      color: black;
      overflow: hidden;
      transform: translateX(-50%);

      .head {
        flex: 0 0 auto;
        width: 95%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 50px;
        margin: 15px auto 0;
        margin-bottom: 15px;
        > div {
          display: flex;
          align-items: center;
        }
        .l {
          height: 100%;
          width: 50%;
          font-size: 24px;
          font-weight: 700;
        }
        .r {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          height: 100%;
          width: 50%;

          .inp {
            display: flex;
            align-items: center;
            box-sizing: border-box;
            width: 42px;
            height: 42px;
            padding: 3px;
            overflow: hidden;
            border: 1px solid transparent;
            border-radius: 3px;
            background: transparent;
            transition:
              width 0.38s cubic-bezier(0.22, 1, 0.36, 1),
              border-color 0.28s ease,
              background-color 0.28s ease,
              box-shadow 0.28s ease;

            input {
              flex: 0 0 0;
              min-width: 0;
              box-sizing: border-box;
              width: 0;
              height: 34px;
              padding: 0;
              color: #171717;
              line-height: 34px;
              opacity: 0;
              pointer-events: none;
              transition:
                width 0.34s cubic-bezier(0.22, 1, 0.36, 1),
                flex-basis 0.34s cubic-bezier(0.22, 1, 0.36, 1),
                padding 0.28s ease,
                opacity 0.2s ease 0.06s;

              &::placeholder {
                color: #9a9a9f;
              }
            }

            .search-trigger,
            .close-trigger {
              appearance: none;
              display: inline-flex;
              flex: 0 0 34px;
              align-items: center;
              justify-content: center;
              box-sizing: border-box;
              width: 34px;
              height: 34px;
              padding: 0;
              border: 0;
              border-radius: 50%;
              color: #171717;
              background: transparent;
              cursor: pointer;
              outline: none;
              transition:
                color 0.22s ease,
                background-color 0.22s ease,
                transform 0.22s ease;

              i {
                display: block;
                font-size: 32px;
                font-style: normal;
                line-height: 1;
              }

              &:active {
                transform: scale(0.94);
              }
            }

            .close-trigger {
              flex-basis: 0;
              width: 0;
              color: #6f6f73;
              opacity: 0;
              pointer-events: none;
              transform: translateX(8px) rotate(-18deg);
              transition:
                width 0.26s ease,
                flex-basis 0.26s ease,
                opacity 0.18s ease,
                color 0.22s ease,
                background-color 0.22s ease,
                transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);

              i {
                font-size: 24px;
              }

              &:hover {
                color: #000000;
              }
            }

            &.is-open {
              width: 276px;
              border-color: #dedee2;

              input {
                flex-basis: 198px;
                width: 198px;
                padding: 0 8px;
                opacity: 1;
                pointer-events: auto;
              }

              .close-trigger {
                flex-basis: 34px;
                width: 34px;
                opacity: 1;
                pointer-events: auto;
                transform: translateX(0) rotate(0);
              }
            }
          }
        }
      }
      .main {
        flex: 1;
        box-sizing: border-box;
        width: 100%;
        height: auto;
        min-height: 0;
        padding-bottom: 24px;
        overflow-x: hidden;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain;
        -ms-overflow-style: none;
        scrollbar-width: none;
        border-radius: 23px 23px 16px 16px;
        border: 1px solid rgb(218, 210, 210);

        &::-webkit-scrollbar {
          display: none;
        }

        .send_head {
          display: flex;
          align-items: center;
          box-sizing: border-box;
          height: 70px;
          gap: 18px;
          width: 93%;
          margin: 0 auto;
          margin-top: 10px;
          border-bottom: 1px solid rgb(203, 198, 198);
          .img {
            position: relative;
            display: grid;
            width: 40px;
            height: 40px;
            place-items: center;
            overflow: hidden;
            border: 1px solid #d4d4d8;
            border-radius: 20px;
            background: #f0f0f0;
            box-shadow: inset 0 0 0 3px #fff;

            .avatar-placeholder {
              color: #8d8d93;
              font-size: 25px;
              transition: opacity 0.2s ease;
            }
            img {
              position: absolute;
              inset: 0;
              width: 100%;
              height: 100%;
              border-radius: inherit;
              object-fit: cover;
              opacity: 0;
              transition: opacity 0.2s ease;
            }
            &.is-loaded {
              .avatar-placeholder {
                opacity: 0;
              }
              img {
                opacity: 1;
              }
            }
          }

          .prompt {
            flex: 1;
            min-width: 0;
            color: #96969b;
            font-size: 19px;
            font-weight: 500;
            letter-spacing: 0.01em;
            cursor: pointer;
          }

          .action {
            flex: 0 0 auto;

            button {
              min-width: 68px;
              height: 42px;
              padding: 0 22px;
              border: 1px solid #d7d7db;
              border-radius: 8px;
              color: #151515;
              background: #fff;
              font-size: 18px;
              font-weight: 700;
              transition: all 0.3s;

              &:hover {
                color: #fff;
                border-color: #1c1c1e;
                background: #48484c;
                transform: translateY(-1px);
              }

              &:active {
                box-shadow: none;
                transform: translateY(0) scale(0.98);
              }

              &:focus-visible {
                outline: 2px solid #1c1c1e;
                outline-offset: 3px;
              }
            }
          }
        }
        .loading {
          display: grid;
          height: 0;
          place-items: center;
          margin-top: 0;
          overflow: hidden;
          opacity: 0;
          pointer-events: none;
          transition:
            height 0.28s ease,
            margin-top 0.28s ease,
            opacity 0.2s ease;

          &.is-visible {
            height: 52px;
            margin-top: 6px;
            opacity: 1;
          }

          p {
            display: block;
            width: 34px;
            height: 34px;
            margin: 0;
            color: #717174;
            font-size: 26px;
            line-height: 34px;
            text-align: center;
            transform-origin: center;
            animation: home-loading-spin 0.85s linear infinite;
            animation-play-state: paused;
          }

          &.is-visible p {
            animation-play-state: running;
          }
        }
        .item_box {
          width: 100%;
          margin-top: 15px;
          > div.item {
            width: 100%;
            margin: 0 auto;
            border-bottom: 1px solid rgb(195, 190, 190);

            &:hover > div.item_content .r .h .h_r,
            &:focus-within > div.item_content .r .h .h_r {
              visibility: visible;
              opacity: 1;
              pointer-events: auto;
              transform: translateX(0);
            }

            > div.item_content {
              width: 93%;
              margin: 0 auto;
              display: flex;
              margin-top: 15px;
              margin-bottom: 10px;
              .l {
                position: relative;
                display: grid;
                flex: 0 0 38px;
                width: 38px;
                height: 38px;
                place-items: center;
                border-radius: 50%;
                background: #f0f0f0;
                margin-right: 13px;
                .avatar-placeholder {
                  color: #8d8d93;
                  font-size: 24px;
                  transition: opacity 0.2s ease;
                }
                img {
                  position: absolute;
                  inset: 0;
                  width: 100%;
                  height: 100%;
                  border-radius: 50%;
                  object-fit: cover;
                  opacity: 0;
                  transition: opacity 0.2s ease;
                }
                .avatar-add {
                  position: absolute;
                  z-index: 2;
                  right: -5px;
                  bottom: -4px;
                  display: grid;
                  width: 17px;
                  height: 17px;
                  place-items: center;
                  border: 2px solid #fff;
                  border-radius: 50%;
                  color: #fff;
                  background: #111;
                  font-size: 12px;
                  line-height: 1;
                }
                &.is-loaded {
                  .avatar-placeholder {
                    opacity: 0;
                  }
                  img {
                    opacity: 1;
                  }
                }
              }
              .r {
                transform: translateY(-3px);
                width: 100%;
                min-width: 0;
                .h {
                  display: flex;
                  justify-content: space-between;

                  .h_l {
                    margin-bottom: 2px;

                    .name {
                      font-weight: 600;
                      margin-right: 14px;
                      font-size: 17px;
                      &:hover {
                        text-decoration: underline;
                      }
                    }
                    .time {
                      color: gray;
                      font-size: 15px;
                    }
                  }
                  .h_r {
                    position: relative;
                    flex: 0 0 32px;
                    margin: 0;
                    text-align: center;
                    visibility: hidden;
                    opacity: 0;
                    pointer-events: none;
                    transform: translateX(4px);
                    transition:
                      opacity 0.2s ease,
                      transform 0.2s ease;
                    .icon-gengduo {
                      color: #777;
                      font-size: 22px;
                      line-height: 24px;
                      cursor: pointer;

                      &::before {
                        content: "\2026";
                        font-family: Arial, sans-serif;
                      }

                      &:hover,
                      &:focus-visible {
                        color: #111;
                        outline: none;
                      }
                    }
                    em {
                      margin-left: 10px;
                    }

                    .more-menu {
                      position: absolute;
                      z-index: 3;
                      top: 100%;
                      right: 0;
                      width: max-content;
                      padding: 6px 0;
                      border: 1px solid #e5e5e5;
                      border-radius: 8px;
                      color: #333;
                      background: #fff;
                      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
                      visibility: hidden;
                      opacity: 0;
                      pointer-events: none;
                      transform: translateY(-4px);
                      transition:
                        opacity 0.18s ease,
                        transform 0.18s ease;

                      em {
                        display: block;
                        margin: 0;
                        padding: 7px 14px;
                        cursor: pointer;

                        &:hover,
                        &:focus-visible {
                          background: #f5f5f5;
                          outline: none;
                        }
                      }
                    }

                    &:hover,
                    &:focus-within {
                      .more-menu {
                        visibility: visible;
                        opacity: 1;
                        pointer-events: auto;
                        transform: translateY(0);
                      }
                    }
                  }
                }
                .m {
                  font-size: 17.5px;
                  margin-bottom: 4px;
                  white-space: pre-wrap;
                  overflow-wrap: anywhere;
                  word-break: break-word;
                }
                .img_box {
                  display: flex;
                  width: 100%;
                  gap: 9px;
                  margin: 10px 0 12px;
                  overflow-x: auto;
                  overscroll-behavior-x: contain;
                  scroll-behavior: auto;
                  scrollbar-width: none;
                  user-select: none;
                  contain: layout paint;

                  &::-webkit-scrollbar {
                    display: none;
                  }
                  &:active {
                    cursor: grabbing;
                  }
                  .img {
                    display: block;
                    flex: 0 0 auto;
                    height: 220px;
                    overflow: hidden;
                    border: 1px solid #d7d7db;
                    border-radius: 12px;

                    img {
                      display: block;
                      width: auto;
                      height: 100%;
                      max-width: none;
                      cursor: zoom-in;
                    }
                  }
                }
                .b {
                  display: flex;
                  align-items: center;
                  em {
                    display: flex;
                    align-items: center;
                    cursor: pointer;
                    transition: all 0.3s;
                    margin-right: 12px;
                    background: #fff;
                    padding: 1px 5px;
                    transform: translateX(-12px);
                    border-radius: 100px;
                    &:hover {
                      background: rgba(240, 237, 237, 0.8);
                    }
                    i:nth-of-type(1) {
                      margin-right: 3px;
                    }
                  }
                  .num_love {
                    .yumao {
                      transition:
                        color 0.2s ease,
                        transform 0.2s ease;
                    }
                    .like-count {
                      display: inline-flex;
                      min-width: 2ch;
                      gap: 0;
                    }
                    .like-digit {
                      position: relative;
                      display: inline-grid;
                      width: 1ch;
                      height: 1.25em;
                      overflow: hidden;
                      line-height: 1.25;
                    }
                    .like-count-value {
                      display: block;
                      grid-area: 1 / 1;
                    }
                    .like-count-enter-active,
                    .like-count-leave-active,
                    .like-count-down-enter-active,
                    .like-count-down-leave-active {
                      transition:
                        transform 0.28s ease,
                        opacity 0.28s ease;
                    }
                    .like-count-leave-active,
                    .like-count-down-leave-active {
                      position: absolute;
                      inset: 0;
                    }
                    .like-count-enter-from {
                      opacity: 0;
                      transform: translateY(100%);
                    }
                    .like-count-leave-to {
                      opacity: 0;
                      transform: translateY(-100%);
                    }
                    .like-count-down-enter-from {
                      opacity: 0;
                      transform: translateY(-100%);
                    }
                    .like-count-down-leave-to {
                      opacity: 0;
                      transform: translateY(100%);
                    }
                    &.is-liked {
                      color: #e8455c;

                      .like-count {
                        color: #e8455c;
                      }
                      .yumao {
                        color: #e8455c;
                      }
                    }
                    &:active .yumao {
                      transform: translateY(1.5px) scale(0.86);
                    }
                    .like-icon-enter-active,
                    .like-icon-leave-active {
                      transition:
                        opacity 0.18s ease,
                        transform 0.18s ease;
                    }
                    .like-icon-enter-from {
                      opacity: 0;
                      transform: translateY(3px) scale(0.72);
                    }
                    .like-icon-leave-to {
                      opacity: 0;
                      transform: translateY(-3px) scale(0.72);
                    }
                  }
                  .yumao {
                    font-size: 25px;
                  }
                  .num_love .yumao {
                    transform: translateY(1.5px);
                    font-size: 24px;
                  }
                }
              }
            }
          }
          > div.item:nth-last-of-type(1) {
            border-bottom: 1px solid transparent;
          }
        }
        .item_bottom {
          display: grid;
          height: 0;
          place-items: center;
          overflow: hidden;
          opacity: 0;
          pointer-events: none;
          transition:
            height 0.28s ease,
            opacity 0.2s ease;

          &.is-visible {
            height: 58px;
            opacity: 1;
          }

          p {
            width: 34px;
            height: 34px;
            margin: 0;
            color: #717174;
            font-size: 27px;
            line-height: 34px;
            text-align: center;
            transform-origin: center;
            animation: home-loading-spin 0.85s linear infinite;
            animation-play-state: paused;
          }

          &.is-visible p {
            animation-play-state: running;
          }
        }
      }
    }
  }

  #send_article_mask {
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

    .send-article-main {
      position: relative;
      z-index: 1;
      box-sizing: border-box;
      width: min(92vw, 620px);
      max-height: 90dvh;
      overflow-y: auto;
      border: 1px solid #dedee2;
      border-radius: 18px;
      background: #fff;
      box-shadow: 0 24px 70px rgba(0, 0, 0, 0.3);

      header {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 58px;
        padding: 0 18px;
        border-bottom: 1px solid #e5e5e8;

        strong {
          font-size: 17px;
        }

        button {
          width: max-content;
          padding: 8px 0;
          border: 0;
          color: inherit;
          background: transparent;
          cursor: pointer;
        }

        .send-cancel {
          position: absolute;
          right: 18px;

          &:hover,
          &:focus-visible {
            outline: none;
          }
        }
      }
    }

    .send-article-body {
      display: flex;
      gap: 14px;
      // min-height: 220px;
      padding: 22px 24px 12px;

      > img {
        flex: 0 0 42px;
        width: 42px;
        height: 42px;
        border-radius: 50%;
        object-fit: cover;
      }
    }

    .send-editor {
      flex: 1;
      min-width: 0;

      > strong {
        display: block;
        margin-bottom: 4px;
        font-size: 16px;
      }

      .send-content {
        display: block;
        box-sizing: border-box;
        width: 100%;
        min-height: 24px;
        padding: 0;
        border: 0;
        outline: 0;
        color: #171717;
        background: transparent;
        font: inherit;
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
    }

    .send-images {
      display: flex;
      gap: 10px;
      margin: 10px 0 12px;
      overflow-x: auto;
      scrollbar-width: none;
      user-select: none;
      cursor: grab;
      border-radius: 10px;

      &::-webkit-scrollbar {
        display: none;
      }

      &:active {
        cursor: grabbing;
      }

      figure {
        position: relative;
        flex: 0 0 auto;
        width: fit-content;
        max-width: 100%;
        margin: 0;

        img {
          display: block;
          width: auto;
          max-width: 100%;
          height: auto;
          max-height: 294px;
          border-radius: 12px;
          pointer-events: none;
        }

        button {
          position: absolute;
          top: 10px;
          right: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          padding: 0;
          border: 0;
          border-radius: 50%;
          color: #fff;
          background: rgba(0, 0, 0, 0.72);
          font-size: 16px;
          line-height: 1;
          cursor: pointer;
        }
      }
    }

    .send-image-trigger {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      color: #68686d;
      font-size: 23px;
      cursor: pointer;

      &:hover,
      &:focus-within {
        color: #171717;
        background: #f1f1f3;
      }

      input {
        display: none;
      }
    }

    footer {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      padding: 12px 24px 20px;

      button {
        min-width: 76px;
        height: 40px;
        border: 1px solid #d7d7db;
        border-radius: 10px;
        color: #fff;
        background: #171717;
        font-size: 16px;
        font-weight: 700;
        cursor: pointer;

        &:disabled {
          color: #aaaab0;
          background: #f5f5f6;
          cursor: not-allowed;
        }
      }

      .form-error {
        flex: 1;
        margin: 0 12px;
        color: #c92a2a;
        font-size: 14px;
        text-align: right;
      }
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  }

  .send_article_preview-enter-active,
  .send_article_preview-leave-active {
    transition: opacity 0.22s ease;

    .send-article-main {
      transition: transform 0.22s ease;
    }
  }

  .send_article_preview-enter-from,
  .send_article_preview-leave-to {
    opacity: 0;

    .send-article-main {
      transform: translateY(14px) scale(0.98);
    }
  }

  #login_preview {
    position: fixed;
    z-index: 1100;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 20px;

    .bg {
      position: absolute;
      inset: 0;
      background: rgba(8, 8, 10, 0.68);
      backdrop-filter: blur(2px);
    }

    .login-main {
      position: relative;
      z-index: 1;
      display: grid;
      gap: 14px;
      box-sizing: border-box;
      width: min(88vw, 360px);
      padding: 24px;
      border: 1px solid #dedee2;
      border-radius: 16px;
      background: #fff;
      box-shadow: 0 24px 70px rgba(0, 0, 0, 0.3);

      input {
        box-sizing: border-box;
        width: 100%;
        height: 46px;
        padding: 0 14px;
        border: 1px solid #d7d7db;
        border-radius: 10px;
        outline: 0;
        color: #171717;
        background: #fff;
        caret-color: #171717;
        -webkit-text-fill-color: #171717;
        font-size: 16px;

        &::placeholder {
          color: #8b8b91;
          -webkit-text-fill-color: #8b8b91;
          opacity: 1;
        }

        &:focus {
          border-color: #171717;
          box-shadow: 0 0 0 2px rgba(23, 23, 23, 0.1);
        }
      }

      button {
        height: 44px;
        border: 0;
        border-radius: 10px;
        color: #fff;
        background: #171717;
        font-size: 16px;
        font-weight: 700;
        cursor: pointer;

        &:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
      }

      .form-error {
        margin: 0;
        color: #c92a2a;
        font-size: 14px;
        text-align: center;
      }
    }
  }

  .login_preview-enter-active,
  .login_preview-leave-active {
    transition: opacity 0.22s ease;

    .login-main {
      transition: transform 0.22s ease;
    }
  }

  .login_preview-enter-from,
  .login_preview-leave-to {
    opacity: 0;

    .login-main {
      transform: translateY(14px) scale(0.98);
    }
  }

  #look_img_mask {
    position: fixed;
    z-index: 1000;
    inset: 0;
    display: grid;
    place-items: center;
    overflow: hidden;
    outline: none;
    touch-action: none;

    .bg {
      position: absolute;
      inset: 0;
      background: rgba(8, 8, 10, 0.58);
      cursor: zoom-out;
    }

    .preview-main {
      --preview-height: min(94dvh, 1200px);
      --preview-stage-height: calc(var(--preview-height) - 120px);

      position: relative;
      z-index: 1;
      display: grid;
      width: min(92vw, 1120px);
      height: var(--preview-height);
      box-sizing: border-box;
      grid-template-rows: minmax(0, 1fr) auto;
      gap: 20px;
      padding-top: 54px;
      pointer-events: none;
    }

    .preview-close {
      position: absolute;
      z-index: 2;
      top: 0;
      right: 0;
      display: grid;
      width: 44px;
      height: 44px;
      place-items: center;
      border-radius: 50%;
      color: #fff;
      background: rgba(255, 255, 255, 0.12);
      font-size: 26px;
      font-style: normal;
      cursor: pointer;
      pointer-events: auto;
      transition:
        background-color 0.22s ease,
        transform 0.22s ease;

      &:hover,
      &:focus-visible {
        background: rgba(255, 255, 255, 0.24);
        outline: none;
        transform: rotate(90deg);
      }
    }

    .preview-stage {
      display: grid;
      width: 100%;
      height: 100%;
      min-height: 0;
      place-items: center;
      margin: 0;
      overflow: hidden;
    }

    .preview-image {
      display: block;
      width: auto;
      height: auto;
      max-width: 100%;
      max-height: var(--preview-stage-height);
      object-fit: contain;
      user-select: none;
      will-change: transform;
      pointer-events: auto;
      transition: transform 0.34s cubic-bezier(0.22, 1, 0.36, 1);

      &.is-portrait {
        width: auto;
        height: var(--preview-stage-height);
        max-height: var(--preview-stage-height);
      }

      &.is-landscape {
        width: auto;
        height: auto;
      }
    }

    .preview-tools {
      display: flex;
      flex: 0 0 auto;
      justify-content: center;
      gap: 12px;
      margin: 0;
      pointer-events: auto;
    }

    .preview-control {
      display: grid;
      width: 46px;
      height: 46px;
      place-items: center;
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 50%;
      color: #fff;
      background: rgba(255, 255, 255, 0.1);
      font-family: Arial, sans-serif;
      font-size: 25px;
      font-style: normal;
      line-height: 1;
      cursor: pointer;
      user-select: none;
      transition:
        border-color 0.22s ease,
        background-color 0.22s ease,
        opacity 0.22s ease,
        transform 0.22s ease;

      &:hover,
      &:focus-visible {
        border-color: rgba(255, 255, 255, 0.36);
        background: rgba(255, 255, 255, 0.22);
        outline: none;
        transform: translateY(-2px);
      }

      &:active {
        transform: scale(0.92);
      }

      &.is-disabled {
        opacity: 0.35;
        cursor: not-allowed;
      }
    }
  }

  .image-preview-enter-active,
  .image-preview-leave-active {
    transition: opacity 0.25s ease;
  }

  .image-preview-enter-from,
  .image-preview-leave-to {
    opacity: 0;
  }

  @media screen and (max-width: 1280px) {
    #pages_blog {
      aside {
        padding: 36px 10px;
        .logo {
          .logo-text {
            letter-spacing: 1px;
            font-size: 18px;
          }
        }
        .nav-item {
          width: 65%;
        }
      }
    }
  }
  @media screen and (max-width: 1100px) {
    #pages_blog {
      aside {
        padding: 36px 5px;
        .logo {
          .logo-line {
            transform: translateX(-2px) scaleX(0.68);
            transform-box: fill-box;
            transform-origin: left center;
          }
        }

        .nav-item {
          width: 50%;
        }
      }
    }
  }
  @media screen and (max-width: 768px) {
    #pages_blog {
      main {
        width: 90%;
        height: calc(100vh - 90px);
        height: calc(100dvh - 90px);
        margin-top: 90px;
        .head {
          .l {
            display: none;
          }
        }
        .main {
          padding-bottom: calc(40px + env(safe-area-inset-bottom));
          border-radius: 8px;
          border: 1px solid rgb(238, 231, 231);
          .send_head {
            display: none;
          }
          .item_box > div.item > div.item_content {
            margin-bottom: 0;
          }
        }
      }
      aside {
        display: none;
      }
    }

    #look_img_mask {
      .preview-main {
        --preview-height: 92dvh;
        --preview-stage-height: calc(var(--preview-height) - 110px);

        width: 94vw;
        padding-top: 48px;
      }

      .preview-close {
        width: 40px;
        height: 40px;
      }

      .preview-control {
        width: 42px;
        height: 42px;
      }
    }
  }
  @keyframes home-loading-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes logo-draw {
    to {
      stroke-dashoffset: 0;
    }
  }

  @keyframes logo-fill {
    to {
      fill: #111;
      stroke-width: 0.45;
    }
  }

  @keyframes logo-line-draw {
    to {
      stroke-dashoffset: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    #pages_blog aside .logo {
      .logo-text {
        fill: #111;
        stroke-dashoffset: 0;
        animation: none;
      }

      .logo-line {
        stroke-dashoffset: 0;
        animation: none;
      }
    }

    #pages_blog main .main .loading p,
    #pages_blog main .main .item_bottom p {
      animation: none;
    }

    #look_img_mask .preview-image,
    #look_img_mask .preview-close,
    #look_img_mask .preview-control,
    .image-preview-enter-active,
    .image-preview-leave-active {
      transition: none;
    }
  }
</style>
