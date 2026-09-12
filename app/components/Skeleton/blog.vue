<template>
  <section class="blog-skeleton" aria-label="正在加载文章" aria-live="polite">
    <span class="sr-only">正在加载文章</span>
    <article v-for="item in 5" :key="item" class="skeleton-item">
      <span class="skeleton-avatar"></span>
      <div class="skeleton-content">
        <p class="skeleton-meta">
          <span></span>
          <span></span>
        </p>
        <p class="skeleton-line is-long"></p>
        <p class="skeleton-line is-medium"></p>
        <p class="skeleton-actions">
          <span></span>
          <span></span>
        </p>
      </div>
    </article>
  </section>
</template>

<style lang="less" scoped>
  .blog-skeleton {
    width: 100%;
    margin-top: 15px;
    color: #e7e7ea;
  }

  .skeleton-item {
    display: flex;
    box-sizing: border-box;
    min-height: 178px;
    gap: 16px;
    padding: 22px 36px;
    border-bottom: 1px solid #e7e7ea;
  }

  .skeleton-avatar,
  .skeleton-meta span,
  .skeleton-line,
  .skeleton-actions span {
    background: linear-gradient(100deg, #eeeeF0 30%, #f8f8f9 50%, #eeeeF0 70%);
    background-size: 220% 100%;
    animation: skeleton-shimmer 1.35s ease-in-out infinite;
  }

  .skeleton-avatar {
    flex: 0 0 46px;
    width: 46px;
    height: 46px;
    border-radius: 50%;
  }

  .skeleton-content {
    flex: 1;
    min-width: 0;
  }

  .skeleton-meta,
  .skeleton-actions {
    display: flex;
    gap: 12px;
    margin: 0;
  }

  .skeleton-meta {
    margin: 3px 0 18px;

    span {
      width: 92px;
      height: 16px;
      border-radius: 6px;

      &:last-child {
        width: 58px;
      }
    }
  }

  .skeleton-line {
    height: 14px;
    margin: 0 0 12px;
    border-radius: 5px;

    &.is-long {
      width: min(92%, 620px);
    }

    &.is-medium {
      width: min(62%, 420px);
    }
  }

  .skeleton-actions {
    margin-top: 23px;

    span {
      width: 52px;
      height: 18px;
      border-radius: 7px;
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

  @keyframes skeleton-shimmer {
    to {
      background-position-x: -220%;
    }
  }

  @media screen and (max-width: 768px) {
    .skeleton-item {
      min-height: 164px;
      gap: 12px;
      padding: 20px 18px;
    }

    .skeleton-avatar {
      flex-basis: 42px;
      width: 42px;
      height: 42px;
    }

    .skeleton-meta span {
      width: 72px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .skeleton-avatar,
    .skeleton-meta span,
    .skeleton-line,
    .skeleton-actions span {
      animation: none;
    }
  }
</style>
