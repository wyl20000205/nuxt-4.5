<template>
  <div id="pages_ai">
    <div class="left" :class="{ collapsed: sidebarCollapsed }">
      <div id="title">
        <p class="brand">
          <i class="yumao iconrengongzhinengdanao" aria-hidden="true"></i>
          <span>Eng-link Plus</span>
        </p>
        <button class="search" type="button" aria-label="搜索">
          <i class="yumao iconSearch" aria-hidden="true"></i>
        </button>
        <button
          class="close"
          type="button"
          :aria-label="sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'"
          :title="sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'"
          @click="toggleSidebar"
        >
          <i
            class="yumao"
            :class="sidebarCollapsed ? 'iconrengongzhinengdanao' : 'iconFrame'"
            aria-hidden="true"
          ></i>
        </button>
      </div>
      <div id="ul">
        <button
          v-for="item in sidebarItems"
          :key="item.label"
          class="nav-item"
          :class="{ active: item.label === '新聊天' }"
          type="button"
          :aria-label="item.label"
          :title="sidebarCollapsed ? item.label : undefined"
          @click="handleSidebarItem(item.label)"
        >
          <i class="yumao" :class="item.icon" aria-hidden="true"></i>
          <span>{{ item.label }}</span>
        </button>
      </div>
      <div id="recent">
        <p class="recent-title">
          <i>最近</i>
          <span>
            <button type="button" aria-label="搜索最近聊天">
              <i class="yumao iconSearch" aria-hidden="true"></i>
            </button>
            <button type="button" aria-label="添加聊天">
              <i class="yumao iconjiahao" aria-hidden="true"></i>
            </button>
            <button type="button" aria-label="最近聊天选项">
              <i
                class="yumao icona-MenuKebabHorizontalCircle"
                aria-hidden="true"
              ></i>
            </button>
          </span>
        </p>
        <div>
          <button v-for="recent in recentChats" :key="recent" type="button">
            {{ recent }}
          </button>
        </div>
      </div>
      <div id="personal_info">
        <span class="avatar">YM</span>
        <span class="profile-copy">
          <i>yu mao</i>
          <i>个人帐户</i>
        </span>
        <button type="button" aria-label="个人帐户设置">
          <i class="yumao iconStore" aria-hidden="true"></i>
        </button>
      </div>
    </div>
    <div class="right" :class="{ chatting: chatMessages.length || isThinking }">
      <Transition name="copy-toast">
        <div v-if="copyToastVisible" class="copy_toast">
          <span></span>
          <p>已添加到剪贴板</p>
        </div>
      </Transition>

      <Transition name="empty-title">
        <p v-if="!chatMessages.length && !isThinking" class="empty_title">
          你今天在想些什么？
        </p>
      </Transition>

      <div ref="chatScroller" class="chat_messages">
        <div
          v-for="message in chatMessages"
          :key="message.id"
          class="chat_message"
          :class="[
            message.role,
            { streaming: message.id === streamingMessageId },
          ]"
        >
          <div class="message_content">
            <p>{{ message.content }}</p>
            <div v-if="message.attachments?.length" class="message_attachments">
              <span v-for="file in message.attachments" :key="file">
                <i class="yumao iconFile" aria-hidden="true"></i>
                {{ file }}
              </span>
            </div>
          </div>
          <button
            v-if="message.role === 'assistant'"
            class="copy_message"
            type="button"
            aria-label="复制回复"
            @click="copyAssistantMessage(message.content)"
          >
            <i class="yumao iconFile" aria-hidden="true"></i>
          </button>
        </div>

        <div
          v-if="isThinking && streamingMessageId === null"
          class="chat_message assistant thinking"
        >
          <p>
            正在思考<span><i></i><i></i><i></i></span>
          </p>
        </div>
      </div>

      <div
        class="composer_area"
        :class="{ centered: !chatMessages.length && !isThinking }"
      >
        <p v-if="chatMessages.length || isThinking" class="chat_notice">
          ChatGPT 也可能会犯错。请核查重要信息。
        </p>

        <Transition name="request-error">
          <div v-if="requestError" class="request_error" role="alert">
            <span>{{ requestError }}</span>
            <button type="button" aria-label="关闭错误提示" @click="requestError = ''">
              ×
            </button>
          </div>
        </Transition>

        <TransitionGroup
          v-if="chatAttachments.length"
          name="attachment-chip"
          tag="div"
          class="chat_attachments"
        >
          <span
            v-for="(file, index) in chatAttachments"
            :key="`${file.name}-${file.lastModified}`"
          >
            <i class="yumao iconFile" aria-hidden="true"></i>
            <em>{{ file.name }}</em>
            <button
              type="button"
              :aria-label="`移除 ${file.name}`"
              @click="removeChatAttachment(index)"
            >
              ×
            </button>
          </span>
        </TransitionGroup>

        <div class="composer">
          <input
            ref="chatFileInput"
            class="chat_file_input"
            type="file"
            multiple
            @change="addChatFiles"
          />
          <button
            class="add_file"
            type="button"
            aria-label="添加文件"
            @click="openChatFilePicker"
          >
            <i class="yumao iconjiahao" aria-hidden="true"></i>
          </button>
          <textarea
            ref="composerInput"
            v-model="prompt"
            rows="1"
            :placeholder="isListening ? '正在聆听…' : '询问 ChatGPT'"
            @input="resizeComposer"
            @keydown="handleComposerKeydown"
          ></textarea>

          <div class="model_picker">
            <button
              type="button"
              :aria-expanded="modelMenuOpen"
              @click="modelMenuOpen = !modelMenuOpen"
            >
              <span>{{ activeModel }}</span>
              <i class="yumao iconxiasanjiao" aria-hidden="true"></i>
            </button>
            <Transition name="model-menu">
              <div v-if="modelMenuOpen" class="model_menu">
                <button type="button" @click="selectModel('高')">高</button>
                <button type="button" @click="selectModel('标准')">标准</button>
                <button type="button" @click="selectModel('快速')">快速</button>
              </div>
            </Transition>
          </div>

          <button
            class="microphone"
            type="button"
            :class="{ listening: isListening }"
            :aria-label="isListening ? '停止聆听' : '语音输入'"
            @click="toggleListening"
          >
            <span aria-hidden="true"></span>
          </button>

          <button
            v-if="isThinking"
            class="send_message stop"
            type="button"
            aria-label="停止生成"
            @click="stopResponse"
          >
            <span aria-hidden="true"></span>
          </button>
          <button
            v-else
            class="send_message"
            type="button"
            aria-label="发送"
            :disabled="!prompt.trim() && !chatAttachments.length"
            @click="sendMessage"
          >
            <span aria-hidden="true"></span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import OpenAI from "openai";

  //  apiKey: "sk-Bt0KYaWIy2hf4PFgd3ucuMUAKq4UAgF5",
  // baseURL: "https://router-link.world3.ai/api/v1",

  // apiKey: "sk-9fnQWSRt0OpXVqMSj2Uaqx0zB9ltoyrX1AT6LhWYjZEmT9ep",
  // baseURL: "https://www.eng-link-ai.com:1644/v1",

  const client = new OpenAI({
    apiKey:  "sk-Bt0KYaWIy2hf4PFgd3ucuMUAKq4UAgF5",
    baseURL: "https://router-link.world3.ai/api/v1",
    dangerouslyAllowBrowser: true,
  });

  const sidebarCollapsed = ref(false);

  const sidebarItems = [
    { label: "新聊天", icon: "iconCursor" },
    { label: "文件库", icon: "iconFolder" },
    { label: "新项目", icon: "iconjiahao" },
    { label: "已安排", icon: "iconClock" },
    { label: "新插件", icon: "iconApps" },
    { label: "智能体", icon: "iconrengongzhinengdanao" },
  ];

  const recentChats = [
    "TTF字体动态分片",
    "Cloudflare 缓存问题解决",
    "Nginx 限制请求与连接",
    "税字段含义",
    "JIUYIN logo修改",
    "CSS 修改字体颜色",
    "OpenAI API 文档解析",
    "高清化图片输出",
  ];

  const toggleSidebar = (): void => {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  };

  interface ChatMessage {
    id: number;
    role: "user" | "assistant";
    content: string;
    contextContent?: string;
    attachments?: string[];
  }

  type ContextMessage = {
    role: "user" | "assistant";
    content: string;
  };

  const activeWorkspace = ref<"chat" | "work">("chat");
  const prompt = ref("");
  const chatMessages = ref<ChatMessage[]>([]);
  const isThinking = ref(false);
  const isListening = ref(false);
  const activeModel = ref("高");
  const modelMenuOpen = ref(false);
  const copyToastVisible = ref(false);
  const requestError = ref("");
  const streamingMessageId = ref<number | null>(null);
  const chatScroller = ref<HTMLElement | null>(null);
  const composerInput = ref<HTMLTextAreaElement | null>(null);
  const chatFileInput = ref<HTMLInputElement | null>(null);
  const chatAttachments = ref<File[]>([]);
  let nextChatMessageId = 1;
  let activeRequestController: AbortController | null = null;
  let copyToastTimer: ReturnType<typeof setTimeout> | undefined;

  const MAX_ATTACHMENT_CHARS = 12000;
  const textFileExtensions = new Set([
    "txt",
    "md",
    "json",
    "csv",
    "tsv",
    "html",
    "css",
    "js",
    "ts",
    "vue",
    "xml",
    "yaml",
    "yml",
  ]);

  const scrollChatToBottom = async (
    behavior: ScrollBehavior = "smooth",
  ): Promise<void> => {
    await nextTick();
    chatScroller.value?.scrollTo({
      top: chatScroller.value.scrollHeight,
      behavior,
    });
  };

  const resizeComposer = (event: Event): void => {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = "44px";
    textarea.style.height = `${Math.min(Math.max(textarea.scrollHeight, 44), 120)}px`;
  };

  const resetComposerHeight = async (): Promise<void> => {
    await nextTick();
    if (composerInput.value) composerInput.value.style.height = "44px";
  };

  const isReadableTextFile = (file: File): boolean => {
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    return file.type.startsWith("text/") || textFileExtensions.has(extension);
  };

  const buildAttachmentContext = async (files: File[]): Promise<string> => {
    if (!files.length) return "";

    const fileContexts = await Promise.all(
      files.map(async (file) => {
        const information = `文件名：${file.name}\n类型：${file.type || "未知"}\n大小：${file.size} bytes`;

        if (!isReadableTextFile(file)) {
          return `[附件信息]\n${information}\n该文件不是可直接读取的文本文件。`;
        }

        try {
          const text = await file.text();
          const content = text.slice(0, MAX_ATTACHMENT_CHARS);
          const truncated = text.length > MAX_ATTACHMENT_CHARS
            ? "\n（内容过长，已截断）"
            : "";
          return `[附件内容]\n${information}\n内容：\n${content}${truncated}`;
        } catch {
          return `[附件信息]\n${information}\n读取文件内容失败。`;
        }
      }),
    );

    return fileContexts.join("\n\n");
  };

  const buildConversationContext = (): ContextMessage[] => {
    return chatMessages.value.map((message) => ({
      role: message.role,
      content: message.contextContent ?? message.content,
    }));
  };

  const getRequestErrorMessage = (error: unknown): string => {
    if (error instanceof Error && error.message) {
      return `请求失败：${error.message}`;
    }
    return "请求失败，请稍后重试。";
  };

  const sendMessage = async (): Promise<void> => {
    const content = prompt.value.trim();
    if ((!content && !chatAttachments.value.length) || isThinking.value) return;

    const files = [...chatAttachments.value];
    const displayContent = content || "已添加附件";
    const controller = new AbortController();
    activeRequestController = controller;
    modelMenuOpen.value = false;
    isThinking.value = true;
    isListening.value = false;
    requestError.value = "";

    try {
      const attachmentContext = await buildAttachmentContext(files);
      if (controller.signal.aborted) return;

      const contextContent = [content, attachmentContext]
        .filter(Boolean)
        .join("\n\n");

      chatMessages.value.push({
        id: nextChatMessageId++,
        role: "user",
        content: displayContent,
        contextContent,
        attachments: files.map((file) => file.name),
      });
      prompt.value = "";
      chatAttachments.value = [];
      resetComposerHeight();
      scrollChatToBottom();

      const stream = await client.chat.completions.create(
        {
          model: "world3-router-north-america/openai/gpt-4o",
          messages: buildConversationContext(),
          stream: true,
        },
        { signal: controller.signal },
      );

      let assistantMessageIndex = -1;

      for await (const chunk of stream) {
        if (controller.signal.aborted) break;

        const delta = chunk.choices[0]?.delta?.content ?? "";
        if (!delta) continue;

        if (assistantMessageIndex === -1) {
          const messageId = nextChatMessageId++;
          chatMessages.value.push({
            id: messageId,
            role: "assistant",
            content: "",
          });
          assistantMessageIndex = chatMessages.value.length - 1;
          streamingMessageId.value = messageId;
        }

        chatMessages.value[assistantMessageIndex].content += delta;
        await scrollChatToBottom("auto");
      }

      if (controller.signal.aborted) return;

      const assistantContent = assistantMessageIndex === -1
        ? ""
        : chatMessages.value[assistantMessageIndex].content.trim();
      if (!assistantContent) {
        throw new Error("接口没有返回有效内容");
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        requestError.value = getRequestErrorMessage(error);
      }
    } finally {
      if (activeRequestController === controller) {
        activeRequestController = null;
        isThinking.value = false;
      }
      streamingMessageId.value = null;
      scrollChatToBottom();
    }
  };

  const stopResponse = (): void => {
    activeRequestController?.abort();
    activeRequestController = null;
    isThinking.value = false;
    streamingMessageId.value = null;
  };

  const startNewChat = (): void => {
    stopResponse();
    chatMessages.value = [];
    chatAttachments.value = [];
    prompt.value = "";
    requestError.value = "";
    streamingMessageId.value = null;
    nextChatMessageId = 1;
    resetComposerHeight();
  };

  const handleSidebarItem = (label: string): void => {
    if (label === "新聊天") startNewChat();
  };

  const handleComposerKeydown = (event: KeyboardEvent): void => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const toggleListening = (): void => {
    isListening.value = !isListening.value;
  };

  const openChatFilePicker = (): void => {
    chatFileInput.value?.click();
  };

  const addChatFiles = (event: Event): void => {
    const input = event.target as HTMLInputElement;
    chatAttachments.value.push(...Array.from(input.files ?? []));
    input.value = "";
  };

  const removeChatAttachment = (index: number): void => {
    chatAttachments.value.splice(index, 1);
  };

  const selectModel = (model: string): void => {
    activeModel.value = model;
    modelMenuOpen.value = false;
  };

  const copyAssistantMessage = async (content: string): Promise<void> => {
    if (!import.meta.client || !navigator.clipboard) return;

    await navigator.clipboard.writeText(content);
    copyToastVisible.value = true;
    if (copyToastTimer) clearTimeout(copyToastTimer);
    copyToastTimer = setTimeout(() => {
      copyToastVisible.value = false;
    }, 1500);
  };

  onMounted(() => {
    if (window.matchMedia("(max-width: 700px)").matches) {
      sidebarCollapsed.value = true;
    }
  });

  onBeforeUnmount(() => {
    activeRequestController?.abort();
    if (copyToastTimer) clearTimeout(copyToastTimer);
  });
</script>

<style lang="less">
  #pages_ai {
    width: 100%;
    min-height: 100vh;
    display: flex;
    background: #fcfcfc;

    > .left {
      width: 268px;
      min-width: 268px;
      height: 100vh;
      padding: 18px 12px 14px;
      position: sticky;
      top: 0;
      box-sizing: border-box;
      border-right: 1px solid #eceff1;
      background: #fcfcfc;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition:
        width 0.28s ease,
        min-width 0.28s ease,
        padding 0.28s ease,
        box-shadow 0.28s ease;

      button {
        font: inherit;
      }

      #title {
        width: 100%;
        height: 48px;
        display: flex;
        align-items: center;
        gap: 4px;

        .brand {
          min-width: 0;
          margin: 0;
          flex: 1;
          display: flex;
          align-items: center;
          gap: 9px;
          overflow: hidden;
          color: #202529;
          font-size: 18px;
          font-weight: 700;
          white-space: nowrap;

          .yumao {
            display: none;
            font-size: 24px;
          }
        }

        > button {
          width: 36px;
          height: 36px;
          padding: 0;
          border: 0;
          border-radius: 8px;
          background: transparent;
          color: #566168;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex: 0 0 auto;
          transition:
            background-color 0.18s ease,
            color 0.18s ease,
            transform 0.18s ease;

          .yumao {
            font-size: 20px;
          }

          &:hover {
            background: #eceeef;
            color: #161b1e;
            transform: translateY(-1px);
          }

          &:active {
            transform: translateY(0) scale(0.95);
          }

          &:focus-visible {
            outline: 2px solid #14191c;
            outline-offset: 2px;
          }
        }
      }

      #ul {
        width: 100%;
        margin-top: 16px;
        display: flex;
        flex-direction: column;
        gap: 3px;

        .nav-item {
          width: 100%;
          min-height: 43px;
          padding: 0 12px;
          border: 0;
          border-radius: 9px;
          background: transparent;
          color: #242a2e;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          overflow: hidden;
          text-align: left;
          transition:
            width 0.25s ease,
            padding 0.25s ease,
            background-color 0.18s ease,
            transform 0.18s ease;

          .yumao {
            width: 22px;
            flex: 0 0 22px;
            font-size: 21px;
            text-align: center;
          }

          span {
            white-space: nowrap;
            transition:
              opacity 0.15s ease,
              transform 0.2s ease;
          }

          &:hover,
          &.active {
            background: #ececec;
          }

          &:hover {
            transform: translateX(2px);
          }

          &:focus-visible {
            outline: 2px solid #242a2e;
            outline-offset: -3px;
          }
        }
      }

      #recent {
        min-height: 0;
        margin-top: 26px;
        flex: 1;
        overflow: hidden;
        opacity: 1;
        transition:
          opacity 0.15s ease,
          transform 0.2s ease;

        .recent-title {
          height: 34px;
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;

          > i {
            font-style: normal;
            font-weight: 700;
          }

          span {
            display: flex;
            gap: 2px;

            button {
              width: 28px;
              height: 28px;
              padding: 0;
              border: 0;
              border-radius: 6px;
              background: transparent;
              color: #606b70;
              cursor: pointer;

              &:hover {
                background: #eceeef;
              }
            }
          }
        }

        > div {
          max-height: calc(100% - 38px);
          padding-top: 4px;
          overflow-y: auto;
          scrollbar-width: none;

          &::-webkit-scrollbar {
            display: none;
          }

          button {
            width: 100%;
            min-height: 38px;
            padding: 0 8px;
            border: 0;
            border-radius: 7px;
            background: transparent;
            color: #30363a;
            cursor: pointer;
            overflow: hidden;
            font-size: 14px;
            text-align: left;
            text-overflow: ellipsis;
            white-space: nowrap;

            &:hover {
              background: #eeeeee;
            }
          }
        }
      }

      #personal_info {
        width: 100%;
        min-height: 52px;
        display: flex;
        align-items: center;
        gap: 10px;
        overflow: hidden;

        .avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #b88b45;
          color: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 34px;
          font-size: 12px;
        }

        .profile-copy {
          min-width: 0;
          flex: 1;
          display: flex;
          flex-direction: column;

          i {
            overflow: hidden;
            font-style: normal;
            text-overflow: ellipsis;
            white-space: nowrap;

            &:first-child {
              font-size: 14px;
              font-weight: 600;
            }

            &:last-child {
              color: #8a9499;
              font-size: 12px;
            }
          }
        }

        > button {
          width: 34px;
          height: 34px;
          padding: 0;
          border: 0;
          border-radius: 7px;
          background: transparent;
          color: #667177;
          cursor: pointer;

          &:hover {
            background: #eceeef;
          }
        }
      }

      &.collapsed {
        width: 78px;
        min-width: 78px;
        padding-right: 10px;
        padding-left: 10px;
        box-shadow: 3px 0 12px rgba(25, 35, 40, 0.03);

        #title {
          justify-content: center;

          .brand,
          .search {
            width: 0;
            display: none;
          }

          .close {
            width: 44px;
            height: 44px;

            .yumao {
              font-size: 24px;
            }
          }
        }

        #ul {
          align-items: center;

          .nav-item {
            width: 44px;
            min-height: 44px;
            padding: 0;
            justify-content: center;

            .yumao {
              width: auto;
              flex-basis: auto;
            }

            span {
              width: 0;
              opacity: 0;
              transform: translateX(-5px);
            }

            &:hover {
              transform: translateY(-1px);
            }
          }
        }

        #recent {
          pointer-events: none;
          opacity: 0;
          transform: translateX(-8px);
        }

        #personal_info {
          justify-content: center;

          .profile-copy,
          > button {
            display: none;
          }
        }
      }
    }

    > .right {
      min-width: 0;
      flex: 1;
      height: 100vh;
      position: relative;
      overflow: hidden;
      background: #fff;

      button,
      textarea {
        font: inherit;
      }

      .workspace_switch {
        width: 258px;
        height: 46px;
        position: absolute;
        top: 22px;
        left: 50%;
        z-index: 5;
        border-radius: 24px;
        background: #f4f4f4;
        display: flex;
        transform: translateX(-50%);

        button {
          flex: 1;
          border: 0;
          border-radius: inherit;
          background: transparent;
          color: #717b80;
          cursor: pointer;
          transition:
            background-color 0.2s ease,
            box-shadow 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease;

          &.active {
            background: #fff;
            box-shadow: 0 2px 8px rgba(25, 32, 36, 0.1);
            color: #202629;
          }

          &:active {
            transform: scale(0.98);
          }
        }
      }

      .copy_toast {
        width: 200px;
        height: 180px;
        position: absolute;
        top: 50%;
        left: 50%;
        z-index: 20;
        border-radius: 12px;
        background: rgba(47, 47, 47, 0.88);
        color: #fff;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 25px;
        transform: translate(-50%, -50%);
        backdrop-filter: blur(6px);

        > span {
          width: 45px;
          height: 25px;
          border-bottom: 5px solid #fff;
          border-left: 5px solid #fff;
          transform: rotate(-45deg) translate(5px, -4px);
        }

        p {
          margin: 0;
          font-size: 15px;
        }
      }

      .empty_title {
        margin: 0;
        position: absolute;
        top: calc(50% - 132px);
        left: 50%;
        font-size: clamp(26px, 2.2vw, 34px);
        line-height: 1.2;
        white-space: nowrap;
        transform: translateX(-50%);
      }

      .chat_messages {
        height: 100%;
        padding: 88px clamp(28px, 8vw, 150px) 160px;
        box-sizing: border-box;
        overflow-y: auto;
        scroll-behavior: smooth;
        scrollbar-width: thin;
        scrollbar-color: #d3d7d9 transparent;

        .chat_message {
          width: min(1120px, 100%);
          margin: 0 auto 34px;
          display: flex;
          align-items: flex-start;
          gap: 8px;
          animation: chat-message-enter 0.28s ease-out both;

          .message_content {
            max-width: min(760px, 78%);

            > p {
              margin: 0;
              line-height: 1.6;
              white-space: pre-wrap;
              word-break: break-word;
            }
          }

          &.user {
            justify-content: flex-end;

            .message_content {
              padding: 12px 18px;
              border-radius: 22px;
              background: #f3f3f3;
            }
          }

          &.assistant {
            padding-top: 12px;

            .message_content {
              font-size: 17px;
            }

            .copy_message {
              width: 31px;
              height: 31px;
              padding: 0;
              border: 0;
              border-radius: 7px;
              background: transparent;
              color: #7b868b;
              cursor: pointer;
              opacity: 0;
              transition:
                background-color 0.18s ease,
                opacity 0.18s ease;

              &:hover {
                background: #f0f1f2;
                color: #272e32;
              }
            }

            &:hover .copy_message,
            .copy_message:focus-visible {
              opacity: 1;
            }

            &.streaming .message_content > p::after {
              content: "";
              width: 7px;
              height: 17px;
              margin-left: 3px;
              background: currentColor;
              display: inline-block;
              vertical-align: -2px;
              animation: stream-caret 0.85s steps(1) infinite;
            }
          }

          &.thinking {
            color: #858f94;

            > p {
              margin: 0;
              display: flex;
              align-items: center;
              gap: 8px;

              span {
                display: flex;
                gap: 4px;

                i {
                  width: 5px;
                  height: 5px;
                  border-radius: 50%;
                  background: currentColor;
                  animation: thinking-dot 1s ease-in-out infinite;

                  &:nth-child(2) {
                    animation-delay: 0.14s;
                  }

                  &:nth-child(3) {
                    animation-delay: 0.28s;
                  }
                }
              }
            }
          }
        }

        .message_attachments {
          margin-top: 8px;
          display: flex;
          flex-wrap: wrap;
          gap: 6px;

          span {
            max-width: 240px;
            padding: 5px 9px;
            border-radius: 7px;
            background: rgba(0, 0, 0, 0.05);
            display: inline-flex;
            align-items: center;
            gap: 5px;
            overflow: hidden;
            font-size: 12px;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }

      .composer_area {
        width: min(930px, calc(100% - 48px));
        position: absolute;
        bottom: 22px;
        left: 50%;
        z-index: 8;
        transform: translateX(-50%);
        transition:
          width 0.25s ease,
          bottom 0.3s ease,
          opacity 0.2s ease;

        &.centered {
          bottom: calc(50% - 54px);
        }

        .chat_notice {
          margin: 0 0 8px;
          color: #7c878c;
          font-size: 12px;
          text-align: center;
        }

        .request_error {
          min-height: 38px;
          margin: 0 12px 8px;
          padding: 8px 8px 8px 12px;
          border: 1px solid #f2c9c6;
          border-radius: 10px;
          box-sizing: border-box;
          background: #fff3f2;
          color: #a5332b;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          font-size: 13px;

          span {
            min-width: 0;
            overflow-wrap: anywhere;
          }

          button {
            width: 24px;
            height: 24px;
            padding: 0;
            border: 0;
            border-radius: 50%;
            background: transparent;
            color: inherit;
            flex: 0 0 auto;
            cursor: pointer;

            &:hover {
              background: rgba(165, 51, 43, 0.1);
            }
          }
        }

        .chat_attachments {
          margin: 0 12px 8px;
          display: flex;
          flex-wrap: wrap;
          gap: 6px;

          > span {
            max-width: 230px;
            min-height: 30px;
            padding: 0 6px 0 9px;
            border: 1px solid #e0e4e6;
            border-radius: 8px;
            background: #fff;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            box-shadow: 0 2px 6px rgba(30, 40, 45, 0.05);

            em {
              min-width: 0;
              overflow: hidden;
              font-style: normal;
              font-size: 12px;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            button {
              width: 22px;
              height: 22px;
              padding: 0;
              border: 0;
              border-radius: 50%;
              background: transparent;
              cursor: pointer;

              &:hover {
                background: #eceeef;
              }
            }
          }
        }

        .composer {
          min-height: 70px;
          padding: 9px 10px 9px 12px;
          border: 1px solid #e0e3e5;
          border-radius: 36px;
          box-sizing: border-box;
          background: #fff;
          box-shadow: 0 7px 25px rgba(28, 36, 41, 0.09);
          display: flex;
          align-items: center;
          gap: 7px;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            transform 0.25s ease;

          &:focus-within {
            border-color: #cbd0d3;
            box-shadow: 0 9px 30px rgba(28, 36, 41, 0.13);
          }

          .chat_file_input {
            display: none;
          }

          .add_file,
          .microphone,
          .send_message {
            width: 44px;
            height: 44px;
            padding: 0;
            border: 0;
            border-radius: 50%;
            background: transparent;
            color: #14191c;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex: 0 0 44px;
            align-self: center;
            line-height: 1;
            cursor: pointer;
            transition:
              background-color 0.18s ease,
              color 0.18s ease,
              transform 0.18s ease;

            &:hover {
              background: #f0f1f2;
              transform: translateY(-1px);
            }

            &:focus-visible {
              outline: 2px solid #161b1e;
              outline-offset: 2px;
            }
          }

          .add_file .yumao {
            width: 100%;
            height: 100%;
            display: grid;
            place-items: center;
            font-size: 25px;
            line-height: 1;
          }

          textarea {
            min-width: 0;
            height: 44px;
            min-height: 44px;
            max-height: 120px;
            padding: 11px 3px;
            border: 0;
            box-sizing: border-box;
            background: transparent;
            flex: 1;
            align-self: center;
            resize: none;
            color: #23292d;
            font-size: 17px;
            line-height: 1.35;
            outline: 0;

            &::placeholder {
              color: #91999d;
            }
          }

          .model_picker {
            height: 44px;
            position: relative;
            display: flex;
            align-items: center;
            flex: 0 0 auto;

            > button {
              min-width: 60px;
              height: 44px;
              padding: 0 6px;
              border: 0;
              border-radius: 8px;
              background: transparent;
              color: #828c91;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 5px;
              line-height: 1;
              cursor: pointer;

              &:hover {
                background: #f2f3f4;
              }

              .yumao {
                font-size: 10px;
                transition: transform 0.2s ease;
              }

              &[aria-expanded="true"] .yumao {
                transform: rotate(180deg);
              }
            }

            .model_menu {
              width: 120px;
              padding: 6px;
              position: absolute;
              right: 0;
              bottom: calc(100% + 12px);
              border: 1px solid #e0e4e6;
              border-radius: 10px;
              background: #fff;
              box-shadow: 0 8px 22px rgba(28, 36, 41, 0.12);

              button {
                width: 100%;
                height: 35px;
                border: 0;
                border-radius: 6px;
                background: transparent;
                cursor: pointer;
                text-align: left;

                &:hover {
                  background: #f0f1f2;
                }
              }
            }
          }

          .microphone {
            span {
              width: 12px;
              height: 19px;
              position: relative;
              border: 2px solid currentColor;
              border-radius: 8px;

              &::before {
                content: "";
                width: 20px;
                height: 12px;
                position: absolute;
                top: 8px;
                left: 50%;
                border-right: 2px solid currentColor;
                border-bottom: 2px solid currentColor;
                border-left: 2px solid currentColor;
                border-radius: 0 0 12px 12px;
                transform: translateX(-50%);
              }

              &::after {
                content: "";
                width: 2px;
                height: 5px;
                position: absolute;
                top: 21px;
                left: 50%;
                background: currentColor;
                transform: translateX(-50%);
              }
            }

            &.listening {
              background: #ffecec;
              color: #c83f3f;
              animation: microphone-pulse 1.3s ease-in-out infinite;
            }
          }

          .send_message {
            background: #000;
            color: #fff;

            > span {
              width: 3px;
              height: 18px;
              position: relative;
              border-radius: 2px;
              background: currentColor;

              &::before {
                content: "";
                width: 10px;
                height: 10px;
                position: absolute;
                top: 0;
                left: 50%;
                border-top: 3px solid currentColor;
                border-left: 3px solid currentColor;
                transform: translate(-50%, 0) rotate(45deg);
              }
            }

            &:hover {
              background: #242424;
            }

            &:disabled {
              background: #d5d8da;
              cursor: not-allowed;
              transform: none;
            }

            &.stop > span {
              width: 13px;
              height: 13px;
              border-radius: 2px;
              background: #fff;

              &::before {
                display: none;
              }
            }
          }
        }
      }
    }
  }

  .copy-toast-enter-active,
  .copy-toast-leave-active,
  .empty-title-enter-active,
  .empty-title-leave-active,
  .model-menu-enter-active,
  .model-menu-leave-active,
  .request-error-enter-active,
  .request-error-leave-active,
  .attachment-chip-enter-active,
  .attachment-chip-leave-active {
    transition:
      opacity 0.18s ease,
      transform 0.2s ease;
  }

  .copy-toast-enter-from,
  .copy-toast-leave-to {
    opacity: 0;
    transform: translate(-50%, -46%) scale(0.96);
  }

  .empty-title-enter-from,
  .empty-title-leave-to {
    opacity: 0;
    transform: translate(-50%, 8px);
  }

  .model-menu-enter-from,
  .model-menu-leave-to,
  .request-error-enter-from,
  .request-error-leave-to,
  .attachment-chip-enter-from,
  .attachment-chip-leave-to {
    opacity: 0;
    transform: translateY(6px);
  }

  @keyframes chat-message-enter {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes thinking-dot {
    0%,
    100% {
      opacity: 0.35;
      transform: translateY(0);
    }
    50% {
      opacity: 1;
      transform: translateY(-3px);
    }
  }

  @keyframes stream-caret {
    0%,
    48% {
      opacity: 1;
    }
    49%,
    100% {
      opacity: 0;
    }
  }

  @keyframes microphone-pulse {
    0%,
    100% {
      box-shadow: 0 0 0 0 rgba(200, 63, 63, 0);
    }
    50% {
      box-shadow: 0 0 0 5px rgba(200, 63, 63, 0.12);
    }
  }

  @media (max-width: 700px) {
    #pages_ai > .left {
      width: 270px;
      min-width: 270px;

      &.collapsed {
        width: 68px;
        min-width: 68px;
      }
    }

    #pages_ai > .right {
      .workspace_switch {
        width: 190px;
        height: 40px;
        top: 12px;
      }

      .empty_title {
        top: calc(50% - 118px);
        font-size: 23px;
      }

      .chat_messages {
        padding: 68px 14px 142px;

        .chat_message .message_content {
          max-width: 88%;
        }
      }

      .composer_area {
        width: calc(100% - 18px);
        bottom: 10px;

        &.centered {
          bottom: calc(50% - 57px);
        }

        .composer {
          min-height: 60px;
          padding: 7px;
          gap: 2px;

          .add_file,
          .microphone,
          .send_message {
            width: 44px;
            height: 44px;
            flex-basis: 44px;
          }

          textarea {
            font-size: 15px;
          }

          .model_picker > button {
            min-width: 48px;
          }

          .model_picker,
          .model_picker > button {
            height: 44px;
          }
        }
      }

      .copy_toast {
        width: 170px;
        height: 150px;
      }
    }
  }

  @media (prefers-reduced-motion: reduce) {
    #pages_ai > .left,
    #pages_ai > .left *,
    #pages_ai > .right,
    #pages_ai > .right * {
      scroll-behavior: auto !important;
      animation: none !important;
      transition: none !important;
    }
  }
</style>
