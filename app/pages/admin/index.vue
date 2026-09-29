<template>
  <div id="pages_admin_index" class="dashboard-page">
    <SiteAdminHead @select="handleNav" />
    <aside class="pc">
      <NuxtLink class="logo" to="/" aria-label="HUALUO">
        <svg viewBox="0 0 176 46" role="img" aria-hidden="true">
          <text class="logo-text" x="10" y="29" transform="skewX(-8)">
            HUALUO
          </text>
          <path class="logo-line" d="M7 38 H132 L148 32" />
        </svg>
      </NuxtLink>
      <nav aria-label="管理中心导航">
        <template v-for="item in item_nav" :key="item.text">
          <NuxtLink
            v-if="item.text === '首页' && item.display"
            class="nav-item flex"
            to="/"
          >
            <i
              :class="['item-icon', 'yumao', item.icon]"
              aria-hidden="true"
            ></i>
            <span>{{ item.text }}</span>
          </NuxtLink>
          <button
            v-else
            v-show="item.display"
            class="nav-item flex"
            :class="{ 'is-selected': selected === item.text }"
            type="button"
            @click="handleNav(item.text)"
          >
            <i
              :class="['item-icon', 'yumao', item.icon]"
              aria-hidden="true"
            ></i>
            <span>{{ item.text }}</span>
          </button>
        </template>
      </nav>
    </aside>
    <main class="dashboard-main">
      <header class="dashboard-title">
        <div>
          <h1>{{ selected }}</h1>
        </div>
        <span
          >{{
            loading || status === "pending"
              ? "加载中"
              : selected === "用户"
                ? users.length
                : posts.length
          }}
          条记录</span
        >
      </header>

      <p v-if="feedback" class="dashboard-feedback" role="status">
        {{ feedback }}
      </p>

      <SkeletonAdmin
        v-if="loading || (status !== 'success' && !error)"
        :kind="selected"
      />
      <section
        v-else-if="selected === '帖子'"
        class="dashboard-list"
        aria-label="全部帖子"
      >
        <article v-for="post in posts" :key="post.id" class="dashboard-card">
          <header>
            <strong>
              帖子 #{{ post.id }} · 用户 {{ post.userId }}
              <span v-if="!post.active" class="status-badge">已停用</span>
              <span v-if="!post.authorActive" class="status-badge">作者已停用</span>
            </strong>
            <time :datetime="new Date(post.time).toISOString()">
              {{ formatTime(post.time) }}
            </time>
          </header>
          <p class="post-text">{{ post.text || "仅包含图片" }}</p>
          <footer>
            <span>{{ post.imageCount }} 张图片</span>
            <div class="card-actions">
              <button type="button" :disabled="!post.active" @click="editingImagesPost = post">图片地址编辑</button>
              <button type="button" :disabled="!post.active" @click="editPost(post)">编辑</button>
              <button :class="{ danger: post.active }" type="button" @click="togglePost(post)">
                {{ post.active ? "停用" : "启用" }}
              </button>
            </div>
          </footer>
        </article>
        <p v-if="!posts.length" class="dashboard-empty">暂无帖子</p>
      </section>

      <section v-else class="dashboard-list" aria-label="用户管理">
        <article
          v-for="user in users"
          :key="user.id"
          class="dashboard-card user-card"
        >
          <header>
            <strong>
              用户 #{{ user.id }}
              <span v-if="!user.active" class="status-badge">已停用</span>
            </strong>
            <time :datetime="new Date(user.time).toISOString()">
              {{ formatTime(user.time) }}
            </time>
          </header>
          <footer>
            <span>{{ user.postCount }} 篇帖子</span>
            <div class="card-actions">
              <span v-if="user.id === 1" class="admin-badge">管理员</span>
              <button
                v-else
                :class="{ danger: user.active }"
                type="button"
                @click="toggleUser(user)"
              >
                {{ user.active ? "停用" : "启用" }}
              </button>
            </div>
          </footer>
        </article>
        <p v-if="!users.length" class="dashboard-empty">暂无用户</p>
      </section>
    </main>
    <PostEditDialog
      :post="editingPost"
      @close="editingPost = null"
      @saved="handlePostSaved"
    />
    <PostImageUrlDialog
      :post="editingImagesPost"
      @close="editingImagesPost = null"
      @saved="handlePostSaved"
    />
  </div>
</template>

<script setup lang="ts">
  import { storeAdmin } from "~/stores/admin";
  import { useIndexStore } from "~/stores/index";
  import type { AdminManagedPost as ManagedPost } from "~/types/blog";

  definePageMeta({ middleware: "auth" });

  type ManagedUser = {
    id: number;
    postCount: number;
    time: number;
    active: boolean;
  };

  type ManageData = {
    posts: ManagedPost[];
    users: ManagedUser[];
  };

  const { admin_data } = storeToRefs(storeAdmin());
  const item_nav = computed(() => admin_data.value.item_nav);
  const selected = ref("帖子");
  const feedback = ref("");
  const loading = ref(false);
  const { data, error, status, refresh } = useLazyFetch<ManageData>(
    "/api/blog/manage",
    { server: false },
  );
  const posts = ref<ManagedPost[]>([]);
  const users = ref<ManagedUser[]>([]);
  const editingPost = ref<ManagedPost | null>(null);
  const editingImagesPost = ref<ManagedPost | null>(null);

  watch(
    data,
    (value) => {
      posts.value = value?.posts ?? [];
      users.value = [...(value?.users ?? [])].reverse();
    },
    { immediate: true },
  );
  watch(error, (value) => {
    if (value) feedback.value = "加载失败，请稍后重试";
  });

  const formatTime = (time: number) =>
    new Intl.DateTimeFormat("zh-CN", {
      timeZone: "Asia/Shanghai",
      dateStyle: "medium",
      timeStyle: "short",
    }).format(time);

  const logout = async () => {
    await $fetch("/api/blog/logout", { method: "POST" });
    useIndexStore().setSession(null);
    await navigateTo("/");
  };

  const handleNav = async (text: string) => {
    if (text === "首页") return navigateTo("/");
    if (text === "退出") return logout();
    if (text !== "帖子" && text !== "用户") return;
    selected.value = text;
    feedback.value = "";
    loading.value = true;
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => setTimeout(resolve, 0)),
    );
    try {
      await refresh();
    } finally {
      loading.value = false;
    }
  };

  const editPost = (post: ManagedPost) => {
    editingPost.value = post;
  };

  const handlePostSaved = (updated: {
    id: number;
    text: string;
    images: string[];
  }) => {
    const post = posts.value.find(({ id }) => id === updated.id);
    if (!post) return;
    post.text = updated.text;
    post.images = updated.images;
    post.imageCount = updated.images.length;
    feedback.value = "帖子已更新";
  };

  const togglePost = async (post: ManagedPost) => {
    const nextActive = !post.active;
    if (!nextActive && !window.confirm(`确认停用帖子 #${post.id}？`)) return;

    try {
      await $fetch(`/api/blog/post/${post.id}`, { method: nextActive ? "PUT" : "DELETE" });
      post.active = nextActive;
      feedback.value = nextActive ? "帖子已启用" : "帖子已停用";
    } catch {
      feedback.value = nextActive ? "帖子启用失败" : "帖子停用失败";
    }
  };

  const toggleUser = async (user: ManagedUser) => {
    const nextActive = !user.active;
    if (!nextActive && !window.confirm(`确认停用用户 #${user.id}？`)) return;

    try {
      await $fetch(`/api/blog/user/${user.id}`, { method: nextActive ? "PUT" : "DELETE" });
      user.active = nextActive;
      posts.value.forEach((post) => {
        if (post.userId === user.id) post.authorActive = nextActive;
      });
      feedback.value = nextActive ? "用户已启用" : "用户已停用";
    } catch {
      feedback.value = nextActive ? "用户启用失败" : "用户停用失败";
    }
  };
</script>

<style lang="less" scoped>
  #pages_admin_index {
    &.dashboard-page {
      min-height: 100vh;
      color: #171717;
      background: #fff;

      > aside {
        position: fixed;
        z-index: 2;
        top: 0;
        left: 0;
        display: flex;
        box-sizing: border-box;
        width: 280px;
        min-height: 100dvh;
        flex-direction: column;
        padding: 36px 24px;
        overflow: hidden;
        // border-right: 1px solid #f0f0f0;
      }
    }

    .logo {
      width: 176px;
      height: 46px;
      margin: 0 8px 30px;

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
          dashboard-logo-draw 1.8s cubic-bezier(0.65, 0, 0.35, 1) forwards,
          dashboard-logo-fill 0.65s ease 1.35s forwards;
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
        animation: dashboard-logo-line-draw 0.75s ease 1.35s forwards;
      }
    }

    nav {
      width: 100%;
    }

    .nav-item {
      position: relative;
      display: flex;
      align-items: center;
      gap: 16px;
      box-sizing: border-box;
      width: 100%;
      min-height: 34px;
      margin-bottom: 15px;
      padding: 0 18px;
      border: 1px solid transparent;
      border-radius: 8px;
      color: #000;
      background: transparent;
      font-size: 17px;
      font-weight: 500;
      letter-spacing: 0.04em;
      cursor: pointer;
      text-align: left;
      transition: 0.2s ease;

      .item-icon {
        display: inline-flex;
        flex: 0 0 24px;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        font-size: 24px;
      }

      &:not(.is-selected):hover {
        border-color: #f6f6f6;
        background: #f6f6f6;
        transform: translateX(2px);
      }

      &.is-selected {
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
          content: "";
          transform: translateY(-50%);
        }
      }
    }

    .dashboard-main {
      box-sizing: border-box;
      width: 60vw;
      max-width: 720px;
      min-width: 480px;
      margin: 0 auto;
      padding: 56px 0 48px;
    }

    .dashboard-title {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      margin-bottom: 22px;

      .eyebrow {
        margin-bottom: 5px;
        color: #8b8b91;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.16em;
      }

      h1 {
        font-size: 30px;
        line-height: 1.2;
      }

      > span {
        color: #77777d;
        font-size: 14px;
      }
    }

    .dashboard-feedback {
      margin-bottom: 14px;
      padding: 11px 14px;
      border-radius: 10px;
      color: #3f5c46;
      background: #eef7f0;
      font-size: 14px;
    }

    .dashboard-list {
      display: grid;
      gap: 14px;
    }

    .dashboard-card {
      padding: 20px;
      border: 1px solid #dedee2;
      border-radius: 16px;
      background: #fff;
      transition:
        border-color 0.2s ease,
        box-shadow 0.2s ease,
        transform 0.2s ease;

      &:hover {
        border-color: #c9c9ce;
        box-shadow: 0 12px 32px rgba(101, 99, 99, 0.06);
        // transform: translateY(-2px);
      }

      > header,
      > footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }

      > header {
        color: #57575e;
        font-size: 14px;

        strong {
          color: #171717;
          font-size: 15px;
        }
      }

      > footer {
        color: #77777d;
        font-size: 13px;
      }

      .status-badge {
        display: inline-block;
        margin-left: 6px;
        padding: 2px 6px;
        border-radius: 5px;
        color: #9a3412;
        background: #fff1e6;
        font-size: 12px;
        font-weight: 400;
      }
    }

    .post-text {
      margin: 18px 0;
      color: #29292d;
      line-height: 1.7;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      user-select: text;
    }

    .card-actions {
      display: flex;
      align-items: center;
      gap: 8px;

      button,
      .admin-badge {
        min-width: 58px;
        padding: 7px 12px;
        border: 1px solid #d7d7db;
        border-radius: 8px;
        color: #343439;
        background: #fff;
        font-size: 13px;
        text-align: center;
      }

      button {
        cursor: pointer;

        &:hover {
          background: #f5f5f6;
        }

        &.danger {
          border-color: #f0caca;
          color: #b42318;
        }

        &:disabled {
          color: #aaaab0;
          cursor: not-allowed;
        }
      }

      .admin-badge {
        color: #46624d;
        background: #eef7f0;
      }
    }

    .user-card > footer {
      margin-top: 18px;
    }

    .dashboard-empty {
      padding: 56px 20px;
      border: 1px dashed #d7d7db;
      border-radius: 16px;
      color: #8b8b91;
      text-align: center;
    }

    @media screen and (max-width: 760px) {
      .dashboard-main {
        width: 54vw;
        min-width: 360px;
      }
    }

    @media screen and (max-width: 520px) {
      &.dashboard-page > aside {
        display: none;
      }

      .dashboard-main {
        width: auto;
        min-width: 0;
        padding: 82px 14px 28px;
      }

      .dashboard-title {
        align-items: flex-start;

        h1 {
          font-size: 26px;
        }
      }

      .dashboard-card {
        padding: 16px;

        > header {
          align-items: flex-start;
          flex-direction: column;
          gap: 6px;
        }
      }
    }

    @keyframes dashboard-logo-draw {
      to {
        stroke-dashoffset: 0;
      }
    }

    @keyframes dashboard-logo-fill {
      to {
        fill: #111;
        stroke-width: 0.45;
      }
    }

    @keyframes dashboard-logo-line-draw {
      to {
        stroke-dashoffset: 0;
      }
    }
  }
</style>
