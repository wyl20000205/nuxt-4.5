<template>
  <main class="mx-auto max-w-5xl space-y-5 p-6">
    <header class="flex items-center justify-between gap-4">
      <h1 class="text-2xl font-semibold">Eng Link 用户页面</h1>
      <button
        class="cursor-pointer text-sm font-medium text-red-600 hover:text-red-700"
        type="button"
        @click="exitLogin"
      >
        退出登录
      </button>
    </header>
    <nav
      class="grid grid-cols-2 rounded-lg bg-gray-100 p-1 md:grid-cols-5"
      role="tablist"
      aria-label="用户页面导航"
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
      v-show="activePanel === 'profile'"
      class="overflow-hidden rounded-xl border bg-white"
      role="tabpanel"
    >
      <div class="flex flex-wrap items-center gap-4 border-b p-5">
        <div
          class="flex size-14 items-center justify-center rounded-full bg-black text-xl font-semibold text-white"
        >
          {{ userInfo?.display_name?.slice(0, 1).toUpperCase() || "U" }}
        </div>
        <div class="min-w-0 flex-1">
          <h2 class="truncate text-xl font-semibold">
            {{ userInfo?.display_name || "用户信息" }}
          </h2>
          <p class="truncate text-sm text-gray-500">
            {{ userInfo ? `@${userInfo.username}` : "正在读取账号信息" }}
          </p>
        </div>
        <button
          class="rounded border px-3 py-1.5 text-sm disabled:opacity-50"
          type="button"
          :disabled="userLoading"
          @click="fetchUserInfo"
        >
          {{ userLoading ? "加载中..." : "刷新" }}
        </button>
      </div>

      <p v-if="userError" class="m-5 rounded bg-red-50 p-4 text-red-700">
        {{ userError }}
      </p>

      <div v-else-if="userLoading" class="p-8 text-center text-gray-500">
        正在加载用户信息...
      </div>

      <div v-else-if="userInfo" class="space-y-6 p-5">
        <dl class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div class="rounded-lg bg-gray-50 p-4">
            <dt class="text-xs text-gray-500">用户 ID</dt>
            <dd class="mt-1 font-semibold">{{ userInfo.id }}</dd>
          </div>
          <div class="rounded-lg bg-gray-50 p-4">
            <dt class="text-xs text-gray-500">邮箱</dt>
            <dd class="mt-1 truncate font-semibold">{{ userInfo.email }}</dd>
          </div>
          <div class="rounded-lg bg-gray-50 p-4">
            <dt class="text-xs text-gray-500">用户组</dt>
            <dd class="mt-1 font-semibold">{{ userInfo.group }}</dd>
          </div>
          <div class="rounded-lg bg-gray-50 p-4">
            <dt class="text-xs text-gray-500">账号状态</dt>
            <dd class="mt-1 font-semibold">{{ accountStatus }}</dd>
          </div>
          <div class="rounded-lg bg-gray-50 p-4">
            <dt class="text-xs text-gray-500">角色等级</dt>
            <dd class="mt-1 font-semibold">{{ userInfo.role }}</dd>
          </div>
          <div class="rounded-lg bg-gray-50 p-4">
            <dt class="text-xs text-gray-500">请求次数</dt>
            <dd class="mt-1 font-semibold">
              {{ formatNumber(userInfo.request_count) }}
            </dd>
          </div>
        </dl>

        <div class="rounded-lg border p-4">
          <div class="mb-3 flex items-center justify-between gap-4">
            <h3 class="font-semibold">额度使用情况</h3>
            <span class="text-sm text-gray-500">
              {{ quotaUsagePercent }}%
            </span>
          </div>
          <div class="h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              class="h-full rounded-full bg-black transition-all"
              :style="{ width: `${quotaUsagePercent}%` }"
            ></div>
          </div>
          <dl class="mt-4 grid grid-cols-3 gap-3 text-sm">
            <div>
              <dt class="text-gray-500">总额度</dt>
              <dd class="mt-1 font-semibold">{{ formatNumber(userInfo.quota) }}</dd>
            </div>
            <div>
              <dt class="text-gray-500">已使用</dt>
              <dd class="mt-1 font-semibold">
                {{ formatNumber(userInfo.used_quota) }}
              </dd>
            </div>
            <div>
              <dt class="text-gray-500">剩余额度</dt>
              <dd class="mt-1 font-semibold">{{ formatNumber(remainingQuota) }}</dd>
            </div>
          </dl>
        </div>

        <dl class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div class="rounded-lg border p-4">
            <dt class="text-xs text-gray-500">推广码</dt>
            <dd class="mt-1 font-semibold">{{ userInfo.aff_code || "暂无" }}</dd>
          </div>
          <div class="rounded-lg border p-4">
            <dt class="text-xs text-gray-500">邀请人数</dt>
            <dd class="mt-1 font-semibold">{{ userInfo.aff_count }}</dd>
          </div>
          <div class="rounded-lg border p-4">
            <dt class="text-xs text-gray-500">推广额度</dt>
            <dd class="mt-1 font-semibold">
              {{ formatNumber(userInfo.aff_quota) }}
            </dd>
          </div>
          <div class="rounded-lg border p-4">
            <dt class="text-xs text-gray-500">邀请人 ID</dt>
            <dd class="mt-1 font-semibold">{{ userInfo.inviter_id || "暂无" }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <section
      v-show="activePanel === 'tokens'"
      class="overflow-hidden rounded-xl border bg-white"
      role="tabpanel"
    >
      <div class="flex items-center justify-between gap-4 border-b p-5">
        <div>
          <h2 class="text-lg font-semibold">密钥管理</h2>
          <p class="mt-1 text-sm text-gray-500">
            共 {{ tokenTotal }} 个密钥
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button
            class="rounded bg-black px-3 py-1.5 text-sm text-white disabled:opacity-50"
            type="button"
            :disabled="tokenLoading || tokenCreating"
            @click="createToken"
          >
            {{ tokenCreating ? "添加中..." : "添加密钥" }}
          </button>
          <button
            class="cursor-not-allowed rounded border border-red-300 px-3 py-1.5 text-sm text-red-600 opacity-60"
            type="button"
            disabled
            title="展示功能，暂未开放"
          >
            批量删除密钥
          </button>
          <button
            class="rounded border px-3 py-1.5 text-sm disabled:opacity-50"
            type="button"
            :disabled="tokenLoading || tokenCreating"
            @click="fetchTokens"
          >
            {{ tokenLoading ? "加载中..." : "刷新" }}
          </button>
        </div>
      </div>

      <p v-if="tokenError" class="m-5 rounded bg-red-50 p-4 text-red-700">
        {{ tokenError }}
      </p>
      <p
        v-if="tokenActionError"
        class="mx-5 mt-5 rounded bg-red-50 p-4 text-red-700"
      >
        {{ tokenActionError }}
      </p>

      <div v-if="tokenLoading" class="p-8 text-center text-gray-500">
        正在加载密钥...
      </div>

      <div v-else-if="!tokens.length" class="p-8 text-center text-gray-500">
        暂无密钥
      </div>

      <div v-else class="divide-y">
        <article v-for="token in tokens" :key="token.id" class="space-y-4 p-5">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-semibold">{{ token.name || "未命名密钥" }}</h3>
                <span
                  class="rounded-full px-2 py-0.5 text-xs"
                  :class="
                    token.status === 1
                      ? 'bg-green-50 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  "
                >
                  {{ token.status === 1 ? "启用" : "禁用" }}
                </span>
              </div>
              <div class="mt-2 flex flex-wrap items-center gap-3">
                <code class="min-w-0 flex-1 break-all text-sm text-gray-600">
                  {{ revealedTokenKeys[token.id] || token.key }}
                </code>
                <button
                  class="text-sm text-blue-600 disabled:opacity-50"
                  type="button"
                  :disabled="
                    tokenKeyLoadingId === token.id ||
                    tokenDeletingId === token.id
                  "
                  @click="toggleTokenKey(token)"
                >
                  {{
                    revealedTokenKeys[token.id]
                      ? "隐藏"
                      : tokenKeyLoadingId === token.id
                        ? "读取中..."
                        : "查看"
                  }}
                </button>
                <button
                  class="text-sm text-blue-600 disabled:opacity-50"
                  type="button"
                  :disabled="
                    tokenKeyLoadingId === token.id ||
                    tokenDeletingId === token.id
                  "
                  @click="copyTokenKey(token)"
                >
                  {{ copiedTokenId === token.id ? "已复制" : "复制" }}
                </button>
                <button
                  class="text-sm text-red-600 disabled:opacity-50"
                  type="button"
                  :disabled="
                    tokenKeyLoadingId === token.id ||
                    tokenDeletingId === token.id
                  "
                  @click="deleteToken(token)"
                >
                  {{ tokenDeletingId === token.id ? "删除中..." : "删除" }}
                </button>
              </div>
            </div>
            <span class="text-xs text-gray-400">ID {{ token.id }}</span>
          </div>

          <dl class="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div class="rounded-lg bg-gray-50 p-3">
              <dt class="text-xs text-gray-500">额度</dt>
              <dd class="mt-1 font-medium">
                {{
                  token.unlimited_quota
                    ? "无限额度"
                    : formatNumber(token.remain_quota)
                }}
              </dd>
            </div>
            <div class="rounded-lg bg-gray-50 p-3">
              <dt class="text-xs text-gray-500">已使用</dt>
              <dd class="mt-1 font-medium">
                {{ formatNumber(token.used_quota) }}
              </dd>
            </div>
            <div class="rounded-lg bg-gray-50 p-3">
              <dt class="text-xs text-gray-500">创建时间</dt>
              <dd class="mt-1 font-medium">
                {{ formatUnixTime(token.created_time) }}
              </dd>
            </div>
            <div class="rounded-lg bg-gray-50 p-3">
              <dt class="text-xs text-gray-500">最近使用</dt>
              <dd class="mt-1 font-medium">
                {{ formatUnixTime(token.accessed_time, "从未使用") }}
              </dd>
            </div>
            <div class="rounded-lg bg-gray-50 p-3">
              <dt class="text-xs text-gray-500">过期时间</dt>
              <dd class="mt-1 font-medium">
                {{
                  token.expired_time === -1
                    ? "永不过期"
                    : formatUnixTime(token.expired_time)
                }}
              </dd>
            </div>
            <div class="rounded-lg bg-gray-50 p-3">
              <dt class="text-xs text-gray-500">用户组</dt>
              <dd class="mt-1 font-medium">{{ token.group || "默认" }}</dd>
            </div>
            <div class="rounded-lg bg-gray-50 p-3">
              <dt class="text-xs text-gray-500">模型限制</dt>
              <dd class="mt-1 font-medium">
                {{ token.model_limits_enabled ? token.model_limits || "已启用" : "无限制" }}
              </dd>
            </div>
            <div class="rounded-lg bg-gray-50 p-3">
              <dt class="text-xs text-gray-500">允许 IP</dt>
              <dd class="mt-1 break-all font-medium">
                {{ token.allow_ips || "无限制" }}
              </dd>
            </div>
          </dl>
        </article>
      </div>
    </section>

    <section
      v-show="activePanel === 'topup'"
      class="overflow-hidden rounded-xl border bg-white"
      role="tabpanel"
    >
      <div class="border-b p-5">
        <h2 class="text-lg font-semibold">微信充值</h2>
        <p class="mt-1 text-sm text-gray-500">
          创建订单后使用微信扫描二维码完成支付
        </p>
      </div>

      <div class="grid gap-6 p-5 md:grid-cols-2">
        <form class="space-y-4" @submit.prevent="createTopup">
          <label class="block text-sm font-medium">
            充值金额
            <input
              v-model.number="topupAmount"
              class="mt-2 w-full rounded border px-3 py-2"
              type="number"
              min="0.01"
              step="0.01"
              required
            />
          </label>
          <button
            class="w-full rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
            type="submit"
            :disabled="topupCreating || topupPending"
          >
            {{ topupCreating ? "正在创建订单..." : "生成支付二维码" }}
          </button>
          <p v-if="topupError" class="rounded bg-red-50 p-3 text-sm text-red-700">
            {{ topupError }}
          </p>
        </form>

        <div
          v-if="topupTradeNo"
          class="space-y-4 rounded-lg border p-4 text-center"
        >
          <img
            v-if="topupQrDataUrl"
            class="mx-auto size-64 max-w-full"
            :src="topupQrDataUrl"
            alt="微信支付二维码"
          />
          <p class="text-sm">
            订单状态：<strong>{{ topupStatusText }}</strong>
          </p>
          <code class="block break-all text-xs text-gray-500">
            {{ topupTradeNo }}
          </code>
          <button
            class="rounded border px-3 py-1.5 text-sm disabled:opacity-50"
            type="button"
            :disabled="topupChecking"
            @click="checkTopupStatus"
          >
            {{ topupChecking ? "查询中..." : "查询订单" }}
          </button>
        </div>
        <div
          v-else
          class="flex min-h-72 items-center justify-center rounded-lg bg-gray-50 text-sm text-gray-400"
        >
          支付二维码将在这里显示
        </div>
      </div>
    </section>

    <section
      v-show="activePanel === 'models'"
      class="overflow-hidden rounded-xl border bg-white"
      role="tabpanel"
    >
      <div class="flex flex-wrap items-center gap-3 border-b p-5">
        <div class="min-w-0 flex-1">
          <h2 class="text-lg font-semibold">模型使用</h2>
          <p class="mt-1 text-sm text-gray-500">
            使用当前账号的首个启用密钥发送请求
          </p>
        </div>
        <select
          v-model="selectedModel"
          class="min-w-64 rounded border bg-white px-3 py-2 text-sm"
          :disabled="modelLoading || !modelOptions.length"
          aria-label="选择模型"
        >
          <option v-for="model in modelOptions" :key="model.id" :value="model.id">
            [{{ modelKindLabels[model.kind] }}] {{ model.id }}
          </option>
        </select>
        <button
          class="rounded border px-3 py-2 text-sm disabled:opacity-50"
          type="button"
          :disabled="modelLoading"
          @click="fetchModels"
        >
          {{ modelLoading ? "加载中..." : "刷新模型" }}
        </button>
      </div>

      <p v-if="modelError" class="m-5 rounded bg-red-50 p-4 text-red-700">
        {{ modelError }}
      </p>

      <div v-if="modelLoading" class="p-8 text-center text-gray-500">
        正在加载模型...
      </div>

      <div
        v-else-if="!modelOptions.length"
        class="p-8 text-center text-gray-500"
      >
        当前用户没有可用模型
      </div>

      <div v-else class="space-y-4 p-5">
        <div class="flex items-center gap-2 text-sm">
          <span class="text-gray-500">当前类型</span>
          <strong>{{ modelKindLabels[selectedModelKind] }}</strong>
        </div>

        <label
          v-if="selectedModelKind === 'text'"
          class="text-sm font-medium hidden"
        >
          系统上下文
          <textarea
            v-model="systemPrompt"
            class="mt-2 min-h-20 w-full resize-y rounded border p-3 font-normal"
            placeholder="You are a helpful assistant."
          ></textarea>
        </label>

        <div
          v-if="selectedModelKind === 'text'"
          class="h-80 space-y-3 overflow-y-auto rounded-lg bg-gray-50 p-4"
        >
          <p v-if="!chatMessages.length" class="text-center text-gray-400">
            输入内容开始对话
          </p>
          <div
            v-for="(message, index) in chatMessages"
            :key="index"
            class="flex"
            :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
          >
            <p
              class="max-w-[80%] whitespace-pre-wrap rounded-lg px-4 py-2 text-sm"
              :class="
                message.role === 'user'
                  ? 'bg-black text-white'
                  : 'border bg-white text-gray-800'
              "
            >
              {{ message.content }}
            </p>
          </div>
        </div>

        <div class="space-y-3 rounded-lg border p-4">
          <textarea
            v-model="modelPrompt"
            class="min-h-24 w-full resize-y rounded border p-3 text-sm"
            :placeholder="modelPromptPlaceholder"
            @keydown.ctrl.enter.prevent="sendModelRequest"
          ></textarea>

          <div class="flex flex-wrap items-center gap-3">
            <template v-if="selectedModelKind === 'image'">
              <label class="text-sm text-gray-600">
                图片尺寸
                <select v-model="imageSize" class="ml-2 rounded border px-2 py-1">
                  <option value="2048x2048">2048x2048</option>
                  <option value="2560x1440">2560x1440</option>
                  <option value="1440x2560">1440x2560</option>
                </select>
              </label>
            </template>
            <template v-if="selectedModelKind === 'video'">
              <label class="text-sm text-gray-600">
                比例
                <select v-model="videoRatio" class="ml-2 rounded border px-2 py-1">
                  <option value="16:9">16:9</option>
                  <option value="9:16">9:16</option>
                  <option value="1:1">1:1</option>
                </select>
              </label>
              <label class="text-sm text-gray-600">
                时长
                <select v-model.number="videoDuration" class="ml-2 rounded border px-2 py-1">
                  <option :value="5">5 秒</option>
                  <option :value="10">10 秒</option>
                </select>
              </label>
            </template>
            <button
              class="ml-auto rounded bg-black px-5 py-2 text-sm text-white disabled:opacity-50"
              type="button"
              :disabled="!canSendModelRequest || modelSending"
              @click="sendModelRequest"
            >
              {{ modelSending ? "发送中..." : "发送" }}
            </button>
          </div>
        </div>

        <div
          v-if="selectedModelKind !== 'text'"
          class="grid items-start gap-4 md:grid-cols-2"
        >
          <div class="rounded-lg border border-dashed p-4">
            <label class="block cursor-pointer text-sm font-medium">
              {{
                selectedModelKind === "image-edit"
                  ? "上传需要编辑的图片"
                  : "上传参考图片（可选）"
              }}
              <input
                class="mt-2 block w-full text-sm"
                type="file"
                accept="image/*"
                @change="handleEditImage"
              />
            </label>
            <img
              v-if="editImagePreview"
              class="mt-4 max-h-64 w-full rounded-lg object-contain"
              :src="editImagePreview"
              alt="参考图片预览"
            />
          </div>

          <div v-if="generatedImages.length" class="grid gap-4">
            <img
              v-for="(image, index) in generatedImages"
              :key="index"
              class="w-full rounded-lg border object-contain"
              :src="image"
              :alt="`生成图片 ${index + 1}`"
            />
          </div>

          <div
            v-else-if="selectedModelKind === 'video' && videoTaskId"
            class="min-w-0 space-y-3 rounded-lg border p-4"
          >
            <div class="flex flex-wrap items-center gap-3">
              <strong>视频任务</strong>
              <code class="min-w-0 flex-1 break-all text-xs">{{ videoTaskId }}</code>
              <span class="rounded bg-gray-100 px-2 py-1 text-xs">
                {{ videoTaskStatus || "等待查询" }}
              </span>
              <button
                class="rounded border px-3 py-1 text-sm disabled:opacity-50"
                type="button"
                :disabled="videoQuerying"
                @click="queryVideoTask"
              >
                {{ videoQuerying ? "查询中..." : "查询状态" }}
              </button>
            </div>
            <video
              v-if="videoResultUrl"
              class="max-h-96 w-full rounded-lg bg-black"
              :src="videoResultUrl"
              controls
            ></video>
            <pre
              v-if="videoTaskResult"
              class="max-h-64 overflow-auto rounded bg-gray-950 p-3 text-xs text-gray-100"
              >{{ videoTaskResult }}</pre
            >
          </div>
        </div>
      </div>
    </section>

    <section
      v-show="activePanel === 'api'"
      class="overflow-hidden rounded border md:grid md:grid-cols-[280px_1fr]"
      role="tabpanel"
    >
      <aside class="border-b md:border-b-0 md:border-r">
        <div class="flex items-center justify-between border-b p-3">
          <strong>接口列表</strong>
          <button
            class="rounded bg-black px-3 py-1 text-sm text-white disabled:opacity-50"
            type="button"
            :disabled="!userId || runningAll"
            @click="runAll"
          >
            {{ runningAll ? "测试中..." : "全部测试" }}
          </button>
        </div>

        <button
          v-for="(item, index) in tests"
          :key="item.name"
          class="flex w-full items-center gap-2 border-b px-3 py-3 text-left last:border-b-0"
          :class="selectedIndex === index ? 'bg-gray-100' : 'hover:bg-gray-50'"
          type="button"
          @click="selectedIndex = index"
        >
          <span class="w-12 text-xs font-semibold">{{ item.method }}</span>
          <span class="min-w-0 flex-1 truncate">{{ item.name }}</span>
          <span class="text-xs text-red-500">{{ item.status }}</span>
        </button>
      </aside>

      <article class="min-w-0 p-4">
        <div class="flex flex-wrap items-center gap-3">
          <strong>{{ selected.method }} {{ selected.name }}</strong>
          <span class="rounded bg-gray-100 px-2 py-1 text-sm">
            {{ selected.status }}
          </span>
          <button
            class="ml-auto rounded border px-3 py-1 disabled:opacity-50"
            type="button"
            :disabled="
              !userId || selected.loading || (selected.tokenKey && !tokenId)
            "
            @click="runTest(selected)"
          >
            {{ selected.loading ? "请求中..." : "测试当前接口" }}
          </button>
        </div>

        <code class="mt-3 block break-all rounded bg-gray-100 p-3 text-sm">
          {{ formatUrl(selected) }}
        </code>

        <textarea
          v-if="selected.method === 'POST' && selected.body !== undefined"
          v-model="selected.body"
          class="mt-3 min-h-20 w-full rounded border p-2 font-mono"
          placeholder="POST JSON 请求体"
        />

        <h2 class="mt-4 font-medium">响应体</h2>
        <pre
          class="mt-2 min-h-80 max-h-[60vh] overflow-auto rounded bg-gray-950 p-4 text-xs text-gray-100"
          >{{ selected.result || "等待请求" }}</pre
        >
      </article>
    </section>
  </main>
</template>

<script setup lang="ts">
  // @ts-expect-error qrcode 没有自带 TypeScript 类型声明
  // import qrcode from "qrcode";

  type PanelId = "profile" | "tokens" | "topup" | "models" | "api";
  type ModelKind = "text" | "image" | "image-edit" | "video";

  type UserInfo = {
    id: number;
    username: string;
    display_name: string;
    email: string;
    group: string;
    quota: number;
    used_quota: number;
    request_count: number;
    status: number;
    role: number;
    aff_code: string;
    aff_count: number;
    aff_quota: number;
    inviter_id: number;
  };

  type ApiToken = {
    id: number;
    key: string;
    status: number;
    name: string;
    created_time: number;
    accessed_time: number;
    expired_time: number;
    remain_quota: number;
    unlimited_quota: boolean;
    used_quota: number;
    group: string;
    model_limits_enabled: boolean;
    model_limits: string;
    allow_ips: string;
  };

  type ModelListEntry =
    | string
    | { id?: string; name?: string; model?: string };
  type ModelOption = { id: string; kind: ModelKind };
  type ChatMessage = { role: "user" | "assistant"; content: string };
  type VideoTaskResponse = {
    output?: Record<string, unknown>;
    data?: Record<string, unknown>;
    request_id?: string;
    model?: string;
  };
  type TopupItem = {
    trade_no: string;
    amount: number;
    status: string;
    create_time: number;
    complete_time: number;
  };

  const panels: Array<{ id: PanelId; label: string }> = [
    { id: "profile", label: "用户信息" },
    { id: "models", label: "模型使用" },
    { id: "tokens", label: "密钥管理" },
    { id: "topup", label: "充值系统" },
    { id: "api", label: "接口列表" },
  ];
  const activePanel = ref<PanelId>("profile");
  const userIdCookie = useCookie<string | null>("eng_link_user_id", {
    path: "/",
    sameSite: "lax",
    secure: import.meta.env.PROD,
  });
  const userInfo = ref<UserInfo>();
  const userLoading = ref(false);
  const userError = ref("");
  const tokens = ref<ApiToken[]>([]);
  const tokenTotal = ref(0);
  const tokenId = ref<number>();
  const tokenLoading = ref(false);
  const tokenCreating = ref(false);
  const tokenLoaded = ref(false);
  const tokenError = ref("");
  const tokenActionError = ref("");
  const tokenKeyLoadingId = ref<number>();
  const tokenDeletingId = ref<number>();
  const copiedTokenId = ref<number>();
  const revealedTokenKeys = reactive<Record<number, string>>({});
  const modelOptions = ref<ModelOption[]>([]);
  const selectedModel = ref("");
  const modelLoading = ref(false);
  const modelsLoaded = ref(false);
  const modelSending = ref(false);
  const modelError = ref("");
  const modelPrompt = ref("");
  const systemPrompt = ref("You are a helpful assistant.");
  const chatMessages = ref<ChatMessage[]>([]);
  const generatedImages = ref<string[]>([]);
  const editImageFile = ref<File>();
  const editImagePreview = ref("");
  const imageSize = ref("2048x2048");
  const videoRatio = ref("16:9");
  const videoDuration = ref(5);
  const videoTaskId = ref("");
  const videoTaskStatus = ref("");
  const videoTaskResult = ref("");
  const videoResultUrl = ref("");
  const videoQuerying = ref(false);
  const topupAmount = ref(1);
  const topupCreating = ref(false);
  const topupChecking = ref(false);
  const topupError = ref("");
  const topupCodeUrl = ref("");
  const topupQrDataUrl = ref("");
  const topupTradeNo = ref("");
  const topupStatus = ref("");
  const modelKindLabels: Record<ModelKind, string> = {
    text: "文本对话",
    image: "文生图",
    "image-edit": "图生图",
    video: "视频生成",
  };
  let copiedTokenTimer: ReturnType<typeof setTimeout> | undefined;
  let videoPollTimer: ReturnType<typeof setInterval> | undefined;
  let videoPollAttempts = 0;
  let topupPollTimer: ReturnType<typeof setInterval> | undefined;
  let topupPollAttempts = 0;
  const userId = computed(() => {
    const id = Number(userInfo.value?.id ?? userIdCookie.value);
    return Number.isInteger(id) && id > 0 ? id : undefined;
  });
  const remainingQuota = computed(() =>
    Math.max(0, (userInfo.value?.quota ?? 0) - (userInfo.value?.used_quota ?? 0)),
  );
  const quotaUsagePercent = computed(() => {
    const quota = userInfo.value?.quota ?? 0;
    if (quota <= 0) return 0;
    return Math.min(
      100,
      Math.round(((userInfo.value?.used_quota ?? 0) / quota) * 100),
    );
  });
  const accountStatus = computed(() =>
    userInfo.value?.status === 1 ? "正常" : "已停用",
  );
  const selectedModelKind = computed<ModelKind>(
    () =>
      modelOptions.value.find((item) => item.id === selectedModel.value)?.kind ??
      "text",
  );
  const modelPromptPlaceholder = computed(() => {
    const placeholders: Record<ModelKind, string> = {
      text: "输入消息，Ctrl + Enter 发送",
      image: "描述要生成的图片",
      "image-edit": "描述要如何修改上传的图片",
      video: "描述要生成的视频",
    };
    return placeholders[selectedModelKind.value];
  });
  const canSendModelRequest = computed(
    () =>
      Boolean(selectedModel.value && modelPrompt.value.trim()) &&
      (selectedModelKind.value !== "image-edit" || Boolean(editImageFile.value)),
  );
  const topupPending = computed(() => topupStatus.value === "pending");
  const topupStatusText = computed(() => {
    const labels: Record<string, string> = {
      pending: "等待支付",
      success: "支付成功",
      failed: "支付失败",
      cancelled: "已取消",
      timeout: "查询超时",
    };
    return labels[topupStatus.value] ?? topupStatus.value ?? "等待创建";
  });
  const formatNumber = (value: number) =>
    new Intl.NumberFormat("zh-CN").format(value);
  const formatUnixTime = (timestamp: number, emptyText = "暂无") =>
    timestamp > 0
      ? new Intl.DateTimeFormat("zh-CN", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(timestamp * 1000))
      : emptyText;

  const clearTopupPolling = () => {
    if (topupPollTimer) clearInterval(topupPollTimer);
    topupPollTimer = undefined;
  };

  const checkTopupStatus = async () => {
    if (!userId.value || !topupTradeNo.value || topupChecking.value) return;
    topupChecking.value = true;

    try {
      const result = await $fetch<{
        success: boolean;
        message?: string;
        data?: { items?: TopupItem[] };
      }>("/api/eng-link1644/user/topup/self", {
        credentials: "include",
        headers: { "New-Api-User": String(userId.value) },
        query: {
          keyword: topupTradeNo.value,
          p: 1,
          page_size: 5,
        },
      });

      if (!result.success || !result.data) {
        throw new Error(result.message || "订单状态查询失败");
      }
      const order = result.data.items?.find(
        (item) => item.trade_no === topupTradeNo.value,
      );
      if (!order) return;

      topupStatus.value = order.status;
      topupError.value = "";
      if (order.status === "success") {
        clearTopupPolling();
        await fetchUserInfo();
      } else if (order.status !== "pending") {
        clearTopupPolling();
      }
    } catch (error) {
      topupError.value =
        (error as { data?: { message?: string } }).data?.message ??
        (error instanceof Error ? error.message : "订单状态查询失败");
    } finally {
      topupChecking.value = false;
    }
  };

  const startTopupPolling = () => {
    clearTopupPolling();
    topupPollAttempts = 0;
    topupPollTimer = setInterval(() => {
      topupPollAttempts += 1;
      if (topupPollAttempts > 300) {
        topupStatus.value = "timeout";
        clearTopupPolling();
        return;
      }
      void checkTopupStatus();
    }, 2000);
  };

  const createTopup = async () => {
    if (!userId.value) {
      topupError.value = "缺少用户身份，请重新登录";
      return;
    }
    const amount = Number(topupAmount.value);
    if (!Number.isFinite(amount) || amount <= 0) {
      topupError.value = "充值金额必须大于 0";
      return;
    }

    clearTopupPolling();
    topupCreating.value = true;
    topupError.value = "";
    topupCodeUrl.value = "";
    topupQrDataUrl.value = "";
    topupTradeNo.value = "";
    topupStatus.value = "";

    try {
      const result = await $fetch<{
        success?: boolean;
        message?: string;
        data?: { code_url?: string; trade_no?: string };
      }>("/api/eng-link1644/user/wechat/pay", {
        method: "POST",
        credentials: "include",
        headers: { "New-Api-User": String(userId.value) },
        body: { amount, payment_method: "wxpay" },
      });

      if (result.success === false || !result.data?.code_url || !result.data.trade_no) {
        throw new Error(result.message || "支付订单创建失败");
      }
      topupCodeUrl.value = result.data.code_url;
      topupTradeNo.value = result.data.trade_no;
      topupStatus.value = "pending";
      // topupQrDataUrl.value = await qrcode.toDataURL(result.data.code_url, {
      //   width: 360,
      //   margin: 1,
      //   errorCorrectionLevel: "M",
      // });
      startTopupPolling();
    } catch (error) {
      topupError.value =
        (error as { data?: { message?: string } }).data?.message ??
        (error instanceof Error ? error.message : "支付订单创建失败");
    } finally {
      topupCreating.value = false;
    }
  };

  const fetchUserInfo = async () => {
    if (!userId.value) {
      userError.value = "缺少用户身份，请重新登录";
      return;
    }

    userLoading.value = true;
    userError.value = "";

    try {
      const result = await $fetch<{
        success: boolean;
        message?: string;
        data?: UserInfo;
      }>("/api/eng-link1644/user/self", {
        credentials: "include",
        headers: { "New-Api-User": String(userId.value) },
      });

      if (!result.success || !result.data) {
        throw new Error(result.message || "用户信息加载失败");
      }
      userInfo.value = result.data;
    } catch (error) {
      userError.value =
        (error as { data?: { message?: string } }).data?.message ??
        (error instanceof Error ? error.message : "用户信息加载失败");
    } finally {
      userLoading.value = false;
    }
  };

  const fetchTokens = async () => {
    if (!userId.value) {
      tokenError.value = "缺少用户身份，请重新登录";
      return;
    }

    tokenLoading.value = true;
    tokenError.value = "";

    try {
      const result = await $fetch<{
        success: boolean;
        message?: string;
        data?: { total: number; items: ApiToken[] };
      }>("/api/eng-link1644/token", {
        credentials: "include",
        headers: { "New-Api-User": String(userId.value) },
      });

      if (!result.success || !result.data) {
        throw new Error(result.message || "密钥加载失败");
      }
      tokens.value = result.data.items;
      tokenTotal.value = result.data.total;
      tokenId.value = result.data.items[0]?.id;
      tokenLoaded.value = true;
    } catch (error) {
      tokenError.value =
        (error as { data?: { message?: string } }).data?.message ??
        (error instanceof Error ? error.message : "密钥加载失败");
    } finally {
      tokenLoading.value = false;
    }
  };

  const createToken = async () => {
    if (!userId.value) return;

    const name = window.prompt("请输入密钥名称", "新密钥")?.trim();
    if (!name) return;

    tokenCreating.value = true;
    tokenActionError.value = "";

    try {
      const result = await $fetch<{ success: boolean; message?: string }>(
        "/api/eng-link1644/token",
        {
          method: "POST",
          credentials: "include",
          headers: { "New-Api-User": String(userId.value) },
          body: {
            remain_quota: 0,
            remain_amount: 0,
            expired_time: -1,
            unlimited_quota: true,
            model_limits_enabled: false,
            model_limits: "",
            cross_group_retry: false,
            name,
            group: "",
            allow_ips: "",
          },
        },
      );

      if (!result.success) {
        throw new Error(result.message || "密钥添加失败");
      }
      await fetchTokens();
    } catch (error) {
      tokenActionError.value =
        (error as { data?: { message?: string } }).data?.message ??
        (error instanceof Error ? error.message : "密钥添加失败");
    } finally {
      tokenCreating.value = false;
    }
  };

  const loadFullTokenKey = async (token: ApiToken) => {
    const cachedKey = revealedTokenKeys[token.id];
    if (cachedKey) return cachedKey;

    tokenKeyLoadingId.value = token.id;
    tokenActionError.value = "";

    try {
      const result = await $fetch<{
        success: boolean;
        message?: string;
        data?: { key?: string };
      }>(`/api/eng-link1644/token/${token.id}/key`, {
        method: "POST",
        credentials: "include",
        headers: { "New-Api-User": String(userId.value) },
      });

      if (!result.success || !result.data?.key) {
        throw new Error(result.message || "密钥读取失败");
      }
      revealedTokenKeys[token.id] = result.data.key;
      return result.data.key;
    } catch (error) {
      tokenActionError.value =
        (error as { data?: { message?: string } }).data?.message ??
        (error instanceof Error ? error.message : "密钥读取失败");
    } finally {
      tokenKeyLoadingId.value = undefined;
    }
  };

  const toggleTokenKey = async (token: ApiToken) => {
    if (revealedTokenKeys[token.id]) {
      delete revealedTokenKeys[token.id];
      return;
    }
    await loadFullTokenKey(token);
  };

  const copyTokenKey = async (token: ApiToken) => {
    const key = await loadFullTokenKey(token);
    if (!key) return;

    try {
      await navigator.clipboard.writeText(key);
      copiedTokenId.value = token.id;
      if (copiedTokenTimer) clearTimeout(copiedTokenTimer);
      copiedTokenTimer = setTimeout(() => {
        copiedTokenId.value = undefined;
      }, 1500);
    } catch {
      tokenActionError.value = "复制失败，请手动复制密钥";
    }
  };

  const deleteToken = async (token: ApiToken) => {
    if (!userId.value) return;

    const confirmed = window.confirm(
      `确定删除密钥“${token.name || token.id}”吗？此操作无法恢复。`,
    );
    if (!confirmed) return;

    tokenDeletingId.value = token.id;
    tokenActionError.value = "";

    try {
      const result = await $fetch<{ success: boolean; message?: string }>(
        `/api/eng-link1644/token/${token.id}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: { "New-Api-User": String(userId.value) },
        },
      );

      if (!result.success) {
        throw new Error(result.message || "密钥删除失败");
      }
      delete revealedTokenKeys[token.id];
      if (copiedTokenId.value === token.id) copiedTokenId.value = undefined;
      await fetchTokens();
    } catch (error) {
      tokenActionError.value =
        (error as { data?: { message?: string } }).data?.message ??
        (error instanceof Error ? error.message : "密钥删除失败");
    } finally {
      tokenDeletingId.value = undefined;
    }
  };

  const classifyModel = (model: string): ModelKind => {
    const name = model.toLowerCase();
    if (/seededit|image[-_.]?edit|inpaint/.test(name)) return "image-edit";
    if (/^wan|^doubao-seedance|^happyhorse/.test(name)) return "video";
    if (/doubao-seedream|dall-e|gpt-image|imagen|flux|midjourney|recraft|sdxl|stable-diffusion/.test(name)) {
      return "image";
    }
    if (/sora|veo|kling|hailuo|runway|vidu|video/.test(name)) return "video";
    return "text";
  };

  const fetchModels = async () => {
    if (!userId.value) {
      modelError.value = "缺少用户身份，请重新登录";
      return;
    }

    modelLoading.value = true;
    modelError.value = "";

    try {
      const result = await $fetch<{
        success: boolean;
        message?: string;
        data?: ModelListEntry[] | { items?: ModelListEntry[] };
      }>("/api/eng-link1644/user/models", {
        credentials: "include",
        headers: { "New-Api-User": String(userId.value) },
      });

      if (!result.success || !result.data) {
        throw new Error(result.message || "模型列表加载失败");
      }

      const entries = Array.isArray(result.data)
        ? result.data
        : result.data.items ?? [];
      const ids = entries
        .map((item) =>
          typeof item === "string" ? item : item.id ?? item.model ?? item.name,
        )
        .filter((id): id is string => Boolean(id));

      const kindOrder: Record<ModelKind, number> = {
        text: 0,
        image: 1,
        "image-edit": 1,
        video: 2,
      };
      modelOptions.value = [...new Set(ids)]
        .map((id) => ({ id, kind: classifyModel(id) }))
        .sort(
          (left, right) =>
            kindOrder[left.kind] - kindOrder[right.kind] ||
            left.id.localeCompare(right.id),
        );
      if (!modelOptions.value.some((item) => item.id === selectedModel.value)) {
        selectedModel.value = modelOptions.value[0]?.id ?? "";
      }
      modelsLoaded.value = true;
    } catch (error) {
      modelError.value =
        (error as { data?: { message?: string } }).data?.message ??
        (error instanceof Error ? error.message : "模型列表加载失败");
    } finally {
      modelLoading.value = false;
    }
  };

  const getActiveApiKey = async () => {
    if (!tokenLoaded.value) await fetchTokens();
    const token = tokens.value.find((item) => item.status === 1);
    if (!token) throw new Error("没有可用的启用密钥，请先添加密钥");
    const key = await loadFullTokenKey(token);
    if (!key) throw new Error(tokenActionError.value || "密钥读取失败");
    return key;
  };

  const handleEditImage = (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    editImageFile.value = file;
    editImagePreview.value = "";
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      editImagePreview.value = typeof reader.result === "string" ? reader.result : "";
    };
    reader.readAsDataURL(file);
  };

  const extractImageSources = (payload: unknown) => {
    const record = payload as {
      data?: Array<{ url?: string; b64_json?: string }>;
      output?: Array<{ url?: string; b64_json?: string }>;
    };
    return (record.data ?? record.output ?? [])
      .map((item) => item.url ?? (item.b64_json ? `data:image/png;base64,${item.b64_json}` : ""))
      .filter(Boolean);
  };

  const findResultString = (value: unknown, keys: string[]): string => {
    if (!value || typeof value !== "object") return "";
    const record = value as Record<string, unknown>;
    for (const key of keys) {
      if (typeof record[key] === "string") return record[key] as string;
    }
    for (const child of Object.values(record)) {
      const found = findResultString(child, keys);
      if (found) return found;
    }
    return "";
  };

  const clearVideoPolling = () => {
    if (videoPollTimer) clearInterval(videoPollTimer);
    videoPollTimer = undefined;
  };

  const queryVideoTask = async () => {
    if (!videoTaskId.value || videoQuerying.value) return;
    videoQuerying.value = true;
    modelError.value = "";

    try {
      const apiKey = await getActiveApiKey();
      const result = await $fetch<VideoTaskResponse>(
        `/api/eng-link1644/v1/videos/generations/task/${encodeURIComponent(videoTaskId.value)}`,
        { headers: { Authorization: `Bearer ${apiKey}` } },
      );
      videoTaskStatus.value =
        findResultString(result, ["task_status", "status"]) ||
        videoTaskStatus.value;
      videoResultUrl.value = findResultString(result, [
        "video_url",
        "output_url",
        "url",
      ]);
      videoTaskResult.value = JSON.stringify(result, null, 2);

      if (/success|succeeded|completed|failed|cancelled|canceled/i.test(videoTaskStatus.value)) {
        clearVideoPolling();
      }
    } catch (error) {
      modelError.value =
        (error as { data?: { message?: string } }).data?.message ??
        (error instanceof Error ? error.message : "视频任务查询失败");
    } finally {
      videoQuerying.value = false;
    }
  };

  const startVideoPolling = () => {
    clearVideoPolling();
    videoPollAttempts = 0;
    videoPollTimer = setInterval(() => {
      videoPollAttempts += 1;
      if (videoPollAttempts > 120) {
        clearVideoPolling();
        return;
      }
      void queryVideoTask();
    }, 5000);
  };

  const readChatStream = async (response: Response, assistantIndex: number) => {
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/event-stream")) {
      const result = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      chatMessages.value[assistantIndex]!.content =
        result.choices?.[0]?.message?.content ?? "";
      return;
    }

    if (!response.body) throw new Error("浏览器无法读取流式响应");
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    const consumeLine = (line: string) => {
      if (!line.startsWith("data:")) return;
      const data = line.slice(5).trim();
      if (!data || data === "[DONE]") return;
      const chunk = JSON.parse(data) as {
        choices?: Array<{
          delta?: { content?: string };
          message?: { content?: string };
        }>;
      };
      const content =
        chunk.choices?.[0]?.delta?.content ??
        chunk.choices?.[0]?.message?.content ??
        "";
      if (content) chatMessages.value[assistantIndex]!.content += content;
    };

    while (true) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() ?? "";
      lines.forEach(consumeLine);
      if (done) break;
    }
    if (buffer) consumeLine(buffer);
  };

  const sendModelRequest = async () => {
    const prompt = modelPrompt.value.trim();
    if (!canSendModelRequest.value || !prompt) return;

    modelSending.value = true;
    modelError.value = "";
    generatedImages.value = [];
    let chatStartIndex: number | undefined;

    try {
      const apiKey = await getActiveApiKey();
      const headers = { Authorization: `Bearer ${apiKey}` };

      if (selectedModelKind.value === "text") {
        chatStartIndex = chatMessages.value.length;
        chatMessages.value.push({ role: "user", content: prompt });
        const context = systemPrompt.value.trim();
        const response = await fetch("/api/eng-link1644/v1/chat/completions", {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: selectedModel.value,
            stream: true,
            messages: [
              ...(context ? [{ role: "system", content: context }] : []),
              ...chatMessages.value.map(({ role, content }) => ({ role, content })),
            ],
          }),
        });
        if (!response.ok) {
          const errorText = await response.text();
          let message = errorText || `请求失败：${response.status}`;
          try {
            const payload = JSON.parse(errorText) as {
              message?: string;
              error?: { message?: string };
            };
            message = payload.error?.message ?? payload.message ?? message;
          } catch {}
          throw new Error(message);
        }
        const assistantIndex =
          chatMessages.value.push({ role: "assistant", content: "" }) - 1;
        await readChatStream(response, assistantIndex);
        if (!chatMessages.value[assistantIndex]?.content) {
          throw new Error("接口没有返回对话内容");
        }
      } else if (selectedModelKind.value === "image") {
        const result = await $fetch<unknown>("/api/eng-link1644/v1/images/generations", {
          method: "POST",
          headers,
          body: {
            model: selectedModel.value,
            prompt,
            n: 1,
            size: imageSize.value,
            ...(/doubao-seedream/i.test(selectedModel.value) &&
            editImagePreview.value
              ? { image: editImagePreview.value }
              : {}),
          },
        });
        generatedImages.value = extractImageSources(result);
        if (!generatedImages.value.length) throw new Error("接口没有返回图片");
      } else if (selectedModelKind.value === "image-edit") {
        const formData = new FormData();
        formData.append("model", selectedModel.value);
        formData.append("image", editImageFile.value!);
        formData.append("prompt", prompt);
        formData.append("n", "1");
        const result = await $fetch<unknown>("/api/eng-link1644/v1/images/edits", {
          method: "POST",
          headers,
          body: formData,
        });
        generatedImages.value = extractImageSources(result);
        if (!generatedImages.value.length) throw new Error("接口没有返回图片");
      } else {
        clearVideoPolling();
        videoTaskId.value = "";
        videoTaskStatus.value = "";
        videoTaskResult.value = "";
        videoResultUrl.value = "";
        const content: Array<Record<string, unknown>> = [
          { type: "text", text: prompt },
        ];
        if (editImagePreview.value) {
          content.push({
            type: "image_url",
            image_url: { url: editImagePreview.value },
          });
        }
        const result = await $fetch<VideoTaskResponse>(
          "/api/eng-link1644/v1/videos/generations",
          {
            method: "POST",
            headers,
            body: {
              model: selectedModel.value,
              content,
              ratio: videoRatio.value,
              duration: videoDuration.value,
            },
          },
        );
        videoTaskId.value = findResultString(result, ["task_id"]);
        videoTaskStatus.value = findResultString(result, ["task_status", "status"]);
        videoTaskResult.value = JSON.stringify(result, null, 2);
        if (!videoTaskId.value) throw new Error("接口没有返回 task_id");
        startVideoPolling();
      }

      modelPrompt.value = "";
    } catch (error) {
      if (chatStartIndex !== undefined) {
        chatMessages.value.splice(chatStartIndex);
      }
      modelError.value =
        (error as { data?: { message?: string } }).data?.message ??
        (error instanceof Error ? error.message : "模型请求失败");
    } finally {
      modelSending.value = false;
    }
  };

  const selectPanel = (panel: PanelId) => {
    activePanel.value = panel;
    if (panel === "tokens" && !tokenLoaded.value) void fetchTokens();
    if (panel === "models" && !modelsLoaded.value) void fetchModels();
  };

  const exitLogin = async () => {
    clearVideoPolling();
    clearTopupPolling();
    userIdCookie.value = null;
    userInfo.value = undefined;
    tokens.value = [];
    modelOptions.value = [];
    tokenTotal.value = 0;
    tokenLoaded.value = false;
    modelsLoaded.value = false;
    await navigateTo("/morse1644/login");
  };

  type Method = "GET" | "POST";

  type TestItem = {
    name: string;
    method: Method;
    path: string;
    url: string;
    body?: string;
    tokenKey?: boolean;
    loading: boolean;
    status: string;
    result: string;
  };

  type TestDefinition = Omit<TestItem, "loading" | "status" | "result">;

  const definitions: TestDefinition[] = [
    {
      name: "用户分组",
      method: "GET",
      path: "user/self/groups",
      url: "https://eng-link-ai.com:1644/api/user/self/groups",
    },
    {
      name: "当前用户",
      method: "GET",
      path: "user/self",
      url: "https://eng-link-ai.com:1644/api/user/self",
    },
    {
      name: "热门模型",
      method: "GET",
      path: "models/hot",
      url: "https://eng-link-ai.com:1644/api/models/hot?top=10&group=default",
    },
    {
      name: "用户模型",
      method: "GET",
      path: "user/models",
      url: "https://eng-link-ai.com:1644/api/user/models?group=default",
    },
    {
      name: "支付宝金额",
      method: "POST",
      path: "user/alipay/amount",
      url: "https://eng-link-ai.com:1644/api/user/alipay/amount",
      body: "{}",
    },
    {
      name: "订阅计划",
      method: "GET",
      path: "subscription/plans",
      url: "https://eng-link-ai.com:1644/api/subscription/plans",
    },
    {
      name: "价格信息",
      method: "GET",
      path: "pricing",
      url: "https://eng-link-ai.com:1644/api/pricing",
    },
    {
      name: "充值信息",
      method: "GET",
      path: "user/topup/info",
      url: "https://eng-link-ai.com:1644/api/user/topup/info",
    },
    {
      name: "推广信息",
      method: "GET",
      path: "user/aff",
      url: "https://eng-link-ai.com:1644/api/user/aff",
    },
    {
      name: "令牌列表",
      method: "GET",
      path: "token",
      url: "https://eng-link-ai.com:1644/api/token/?p=1&size=10",
    },
    {
      name: "令牌密钥",
      method: "POST",
      path: "token/{id}/key",
      url: "https://eng-link-ai.com:1644/api/token/{id}/key",
      tokenKey: true,
    },
  ];

  const tests = reactive<TestItem[]>(
    definitions.map((item) => ({
      ...item,
      loading: false,
      status: "待测试",
      result: "",
    })),
  );
  const selectedIndex = ref(0);
  const selected = computed(() => tests[selectedIndex.value]!);
  const runningAll = ref(false);

  const formatUrl = (item: TestItem) =>
    item.tokenKey
      ? item.url.replace("{id}", String(tokenId.value ?? "等待令牌列表"))
      : item.url;

  const runTest = async (item: TestItem) => {
    if (!userId.value) return;

    item.loading = true;
    item.status = "请求中";
    item.result = "";

    try {
      const path = item.tokenKey ? `token/${tokenId.value}/key` : item.path;
      const response = await $fetch.raw(`/api/eng-link1644/${path}`, {
        method: item.method,
        credentials: "include",
        headers: {
          "New-Api-User": String(userId.value),
        },
        body: item.body === undefined ? undefined : JSON.parse(item.body),
        ignoreResponseError: true,
      });

      item.status = String(response.status);
      item.result = JSON.stringify(response._data, null, 2);

      if (item.path === "token" && response.status === 200) {
        const payload = response._data as {
          data?: { items?: Array<{ id?: number }> };
        };
        tokenId.value = payload.data?.items?.[0]?.id;
      }
    } catch (error) {
      item.status = "请求失败";
      item.result = error instanceof Error ? error.message : String(error);
    } finally {
      item.loading = false;
    }
  };

  const runAll = async () => {
    runningAll.value = true;

    try {
      for (const [index, item] of tests.entries()) {
        selectedIndex.value = index;
        await runTest(item);
      }
    } finally {
      runningAll.value = false;
    }
  };

  onMounted(() => void fetchUserInfo());
  onBeforeUnmount(() => {
    if (copiedTokenTimer) clearTimeout(copiedTokenTimer);
    clearVideoPolling();
    clearTopupPolling();
  });
</script>
