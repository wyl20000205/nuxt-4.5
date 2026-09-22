<template>
  <main class="temp_page">
    <section class="panel video_panel">
      <h2>视频生成</h2>
      <div class="controls">
        <input
          v-model="apiKey"
          type="password"
          autocomplete="off"
          placeholder="Eng-Link API Key"
        />
        <label>
          时长
          <select v-model="duration" :disabled="videoPending">
            <option :value="5">5 秒</option>
            <option :value="10">10 秒</option>
          </select>
        </label>
        <label>
          分辨率
          <select v-model="resolution" :disabled="videoPending">
            <option value="720P">720p</option>
            <option value="1080P">1080p</option>
          </select>
        </label>
        <button type="button" :disabled="videoPending" @click="test_model()">
          {{ videoPending ? "生成中..." : "生成视频" }}
        </button>
        <button type="button" :disabled="videoPending" @click="test_model(true)">
          一键测试全部组合
        </button>
        <button type="button" :disabled="videoPending" @click="query_video()">
          查询全部任务
        </button>
      </div>
      <p class="status">一键测试当前模型的四种组合，共提交 4 个生成任务。</p>
      <p v-if="videoStatus" class="status" role="status">{{ videoStatus }}</p>
      <p v-if="storageError" class="status" role="alert">{{ storageError }}</p>
      <h3>任务记录（{{ videoTests.length }}）</h3>
      <article v-for="(test, index) in videoTests" :key="index" class="video_test">
        <h3>{{ test.duration ? `${test.duration} 秒` : "时长未知" }} · {{ test.resolution || "分辨率未知" }}</h3>
        <p>模型：{{ test.model || "未知" }}</p>
        <p v-if="test.createdAt">提交时间：{{ new Date(test.createdAt).toLocaleString() }}</p>
        <p>状态：{{ test.status }}</p>
        <p v-if="test.taskId">任务 ID：{{ test.taskId }}</p>
        <button type="button" :disabled="videoPending || !test.taskId" @click="query_video(test)">
          查询此任务
        </button>
        <video v-if="test.videoUrl" :src="test.videoUrl" controls></video>
      </article>
    </section>

    <!-- <section id="chat_test" class="panel">
      <h2>DeepSeek 对话</h2>
      <div class="chat_main">
        <p v-if="!chatMessages.length" class="chat_empty">输入消息开始对话</p>
        <p
          v-for="(message, index) in chatMessages"
          :key="index"
          :class="message.role"
        >
          <strong>{{ message.role === "user" ? "我" : "DeepSeek" }}：</strong>
          {{ message.content }}
        </p>
      </div>
      <form @submit.prevent="chat_test">
        <input v-model="chatInput" type="text" placeholder="输入消息" />
        <button :disabled="chatPending">
          {{ chatPending ? "回复中..." : "发送" }}
        </button>
      </form>
    </section> -->

    <!-- <button @click="a">发送</button> -->
  </main>
</template>

<script setup lang="ts">
  let a = async () => {
    let aa = await $fetch("httpswlclri.js", {
      method: "get",
    });
    console.log(aa);
  };

  type VideoGenerationResponse = {
    output?: {
      task_id?: string;
      task_status?: string;
    };
  };

  type VideoTaskResponse = {
    status?: string;
    content?: { video_url?: string };
  };

  type ChatMessage = {
    role: "user" | "assistant";
    content: string;
  };

  type ChatResponse = {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const name = ref("yumao");
  const pending = ref(false);
  const apiKey = ref("OAhFtlJka89td0iyzgTxVybozywTnG5ki2i6YxeiY7SZQejA"); // 企业 818
  // const apiKey = ref("sk-mbITQzslP8x6eINcKCQ4eYID1JTB0TThU4oU2SH6fiwPCtOy"); //用户key 817
  const model_name = ref<String>("doubao-seedance-2-5-cloud");
  const videoPending = ref(false);
  const videoStatus = ref("");
  const duration = ref(5);
  const resolution = ref("720P");
  type VideoTest = {
    model: string;
    createdAt: string;
    duration: number | null;
    resolution: string;
    taskId: string;
    status: string;
    videoUrl: string;
  };
  const videoTests = ref<VideoTest[]>([]);
  const storageError = ref("");
  const chatInput = ref("");
  const chatPending = ref(false);
  const chatMessages = ref<ChatMessage[]>([]);
  const result = ref<unknown>();

  function save_tasks() {
    try {
      localStorage.setItem("videoTasks", JSON.stringify(videoTests.value));
      storageError.value = "";
    } catch {
      storageError.value = "任务记录保存失败，请保留当前页面并记录任务 ID";
    }
  }

  onMounted(() => {
    try {
      const saved = localStorage.getItem("videoTasks");
      if (saved) {
        const tasks: unknown = JSON.parse(saved);
        if (!Array.isArray(tasks) || !tasks.every((task) =>
          task && typeof task.model === "string" &&
          typeof task.createdAt === "string" &&
          (task.duration === null || task.duration === 5 || task.duration === 10) &&
          typeof task.resolution === "string" && typeof task.taskId === "string" &&
          typeof task.status === "string" && typeof task.videoUrl === "string"
        )) throw new Error("Invalid task records");
        videoTests.value = tasks;
      } else {
        const taskId = localStorage.getItem("task");
        if (taskId) {
          videoTests.value.push({
            model: "", createdAt: "", duration: null, resolution: "",
            taskId, status: "待查询", videoUrl: "",
          });
          save_tasks();
        }
      }
    } catch {
      storageError.value = "任务记录读取失败，原始记录仍保留在浏览器中";
    }
  });

  async function createUser() {
    pending.value = true;
    try {
      result.value = await $fetch("/rust/user/users", {
        method: "POST",
        body: { name: name.value, age: 32, active: true },
      });
    } finally {
      pending.value = false;
    }
  }

  async function test_model(all = false) {
    if (videoPending.value) return;

    const key = apiKey.value.trim();
    if (!key) {
      videoStatus.value = "请输入 Eng-Link API Key";
      return;
    }

    const options = all
      ? [5, 10].flatMap((duration) =>
          ["720P", "1080P"].map((resolution) => ({ duration, resolution })),
        )
      : [{ duration: duration.value, resolution: resolution.value }];
    if (storageError.value) return;
    videoTests.value.unshift(...options.map((option) => ({
      ...option,
      model: String(model_name.value),
      createdAt: new Date().toISOString(),
      taskId: "",
      status: "等待提交",
      videoUrl: "",
    })));
    const batch = videoTests.value.slice(0, options.length);
    videoStatus.value = "正在提交生成任务";
    videoPending.value = true;
    try {
      for (const test of batch) {
        await create_video(test, key);
      }
      const submitted = batch.filter((test) => test.taskId).length;
      videoStatus.value = `已提交 ${submitted}/${batch.length} 个任务，点击查询视频查看结果`;
    } finally {
      videoPending.value = false;
    }
  }

  async function create_video(test: (typeof videoTests.value)[number], key: string) {
    test.status = "提交中";
    try {
      const response = await $fetch<VideoGenerationResponse>(
        "/api/eng-link/v1/videos/generations",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${key}` },
          body: {
            model: test.model,
            content: [
              { type: "text", text: "让小猫跳起来" },
              {
                type: "image_url",
                image_url: {
                  url: "https://img0.baidu.com/it/u=1607203819,3864225772&fm=253&fmt=auto&app=120&f=JPEG?w=500&h=889",
                },
                role: "reference_image",
              },
            ],
            ratio: "16:9",
            duration: test.duration,
            resolution: test.resolution,
            generate_audio: false,
            watermark: false,
          },
        },
      );

      const taskId = response.output?.task_id;
      test.taskId = taskId ?? "";
      test.status = taskId
        ? response.output?.task_status ?? "已提交"
        : "提交失败：接口未返回任务 ID";
      result.value = response;
    } catch (error) {
      test.status = `提交失败：${error instanceof Error ? error.message : String(error)}`;
    } finally {
      save_tasks();
    }
  }

  async function query_video(selected?: VideoTest) {
    if (videoPending.value) return;

    const key = apiKey.value.trim();
    const tasks = (selected ? [selected] : videoTests.value).filter((test) => test.taskId);
    if (!key || !tasks.length) {
      videoStatus.value = "请先输入 API Key 并生成视频";
      return;
    }

    videoPending.value = true;
    try {
      for (const test of tasks) {
        try {
          const response = await $fetch<VideoTaskResponse>(
            `/api/eng-link/v1/videos/generations/task/${test.taskId}`,
            { headers: { Authorization: `Bearer ${key}` } },
          );
          test.status = response.status ?? "unknown";
          test.videoUrl = response.content?.video_url ?? "";
          result.value = response;
        } catch (error) {
          test.status = `查询失败：${error instanceof Error ? error.message : String(error)}`;
        } finally {
          save_tasks();
        }
      }
      videoStatus.value = "查询完成，生成中的任务可稍后再次查询";
    } finally {
      videoPending.value = false;
    }
  }

  async function chat_test() {
    if (chatPending.value) return;

    const key = apiKey.value.trim();
    const content = chatInput.value.trim();
    if (!key || !content) {
      result.value = "请输入 API Key 和消息";
      return;
    }

    chatMessages.value.push({ role: "user", content });
    chatInput.value = "";
    chatPending.value = true;
    try {
      const response = await $fetch<ChatResponse>(
        "/api/eng-link/v1/chat/completions",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${key}` },
          body: {
            model: "deepseek-v4-pro",
            messages: chatMessages.value,
          },
        },
      );

      const reply = response.choices?.[0]?.message?.content;
      if (reply) chatMessages.value.push({ role: "assistant", content: reply });
      result.value = response;
    } catch (error) {
      result.value = error;
    } finally {
      chatPending.value = false;
    }
  }
</script>

<style lang="less" scoped>
  .temp_page {
    min-height: 100vh;
    padding: 40px 20px;
    box-sizing: border-box;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 24px;
    color: #1f2937;
    background: #f3f6fb;
  }

  .panel {
    padding: 24px;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    background: #fff;
    box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);

    h2 {
      margin: 0 0 20px;
      font-size: 22px;
    }
  }

  .controls {
    flex-wrap: wrap;
    align-items: center;

    label {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    select {
      padding: 10px;
      border: 1px solid #d1d5db;
      border-radius: 10px;
      font: inherit;
    }
  }

  .video_test {
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid #e5e7eb;
    overflow-wrap: anywhere;
  }

  .controls,
  form {
    display: flex;
    gap: 10px;
  }

  input {
    min-width: 0;
    flex: 1;
    padding: 11px 14px;
    border: 1px solid #d1d5db;
    border-radius: 10px;
    outline: none;
    font: inherit;

    &:focus {
      border-color: #4f46e5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.14);
    }
  }

  button {
    padding: 11px 16px;
    border: 0;
    border-radius: 10px;
    color: #fff;
    background: #4f46e5;
    cursor: pointer;
    font: inherit;
    white-space: nowrap;

    &:hover:not(:disabled) {
      background: #4338ca;
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.55;
    }
  }

  .status {
    margin: 16px 0;
    color: #4f46e5;
  }

  video {
    width: 100%;
    max-height: 520px;
    margin-top: 16px;
    border-radius: 12px;
    background: #111827;
  }

  #chat_test {
    min-height: 560px;
    display: flex;
    flex-direction: column;
  }

  .chat_main {
    min-height: 360px;
    max-height: 520px;
    margin-bottom: 16px;
    padding: 16px;
    overflow-y: auto;
    flex: 1;
    border-radius: 12px;
    background: #f8fafc;

    p {
      width: fit-content;
      max-width: 85%;
      margin: 0 0 12px;
      padding: 10px 14px;
      border-radius: 12px;
      line-height: 1.6;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      background: #e5e7eb;
    }

    .user {
      margin-left: auto;
      color: #fff;
      background: #4f46e5;
    }

    .chat_empty {
      margin: 120px auto 0;
      color: #94a3b8;
      background: transparent;
    }
  }

  @media (max-width: 860px) {
    .temp_page {
      padding: 20px 12px;
      grid-template-columns: 1fr;
    }

    .controls {
      flex-wrap: wrap;

      input {
        flex-basis: 100%;
      }
    }

    .panel {
      padding: 18px;
    }
  }
</style>
