<script setup lang="ts">
  import ids2026Text from "../../public/paperids.txt?raw";
  import ids2025Text from "../../public/paperids_2025.txt?raw";
  import ids2024Text from "../../public/paperids_2024.txt?raw";

  type Year = "2026" | "2025" | "2024";
  type View = `query-${Year}` | `all-${Year}` | "compare";

  const makeYear = (text: string) => {
    const ids = text.trim().split(/\s+/);
    const maxId = Math.max(...ids.map(Number));
    return {
      ids,
      idSet: new Set(ids),
      count: ids.length,
      maxId,
      estimatedRate: ((ids.length / maxId) * 100).toFixed(1),
    };
  };

  const years = {
    "2026": makeYear(ids2026Text),
    "2025": makeYear(ids2025Text),
    "2024": makeYear(ids2024Text),
  };
  const downloads: Record<Year, string> = {
    "2026": "/paperids.txt",
    "2025": "/paperids_2025.txt",
    "2024": "/paperids_2024.txt",
  };
  const navItems: { view: View; label: string }[] = [
    { view: "query-2026", label: "查询中稿 2026年" },
    { view: "all-2026", label: "全部展示 2026年" },
    { view: "query-2025", label: "查询中稿 2025年" },
    { view: "all-2025", label: "全部展示 2025年" },
    { view: "query-2024", label: "查询中稿 2024年" },
    { view: "all-2024", label: "全部展示 2024年" },
    { view: "compare", label: "三年对比分析" },
  ];

  useHead({ title: "BIBM 2024 至 2026 中稿查询" });

  const query = ref("");
  const view = ref<View>("query-2026");
  const loading = ref(true);
  const currentYear = computed<Year>(() => {
    if (view.value.includes("2025")) return "2025";
    if (view.value.includes("2024")) return "2024";
    return "2026";
  });
  const currentData = computed(() => years[currentYear.value]);
  const comparison = (["2026", "2025", "2024"] as Year[]).map((year) => ({
    year,
    ...years[year],
  }));

  onMounted(() => requestAnimationFrame(() => (loading.value = false)));

  const result = computed(() => {
    const input = query.value.trim();
    if (!input) return null;
    const match = /^B?(\d+)$/.exec(input);
    if (!match)
      return { message: "请输入编号，例如 B212 或 212", found: false };
    const id = String(Number(match[1]));
    return currentData.value.idSet.has(id)
      ? { message: `B${id} 在 ${currentYear.value} 年中稿名单中`, found: true }
      : {
          message: `B${id} 不在 ${currentYear.value} 年当前名单中`,
          found: false,
        };
  });

  const filterInput = (event: Event) => {
    const input = event.target as HTMLInputElement;
    query.value = input.value = input.value
      .toUpperCase()
      .replace(/[^B0-9]/g, "");
  };
</script>

<template>
  <SkeletonBibm2026 v-if="loading" />
  <main v-else class="bibm-page">
    <nav aria-label="年份和查看方式">
      <button
        v-for="item in navItems"
        :key="item.view"
        type="button"
        :class="{ active: view === item.view }"
        @click="view = item.view"
      >
        {{ item.label }}
      </button>
    </nav>

    <section
      v-if="view.startsWith('query')"
      class="card"
      aria-labelledby="page-title"
    >
      <p class="eyebrow">BIBM {{ currentYear }}</p>
      <h1 id="page-title">中稿查询</h1>
      <p class="intro">输入论文编号，查询是否中稿。</p>
      <label for="paper-id">论文编号</label>
      <input
        id="paper-id"
        v-model="query"
        type="text"
        placeholder="例如 B212 或 212"
        autocomplete="off"
        spellcheck="false"
        maxlength="6"
        @input="filterInput"
      />
      <p
        v-if="result"
        class="result"
        :class="{ found: result.found }"
        role="status"
        aria-live="polite"
      >
        {{ result.message }}
      </p>
      <div class="stats">
        <div>
          <strong>{{ currentData.count }}</strong
          ><span>中稿数量</span>
        </div>
        <div>
          <strong>{{ currentData.maxId }}</strong
          ><span>最大编号</span>
        </div>
        <div class="pc">
          <strong>约 {{ currentData.estimatedRate }}%</strong
          ><span>编号占比</span>
        </div>
      </div>
      <p class="note">
        编号占比只等于中稿数量除以最大编号，不能当作官方中稿率。正式中稿率需要实际投稿总数。
      </p>
      <a class="download" :href="downloads[currentYear]" download>
        下载 {{ currentYear }} 年全部中稿编号 TXT
      </a>
    </section>

    <section
      v-else-if="view.startsWith('all')"
      class="all"
      :aria-label="`${currentYear} 年全部中稿编号`"
    >
      <i v-for="id in currentData.ids" :key="id">B{{ id }}</i>
    </section>

    <section v-else class="compare" aria-labelledby="compare-title">
      <h1 id="compare-title">三年对比分析</h1>
      <p class="intro">以下结果基于当前三个编号名单。</p>
      <div class="compare-grid">
        <article v-for="item in comparison" :key="item.year">
          <strong>{{ item.year }}</strong>
          <span>{{ item.count }} 篇中稿</span>
          <span>最大编号 {{ item.maxId }}</span>
          <span>编号占比约 {{ item.estimatedRate }}%</span>
        </article>
      </div>
      <p class="note">
        2025 年比 2024 年多 89 篇，增加约 12.2%；2026 年比 2025 年少 62
        篇，减少约 7.6%。所有数据已官网邮件通报为准。
      </p>
    </section>
  </main>
</template>

<style scoped>
  .bibm-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 24px;
    background: #f5f7fb;
    color: #182334;
  }
  nav {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 4px;
    width: min(100%, 900px);
    padding: 4px;
    border-radius: 12px;
    background: #e9eef7;
  }
  nav button {
    padding: 10px 6px;
    border: 0;
    border-radius: 9px;
    background: transparent;
    color: #687588;
    cursor: pointer;
    font-size: 13px;
  }
  nav button.active {
    background: white;
    color: #3267d6;
    font-weight: 600;
  }
  .card,
  .compare {
    width: min(100%, 600px);
    padding: clamp(24px, 5vw, 44px);
    border: 1px solid #e6eaf1;
    border-radius: 20px;
    background: white;
    box-shadow: 0 18px 55px #14213d0d;
  }
  .compare {
    width: min(100%, 900px);
  }
  .eyebrow {
    margin: 0 0 8px;
    color: #3267d6;
    font-weight: 700;
    letter-spacing: 0.08em;
  }
  h1 {
    margin: 0;
    font-size: clamp(28px, 5vw, 38px);
  }
  .intro {
    margin: 12px 0 30px;
    color: #687588;
  }
  label {
    display: block;
    margin-bottom: 10px;
    font-weight: 600;
  }
  input {
    width: 100%;
    height: 52px;
    padding: 0 16px;
    border: 1px solid #cbd5e1;
    border-radius: 10px;
    outline: none;
    font: inherit;
  }
  input:focus {
    border-color: #3267d6;
    box-shadow: 0 0 0 3px #3267d622;
  }
  .result {
    margin: 16px 0 0;
    padding: 14px 16px;
    border-radius: 10px;
    background: #f3f5f8;
    font-weight: 600;
  }
  .result.found {
    color: #146b44;
    background: #e8f8ef;
  }
  .stats,
  .compare-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-top: 32px;
  }
  .stats div,
  .compare-grid article {
    padding: 17px 8px;
    border-radius: 12px;
    background: #f6f8fc;
    text-align: center;
  }
  .stats strong {
    display: block;
    font-size: clamp(20px, 4vw, 25px);
  }
  .stats span,
  .compare-grid span {
    display: block;
    margin-top: 5px;
    color: #687588;
    font-size: 12px;
  }
  .compare-grid article > strong {
    color: #3267d6;
    font-size: 24px;
  }
  .note {
    margin: 18px 0 0;
    color: #687588;
    font-size: 13px;
    line-height: 1.6;
  }
  .download {
    display: inline-block;
    margin-top: 22px;
    color: #3267d6;
    text-decoration: underline;
  }
  .all {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 6px;
    width: min(100%, 600px);
    padding: 16px;
    border-radius: 16px;
    background: white;
  }
  .all i {
    padding: 6px 2px;
    border-radius: 6px;
    background: #f6f8fc;
    font-size: 12px;
    font-style: normal;
    text-align: center;
  }
  @media screen and (max-width: 618px) {
    nav {
      grid-template-columns: repeat(2, 1fr);
    }
    .stats {
      grid-template-columns: repeat(2, 1fr);
    }
    .compare-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
