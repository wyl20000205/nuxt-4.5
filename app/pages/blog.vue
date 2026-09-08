<template>
  <div id="pages_blog">
    <div v-if="viewport_width" class="viewport-debug">
      {{ viewport_width }}px
    </div>
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
        v-for="(item, index) in aside_item"
        :key="item.name"
        class="nav-item"
        :class="{ 'is-selected': select_item === index }"
        type="button"
        :aria-current="select_item === index ? 'page' : undefined"
        @click="handleAsideSelect(index)"
      >
        <i :class="['item-icon', 'yumao', item.icon]" aria-hidden="true"></i>
        <span>{{ item.name }}</span>
      </button>
    </aside>
    <main>
      <div class="head">
        <div class="l"><p>最新文章</p></div>
        <div class="r">
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
              @keydown.enter="handleSearch"
              @keydown.esc="closeSearch"
              @input="removeSpaces"
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
        </div>
      </div>
      <div
        ref="main_scroll"
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
            <img
              ref="home_avatar_image"
              :src="qq_img"
              alt="用户头像"
              fetchpriority="high"
              @load="home_avatar_loaded = true"
              @error="home_avatar_loaded = false"
            />
          </p>
          <p class="prompt">今天有什么有趣的事吗？🤔</p>
          <p class="action"><button type="button">发帖</button></p>
        </div>
        <div
          class="loading"
          :class="{ 'is-visible': home_loading }"
          :aria-hidden="!home_loading"
        >
          <p class="yumao icon-jiazai"></p>
        </div>
        <div class="item_box">
          <div
            v-for="post in post_items"
            :key="post.id"
            :class="[post.item_id, 'item']"
            role="button"
            tabindex="0"
            @mouseenter="hovered_post_id = post.id"
            @mouseleave="hovered_post_id = null"
            @focus="hovered_post_id = post.id"
            @blur="hovered_post_id = null"
            @click="handlePostClick(post)"
            @keydown.enter="handlePostClick(post)"
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
                <img
                  :src="post.avatar"
                  :alt="`${post.author} 的头像`"
                  :data-post-avatar-id="post.id"
                  loading="lazy"
                  @load="post_avatar_loaded[post.id] = true"
                  @error="post_avatar_loaded[post.id] = false"
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
                  <p
                    class="h_r"
                    :class="{ 'is-visible': hovered_post_id === post.id }"
                    aria-label="更多操作"
                  >
                    <em class="yumao icon-gengduo"></em>
                  </p>
                </div>
                <pre class="m">{{ post.content }}</pre>
                <picture
                  v-if="post.img_list?.length"
                  class="img_box"
                  @click.stop
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
                    <img
                      :src="`/images/${image}`"
                      :alt="`${post.author} 的图片 ${index + 1}`"
                      loading="lazy"
                      decoding="async"
                      draggable="false"
                    />
                  </span>
                </picture>
                <picture v-if="false" class="img_box">
                  <p class="img img_1">
                    <img
                      src="https://scontent-sin6-3.cdninstagram.com/v/t51.82787-15/775591707_18427859728180291_7845693213144947568_n.jpg?stp=dst-jpg_e35_s480x480_tt6&_nc_cat=106&ig_cache_key=Mzk2NDk1MDc2MDE0OTEyNTk2OA%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0ueHBpZHMuMjQ0Ny5zZHIucmVndWxhcl9waG90by5DMyJ9&_nc_ohc=Arm5ScTeb7oQ7kNvwERFYgA&_nc_oc=Adp2YMfeY35zdxigPZhxRovmElb562b_sXXni-typ6M3HhRQRgg6GQL_wdNjnShAd8o&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent-sin6-3.cdninstagram.com&_nc_gid=uLgrxQ8i2AEV8dNvbmsHtw&_nc_ss=7a22e&oh=00_AQHD8cV-MXkUS864cgeHFDaYxHkrO-1UZgc0vXEHGVqF4A&oe=6A888C4C"
                    /><i class="to do"></i>
                  </p>
                  <p class="img img_1">
                    <img
                      src="https://scontent-sin6-3.cdninstagram.com/v/t51.82787-15/775591707_18427859728180291_7845693213144947568_n.jpg?stp=dst-jpg_e35_s480x480_tt6&_nc_cat=106&ig_cache_key=Mzk2NDk1MDc2MDE0OTEyNTk2OA%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0ueHBpZHMuMjQ0Ny5zZHIucmVndWxhcl9waG90by5DMyJ9&_nc_ohc=Arm5ScTeb7oQ7kNvwERFYgA&_nc_oc=Adp2YMfeY35zdxigPZhxRovmElb562b_sXXni-typ6M3HhRQRgg6GQL_wdNjnShAd8o&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent-sin6-3.cdninstagram.com&_nc_gid=uLgrxQ8i2AEV8dNvbmsHtw&_nc_ss=7a22e&oh=00_AQHD8cV-MXkUS864cgeHFDaYxHkrO-1UZgc0vXEHGVqF4A&oe=6A888C4C"
                    /><i class="to do"></i>
                  </p>
                  <p class="img img_1">
                    <img
                      src="https://scontent-sin6-3.cdninstagram.com/v/t51.82787-15/775591707_18427859728180291_7845693213144947568_n.jpg?stp=dst-jpg_e35_s480x480_tt6&_nc_cat=106&ig_cache_key=Mzk2NDk1MDc2MDE0OTEyNTk2OA%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0ueHBpZHMuMjQ0Ny5zZHIucmVndWxhcl9waG90by5DMyJ9&_nc_ohc=Arm5ScTeb7oQ7kNvwERFYgA&_nc_oc=Adp2YMfeY35zdxigPZhxRovmElb562b_sXXni-typ6M3HhRQRgg6GQL_wdNjnShAd8o&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent-sin6-3.cdninstagram.com&_nc_gid=uLgrxQ8i2AEV8dNvbmsHtw&_nc_ss=7a22e&oh=00_AQHD8cV-MXkUS864cgeHFDaYxHkrO-1UZgc0vXEHGVqF4A&oe=6A888C4C"
                    /><i class="to do"></i>
                  </p>
                  <p class="img img_1">
                    <img
                      src="https://scontent-sin6-3.cdninstagram.com/v/t51.82787-15/775591707_18427859728180291_7845693213144947568_n.jpg?stp=dst-jpg_e35_s480x480_tt6&_nc_cat=106&ig_cache_key=Mzk2NDk1MDc2MDE0OTEyNTk2OA%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0ueHBpZHMuMjQ0Ny5zZHIucmVndWxhcl9waG90by5DMyJ9&_nc_ohc=Arm5ScTeb7oQ7kNvwERFYgA&_nc_oc=Adp2YMfeY35zdxigPZhxRovmElb562b_sXXni-typ6M3HhRQRgg6GQL_wdNjnShAd8o&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent-sin6-3.cdninstagram.com&_nc_gid=uLgrxQ8i2AEV8dNvbmsHtw&_nc_ss=7a22e&oh=00_AQHD8cV-MXkUS864cgeHFDaYxHkrO-1UZgc0vXEHGVqF4A&oe=6A888C4C"
                    /><i class="to do"></i>
                  </p>
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
  </div>
</template>

<script setup lang="ts">
  type PostItem = {
    id: number;
    item_id: string;
    author: string;
    avatar: string;
    time: number;
    content: string;
    img_list?: string[];
    likes: number;
    replies: number;
  };

  const qq_img = ref("https://q1.qlogo.cn/g?b=qq&nk=1799498990&s=640");
  const home_avatar_loaded = ref(false);
  const post_avatar_loaded = reactive<Record<number, boolean>>({});
  const hovered_post_id = ref<number | null>(null);
  const liked_post_ids = ref<Set<number>>(new Set());
  const like_transition_direction = reactive<Record<number, "up" | "down">>({});
  const post_items = ref<PostItem[]>([
    {
      id: 1,
      item_id: "item_1",
      author: "Hualuo",
      avatar: qq_img.value,
      time: 1786939080000,
      content: "午后的阳光很适合整理照片。\n今天也记录一点小小的开心。",
      likes: 28,
      replies: 6,
      img_list: ["temp.png"],
    },
    {
      id: 2,
      item_id: "item_3",
      author: "Mori",
      avatar: "https://q1.qlogo.cn/g?b=qq&nk=10000&s=640",
      time: 1786938480000,
      content: "周末去逛了旧书店，带回一本很喜欢的散文集。",
      likes: 46,
      replies: 9,
    },
    {
      id: 3,
      item_id: "item_4",
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
      item_id: "item_5",
      author: "Nina",
      avatar: "https://q1.qlogo.cn/g?b=qq&nk=888888&s=640",
      time: 1786928400000,
      content: "分享一首适合通勤路上循环的歌，节奏轻快，心情也会亮一点。",
      likes: 35,
      replies: 4,
    },
    {
      id: 5,
      item_id: "item_6",
      author: "阿岚",
      avatar: "https://q1.qlogo.cn/g?b=qq&nk=5201314&s=640",
      time: 1786885200000,
      content: "雨天在窗边喝咖啡，看着街道慢慢安静下来。",
      likes: 109,
      replies: 23,
    },
    {
      id: 6,
      item_id: "item_7",
      author: "Kiki",
      avatar: "https://q1.qlogo.cn/g?b=qq&nk=246810&s=640",
      time: 1786876920000,
      content:
        "今天把房间收拾了一遍。\n桌面干净以后，思路也清楚了不少。\n晚上想做一道简单的番茄鸡蛋面。",
      likes: 18,
      replies: 3,
    },
    {
      id: 7,
      item_id: "item_8",
      author: "周周",
      avatar: "https://q1.qlogo.cn/g?b=qq&nk=271828&s=640",
      time: 1786868400000,
      content:
        "下班路上买了一束向日葵，插在客厅里以后，原本普通的傍晚也有了些仪式感。",
      likes: 64,
      replies: 11,
    },
    {
      id: 8,
      item_id: "item_9",
      author: "小满",
      avatar: "https://q1.qlogo.cn/g?b=qq&nk=314159&s=640",
      time: 1786860360000,
      content:
        "午休没有刷手机。\n坐在楼下晒了十分钟太阳。\n风有一点凉。\n下午的工作居然顺了很多。",
      likes: 87,
      replies: 16,
    },
    {
      id: 9,
      item_id: "item_10",
      author: "Lena",
      avatar: "https://q1.qlogo.cn/g?b=qq&nk=161803&s=640",
      time: 1786851300000,
      content:
        "最近开始用纸笔记待办，划掉一项的瞬间很有成就感。比起把计划排得很满，先完成眼前的一件小事更踏实。",
      likes: 42,
      replies: 7,
    },
    {
      id: 10,
      item_id: "item_11",
      author: "阿澈",
      avatar: "https://q1.qlogo.cn/g?b=qq&nk=112233&s=640",
      time: 1786752900000,
      content:
        "早餐是热牛奶和烤面包。\n窗外刚好下起小雨。\n这样的早晨，适合把节奏放慢一点。",
      likes: 31,
      replies: 5,
    },
    {
      id: 11,
      item_id: "item_12",
      author: "Yoyo",
      avatar: "https://q1.qlogo.cn/g?b=qq&nk=445566&s=640",
      time: 1786792200000,
      content:
        "把很久没联系的朋友约出来吃了顿饭，聊天时才发现大家都在各自努力生活。见面本身就很治愈。",
      likes: 93,
      replies: 20,
    },
    {
      id: 12,
      item_id: "item_13",
      author: "南风",
      avatar: "https://q1.qlogo.cn/g?b=qq&nk=778899&s=640",
      time: 1786789500000,
      content:
        "傍晚去江边散步。\n云层被夕阳染成很浅的橘色。\n耳机里正好放到喜欢的歌。\n今天到这里就很好。",
      likes: 126,
      replies: 28,
    },
    {
      id: 13,
      item_id: "item_14",
      author: "Mia",
      avatar: "https://q1.qlogo.cn/g?b=qq&nk=998877&s=640",
      time: 1786624200000,
      content:
        "试着做了新配方的冰美式，苦味比预想中淡一些。天气热的时候，冰块碰杯的声音也很让人安心。",
      likes: 39,
      replies: 8,
    },
    {
      id: 14,
      item_id: "item_15",
      author: "木木",
      avatar: "https://q1.qlogo.cn/g?b=qq&nk=135790&s=640",
      time: 1786687200000,
      content:
        "给阳台上的薄荷换了盆。\n浇水的时候闻到一点清凉的香气。\n希望它能快点长得茂盛。",
      likes: 22,
      replies: 2,
    },
    {
      id: 15,
      item_id: "item_16",
      author: "晴子",
      avatar: "https://q1.qlogo.cn/g?b=qq&nk=975310&s=640",
      time: 1786629600000,
      content:
        "最近读书读得慢了一些。\n每晚只看几页。\n却能把喜欢的句子记得更久。\n慢下来也没有关系。",
      likes: 76,
      replies: 14,
    },
  ]);
  const viewport_width = ref(0);
  const select_item = ref(0);
  const home_loading = ref(false);
  const bottom_loading = ref(false);
  const search_open = ref(false);
  const search_input = ref<HTMLInputElement | null>(null);
  const main_scroll = ref<HTMLElement | null>(null);
  const home_avatar_image = ref<HTMLImageElement | null>(null);
  let homeLoadingTimer: number | undefined;
  let bottomLoadingTimer: number | undefined;
  let bottomReached = false;

  const removeSpaces = (event: Event) => {
    const input = event.currentTarget as HTMLInputElement;
    input.value = input.value.replace(/\s+/g, "");
  };

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

  const handlePostClick = (_post: PostItem) => {
    // 预留帖子详情跳转或弹窗逻辑。
  };

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

  const handleGalleryPointerDown = (event: PointerEvent) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    const gallery = event.currentTarget as HTMLElement;
    active_gallery = gallery;
    active_gallery_pointer_id = event.pointerId;
    gallery_start_x = event.clientX;
    gallery_start_scroll_left = gallery.scrollLeft;
    gallery_last_x = event.clientX;
    gallery.setPointerCapture(event.pointerId);
  };

  const handleGalleryPointerMove = (event: PointerEvent) => {
    if (
      active_gallery !== event.currentTarget ||
      active_gallery_pointer_id !== event.pointerId
    ) {
      return;
    }

    const distance = event.clientX - gallery_start_x;
    if (Math.abs(distance) > 3) event.preventDefault();
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

  const syncAvatarLoadState = () => {
    const homeImage = home_avatar_image.value;
    if (homeImage?.complete && homeImage.naturalWidth > 0) {
      home_avatar_loaded.value = true;
    }

    document
      .querySelectorAll<HTMLImageElement>("img[data-post-avatar-id]")
      .forEach((image) => {
        const postId = Number(image.dataset.postAvatarId);
        if (
          image.complete &&
          image.naturalWidth > 0 &&
          Number.isFinite(postId)
        ) {
          post_avatar_loaded[postId] = true;
        }
      });
  };

  const updateViewportWidth = () => {
    viewport_width.value = window.innerWidth;
  };

  onMounted(() => {
    updateViewportWidth();
    nextTick(syncAvatarLoadState);
    window.addEventListener("resize", updateViewportWidth);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("resize", updateViewportWidth);
    if (homeLoadingTimer !== undefined) window.clearTimeout(homeLoadingTimer);
    if (bottomLoadingTimer !== undefined)
      window.clearTimeout(bottomLoadingTimer);
    if (gallery_animation_frame !== undefined)
      window.cancelAnimationFrame(gallery_animation_frame);
  });

  const handleSearch = async () => {
    if (!search_open.value) {
      search_open.value = true;
      await nextTick();
      search_input.value?.focus();
      return;
    }
  };

  const closeSearch = () => {
    search_open.value = false;
    search_input.value?.blur();
  };

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

  const handleAsideSelect = (index: number) => {
    select_item.value = index;
    if (index === 0) {
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

  const aside_item = ref([
    {
      icon: "icon-a-042_fujin",
      name: "首页",
    },
    {
      icon: "icon-a-042_faxian",
      name: "发帖",
    },
    {
      icon: "icon-a-042_sousuo",
      name: "搜索",
    },
    {
      icon: "icon-a-042_wode-09",
      name: "登录",
    },
    {
      icon: "icon-a-042_tianjia",
      name: "其他",
    },
  ]);

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

    .viewport-debug {
      position: absolute;
      top: 12px;
      right: 16px;
      z-index: 100;
      padding: 5px 9px;
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 999px;
      color: rgba(255, 255, 255, 0.72);
      background: rgba(20, 20, 20, 0.82);
      font:
        600 12px/1.2 ui-monospace,
        SFMono-Regular,
        Consolas,
        monospace;
      letter-spacing: 0.04em;
      pointer-events: none;
      user-select: none;
    }

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

        .item-icon {
          color: #111;
        }
      }
    }
    main {
      position: fixed;
      top: 0;
      left: 50%;
      width: 680px;
      height: 100dvh;
      margin: 0;
      color: black;
      overflow: hidden;
      transform: translateX(-50%);

      .head {
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
          // border: 1px solid red;
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
              font-size: 15px;
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
        box-sizing: border-box;
        width: 100%;
        height: calc(100dvh - 95px);
        min-height: 0;
        padding-bottom: 24px;
        overflow-x: hidden;
        overflow-y: auto;
        overscroll-behavior: contain;
        -ms-overflow-style: none;
        scrollbar-width: none;
        border: 1px solid #dedee2;
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
            cursor: pointer;

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
              cursor: pointer;
              transition: all 0.3s;

              &:hover {
                color: #fff;
                border-color: #1c1c1e;
                background: #48484c;
                // box-shadow: 0 7px 18px rgba(0, 0, 0, 0.14);
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
          > div.item_2 {
            display: none;
          }
          > div.item {
            width: 100%;
            margin: 0 auto;
            border-bottom: 1px solid rgb(195, 190, 190);
            cursor: pointer;

            &:hover,
            &:focus-visible {
              .h_r {
                visibility: visible;
                opacity: 1;
                transform: translateX(0);
                pointer-events: auto;
              }
            }

            &:focus-visible {
              outline: 2px solid rgba(0, 0, 0, 0.35);
              outline-offset: -2px;
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
                  cursor: pointer;
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
                      cursor: pointer;
                      &:hover {
                        text-decoration: underline;
                      }
                    }
                    .time {
                      cursor: pointer;
                      color: gray;
                      font-size: 15px;
                    }
                  }
                  .h_r {
                    visibility: hidden;
                    opacity: 0;
                    pointer-events: none;
                    transform: translateX(4px);
                    transition:
                      opacity 0.2s ease,
                      transform 0.2s ease;

                    &.is-visible {
                      visibility: visible;
                      opacity: 1;
                      pointer-events: auto;
                      transform: translateX(0);
                    }

                    .icon-gengduo {
                      transition: all 0.3s;
                      color: gray;
                    }
                    em {
                      margin-left: 10px;
                      cursor: pointer;
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
                  //cursor: grab;
                  touch-action: pan-y;
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
                    min-height: 210px;
                    height: clamp(220px, 25vw, 220px);
                    overflow: hidden;
                    border: 1px solid #d7d7db;
                    border-radius: 12px;
                    pointer-events: none;

                    img {
                      display: block;
                      width: auto;
                      height: 100%;
                      max-width: none;
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
  @media screen and (max-width: 1280px) {
    #pages_index {
      aside {
        padding: 36px 10px;
        .logo {
          .logo-text {
            letter-spacing: 1px;
            font-size: 18px;
          }
          .logo-line {
            stroke-width: 1.2;
          }
        }
        .nav-item {
          width: 65%;
        }
      }
    }
  }
  @media screen and (max-width: 1100px) {
    #pages_index {
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
    #pages_index aside .logo {
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

    #pages_index main .main .loading p,
    #pages_index main .main .item_bottom p {
      animation: none;
    }
  }
</style>
