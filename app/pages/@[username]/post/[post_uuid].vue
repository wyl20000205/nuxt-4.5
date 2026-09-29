<template>
  <main class="post-page">
    <header>
      <button type="button" aria-label="返回" @click="goBack">←</button>
      <div><h1>文章</h1><span>{{ post?.commentCount ?? 0 }} 条评论</span></div>
    </header>

    <section v-if="status === 'pending'" class="state">正在加载帖子…</section>
    <section v-else-if="!post" class="state">
      <h2>{{ error?.statusCode === 404 ? "帖子不存在" : "帖子加载失败" }}</h2>
      <NuxtLink to="/">返回首页</NuxtLink>
    </section>

    <section v-else class="thread">
      <article class="post-card">
        <div class="author">
          <span class="avatar">{{ post.username.slice(0, 1).toUpperCase() }}</span>
          <div><strong>@{{ post.username }}</strong><small>{{ formatTime(post.time) }}</small></div>
        </div>
        <pre>{{ post.text }}</pre>
        <div v-if="post.img_list.length" class="images">
          <NuxtImg
            v-for="(image, index) in post.img_list"
            :key="image"
            :src="imageSource(image)"
            :alt="`@${post.username} 的图片 ${index + 1}`"
            loading="lazy"
          />
        </div>
        <div class="actions">
          <button type="button" :disabled="likePending" @click="toggleLike">
            {{ post.liked ? "♥" : "♡" }} {{ post.likeCount }}
          </button>
          <span>💬 {{ comments.length }}</span>
        </div>
      </article>

      <form class="comment-form" @submit.prevent="submitComment">
        <p v-if="replyTo">
          回复 @{{ replyTo.username }}
          <button type="button" @click="replyTo = null">取消</button>
        </p>
        <textarea
          v-model="commentText"
          maxlength="1000"
          :placeholder="replyTo ? `回复 @${replyTo.username}` : '写下评论…'"
        ></textarea>
        <div>
          <span class="form-error" role="alert">{{ formError }}</span>
          <button type="submit" :disabled="commentPending || !commentText.trim()">
            {{ commentPending ? "发送中" : "发送" }}
          </button>
        </div>
      </form>

      <div class="comments">
        <h2>评论</h2>
        <p v-if="!comments.length" class="empty">暂无评论</p>
        <article
          v-for="comment in comments"
          :key="comment.id"
          :class="{ reply: comment.parentId }"
        >
          <div class="author">
            <span class="avatar small">{{ comment.username.slice(0, 1).toUpperCase() }}</span>
            <div>
              <strong>@{{ comment.username }}</strong>
              <small>{{ formatTime(comment.time) }}</small>
            </div>
          </div>
          <p>{{ comment.text }}</p>
          <button type="button" class="reply-button" @click="replyTo = comment">回复</button>
        </article>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
  import { useIndexStore } from "~/stores/index";
  import type { BlogPost } from "~/types/blog";

  type Comment = {
    id: string;
    parentId: string | null;
    username: string;
    text: string;
    time: number;
  };
  const route = useRoute();
  const router = useRouter();
  const indexStore = useIndexStore();
  const username = String(route.params.username || "");
  const postUuid = String(route.params.post_uuid || "");
  const { data, error, status } = await useLazyFetch<{
    post: BlogPost;
    comments: Comment[];
  }>(
    `/api/blog/post/${encodeURIComponent(postUuid)}`,
    { query: { username } },
  );
  const post = computed(() => data.value?.post ?? null);
  const comments = ref<Comment[]>([]);
  const commentText = ref("");
  const replyTo = ref<Comment | null>(null);
  const commentPending = ref(false);
  const likePending = ref(false);
  const formError = ref("");

  useHead({ title: computed(() => (post.value ? `@${post.value.username} 的帖子` : "帖子详情")) });
  watch(
    () => data.value?.comments,
    (value) => {
      if (value) comments.value = value;
    },
    { immediate: true },
  );
  onMounted(() => void indexStore.refreshSession());

  const formatTime = (time: number) => indexStore.formatPostTime(time);
  const imageSource = (image: string) =>
    /^https?:\/\//i.test(image) ? image : `/images/${image}`;
  const goBack = () => router.back();

  const toggleLike = async () => {
    if (!post.value) return;
    if (!indexStore.sessionUserId) {
      formError.value = "请先登录后点赞";
      return;
    }
    likePending.value = true;
    formError.value = "";
    try {
      const result = await $fetch<{ liked: boolean; likeCount: number }>(
        `/api/blog/post/${post.value.id}/like`,
        { method: post.value.liked ? "DELETE" : "PUT" },
      );
      post.value.liked = result.liked;
      post.value.likeCount = result.likeCount;
    } catch {
      formError.value = "点赞失败，请重试";
    } finally {
      likePending.value = false;
    }
  };

  const submitComment = async () => {
    if (!post.value || !commentText.value.trim() || commentPending.value) return;
    if (!indexStore.sessionUserId) {
      formError.value = "请先登录后评论";
      return;
    }
    commentPending.value = true;
    formError.value = "";
    try {
      const { comment } = await $fetch<{ comment: Comment }>(
        "/api/blog/post/comment",
        {
          method: "POST",
          body: {
            postId: post.value.id,
            text: commentText.value,
            parentId: replyTo.value?.id ?? null,
          },
        },
      );
      comments.value.push(comment);
      post.value.commentCount = comments.value.length;
      commentText.value = "";
      replyTo.value = null;
    } catch (requestError) {
      formError.value =
        (requestError as { data?: { message?: string } }).data?.message || "评论失败，请重试";
    } finally {
      commentPending.value = false;
    }
  };
</script>

<style lang="less" scoped>
  .post-page {
    min-height: 100vh;
    padding: 24px;
    background: #f5f7fb;
    color: #182334;
  }
  header {
    display: flex;
    align-items: center;
    gap: 18px;
    width: min(100%, 820px);
    margin: 0 auto 14px;
    button { border: 0; background: transparent; font-size: 32px; cursor: pointer; }
    h1 { margin: 0; font-size: 24px; }
    span { color: #8893a3; font-size: 13px; }
  }
  .thread,
  .state {
    width: min(100%, 820px);
    margin: auto;
    border: 1px solid #e1e5eb;
    border-radius: 20px;
    background: white;
    overflow: hidden;
  }
  .state { padding: 70px 24px; text-align: center; }
  .post-card,
  .comment-form,
  .comments > article { padding: 28px 38px; }
  .author {
    display: flex;
    align-items: center;
    gap: 12px;
    div { display: flex; gap: 10px; align-items: baseline; }
    small { color: #98a0aa; }
  }
  .avatar {
    display: grid;
    place-items: center;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #182334;
    color: white;
    font-weight: 700;
  }
  .avatar.small { width: 38px; height: 38px; }
  .post-card pre {
    margin: 22px 0;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    font: inherit;
    line-height: 1.7;
  }
  .images {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    img { width: 100%; max-height: 460px; border-radius: 12px; object-fit: cover; }
  }
  .actions {
    display: flex;
    gap: 28px;
    margin-top: 22px;
    color: #596474;
    button { border: 0; background: transparent; cursor: pointer; font: inherit; }
  }
  .comment-form {
    border-top: 1px solid #e8ebef;
    border-bottom: 1px solid #e8ebef;
    p { margin: 0 0 8px; color: #687588; font-size: 13px; }
    p button { border: 0; background: transparent; color: #3267d6; cursor: pointer; }
    textarea {
      width: 100%;
      min-height: 86px;
      padding: 12px;
      resize: vertical;
      border: 1px solid #d8dde5;
      border-radius: 12px;
      font: inherit;
    }
    > div { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; }
    > div button { padding: 8px 20px; border: 0; border-radius: 20px; background: #3267d6; color: white; cursor: pointer; }
    > div button:disabled { opacity: 0.5; cursor: default; }
  }
  .form-error { color: #c23b3b; font-size: 13px; }
  .comments h2 { margin: 0; padding: 24px 38px 10px; font-size: 18px; }
  .comments .empty { padding: 24px 38px 40px; color: #98a0aa; }
  .comments > article { border-top: 1px solid #eef0f3; }
  .comments > article.reply { margin-left: 46px; border-left: 3px solid #e3e7ed; }
  .comments > article > p { margin: 12px 0; line-height: 1.6; white-space: pre-wrap; }
  .reply-button { border: 0; background: transparent; color: #687588; cursor: pointer; }
  @media screen and (max-width: 618px) {
    .post-page { padding: 12px; }
    .post-card,
    .comment-form,
    .comments > article { padding: 22px 18px; }
    .comments > article.reply { margin-left: 18px; }
    .images { grid-template-columns: 1fr; }
  }
</style>
