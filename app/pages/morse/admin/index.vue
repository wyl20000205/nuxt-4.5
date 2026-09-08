<template>
  <main class="mx-auto max-w-5xl space-y-5 p-6">
    <header class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold">Eng Link 管理后台</h1>
        <p class="mt-1 text-sm text-gray-500">用户与企业数据管理</p>
      </div>
      <button
        class="text-sm font-medium text-red-600 hover:text-red-700"
        type="button"
        @click="exitLogin"
      >
        退出登录
      </button>
    </header>

    <nav
      class="grid rounded-lg bg-gray-100 p-1"
      style="grid-auto-flow: column; grid-auto-columns: minmax(0, 1fr)"
      role="tablist"
      aria-label="管理员页面导航"
    >
      <button
        v-for="panel in panels"
        :key="panel.id"
        class="rounded-md px-4 py-2.5 text-sm font-medium transition"
        :class="
          activePanel === panel.id
            ? 'bg-white text-black shadow-sm'
            : 'text-gray-500 hover:text-gray-900'
        "
        type="button"
        role="tab"
        :aria-selected="activePanel === panel.id"
        @click="selectPanel(panel.id)"
      >
        {{ panel.label }}
      </button>
    </nav>

    <section
      v-show="activePanel === 'users'"
      class="overflow-hidden rounded-xl border bg-white"
      role="tabpanel"
    >
      <div class="flex items-center justify-between gap-4 border-b p-5">
        <div>
          <h2 class="text-lg font-semibold">用户管理</h2>
          <p class="mt-1 text-sm text-gray-500">共 {{ userTotal }} 位用户</p>
        </div>
        <div
          v-if="userPageCount > 1"
          class="flex flex-wrap items-center justify-center gap-2"
        >
          <button
            class="rounded border px-3 py-1.5 text-sm disabled:opacity-40"
            type="button"
            :disabled="userLoading || userPage === 1"
            @click="fetchUsers(userPage - 1)"
          >
            上一页
          </button>
          <button
            v-for="page in userPageNumbers"
            :key="page"
            class="min-w-9 rounded border px-3 py-1.5 text-sm"
            :class="page === userPage ? 'bg-black text-white' : 'bg-white'"
            type="button"
            :disabled="userLoading"
            @click="fetchUsers(page)"
          >
            {{ page }}
          </button>
          <button
            class="rounded border px-3 py-1.5 text-sm disabled:opacity-40"
            type="button"
            :disabled="userLoading || userPage === userPageCount"
            @click="fetchUsers(userPage + 1)"
          >
            下一页
          </button>
          <span class="text-xs text-gray-500">
            第 {{ userPage }} / {{ userPageCount }} 页
          </span>
        </div>
        <button
          class="rounded border px-3 py-1.5 text-sm disabled:opacity-50"
          type="button"
          :disabled="userLoading"
          @click="fetchUsers()"
        >
          {{ userLoading ? "加载中..." : "刷新" }}
        </button>
      </div>

      <p v-if="userError" class="m-5 rounded bg-red-50 p-4 text-red-700">
        {{ userError }}
      </p>
      <div v-if="userLoading" class="p-10 text-center text-gray-500">
        正在加载用户数据...
      </div>
      <div v-else-if="!users.length" class="p-10 text-center text-gray-500">
        暂无用户数据
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[860px] text-left text-sm">
          <thead class="bg-gray-50 text-xs text-gray-500">
            <tr>
              <th class="px-4 py-3">ID</th>
              <th class="px-4 py-3">用户</th>
              <th class="px-4 py-3">邮箱</th>
              <th class="px-4 py-3">状态</th>
              <th class="px-4 py-3">角色</th>
              <th class="px-4 py-3">请求数</th>
              <th class="px-4 py-3">最后登录</th>
              <th class="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
              <td class="px-4 py-3">{{ user.id }}</td>
              <td class="px-4 py-3">
                <strong class="block">{{ user.display_name || user.username }}</strong>
                <span class="text-xs text-gray-500">@{{ user.username }}</span>
              </td>
              <td class="px-4 py-3">{{ user.email || "暂无" }}</td>
              <td class="px-4 py-3">
                <span
                  class="rounded-full px-2 py-1 text-xs"
                  :class="
                    user.status === 1
                      ? 'bg-green-50 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  "
                >
                  {{ user.status === 1 ? "启用" : "停用" }}
                </span>
              </td>
              <td class="px-4 py-3">{{ formatRole(user.role) }}</td>
              <td class="px-4 py-3">{{ formatNumber(user.request_count) }}</td>
              <td class="px-4 py-3">{{ user.last_login_at || "从未登录" }}</td>
              <td class="px-4 py-3">
                <div class="flex gap-3">
                  <button
                    class="cursor-not-allowed text-blue-600 opacity-60"
                    type="button"
                    disabled
                    title="仅展示，暂未开放"
                  >
                    编辑
                  </button>
                  <button
                    class="cursor-not-allowed text-red-600 opacity-60"
                    type="button"
                    disabled
                    title="危险操作，暂未开放"
                  >
                    删除
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section
      v-show="activePanel === 'organizations'"
      class="overflow-hidden rounded-xl border bg-white"
      role="tabpanel"
    >
      <div class="flex items-center justify-between gap-4 border-b p-5">
        <div>
          <h2 class="text-lg font-semibold">企业管理</h2>
          <p class="mt-1 text-sm text-gray-500">共 {{ organizationTotal }} 家企业</p>
        </div>
        <div
          v-if="organizationPageCount > 1"
          class="flex flex-wrap items-center justify-center gap-2"
        >
          <button
            class="rounded border px-3 py-1.5 text-sm disabled:opacity-40"
            type="button"
            :disabled="organizationLoading || organizationPage === 1"
            @click="fetchOrganizations(organizationPage - 1)"
          >
            上一页
          </button>
          <button
            v-for="page in organizationPageNumbers"
            :key="page"
            class="min-w-9 rounded border px-3 py-1.5 text-sm"
            :class="page === organizationPage ? 'bg-black text-white' : 'bg-white'"
            type="button"
            :disabled="organizationLoading"
            @click="fetchOrganizations(page)"
          >
            {{ page }}
          </button>
          <button
            class="rounded border px-3 py-1.5 text-sm disabled:opacity-40"
            type="button"
            :disabled="organizationLoading || organizationPage === organizationPageCount"
            @click="fetchOrganizations(organizationPage + 1)"
          >
            下一页
          </button>
          <span class="text-xs text-gray-500">
            第 {{ organizationPage }} / {{ organizationPageCount }} 页
          </span>
        </div>
        <button
          class="rounded border px-3 py-1.5 text-sm disabled:opacity-50"
          type="button"
          :disabled="organizationLoading"
          @click="fetchOrganizations()"
        >
          {{ organizationLoading ? "加载中..." : "刷新" }}
        </button>
      </div>

      <p
        v-if="organizationError"
        class="m-5 rounded bg-red-50 p-4 text-red-700"
      >
        {{ organizationError }}
      </p>
      <div
        v-if="organizationLoading"
        class="p-10 text-center text-gray-500"
      >
        正在加载企业数据...
      </div>
      <div
        v-else-if="!organizations.length"
        class="p-10 text-center text-gray-500"
      >
        暂无企业数据
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[900px] text-left text-sm">
          <thead class="bg-gray-50 text-xs text-gray-500">
            <tr>
              <th class="px-4 py-3">ID</th>
              <th class="px-4 py-3">企业</th>
              <th class="px-4 py-3">所有者</th>
              <th class="px-4 py-3">状态</th>
              <th class="px-4 py-3">成员</th>
              <th class="px-4 py-3">计费模式</th>
              <th class="px-4 py-3">月用量</th>
              <th class="px-4 py-3">创建时间</th>
              <th class="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr
              v-for="organization in organizations"
              :key="organization.id"
              class="hover:bg-gray-50"
            >
              <td class="px-4 py-3">{{ organization.id }}</td>
              <td class="px-4 py-3">
                <strong class="block">{{ organization.display_name }}</strong>
                <span class="text-xs text-gray-500">{{ organization.name }}</span>
              </td>
              <td class="px-4 py-3">
                <span class="block">{{ organization.owner_username }}</span>
                <span class="text-xs text-gray-500">ID {{ organization.owner_id }}</span>
              </td>
              <td class="px-4 py-3">
                <span
                  class="rounded-full px-2 py-1 text-xs"
                  :class="
                    organization.status === 1
                      ? 'bg-green-50 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  "
                >
                  {{ organization.status === 1 ? "启用" : "停用" }}
                </span>
              </td>
              <td class="px-4 py-3">
                {{ organization.member_count }} / {{ organization.max_members }}
              </td>
              <td class="px-4 py-3">{{ formatBillingMode(organization.billing_mode) }}</td>
              <td class="px-4 py-3">{{ formatNumber(organization.monthly_usage) }}</td>
              <td class="px-4 py-3">{{ formatUnixTime(organization.created_at) }}</td>
              <td class="px-4 py-3">
                <div class="flex gap-3">
                  <button
                    class="cursor-not-allowed text-blue-600 opacity-60"
                    type="button"
                    disabled
                    title="仅展示，暂未开放"
                  >
                    编辑
                  </button>
                  <button
                    class="cursor-not-allowed text-red-600 opacity-60"
                    type="button"
                    disabled
                    title="危险操作，暂未开放"
                  >
                    删除
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section
      v-show="activePanel === 'channels'"
      class="overflow-hidden rounded-xl border bg-white"
      role="tabpanel"
    >
      <div class="flex items-center justify-between gap-4 border-b p-5">
        <div>
          <h2 class="text-lg font-semibold">渠道管理</h2>
          <p class="mt-1 text-sm text-gray-500">共 {{ channelTotal }} 个渠道</p>
        </div>
        <div
          v-if="channelPageCount > 1"
          class="flex flex-wrap items-center justify-center gap-2"
        >
          <button
            class="rounded border px-3 py-1.5 text-sm disabled:opacity-40"
            type="button"
            :disabled="channelLoading || channelPage === 1"
            @click="fetchChannels(channelPage - 1)"
          >
            上一页
          </button>
          <button
            v-for="page in channelPageNumbers"
            :key="page"
            class="min-w-9 rounded border px-3 py-1.5 text-sm"
            :class="page === channelPage ? 'bg-black text-white' : 'bg-white'"
            type="button"
            :disabled="channelLoading"
            @click="fetchChannels(page)"
          >
            {{ page }}
          </button>
          <button
            class="rounded border px-3 py-1.5 text-sm disabled:opacity-40"
            type="button"
            :disabled="channelLoading || channelPage === channelPageCount"
            @click="fetchChannels(channelPage + 1)"
          >
            下一页
          </button>
          <span class="text-xs text-gray-500">
            第 {{ channelPage }} / {{ channelPageCount }} 页
          </span>
        </div>
        <button
          class="rounded border px-3 py-1.5 text-sm disabled:opacity-50"
          type="button"
          :disabled="channelLoading"
          @click="fetchChannels()"
        >
          {{ channelLoading ? "加载中..." : "刷新" }}
        </button>
      </div>

      <p v-if="channelError" class="m-5 rounded bg-red-50 p-4 text-red-700">
        {{ channelError }}
      </p>
      <div v-if="channelLoading" class="p-10 text-center text-gray-500">
        正在加载渠道数据...
      </div>
      <div v-else-if="!channels.length" class="p-10 text-center text-gray-500">
        暂无渠道数据
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[1050px] text-left text-sm">
          <thead class="bg-gray-50 text-xs text-gray-500">
            <tr>
              <th class="px-4 py-3">ID</th>
              <th class="px-4 py-3">渠道</th>
              <th class="px-4 py-3">类型</th>
              <th class="px-4 py-3">状态</th>
              <th class="px-4 py-3">接口地址</th>
              <th class="px-4 py-3">模型数</th>
              <th class="px-4 py-3">响应时间</th>
              <th class="px-4 py-3">优先级</th>
              <th class="px-4 py-3">创建时间</th>
              <th class="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-for="channel in channels" :key="channel.id" class="hover:bg-gray-50">
              <td class="px-4 py-3">{{ channel.id }}</td>
              <td class="px-4 py-3 font-medium">{{ channel.name }}</td>
              <td class="px-4 py-3">{{ channel.type }}</td>
              <td class="px-4 py-3">
                <span
                  class="rounded-full px-2 py-1 text-xs"
                  :class="channel.status === 1 ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'"
                >
                  {{ channel.status === 1 ? "启用" : "停用" }}
                </span>
              </td>
              <td class="max-w-64 truncate px-4 py-3" :title="channel.base_url">
                {{ channel.base_url || "默认地址" }}
              </td>
              <td class="px-4 py-3">
                {{ channel.models ? channel.models.split(",").length : 0 }}
              </td>
              <td class="px-4 py-3">{{ channel.response_time }} ms</td>
              <td class="px-4 py-3">{{ channel.priority }}</td>
              <td class="px-4 py-3">{{ formatUnixTime(channel.created_time) }}</td>
              <td class="px-4 py-3">
                <div class="flex gap-3">
                  <button class="cursor-not-allowed text-blue-600 opacity-60" type="button" disabled>
                    编辑
                  </button>
                  <button class="cursor-not-allowed text-red-600 opacity-60" type="button" disabled>
                    删除
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section
      v-show="activePanel === 'logs'"
      class="overflow-hidden rounded-xl border bg-white"
      role="tabpanel"
    >
      <div class="flex items-center justify-between gap-4 border-b p-5">
        <div>
          <h2 class="text-lg font-semibold">使用日志</h2>
          <p class="mt-1 text-sm text-gray-500">共 {{ logTotal }} 条日志</p>
        </div>
        <div
          v-if="logPageCount > 1"
          class="flex flex-wrap items-center justify-center gap-2"
        >
          <button
            class="rounded border px-3 py-1.5 text-sm disabled:opacity-40"
            type="button"
            :disabled="logLoading || logPage === 1"
            @click="fetchLogs(logPage - 1)"
          >
            上一页
          </button>
          <button
            v-for="page in logPageNumbers"
            :key="page"
            class="min-w-9 rounded border px-3 py-1.5 text-sm"
            :class="page === logPage ? 'bg-black text-white' : 'bg-white'"
            type="button"
            :disabled="logLoading"
            @click="fetchLogs(page)"
          >
            {{ page }}
          </button>
          <button
            class="rounded border px-3 py-1.5 text-sm disabled:opacity-40"
            type="button"
            :disabled="logLoading || logPage === logPageCount"
            @click="fetchLogs(logPage + 1)"
          >
            下一页
          </button>
          <span class="text-xs text-gray-500">
            第 {{ logPage }} / {{ logPageCount }} 页
          </span>
        </div>
        <button
          class="rounded border px-3 py-1.5 text-sm disabled:opacity-50"
          type="button"
          :disabled="logLoading"
          @click="fetchLogs()"
        >
          {{ logLoading ? "加载中..." : "刷新" }}
        </button>
      </div>

      <p v-if="logError" class="m-5 rounded bg-red-50 p-4 text-red-700">
        {{ logError }}
      </p>
      <div v-if="logLoading" class="p-10 text-center text-gray-500">
        正在加载使用日志...
      </div>
      <div v-else-if="!logs.length" class="p-10 text-center text-gray-500">
        暂无使用日志
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[980px] text-left text-sm">
          <thead class="bg-gray-50 text-xs text-gray-500">
            <tr>
              <th class="px-4 py-3">ID</th>
              <th class="px-4 py-3">时间</th>
              <th class="px-4 py-3">用户</th>
              <th class="px-4 py-3">密钥</th>
              <th class="px-4 py-3">模型</th>
              <th class="px-4 py-3">渠道</th>
              <th class="px-4 py-3">Token</th>
              <th class="px-4 py-3">额度</th>
              <th class="px-4 py-3">耗时</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-for="log in logs" :key="log.id" class="hover:bg-gray-50">
              <td class="px-4 py-3">{{ log.id }}</td>
              <td class="whitespace-nowrap px-4 py-3">{{ formatUnixTime(log.created_at) }}</td>
              <td class="px-4 py-3">{{ log.username }}</td>
              <td class="px-4 py-3">{{ log.token_name || "未命名" }}</td>
              <td class="px-4 py-3">{{ log.model_name }}</td>
              <td class="px-4 py-3">{{ log.channel_name || log.channel }}</td>
              <td class="px-4 py-3">
                {{ formatNumber(log.prompt_tokens) }} + {{ formatNumber(log.completion_tokens) }}
              </td>
              <td class="px-4 py-3">{{ formatNumber(log.quota) }}</td>
              <td class="px-4 py-3">{{ log.use_time }} s</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
  type PanelId = "users" | "organizations" | "channels" | "logs";

  type AdminUser = {
    id: number;
    username: string;
    display_name: string;
    email: string;
    role: number;
    status: number;
    request_count: number;
    last_login_at: string;
    org_id: number;
  };

  type Organization = {
    id: number;
    name: string;
    display_name: string;
    owner_id: number;
    owner_username: string;
    status: number;
    max_members: number;
    billing_mode: string;
    created_at: number;
    member_count: number;
    monthly_usage: number;
  };

  type Channel = {
    id: number;
    type: number;
    status: number;
    name: string;
    base_url: string;
    models: string;
    priority: number;
    response_time: number;
    created_time: number;
  };

  type UsageLog = {
    id: number;
    created_at: number;
    username: string;
    token_name: string;
    model_name: string;
    quota: number;
    prompt_tokens: number;
    completion_tokens: number;
    use_time: number;
    channel: number;
    channel_name: string;
  };

  const panels: Array<{ id: PanelId; label: string }> = [
    { id: "users", label: "用户管理" },
    { id: "organizations", label: "企业管理" },
    { id: "channels", label: "渠道管理" },
    { id: "logs", label: "使用日志" },
  ];
  const pageSize = 10;
  const activePanel = ref<PanelId>("users");
  const userIdCookie = useCookie<string | null>("eng_link_user_id", {
    path: "/",
    sameSite: "lax",
    secure: import.meta.env.PROD,
  });
  const users = ref<AdminUser[]>([]);
  const userTotal = ref(0);
  const userPage = ref(1);
  const userLoading = ref(false);
  const userError = ref("");
  const organizations = ref<Organization[]>([]);
  const organizationTotal = ref(0);
  const organizationPage = ref(1);
  const organizationLoading = ref(false);
  const organizationLoaded = ref(false);
  const organizationError = ref("");
  const channels = ref<Channel[]>([]);
  const channelTotal = ref(0);
  const channelPage = ref(1);
  const channelLoading = ref(false);
  const channelLoaded = ref(false);
  const channelError = ref("");
  const logs = ref<UsageLog[]>([]);
  const logTotal = ref(0);
  const logPage = ref(1);
  const logLoading = ref(false);
  const logLoaded = ref(false);
  const logError = ref("");

  const formatNumber = (value: number) =>
    new Intl.NumberFormat("zh-CN").format(value ?? 0);
  const formatUnixTime = (timestamp: number) =>
    timestamp > 0
      ? new Intl.DateTimeFormat("zh-CN", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(timestamp * 1000))
      : "暂无";
  const formatRole = (role: number) =>
    role === 10 ? "管理员" : role === 1 ? "普通用户" : String(role);
  const formatBillingMode = (mode: string) =>
    mode === "postpaid" ? "后付费" : mode === "prepaid" ? "预付费" : mode;
  const getErrorMessage = (error: unknown, fallback: string) =>
    (error as { data?: { message?: string } }).data?.message ??
    (error instanceof Error ? error.message : fallback);
  const getPageNumbers = (current: number, total: number) => {
    const count = Math.min(5, total);
    const start = Math.min(
      Math.max(1, current - 2),
      Math.max(1, total - count + 1),
    );
    return Array.from({ length: count }, (_, index) => start + index);
  };
  const userPageCount = computed(() =>
    Math.max(1, Math.ceil(userTotal.value / pageSize)),
  );
  const userPageNumbers = computed(() =>
    getPageNumbers(userPage.value, userPageCount.value),
  );
  const organizationPageCount = computed(() =>
    Math.max(1, Math.ceil(organizationTotal.value / pageSize)),
  );
  const organizationPageNumbers = computed(() =>
    getPageNumbers(organizationPage.value, organizationPageCount.value),
  );
  const channelPageCount = computed(() =>
    Math.max(1, Math.ceil(channelTotal.value / pageSize)),
  );
  const channelPageNumbers = computed(() =>
    getPageNumbers(channelPage.value, channelPageCount.value),
  );
  const logPageCount = computed(() =>
    Math.max(1, Math.ceil(logTotal.value / pageSize)),
  );
  const logPageNumbers = computed(() =>
    getPageNumbers(logPage.value, logPageCount.value),
  );

  const fetchUsers = async (page = userPage.value) => {
    if (!userIdCookie.value) return;
    const nextPage = Math.max(1, Math.trunc(page));
    userLoading.value = true;
    userError.value = "";

    try {
      const result = await $fetch<{
        success: boolean;
        message?: string;
        data?: { total: number; items: AdminUser[] };
      }>("/api/eng-link/user", {
        credentials: "include",
        headers: { "New-Api-User": userIdCookie.value },
        query: { p: nextPage - 1, page_size: pageSize },
      });
      if (!result.success || !result.data) {
        throw new Error(result.message || "用户数据加载失败");
      }
      users.value = result.data.items;
      userTotal.value = result.data.total;
      userPage.value = nextPage;
    } catch (error) {
      userError.value = getErrorMessage(error, "用户数据加载失败");
    } finally {
      userLoading.value = false;
    }
  };

  const fetchOrganizations = async (page = organizationPage.value) => {
    if (!userIdCookie.value) return;
    const nextPage = Math.max(1, Math.trunc(page));
    organizationLoading.value = true;
    organizationError.value = "";

    try {
      const result = await $fetch<{
        success: boolean;
        message?: string;
        data?: { total: number; items: Organization[] };
      }>("/api/eng-link/admin/org", {
        credentials: "include",
        headers: { "New-Api-User": userIdCookie.value },
        query: { p: nextPage - 1, page_size: pageSize },
      });
      if (!result.success || !result.data) {
        throw new Error(result.message || "企业数据加载失败");
      }
      organizations.value = result.data.items;
      organizationTotal.value = result.data.total;
      organizationPage.value = nextPage;
      organizationLoaded.value = true;
    } catch (error) {
      organizationError.value = getErrorMessage(error, "企业数据加载失败");
    } finally {
      organizationLoading.value = false;
    }
  };

  const fetchChannels = async (page = channelPage.value) => {
    if (!userIdCookie.value) return;
    const nextPage = Math.max(1, Math.trunc(page));
    channelLoading.value = true;
    channelError.value = "";

    try {
      const result = await $fetch<{
        success: boolean;
        message?: string;
        data?: { total: number; items: Channel[] };
      }>("/api/eng-link/channel", {
        credentials: "include",
        headers: { "New-Api-User": userIdCookie.value },
        query: {
          p: nextPage,
          page_size: pageSize,
          id_sort: false,
          tag_mode: false,
        },
      });
      if (!result.success || !result.data) {
        throw new Error(result.message || "渠道数据加载失败");
      }
      channels.value = result.data.items;
      channelTotal.value = result.data.total;
      channelPage.value = nextPage;
      channelLoaded.value = true;
    } catch (error) {
      channelError.value = getErrorMessage(error, "渠道数据加载失败");
    } finally {
      channelLoading.value = false;
    }
  };

  const fetchLogs = async (page = logPage.value) => {
    if (!userIdCookie.value) return;
    const nextPage = Math.max(1, Math.trunc(page));
    logLoading.value = true;
    logError.value = "";

    try {
      const result = await $fetch<{
        success: boolean;
        message?: string;
        data?: { total: number; items: UsageLog[] };
      }>("/api/eng-link/log", {
        credentials: "include",
        headers: { "New-Api-User": userIdCookie.value },
        query: {
          p: nextPage,
          page_size: pageSize,
          type: 0,
          username: "",
          token_name: "",
          model_name: "",
          start_timestamp: 1788364800,
          end_timestamp: 1788417294,
          channel: "",
          group: "",
          request_id: "",
        },
      });
      if (!result.success || !result.data) {
        throw new Error(result.message || "使用日志加载失败");
      }
      logs.value = result.data.items;
      logTotal.value = result.data.total;
      logPage.value = nextPage;
      logLoaded.value = true;
    } catch (error) {
      logError.value = getErrorMessage(error, "使用日志加载失败");
    } finally {
      logLoading.value = false;
    }
  };

  const selectPanel = (panel: PanelId) => {
    activePanel.value = panel;
    if (panel === "organizations" && !organizationLoaded.value) {
      void fetchOrganizations();
    }
    if (panel === "channels" && !channelLoaded.value) {
      void fetchChannels();
    }
    if (panel === "logs" && !logLoaded.value) {
      void fetchLogs();
    }
  };

  const exitLogin = async () => {
    userIdCookie.value = null;
    users.value = [];
    organizations.value = [];
    channels.value = [];
    logs.value = [];
    await navigateTo("/morse/login");
  };

  onMounted(() => void fetchUsers());
</script>
