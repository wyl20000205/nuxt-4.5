<template>
  <div id="pages_user_index">
    <header>
      <div class="header_main">
        <div class="l">
          <div class="img btn">
            <img src="/images/logo_2.png" @click="go_home" />
            <img src="/images/logo_1.png" @click="go_home" />
          </div>
        </div>
        <div class="r">
          <p class="look_msg btn" @click="viewMessagesTodo">
            <i class="yumao icon-a-042_xinxi"></i>
            <i class="set_bg_tip">查看消息</i>
          </p>
          <p class="set_bg btn" @click="switchBackgroundTodo">
            <i class="yumao icon-a-042_tupian-01"></i>
            <i class="set_bg_tip">切换背景</i>
          </p>
          <div class="user_menu">
            <p class="info btn">
              <i>1799498990</i>
              <i>欢迎你</i>
            </p>
            <p class="img btn">
              <img :src="qq_img" /><i class="yumao icon-a-042_biaoqing"></i>
            </p>
            <p
              class="show_li"
              :class="{ 'is-exiting': isExitMenuClosing }"
              @transitionend="showExitCover"
            >
              <em class="uid btn"
                ><i class="yumao icon-a-book2"></i><i>UID: 5324</i></em
              >
              <em class="is_divider btn"
                ><i class="yumao icon-user"></i><i>账户设置</i></em
              >
              <em class="btn" @click="exit($event)"
                ><i class="yumao icon-ban"></i><i>退出登录</i></em
              >
            </p>
          </div>
        </div>
      </div>
    </header>
    <div
      v-if="isExitCoverVisible"
      class="exit-transition-cover"
      :class="{ 'is-contracting': isExitCoverContracting }"
      :style="exitCoverStyle"
      aria-hidden="true"
      @animationend="handleExitCoverAnimation"
    ></div>
    <nav>
      <div class="nav_item_box">
        <div
          v-for="item in navItems"
          :key="item.id"
          class="item center btn"
          :class="{ is_select: activePanel === item.id }"
          @click="selectPanel(item.id)"
        >
          <i :class="['yumao', item.icon]"></i><i>{{ item.text }}</i>
        </div>
        <div class="nav_easter_eggs" aria-label="隐藏工作流入口">
          <button
            type="button"
            class="flow_portal flow_portal_media"
            @click="go_where('/user/video')"
          >
            <em class="yumao icon-shipin"></em><em>进入媒体流</em>
          </button>
          <button
            type="button"
            class="flow_portal flow_portal_editor"
            @click="go_where('/user/editor')"
          >
            <em class="yumao icon-bianji"></em><em>进入编辑流</em>
          </button>
        </div>
      </div>
    </nav>
    <main>
      <Transition name="admin-panel" mode="out-in">
        <section
          v-if="activePanel === 'overview'"
          key="overview"
          class="overview"
        >
          <div class="r1">
            <div class="qian">
              <p>余额</p>
              <p>¥ 1210.26</p>
              <p class="btn">前往充值 <i>-></i></p>
            </div>
            <div class="jifen">
              <p>积分</p>
              <p>2121 分</p>
              <p class="btn">积分商场 <i>-></i></p>
            </div>
            <div class="xiaofei">
              <p>消费</p>
              <p>¥ 0</p>
              <p class="btn">消费历史 <i>-></i></p>
            </div>
            <div class="shixiang">
              <p>代办</p>
              <p>
                <em class="center btn"
                  ><i class="yumao icon-a-042_dianying"></i><i>工单</i></em
                ><em class="center btn"
                  ><i class="yumao icon-a-042_dianying"></i><i>消费</i></em
                ><em class="center btn"
                  ><i class="yumao icon-a-042_dianying"></i><i>优惠卷</i></em
                >
              </p>
            </div>
          </div>
          <div class="r2">
            <div class="r2-content">
              <div class="service-grid">
                <button
                  class="service-card service-card--cyan service-card--chart"
                  data-grid-span="2"
                  @click="openServiceTodo('云应用')"
                >
                  <ChartLine class="service-card-chart" />
                  <small>最近几日Token消耗趋势</small>
                </button>

                <button
                  class="service-card service-card--cyan service-card--gpu"
                  data-grid-span="1"
                  type="button"
                  @click="openServiceTodo('显卡云电脑')"
                >
                  <EchartGpuToken class="service-card-gpu" />
                  <small>GPU 推理 Token 吞吐</small>
                </button>
                <button
                  class="service-card service-card--red service-card--realtime"
                  data-grid-span="1"
                  type="button"
                  @click="openServiceTodo('游戏云')"
                >
                  <EchartRealtimeToken class="service-card-realtime" />
                  <small>实时推理 Token 消耗</small>
                </button>
                <button
                  class="service-card service-card--dark service-card--multi-line"
                  data-grid-span="2"
                  type="button"
                  @click="openServiceTodo('裸金属物理机')"
                >
                  <ChartMultiLine class="service-card-multi-line" />
                  <small>多维 Token 指标对比</small>
                </button>
                <button
                  class="service-card service-card--cyan service-card--pie"
                  data-grid-span="1"
                  type="button"
                  @click="openServiceTodo('云服务器')"
                >
                  <ChartPie class="service-card-pie" />
                  <small>多模型 Token 消耗占比</small>
                </button>
                <button
                  class="service-card service-card--green service-card--context"
                  data-grid-span="1"
                  type="button"
                  @click="openServiceTodo('对象存储')"
                >
                  <EchartContextToken class="service-card-context" />
                  <small>上下文 Token 缓存占用</small>
                </button>
              </div>
              <aside class="notice-panel">
                <div class="title" role="tablist" aria-label="信息栏目">
                  <button
                    v-for="(tab, index) in noticeTabs"
                    :key="tab"
                    class="notice-tab"
                    :class="{ is_active: activeNoticeTab === index }"
                    type="button"
                    role="tab"
                    :aria-selected="activeNoticeTab === index"
                    @click="activeNoticeTab = index"
                  >
                    {{ tab }}
                  </button>
                </div>
                <div
                  class="dy"
                  :class="{ 'is-activity': activeNoticeTab === 1 }"
                >
                  <div class="t1" :aria-hidden="activeNoticeTab !== 0">
                    <a
                      v-for="notice in notices"
                      :key="notice.title"
                      href="#"
                      @click.prevent="openNoticeTodo(notice.title)"
                    >
                      {{ notice.title }}
                    </a>
                  </div>
                  <div class="t2" :aria-hidden="activeNoticeTab !== 1">
                    <a
                      v-for="notice in activityNotices"
                      :key="notice.title"
                      href="#"
                      @click.prevent="openNoticeTodo(notice.title)"
                    >
                      {{ notice.title }}
                    </a>
                  </div>
                </div>
                <div class="rc">
                  <a class="forum-link" href="#" @click.prevent="openForumTodo"
                    >前往久引论坛 <span aria-hidden="true">↗</span></a
                  >
                  <div class="community">
                    <p>
                      欢迎加入久引用户群：<a
                        href="#"
                        @click.prevent="joinCommunityTodo"
                        >点我加入新群</a
                      >
                    </p>
                    <p v-for="group in communityGroups" :key="group">
                      {{ group }}
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
        <section
          v-else-if="activePanel === 'models'"
          key="models"
          class="models"
        >
          <p class="title_1 title">
            <i class="yumao icon-a-042_NFC"></i><i>模型产品 CLOUD</i>
          </p>
          <div class="model_item">
            <div
              class="item item1 item_gpt"
              :class="{ is_active: activeModelProvider === 0 }"
              @click="selectModelProvider(0, $event)"
            >
              <p>
                <img src="/images/gpt.png" alt="" />
              </p>
              <p>
                <i>GPT 系列</i>
                <i
                  >覆盖复杂推理、编程与通用对话，提供 Sol、Terra、Luna
                  三种能力配置。</i
                >
              </p>
              <p>选购</p>
            </div>

            <div
              class="item item2 item_claude"
              :class="{ is_active: activeModelProvider === 1 }"
              @click="selectModelProvider(1, $event)"
            >
              <p>
                <img src="/images/claude.jpg" alt="" />
              </p>
              <p>
                <i>Claude 系列</i>
                <i
                  >Anthropic
                  模型系列，覆盖复杂推理、智能体编程、视觉理解与低延迟处理。</i
                >
              </p>
              <p>选购</p>
            </div>

            <div
              class="item item3 item_grok"
              :class="{ is_active: activeModelProvider === 2 }"
              @click="selectModelProvider(2, $event)"
            >
              <p>
                <img src="/images/grok.jpg" alt="" />
              </p>
              <p>
                <i>Grok 系列</i>
                <i
                  >xAI
                  推理模型，适合实时问答、趋势分析与需要快速响应的多模态任务。</i
                >
              </p>
              <p>选购</p>
            </div>

            <div
              class="item item4 item_deepseek"
              :class="{ is_active: activeModelProvider === 3 }"
              @click="selectModelProvider(3, $event)"
            >
              <p>
                <img src="/images/deepseek.jpg" alt="" />
              </p>
              <p>
                <i>DeepSeek 系列</i>
                <i
                  >面向中文对话、深度推理与代码生成，兼顾性能、成本和工程开发效率。</i
                >
              </p>
              <p>选购</p>
            </div>
          </div>
          <p class="title_2 title">
            <i class="yumao icon-a-042_NFC"></i><i>模型型号 CLOUD</i>
          </p>
          <div class="model_item_son">
            <Transition name="model-list" mode="out-in">
              <div v-if="activeModelProvider === 0" key="gpt" class="gpt">
                <p class="model-astra" @click="show_Gpt_6">
                  <em class="name">Gpt-6.0-astra</em>
                  <em class="desc">旗舰智能体与长程复杂推理</em>
                  <img src="/images/gpt.png" alt="Gpt-6.0-astra" />
                </p>
                <p>
                  <em class="name">Gpt-5.6-sol</em>
                  <em class="desc">旗舰推理与复杂任务</em>
                  <img src="/images/gpt.png" alt="" />
                </p>
                <p>
                  <em class="name">Gpt-5.6-terra</em>
                  <em class="desc">均衡通用与代码能力</em>
                  <img src="/images/gpt.png" alt="" />
                </p>
                <p>
                  <em class="name">Gpt-5.6-luna</em>
                  <em class="desc">轻量快速的日常对话</em>
                  <img src="/images/gpt.png" alt="" />
                </p>
              </div>
              <div
                v-else-if="activeModelProvider === 1"
                key="claude"
                class="claude"
              >
                <p class="f5 model-fable">
                  <em class="name">Claude Fable 5</em>
                  <em class="desc">长时智能体与深度推理</em>
                  <img src="/images/claude.jpg" alt="Claude Fable 5" />
                </p>
                <p>
                  <em class="name">Claude Opus 5</em>
                  <em class="desc">复杂编程与企业级任务</em>
                  <img src="/images/claude.jpg" alt="Claude Opus 5" />
                </p>
                <p>
                  <em class="name">Claude Sonnet 5</em>
                  <em class="desc">速度与智能的均衡选择</em>
                  <img src="/images/claude.jpg" alt="Claude Sonnet 5" />
                </p>
                <p>
                  <em class="name">Claude Haiku 4.5</em>
                  <em class="desc">低延迟与高吞吐处理</em>
                  <img src="/images/claude.jpg" alt="Claude Haiku 4.5" />
                </p>
              </div>
              <div
                v-else-if="activeModelProvider === 2"
                key="grok"
                class="grok"
              >
                <p class="model-grok">
                  <em class="name">Grok-4.6</em>
                  <em class="desc">高阶推理与实时问答</em>
                  <img src="/images/grok.jpg" alt="" />
                </p>
                <p>
                  <em class="name">Grok-4-fast</em>
                  <em class="desc">低延迟的快速响应</em>
                  <img src="/images/grok.jpg" alt="" />
                </p>
                <p>
                  <em class="name">Grok-3-mini</em>
                  <em class="desc">轻量高效的日常对话</em>
                  <img src="/images/grok.jpg" alt="" />
                </p>
              </div>
              <div v-else key="deepseek" class="deepseek">
                <p class="model-deepseek-pro">
                  <em class="name">DeepSeek-V4-Pro</em>
                  <em class="desc">通用多轮对话</em>
                  <img src="/images/deepseek.jpg" alt="" />
                </p>
                <p>
                  <em class="name">DeepSeek-R1</em>
                  <em class="desc">深度推理与解题</em>
                  <img src="/images/deepseek.jpg" alt="" />
                </p>
                <p>
                  <em class="name">DeepSeek-Coder</em>
                  <em class="desc">代码生成与调试</em>
                  <img src="/images/deepseek.jpg" alt="" />
                </p>
              </div>
            </Transition>
          </div>

          <p class="title_2 title">
            <i class="yumao icon-a-042_NFC"></i><i>其他型号 CLOUD</i>
          </p>
          <div class="model_item_son model_item_old">
            <Transition name="model-list" mode="out-in">
              <div
                :key="`legacy-${activeModelProvider}`"
                class="legacy-models btn"
              >
                <p v-for="model in activeLegacyModels" :key="model.name">
                  <em class="name">{{ model.name }}</em>
                  <em class="desc">{{ model.description }}</em>
                  <img :src="model.image" :alt="model.name" />
                </p>
              </div>
            </Transition>
          </div>
        </section>
        <section
          v-else-if="activePanel === 'tokens'"
          key="tokens"
          class="tokens"
        >
          <p class="head">
            <i class="yumao icon-a-042_kanyikan"></i><i>令牌管理</i>
          </p>
          <div class="head_btn">
            <p class="add_btn btn" @click="handleTokenAction('add', $event)">
              添加
            </p>
            <p
              class="clear_btn btn"
              @click="handleTokenAction('clear', $event)"
            >
              删除
            </p>
            <input type="text" placeholder="搜索令牌" maxlength="25" />
            <p
              class="search_btn btn"
              @click="handleTokenAction('search', $event)"
            >
              搜索
            </p>
          </div>
          <div class="list_head">
            <i></i><i>名称</i><i>密钥</i><i>使用额度</i><i>创建时间</i
            ><i>使用时间</i><i>操作状态</i>
          </div>
          <div class="list_token">
            <div v-for="token in tokenList" :key="token.id" class="list_head_1">
              <i></i>
              <i>{{ token.name }}</i>
              <i>{{ token.secret }}</i>
              <i>{{ token.quota }}</i>
              <i>{{ token.createdAt }}</i>
              <i>{{ token.lastUsedAt }}</i>
              <em>
                <i @click="editTokenTodo(token.id)">编辑</i>
                <i @click="disableTokenTodo(token.id)">禁用</i>
                <i @click="deleteTokenTodo(token.id)">删除</i>
              </em>
            </div>
          </div>
        </section>
        <section
          v-else-if="activePanel === 'skills'"
          key="skills"
          class="skills"
        >
          <p class="title"><i class="yumao icon-store"></i><i>技能商店</i></p>
          <p class="search">
            <input type="text" name="" placeholder="搜索应用" />
            <i class="yumao icon-search"></i>
          </p>
          <p class="category-filter">
            <em
              v-for="category in skillCategories"
              :key="category.value"
              :class="{ is_active: activeSkillCategory === category.value }"
              @click="activeSkillCategory = category.value"
            >
              <i v-if="category.icon" :class="['yumao', category.icon]"></i>
              <i>{{ category.label }}</i>
            </em>
          </p>
          <div class="skill_items">
            <div
              v-for="skill in filteredSkillItems"
              :key="skill.id"
              class="item"
              @click="openSkillTodo(skill)"
            >
              <div class="head">
                <p class="left">
                  <img :src="skill.image" :alt="skill.name" />
                  <em
                    ><i>{{ skill.name }}</i
                    ><i>{{ skill.category }}</i></em
                  >
                  <em v-if="skill.official" class="right">
                    <i class="yumao icon-a-042_shoucang-24"></i><i>官方合作</i>
                  </em>
                </p>
              </div>
              <div class="main">{{ skill.description }}</div>
              <div class="bottom">
                <p class="left">
                  <em
                    ><i class="yumao icon-a-042_dianzan-02"></i><i>官网</i></em
                  >
                  <em><i class="yumao icon-a-042_gouwu-27"></i><i>源码</i></em>
                </p>
                <p class="right">
                  <i class="yumao icon-xiazai"></i><i>复制</i>
                </p>
              </div>
            </div>
          </div>
        </section>
        <section
          v-else-if="activePanel === 'sandbox'"
          key="sandbox"
          class="sandbox"
        >
          <div class="l">
            <div class="item_1">
              <p class="title">模型选择</p>
              <p
                v-for="modelGroup in sandboxModelGroups"
                :key="modelGroup.group"
                :class="{
                  'is-active': activeSandboxModelGroup === modelGroup.group,
                }"
              >
                <i :class="['yumao', modelGroup.icon]"></i
                ><i>{{ modelGroup.group }}</i>
                <em class="dropdown">
                  <i
                    v-for="model in modelGroup.models"
                    :key="model.name"
                    @click.stop="selectSandboxModel(model)"
                  >
                    {{ model.name }}
                  </i>
                </em>
              </p>
            </div>

            <div class="item_2">
              <p class="title">热门创意</p>
              <p>
                <i class="yumao icon-jisuanji" style="font-size: 25px"></i
                ><i>图像修复</i>
              </p>
              <p>
                <i class="yumao icon-jisuanji" style="font-size: 25px"></i
                ><i>游戏制作</i>
              </p>
              <p>
                <i class="yumao icon-jisuanji" style="font-size: 25px"></i
                ><i>网站制作</i>
              </p>
            </div>

            <div class="item_3">
              <p class="title">智能体接入</p>
              <p
                class="smart_app_entry"
                role="button"
                tabindex="0"
                @click="openGptAgent"
                @keydown.enter="openGptAgent"
                @keydown.space.prevent="openGptAgent"
              >
                <i class="yumao icon-claude" style="font-size: 25px"></i
                ><i>CodeX</i>
              </p>
              <p
                class="smart_app_entry"
                role="button"
                tabindex="0"
                @click="openClaudeAgent"
                @keydown.enter="openClaudeAgent"
                @keydown.space.prevent="openClaudeAgent"
              >
                <i class="yumao icon-claude" style="font-size: 25px"></i
                ><i>Claude</i>
              </p>
              <p>
                <i class="yumao icon-claude" style="font-size: 25px"></i
                ><i>Wrokbuddy</i>
              </p>
              <p>
                <i class="yumao icon-claude" style="font-size: 25px"></i
                ><i>Trea</i>
              </p>
            </div>
          </div>
          <div class="r">
            <p class="h">
              <em class="yumao icon-a-042_yuyin"></em>
              <em
                ><i>{{ sandboxModel.text }}</i
                ><br /><i>{{ sandboxModel.name }}</i></em
              >
            </p>
            <div ref="messageContainerRef" class="msg_m">
              <div
                v-for="(message, index) in chatMessages"
                :key="index"
                :class="message.role === 'user' ? 'msg_r' : 'msg_l'"
              >
                <template v-if="message.role === 'assistant'">
                  <div class="assistant_stack">
                    <div class="assistant_top">
                      <p>
                        <Transition name="assistant-avatar" mode="out-in">
                          <img
                            :key="sandboxAssistantAvatar"
                            :src="sandboxAssistantAvatar"
                            :alt="`${sandboxModel.name} 助手`"
                          />
                        </Transition>
                      </p>
                      <p
                        class="message_text"
                        :class="{ is_thinking: message.isThinking }"
                      >
                        {{ message.content }}
                      </p>
                    </div>
                    <p
                      v-if="message.attachments?.length"
                      class="chat_attachments assistant_attachments"
                    >
                      <template
                        v-for="attachment in message.attachments"
                        :key="attachment.id"
                      >
                        <span
                          v-if="
                            attachment.kind === 'image' ||
                            attachment.kind === 'video'
                          "
                          class="image_attachment"
                          :class="{
                            video_attachment: attachment.kind === 'video',
                            is_processing: attachment.isProcessing,
                          }"
                        >
                          <video
                            v-if="
                              attachment.kind === 'video' &&
                              attachment.isPlaying
                            "
                            class="sandbox_response_video"
                            :src="attachment.mediaUrl"
                            controls
                            autoplay
                            playsinline
                            preload="metadata"
                          ></video>
                          <img
                            v-else
                            :src="attachment.url"
                            :alt="attachment.name"
                          />
                          <span
                            v-if="attachment.isProcessing"
                            class="image_processing_mask"
                          >
                            <i>{{
                              attachment.kind === "video"
                                ? "正在生成视频"
                                : "正在分析图片"
                            }}</i>
                          </span>
                          <button
                            v-else-if="
                              attachment.kind === 'video' &&
                              !attachment.isPlaying
                            "
                            type="button"
                            class="video_play_button"
                            :aria-label="`播放${attachment.name}`"
                            @click="playSandboxVideo(attachment)"
                          ></button>
                        </span>
                        <span v-else class="file_attachment">
                          <i
                            class="yumao icon-a-042_wenjian"
                            aria-hidden="true"
                          ></i>
                          <span :title="attachment.name">{{
                            attachment.name
                          }}</span>
                        </span>
                      </template>
                    </p>
                  </div>
                </template>
                <template v-else>
                  <div class="message_stack">
                    <div class="message_top">
                      <p v-if="message.content" class="message_text">
                        {{ message.content }}
                      </p>
                      <p><img :src="qq_img" alt="用户头像" /></p>
                    </div>
                    <p
                      v-if="message.attachments?.length"
                      class="chat_attachments"
                    >
                      <template
                        v-for="attachment in message.attachments"
                        :key="attachment.id"
                      >
                        <span
                          v-if="attachment.kind === 'image'"
                          class="image_attachment"
                          :class="{ is_processing: attachment.isProcessing }"
                        >
                          <img :src="attachment.url" :alt="attachment.name" />
                          <span class="image_processing_mask">
                            <i>正在分析图片</i>
                          </span>
                        </span>
                        <span v-else class="file_attachment">
                          <i
                            class="yumao icon-a-042_wenjian"
                            aria-hidden="true"
                          ></i>
                          <span :title="attachment.name">{{
                            attachment.name
                          }}</span>
                        </span>
                      </template>
                    </p>
                  </div>
                </template>
              </div>
            </div>
            <div
              class="file_todo_area"
              :class="{ has_files: selectedFiles.length > 0 }"
            >
              <input
                ref="fileInput"
                type="file"
                multiple
                @change="handleFileChange"
              />
              <TransitionGroup name="file-item" tag="div" class="file_list">
                <div
                  v-for="(file, index) in selectedFiles"
                  :key="`${file.name}-${file.lastModified}-${index}`"
                  class="file_item"
                >
                  <span class="file_type">FILE</span>
                  <span class="file_name" :title="file.name">{{
                    file.name
                  }}</span>
                  <button
                    type="button"
                    :aria-label="`移除文件 ${file.name}`"
                    @click="removeSelectedFile(index)"
                  >
                    ×
                  </button>
                </div>
              </TransitionGroup>
            </div>
            <div class="send_b">
              <p>
                <i class="yumao"></i>
                <i class="yumao icon-a-042_wenjian" @click="todofile"></i>
                <input
                  v-model="chatInput"
                  type="text"
                  placeholder="输入消息..."
                  aria-label="输入消息"
                  @keyup.enter="sendChatMessage"
                />
                <i
                  class="yumao icon-a-042_faxian"
                  role="button"
                  aria-label="发送消息"
                  @click="sendChatMessage"
                ></i>
              </p>
            </div>
          </div>
        </section>
        <section
          v-else-if="activePanel === 'account'"
          key="account"
          class="account"
        >
          <div class="l">
            <div class="item_1">
              <p><i class="yumao icon-store"></i><i>基本材料</i></p>
              <p><i class="yumao icon-store"></i><i>其他信息</i></p>
            </div>
          </div>
          <div class="r">
            <div class="set_left">
              <div class="item user_info">
                <p class="title">个人资料</p>
                <div>
                  <p class="img l">
                    <img :src="qq_img" alt="用户头像" />
                  </p>
                  <p class="r">
                    <em>用户ID: 2132</em>
                    <em>用户邮箱: 1799498990@qq.com</em>
                    <em>注册日期: 2019年07月15日</em>
                  </p>
                </div>
              </div>

              <div class="pass_set">
                <p class="title">修改密码</p>
                <p class="pass_old">
                  <em>旧密码</em>
                  <input
                    v-model="passwordForm.oldPassword"
                    type="password"
                    placeholder="请输入旧密码"
                    @input="
                      passwordForm.oldPassword = indexStore.handle_inp($event)
                    "
                  />
                  <em class="yumao icon-yanjing"></em>
                </p>
                <p class="pass_new">
                  <em>新密码</em>
                  <input
                    v-model="passwordForm.newPassword"
                    type="password"
                    placeholder="请输入新密码"
                    @input="
                      passwordForm.newPassword = indexStore.handle_inp($event)
                    "
                  />
                  <em class="yumao icon-yanjing"></em>
                </p>
                <p class="pass_new_1">
                  <em>确认密码</em>
                  <input
                    v-model="passwordForm.confirmPassword"
                    type="password"
                    placeholder="请再次输入新密码"
                    @input="
                      passwordForm.confirmPassword =
                        indexStore.handle_inp($event)
                    "
                  />
                  <em class="yumao icon-yanjing"></em>
                </p>
                <p v-if="passwordHint" class="password_hint">
                  {{ passwordHint }}
                </p>
                <p class="send_btn">
                  <em @click="confirmPasswordTodo">确认修改</em>
                  <em @click="cancelPasswordTodo">取消修改</em>
                </p>
              </div>

              <div class="mail_set">
                <p class="title">修改邮箱</p>
                <p class="mail_old">
                  <em>当前邮箱</em>
                  <input
                    v-model="mailForm.oldEmail"
                    type="email"
                    placeholder="请输入当前邮箱"
                    @input="mailForm.oldEmail = indexStore.handle_inp($event)"
                  />
                </p>
                <p class="mail_new">
                  <em>新邮箱</em>
                  <input
                    v-model="mailForm.newEmail"
                    type="email"
                    placeholder="请输入新邮箱"
                    @input="mailForm.newEmail = indexStore.handle_inp($event)"
                  />
                </p>
                <p v-if="mailHint" class="mail_hint">{{ mailHint }}</p>
                <p class="send_btn">
                  <em @click="confirmMailTodo">确认修改</em>
                  <em @click="cancelMailTodo">取消修改</em>
                </p>
              </div>
            </div>
            <div class="set_right">
              <article
                v-for="plan in pricingPlans"
                :key="plan.id"
                class="plan_card"
                :class="[plan.className]"
                tabindex="0"
                :aria-label="`${plan.name}，每月 ${plan.price} 人民币`"
                @click="selectPlan(plan.id)"
                @keydown.enter.prevent="selectPlan(plan.id)"
                @keydown.space.prevent="selectPlan(plan.id)"
              >
                <div class="plan_head">
                  <span>{{ plan.badge }}</span>
                  <em v-if="plan.reward">{{ plan.reward }}</em>
                </div>
                <div class="plan_price">
                  <strong>{{ plan.price }}</strong
                  ><span>人民币</span>
                  <small>{{ plan.price === 0 ? "长期免费" : "每月" }}</small>
                </div>
                <div class="plan_art" aria-hidden="true">
                  <span></span><span></span><span></span>
                  <strong>{{ plan.code }}</strong>
                </div>
                <ul>
                  <li v-for="feature in plan.features" :key="feature">
                    {{ feature }}
                  </li>
                </ul>
                <div class="plan_footer">
                  <button type="button" @click.stop="subscribePlan(plan.id)">
                    {{ subscribedPlanId === plan.id ? "已选择" : "订阅" }}
                  </button>
                  <span>{{ plan.caption }}</span>
                </div>
              </article>
              <p v-if="planFeedback" class="plan_feedback" role="status">
                {{ planFeedback }}
              </p>
            </div>
          </div>
        </section>
        <section
          v-else-if="activePanel === 'deploy'"
          key="deploy"
          class="deploy center"
        >
          <div class="deploy_main">
            <p>
              <em class="btn"
                ><i class="yumao icon-a-042_lianxiren"></i> <i>联系销售</i></em
              >
            </p>
            <div class="grid_xx">
              <div class="r1">
                <div class="node_heading">
                  <span>GPU TRAINING RACK</span>
                  <h3>36 卡 H100 训练服务器</h3>
                  <p>面向大模型预训练与分布式微调</p>
                </div>
                <img src="/images/f3.png" alt="H100 训练服务器" />
                <ul>
                  <li>8 × NVIDIA H100 SXM5</li>
                  <li>640 GB HBM3 · 400 Gb/s InfiniBand</li>
                  <li>AMD EPYC 9654 × 2</li>
                  <li>512 GB ECC DDR5</li>
                  <li>7.68 TB NVMe SSD</li>
                  <li>支持 7 × 24 小时长任务</li>
                  <li>8 × 80 GB HBM3 高带宽显存</li>
                  <li>双路冗余电源与全链路健康监测</li>
                  <li>支持容器镜像、作业队列与断点续训</li>
                </ul>
              </div>
              <div class="r2">
                <div class="node_heading">
                  <span>ELASTIC INFERENCE</span>
                  <h3>弹性推理节点</h3>
                  <p>在线推理与自动扩容</p>
                </div>
                <ul class="mini_specs">
                  <li>4 × NVIDIA L40S</li>
                  <li>192 GB GDDR6</li>
                  <li>低至 18 ms 响应</li>
                </ul>
                <img src="/images/f1.png" alt="弹性推理服务器" />
                <em>4 × NVIDIA L40S</em>
              </div>
              <div class="r3">
                <div class="node_heading">
                  <span>DEDICATED NODE</span>
                  <h3>专属计算节点</h3>
                  <p>私有模型与敏感数据</p>
                </div>
                <ul class="mini_specs">
                  <li>AMD EPYC 9654 × 2</li>
                  <li>512 GB ECC DDR5</li>
                  <li>隔离网络与专属存储</li>
                </ul>
                <img src="/images/f2.png" alt="专属计算服务器" />
                <em>2 × AMD EPYC 9654</em>
              </div>
              <div class="r4">
                <span>RESOURCE POOL</span>
                <strong>2,048</strong>
                <p>可调度 GPU 加速卡</p>
                <ul class="pool_specs">
                  <li><b>96</b><span>训练集群</span></li>
                  <li><b>60 s</b><span>弹性扩容</span></li>
                  <li><b>400 Gb/s</b><span>高速互联</span></li>
                  <li><b>48</b><span>可用区域</span></li>
                  <li><b>768</b><span>计算节点</span></li>
                  <li><b>24 h</b><span>监控值守</span></li>
                  <li><b>32 TB/s</b><span>存储吞吐</span></li>
                  <li><b>18 ms</b><span>推理响应</span></li>
                  <li><b>7 × 24</b><span>持续服务</span></li>
                </ul>
              </div>
              <div class="r5">
                <span>MODEL CATALOG</span>
                <div class="model_list">
                  <p><img src="/images/gpt.png" alt="GPT" />GPT-4.1</p>
                  <p>
                    <img src="/images/claude.png" alt="Claude" />Claude Sonnet
                  </p>
                  <p>
                    <img src="/images/deepseek.png" alt="DeepSeek" />DeepSeek-R1
                  </p>
                  <p><img src="/images/grok.png" alt="Grok" />Grok 3</p>
                  <p><img src="/images/gpt.png" alt="Qwen" />Qwen2.5</p>
                  <p><img src="/images/gpt.png" alt="Llama" />Llama 3.1</p>
                  <p><img src="/images/doubao.png" alt="Doubao" />Doubao Pro</p>
                  <p>
                    <img src="/images/gpt.png" alt="Mistral" />Mistral Large
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Transition>
    </main>
    <div
      v-if="isExitBrandVisible"
      class="exit_ani"
      :class="{
        'is-looking': isExitEyesLooking,
        'is-running': isExitBrandRunning,
      }"
      aria-hidden="true"
    >
      <p class="bg"></p>
      <p class="point">
        <i class="eye eye_left" aria-hidden="true"></i>
        <i class="eye eye_right" aria-hidden="true"></i>
      </p>
      <p class="text_r" style="font-weight: 800">J</p>
      <p class="text_iuYin">iuYin</p>
    </div>
    <div
      class="show_gpt_6"
      v-if="showGpt6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="astra-dialog-title"
      @click.self="toggleGpt6"
    >
      <div class="bg" @click="toggleGpt6"></div>
      <div class="main">
        <div class="hero">
          <!-- <p class="eyebrow">NEXT GENERATION AGENT</p > -->
          <div ref="astraCrystalContainer" class="orb" aria-hidden="true"></div>
          <h1 id="astra-dialog-title">Gpt-6.0-astra</h1>
          <p class="summary">为复杂任务而生的旗舰智能体</p>
          <p class="description">
            Astra
            将长程规划、深度推理与工具协同整合于同一工作流，适合需要持续推进、反复校验与多步骤交付的任务，保障交付质量稳定可控。
          </p>
        </div>

        <div class="capabilities">
          <article>
            <span>01</span>
            <h3>长程规划</h3>
            <p>拆解目标、保留上下文，并持续推进复杂工作。</p>
          </article>
          <article>
            <span>02</span>
            <h3>深度推理</h3>
            <p>处理多约束分析、方案权衡与高难度问题。</p>
          </article>
          <article>
            <span>03</span>
            <h3>工具协同</h3>
            <p>连接代码、数据与内容任务，形成完整交付链路。</p>
          </article>
        </div>

        <div class="dialog-footer">
          <p><i></i> ASTRA READY</p>
          <button type="button" @click="enterSandbox">去体验</button>
        </div>
      </div>
    </div>
    <Transition name="smart-app">
      <div
        v-if="showSmartApp"
        class="show_smart_app"
        role="dialog"
        aria-modal="true"
        aria-labelledby="claude-agent-title"
        @click.self="closeClaudeAgent"
      >
        <div class="bg" @click="closeClaudeAgent"></div>
        <div class="main">
          <button
            type="button"
            class="quick_connect_btn"
            @click="closeClaudeAgent"
          >
            快速接入
          </button>

          <section class="smart_intro">
            <div class="brand_image">
              <img src="/images/claude.jpg" alt="Claude" />
            </div>
            <div class="intro_copy">
              <p class="eyebrow">AGENT CONNECTION</p>
              <h2 id="claude-agent-title">Claude 智能体接入</h2>
              <p class="summary">
                将 Claude
                接入久引工作区，调用代码、文件和知识库工具，持续完成多步骤任务。
              </p>
              <div class="tags" aria-label="接入能力">
                <span>长上下文</span>
                <span>工具调用</span>
                <span>任务协同</span>
              </div>
            </div>
          </section>

          <section class="smart_capabilities" aria-label="Claude 智能体能力">
            <article>
              <span>01</span>
              <h3>上下文理解</h3>
              <p>读取项目资料与历史任务，保持连续的工作上下文。</p>
            </article>
            <article>
              <span>02</span>
              <h3>工具执行</h3>
              <p>按授权范围调用文件、终端与知识库等工作区工具。</p>
            </article>
            <article>
              <span>03</span>
              <h3>结果回传</h3>
              <p>记录执行状态、产物与异常，便于复核和继续处理。</p>
            </article>
          </section>

          <section class="access_steps">
            <div class="steps_heading">
              <p>接入流程</p>
              <span>完成配置后即可在工坊中调用</span>
            </div>
            <ol>
              <li>
                <span>01</span>
                <p><strong>创建凭证</strong><em>配置访问密钥和可用模型</em></p>
              </li>
              <li>
                <span>02</span>
                <p>
                  <strong>授权工具</strong><em>选择允许调用的工作区能力</em>
                </p>
              </li>
              <li>
                <span>03</span>
                <p>
                  <strong>连接测试</strong><em>验证模型响应与工具执行状态</em>
                </p>
              </li>
            </ol>
          </section>

          <footer>
            <p><i></i> CLAUDE CONNECTOR READY</p>
            <span>智能体接入中心</span>
          </footer>
        </div>
      </div>
    </Transition>
    <Transition name="smart-app-code">
      <div
        v-if="showGptApp"
        class="show_smart_app show_gpt_app"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gpt-agent-title"
        @click.self="closeGptAgent"
      >
        <div class="bg" @click="closeGptAgent"></div>
        <div class="main">
          <button
            type="button"
            class="quick_connect_btn"
            @click="closeGptAgent"
          >
            快速接入
          </button>

          <section class="smart_intro">
            <div class="brand_image">
              <img src="/images/gpt.png" alt="GPT" />
            </div>
            <div class="intro_copy">
              <p class="eyebrow">AGENT CONNECTION</p>
              <h2 id="gpt-agent-title">GPT 智能体接入</h2>
              <p class="summary">
                将 GPT
                接入久引工作区，调用代码、文件和知识库工具，持续完成多步骤任务。
              </p>
              <div class="tags" aria-label="接入能力">
                <span>多模态</span>
                <span>工具调用</span>
                <span>任务协同</span>
              </div>
            </div>
          </section>

          <section class="smart_capabilities" aria-label="GPT 智能体能力">
            <article>
              <span>01</span>
              <h3>任务规划</h3>
              <p>理解目标与项目上下文，拆分并持续推进多步骤任务。</p>
            </article>
            <article>
              <span>02</span>
              <h3>工具执行</h3>
              <p>按授权范围调用文件、终端与知识库等工作区工具。</p>
            </article>
            <article>
              <span>03</span>
              <h3>结果回传</h3>
              <p>记录执行状态、产物与异常，便于复核和继续处理。</p>
            </article>
          </section>

          <section class="access_steps">
            <div class="steps_heading">
              <p>接入流程</p>
              <span>完成配置后即可在工坊中调用</span>
            </div>
            <ol>
              <li>
                <span>01</span>
                <p><strong>创建凭证</strong><em>配置访问密钥和可用模型</em></p>
              </li>
              <li>
                <span>02</span>
                <p>
                  <strong>授权工具</strong><em>选择允许调用的工作区能力</em>
                </p>
              </li>
              <li>
                <span>03</span>
                <p>
                  <strong>连接测试</strong><em>验证模型响应与工具执行状态</em>
                </p>
              </li>
            </ol>
          </section>

          <footer>
            <p><i></i> GPT CONNECTOR READY</p>
            <span>智能体接入中心</span>
          </footer>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import * as THREE from "three";
  import { useIndexStore } from "~/stores/index";
  import { useUserStore } from "~/stores/user";

  let router = useRouter();
  let isExitMenuClosing = ref(false);
  let isExitCoverVisible = ref(false);
  let isExitCoverContracting = ref(false);
  let isExitBrandVisible = ref(false);
  let isExitBrandRunning = ref(false);
  let isExitEyesLooking = ref(false);
  let exitEyesTimer: number | null = null;
  let exitCoverStyle = ref<Record<string, string>>({});
  let showGpt6 = ref(false);
  let showSmartApp = ref(false);
  let showGptApp = ref(false);
  let astraCrystalContainer = ref<HTMLElement | null>(null);
  let astraCrystalRenderer: THREE.WebGLRenderer | null = null;
  let astraCrystalScene: THREE.Scene | null = null;
  let astraCrystalAnimationFrame: number | null = null;
  let astraCrystalResizeObserver: ResizeObserver | null = null;
  let fileInput = ref<HTMLInputElement | null>(null);
  let selectedFiles = ref<File[]>([]);
  let activePanel = ref<PanelId>("overview");
  let selectedPlanId = ref("plus");
  let subscribedPlanId = ref("");
  let planFeedback = ref("");
  let chatInput = ref("");
  let noticeTabs = ["公告动态", "最新活动"];
  let indexStore = useIndexStore();
  const userStore = useUserStore();
  const userTokenCookie = useCookie<string | null>("token_user", {
    path: "/",
    sameSite: "strict",
    secure: import.meta.env.PROD,
  });
  let passwordHint = ref("");
  let mailForm = reactive({ oldEmail: "", newEmail: "" });
  let mailHint = ref("");
  let qq_img = ref("https://q1.qlogo.cn/g?b=qq&nk=754796037&s=640");
  let cancelPasswordTodo = () => {
    passwordForm.oldPassword = "";
    passwordForm.newPassword = "";
    passwordForm.confirmPassword = "";
    passwordHint.value = "已取消修改";
    console.info("取消修改密码");
  };
  let passwordForm = reactive({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const todofile = () => {
    fileInput.value?.click();
  };

  const handleFileChange = (event: Event) => {
    if (!(event.target instanceof HTMLInputElement)) return;
    const input = event.target;
    selectedFiles.value = Array.from(input.files ?? []);
    input.value = "";
  };

  const removeSelectedFile = (index: number) => {
    selectedFiles.value.splice(index, 1);
  };

  const exit = (event: MouseEvent) => {
    if (isExitMenuClosing.value || isExitCoverVisible.value) return;
    if (!(event.currentTarget instanceof HTMLElement)) return;

    localStorage.removeItem("token_user");
    userTokenCookie.value = null;
    userStore.token_user = "";

    if (exitEyesTimer !== null) {
      window.clearTimeout(exitEyesTimer);
      exitEyesTimer = null;
    }

    const trigger = event.currentTarget;
    const { left, top, width, height } = trigger.getBoundingClientRect();
    const originX = left + width / 2;
    const originY = top + height / 2;
    const farthestCorner = Math.hypot(
      Math.max(originX, window.innerWidth - originX),
      Math.max(originY, window.innerHeight - originY),
    );
    exitCoverStyle.value = {
      "--exit-origin-x": `${originX}px`,
      "--exit-origin-y": `${originY}px`,
      "--exit-cover-scale": String(Math.ceil(farthestCorner / 12) + 1),
    };
    isExitCoverContracting.value = false;
    isExitBrandVisible.value = false;
    isExitBrandRunning.value = false;
    isExitEyesLooking.value = false;
    isExitMenuClosing.value = true;
  };

  const toggleGpt6 = () => {
    showGpt6.value = !showGpt6.value;
  };

  const show_Gpt_6 = () => {
    toggleGpt6();
  };

  const openClaudeAgent = () => {
    showSmartApp.value = true;
  };

  const closeClaudeAgent = () => {
    showSmartApp.value = false;
  };

  const openGptAgent = () => {
    showGptApp.value = true;
  };

  const closeGptAgent = () => {
    showGptApp.value = false;
  };

  const quickConnectClaude = () => {
    // TODO: 接入 Claude 智能体授权与配置流程。
    console.info("Claude 快速接入功能待实现");
  };

  const showExitCover = (event: TransitionEvent) => {
    if (
      event.target !== event.currentTarget ||
      !["opacity", "transform"].includes(event.propertyName) ||
      !isExitMenuClosing.value ||
      isExitCoverVisible.value
    ) {
      return;
    }

    isExitCoverVisible.value = true;
  };

  const handleExitCoverAnimation = (event: AnimationEvent) => {
    if (event.target !== event.currentTarget) return;

    if (!isExitCoverContracting.value) {
      isExitBrandVisible.value = true;
      isExitCoverContracting.value = true;
      return;
    }

    isExitCoverVisible.value = false;
    isExitEyesLooking.value = true;
    exitEyesTimer = window.setTimeout(() => {
      isExitEyesLooking.value = false;
      isExitBrandRunning.value = true;
      exitEyesTimer = null;
    }, 1500);
  };

  type PanelId =
    | "overview"
    | "models"
    | "skills"
    | "sandbox"
    | "deploy"
    | "tokens"
    | "account";

  const navItems = [
    { id: "overview", text: "总览", icon: "icon-a-042_fujin" },
    { id: "models", text: "模型", icon: "icon-a-042_ziliao" },
    { id: "sandbox", text: "工坊", icon: "icon-a-042_shoucang-24" },
    { id: "skills", text: "技能", icon: "icon-a-042_youxi-23" },
    { id: "deploy", text: "部署", icon: "icon-a-042_tianqi" },
    { id: "tokens", text: "令牌", icon: "icon-a-042_shoucang-10" },
    { id: "account", text: "账户", icon: "icon-a-042_wode-09" },
  ] as const satisfies ReadonlyArray<{
    id: PanelId;
    text: string;
    icon: string;
  }>;

  const ACTIVE_PANEL_STORAGE_KEY = "user-active-panel";
  const isPanelId = (value: string | null): value is PanelId =>
    navItems.some((item) => item.id === value);

  const selectPanel = (panelId: PanelId) => {
    activePanel.value = panelId;
    localStorage.setItem(ACTIVE_PANEL_STORAGE_KEY, panelId);
  };

  const enterSandbox = () => {
    showGpt6.value = false;
    selectPanel("sandbox");
  };

  const pricingPlans = [
    {
      id: "starter",
      className: "sub_1",
      badge: "免费",
      reward: "",
      price: 0,
      code: "FREE",
      caption: "适合体验",
      features: ["免费模型", "标准速率限制", "每月 0 人民币信用额度"],
    },
    {
      id: "plus",
      className: "sub_2",
      badge: "加量",
      reward: "30% 佣金",
      price: 20,
      code: "PLUS",
      caption: "个人创作",
      features: ["每月 22 人民币抵用金", "10 人民币滚动上限", "200 多种型号"],
    },
    {
      id: "pro",
      className: "sub_3",
      badge: "极好",
      reward: "60% 佣金",
      price: 100,
      code: "PRO",
      caption: "专业工作流",
      features: [
        "每月 110 人民币信用额度",
        "50 人民币滚动上限",
        "托管工具使用",
      ],
    },
    {
      id: "max",
      className: "sub_4",
      badge: "极端",
      reward: "80% 佣金",
      price: 200,
      code: "MAX",
      caption: "团队高负载",
      features: ["每月 220 人民币信用额度", "100 人民币滚动上限", "高费率限制"],
    },
  ] as const;

  const selectPlan = (planId: string) => {
    selectedPlanId.value = planId;
    planFeedback.value = "";
  };

  const subscribePlan = (planId: string) => {
    const plan = pricingPlans.find((item) => item.id === planId);
    if (!plan) return;
    selectedPlanId.value = planId;
    subscribedPlanId.value = planId;
    planFeedback.value = `已选择 ${plan.badge} 套餐，当前仅展示交互效果。`;
  };

  const activeNoticeTab = ref(0);
  const activeModelProvider = ref(0);
  const legacyModelsByProvider = [
    [
      {
        name: "GPT-4o",
        description: "通用多模态",
        image: "/images/gpt.png",
      },
      {
        name: "GPT-4o mini",
        description: "轻量高性价比",
        image: "/images/gpt.png",
      },
      {
        name: "GPT-4 Turbo",
        description: "长上下文分析",
        image: "/images/gpt.png",
      },
      {
        name: "GPT-3.5 Turbo",
        description: "高效基础对话",
        image: "/images/gpt.png",
      },
      {
        name: "GPT-4.1",
        description: "稳定通用能力",
        image: "/images/gpt.png",
      },
    ],
    [
      {
        name: "Claude Opus 4.8",
        description: "复杂推理与长程智能体",
        image: "/images/claude.jpg",
      },
      {
        name: "Claude Opus 4.7",
        description: "高强度编程与自主任务",
        image: "/images/claude.jpg",
      },
      {
        name: "Claude Opus 4.6",
        description: "复杂推理与智能体编程",
        image: "/images/claude.jpg",
      },
      {
        name: "Claude Sonnet 4.6",
        description: "速度与智能均衡",
        image: "/images/claude.jpg",
      },
      {
        name: "Claude Sonnet 4.5",
        description: "通用编程与智能体任务",
        image: "/images/claude.jpg",
      },
    ],
    [
      {
        name: "Grok-2",
        description: "通用推理问答",
        image: "/images/grok.jpg",
      },
      {
        name: "Grok-2 mini",
        description: "轻量快速对话",
        image: "/images/grok.jpg",
      },
      {
        name: "Grok-1",
        description: "基础文本任务",
        image: "/images/grok.jpg",
      },
      {
        name: "Grok Beta",
        description: "早期通用对话",
        image: "/images/grok.jpg",
      },
      {
        name: "Grok-1.5V",
        description: "图文理解能力",
        image: "/images/grok.jpg",
      },
    ],
    [
      {
        name: "DeepSeek-V2.5",
        description: "中文问答写作",
        image: "/images/deepseek.jpg",
      },
      {
        name: "DeepSeek-Coder-V2",
        description: "代码生成调试",
        image: "/images/deepseek.jpg",
      },
      {
        name: "DeepSeek-LLM-67B",
        description: "大参数文本对话",
        image: "/images/deepseek.jpg",
      },
      {
        name: "DeepSeek-Chat",
        description: "基础中文对话",
        image: "/images/deepseek.jpg",
      },
      {
        name: "DeepSeek-VL2",
        description: "图文视觉理解",
        image: "/images/deepseek.jpg",
      },
    ],
  ];
  const activeLegacyModels = computed(
    () => legacyModelsByProvider[activeModelProvider.value] ?? [],
  );
  type ChatAttachment = {
    id: string;
    kind: "image" | "video" | "file";
    name: string;
    url?: string;
    mediaUrl?: string;
    isProcessing?: boolean;
    isPlaying?: boolean;
  };

  type ChatMessage = {
    role: "assistant" | "user";
    content: string;
    attachments?: ChatAttachment[];
    isThinking?: boolean;
  };

  type SandboxModel = {
    name: string;
    image?: string;
    text: string;
  };

  type SandboxModelGroup = {
    group: string;
    icon: string;
    models: SandboxModel[];
  };

  const sandboxModelGroups = ref<SandboxModelGroup[]>([
    {
      group: "文本模型",
      icon: "icon-wenjian",
      models: [
        {
          name: "Gpt-6.0-Astra",
          image: "/images/gpt.png",
          text: "AI 对话",
        },
        {
          name: "Claude Fable 5",
          image: "/images/claude.png",
          text: "AI 对话",
        },
        {
          name: "DeepSeek-V4-Pro",
          image: "/images/deepseek.png",
          text: "AI 对话",
        },
      ],
    },
    {
      group: "图像模型",
      icon: "icon-zhaopian",
      models: [
        { name: "GPT Image 1.5", text: "图像创作" },
        { name: "Flux Kontext", text: "图像创作" },
        { name: "Stable Diffusion 3", text: "图像创作" },
      ],
    },
    {
      group: "视频模型",
      icon: "icon-zhaoxiangji",
      models: [
        { name: "Sora", text: "视频生成" },
        { name: "Runway Gen-4", text: "视频生成" },
        {
          name: "Seedance 2.5",
          image: "/images/doubao.png",
          text: "视频生成",
        },
      ],
    },
  ]);

  const sandboxModel = ref(
    sandboxModelGroups.value[0]?.models[0] ?? {
      name: "Gpt-6.0-Astra",
      image: "/images/gpt.png",
      text: "AI 对话",
    },
  );
  const sandboxAssistantAvatar = computed(
    () => sandboxModel.value.image ?? "/images/gpt.png",
  );
  const activeSandboxModelGroup = computed(
    () =>
      sandboxModelGroups.value.find((modelGroup) =>
        modelGroup.models.some(
          (model) => model.name === sandboxModel.value.name,
        ),
      )?.group,
  );
  const selectSandboxModel = (model: SandboxModel) => {
    sandboxModel.value = model;
  };

  const messageContainerRef = ref<HTMLElement | null>(null);
  const chatMessages = ref<ChatMessage[]>([
    { role: "assistant", content: "你好，有什么需要帮助的" },
  ]);

  const scrollChatToBottom = async () => {
    await nextTick();
    const messageContainer = messageContainerRef.value;
    if (!messageContainer) return;

    messageContainer.scrollTo({
      top: messageContainer.scrollHeight,
      behavior: "smooth",
    });
  };

  const playSandboxVideo = (attachment: ChatAttachment) => {
    if (attachment.kind !== "video" || !attachment.mediaUrl) return;

    attachment.isPlaying = true;
    void scrollChatToBottom();
  };

  const sendChatMessage = () => {
    const content = chatInput.value.trim();
    const attachments: ChatAttachment[] = selectedFiles.value.map((file) => {
      const isImage = file.type.startsWith("image/");

      return {
        id: `${file.name}-${file.lastModified}-${file.size}`,
        kind: isImage ? "image" : "file",
        name: file.name,
        ...(isImage ? { url: URL.createObjectURL(file) } : {}),
      };
    });

    if (!content && attachments.length === 0) return;

    chatMessages.value.push({ role: "user", content, attachments });
    chatInput.value = "";
    selectedFiles.value = [];
    void scrollChatToBottom();

    const imageProcessingAttachments = attachments
      .filter((attachment) => attachment.kind === "image")
      .map((attachment) => ({
        ...attachment,
        id: `processing-${attachment.id}`,
        isProcessing: true,
      }));
    const isDeepSeekV4Pro = sandboxModel.value.name === "DeepSeek-V4-Pro";
    const isVideoRequest = content.includes("视频");
    const processingDuration = isVideoRequest
      ? 60_000
      : imageProcessingAttachments.length > 0
        ? 20_000
        : 17_000;
    const previewImage =
      attachments.find((attachment) => attachment.kind === "image")?.url ??
      "/images/production5.png";
    const processingAttachments: ChatAttachment[] = isVideoRequest
      ? [
          {
            id: `processing-video-${Date.now()}`,
            kind: "video",
            name: "生成的视频",
            url: previewImage,
            mediaUrl: "/video-test.mp4",
            isProcessing: true,
          },
        ]
      : imageProcessingAttachments;

    window.setTimeout(() => {
      chatMessages.value.push({
        role: "assistant",
        content: "正在思考...",
        attachments: processingAttachments,
        isThinking: true,
      });
      void scrollChatToBottom();

      const responseIndex = chatMessages.value.length - 1;

      window.setTimeout(() => {
        const response = chatMessages.value[responseIndex];
        if (!response || response.role !== "assistant") return;

        const hasImageAttachment = attachments.some(
          (attachment) => attachment.kind === "image",
        );

        response.content = isVideoRequest
        ? "视频生成完毕，点击播放按钮查看。"
        : hasImageAttachment
          ? "图片分析完成，已生成结果。"
          : isDeepSeekV4Pro
            ? "Hello, 我是DeepSeek, 来自中国深度求索公司研发的模型, 有什么工作需要处理的吗"
            : "Hello, 我是GPT, 有什么工作需要处理的吗 🤔";
        response.isThinking = false;
        response.attachments = isVideoRequest
        ? [
            {
              id: `video-result-${Date.now()}`,
              kind: "video",
              name: "生成视频",
              url: "/images/test-img.jpg",
              mediaUrl: "/video-test.mp4",
            },
          ]
        : hasImageAttachment
          ? [
              {
                id: `image-result-${Date.now()}`,
                kind: "image",
                name: "图片回复",
                url: "/images/responce-img.jpg",
              },
            ]
          : [];
        void scrollChatToBottom();
      }, processingDuration);
    }, 1000);
  };

  const notices = [
    { title: "[09月13日] 久引2026年7至9月更新日志" },
    { title: "[08月31日] 你好，我是天气狐！" },
    { title: "[07月01日] 云应用7月更新公告，Docker Compose已支持！" },
    { title: "[06月20日] 久引近期计划加更新日志" },
  ];
  const activityNotices = [
    { title: "[进行中] 新用户首月体验活动" },
    { title: "[限时] 云服务器资源包优惠" },
    { title: "[报名中] 开发者交流线上活动" },
    { title: "[福利] 邀请好友领取积分" },
  ];
  const communityGroups = [
    "①群（2000人）（已满）",
    "②群（2000人）（已满）",
    "③群（2000人）（已满）",
  ];
  const tokenList = Array.from({ length: 10 }, (_, index) => {
    const sequence = String(index + 1).padStart(2, "0");

    return {
      id: index + 1,
      name: `Test_token_${sequence}`,
      secret: `sk-2131kisk2ski${sequence}`,
      quota: `${Math.floor(Math.random() * 80 + 10)}%（${Math.floor(
        Math.random() * 800 + 100,
      )}K Token）`,
      createdAt: `2024-12-${sequence} 12:12:34`,
      lastUsedAt: `2025-01-${sequence} 12:12:01`,
    };
  });
  const skillItems = [
    {
      id: 1,
      name: "DeepSeek",
      category: "工具",
      image: "https://cdn.jsdelivr.net/npm/simple-icons@v16/icons/deepseek.svg",
      official: false,
      description:
        "提供通用对话与推理模型及 API，支持文本生成、结构化输出、工具调用与上下文缓存。",
    },
    {
      id: 2,
      name: "Cursor",
      category: "开发",
      image: "https://cdn.jsdelivr.net/npm/simple-icons@v16/icons/cursor.svg",
      official: false,
      description:
        "面向代码库的 AI 编辑器，支持代码补全、自然语言编辑、代理执行与终端命令。",
    },
    {
      id: 3,
      name: "Windsurf",
      category: "开发",
      image: "https://cdn.jsdelivr.net/npm/simple-icons@v16/icons/windsurf.svg",
      official: false,
      description:
        "将画作转换为东方水墨风格，保留主体构图与细节，通过墨色层次、留白和自然笔触强化画面意境。",
    },
    {
      id: 4,
      name: "n8n",
      category: "效率",
      image: "https://cdn.jsdelivr.net/npm/simple-icons@v16/icons/n8n.svg",
      official: false,
      description:
        "可自托管的工作流自动化平台，可连接 API 与应用，并编排 AI 节点、智能体和业务流程。",
    },
    {
      id: 5,
      name: "Dify",
      category: "开发",
      image: "https://cdn.jsdelivr.net/npm/simple-icons@v16/icons/dify.svg",
      official: false,
      description:
        "开源 LLM 应用开发平台，提供工作流、智能体、知识库检索和模型接入能力。",
    },
    {
      id: 6,
      name: "Figma",
      category: "工具",
      image: "https://cdn.jsdelivr.net/npm/simple-icons@v16/icons/figma.svg",
      official: false,
      description:
        "协作式产品设计平台，AI 功能支持生成与编辑设计、原型制作、视觉搜索和内容处理。",
    },
    {
      id: 7,
      name: "Grammarly",
      category: "写作",
      image:
        "https://cdn.jsdelivr.net/npm/simple-icons@v16/icons/grammarly.svg",
      official: false,
      description:
        "AI 写作助手，提供语法校对、清晰度与语气建议、段落改写和多语言支持。",
    },
    {
      id: 8,
      name: "Zapier",
      category: "效率",
      image: "https://cdn.jsdelivr.net/npm/simple-icons@v16/icons/zapier.svg",
      official: false,
      description:
        "应用自动化平台，通过触发器与动作连接业务工具，并支持 AI 工作流、智能体和 MCP。",
    },
    {
      id: 9,
      name: "ElevenLabs",
      category: "工具",
      image:
        "https://cdn.jsdelivr.net/npm/simple-icons@v16/icons/elevenlabs.svg",
      official: false,
      description:
        "AI 音频平台，提供文本转语音、语音克隆、转录、配音和多语言音频生成能力。",
    },
    {
      id: 10,
      name: "Suno",
      category: "工具",
      image: "https://cdn.jsdelivr.net/npm/simple-icons@v16/icons/suno.svg",
      official: false,
      description:
        "AI 音乐创作平台，可根据文本提示、歌词或上传音频生成并编辑完整歌曲。",
    },
    {
      id: 11,
      name: "Mistral AI",
      category: "工具",
      image:
        "https://cdn.jsdelivr.net/npm/simple-icons@v16/icons/mistralai.svg",
      official: false,
      description:
        "提供文本、多模态、代码、OCR 模型及 API，支持推理、工具调用和智能体应用。",
    },
    {
      id: 12,
      name: "Claude",
      category: "写作",
      image:
        "https://cdn.jsdelivr.net/npm/simple-icons@v16/icons/anthropic.svg",
      official: false,
      description:
        "Anthropic 的 AI 助手，面向写作、分析、编程、文件理解和复杂知识任务。",
    },
    {
      id: 13,
      name: "Gemini",
      category: "工具",
      image:
        "https://cdn.jsdelivr.net/npm/simple-icons@v16/icons/googlegemini.svg",
      official: false,
      description:
        "Google 的多模态 AI 助手，可处理文本、图像、音频、视频、文件与代码。",
    },
    {
      id: 14,
      name: "Hugging Face",
      category: "开发",
      image:
        "https://cdn.jsdelivr.net/npm/simple-icons@v16/icons/huggingface.svg",
      official: false,
      description:
        "AI 模型与数据集协作平台，支持发现、下载、部署模型以及托管 Spaces 应用。",
    },
    {
      id: 15,
      name: "LangChain",
      category: "开发",
      image:
        "https://cdn.jsdelivr.net/npm/simple-icons@v16/icons/langchain.svg",
      official: false,
      description:
        "用于构建 AI 智能体的开源框架，可连接模型、工具、数据库和检索系统。",
    },
    {
      id: 16,
      name: "Ollama",
      category: "开发",
      image: "https://cdn.jsdelivr.net/npm/simple-icons@v16/icons/ollama.svg",
      official: false,
      description:
        "用于本地下载、运行和管理大语言模型的工具，同时提供本地 API 与开发客户端。",
    },
    {
      id: 17,
      name: "Perplexity",
      category: "数据",
      image:
        "https://cdn.jsdelivr.net/npm/simple-icons@v16/icons/perplexity.svg",
      official: false,
      description:
        "AI 搜索与研究工具，可检索网络并在回答中提供可追溯的来源引用。",
    },
    {
      id: 18,
      name: "Replicate",
      category: "开发",
      image:
        "https://cdn.jsdelivr.net/npm/simple-icons@v16/icons/replicate.svg",
      official: false,
      description:
        "云端模型运行平台，可通过网页或 API 调用公开模型，覆盖图像、视频、音频和文本任务。",
    },
    {
      id: 19,
      name: "GitHub Copilot",
      category: "开发",
      image:
        "https://cdn.jsdelivr.net/npm/simple-icons@v16/icons/githubcopilot.svg",
      official: false,
      description:
        "GitHub 的 AI 编程助手，支持代码补全、对话、代码审查、代理和命令行开发流程。",
    },
    {
      id: 20,
      name: "Notion AI",
      category: "效率",
      image: "https://cdn.jsdelivr.net/npm/simple-icons@v16/icons/notion.svg",
      official: false,
      description:
        "集成在 Notion 工作空间中的 AI 功能，支持写作、总结、企业搜索和知识整理。",
    },
  ];
  const skillCategories = [
    { label: "全部应用", value: "all", icon: "icon-xingzhuang" },
    { label: "写作", value: "写作" },
    { label: "开发", value: "开发" },
    { label: "数据", value: "数据" },
    { label: "工具", value: "工具" },
    { label: "效率", value: "效率" },
  ];
  const activeSkillCategory = ref("all");
  const filteredSkillItems = computed(() => {
    if (activeSkillCategory.value === "all") return skillItems;

    return skillItems.filter(
      (skill) => skill.category === activeSkillCategory.value,
    );
  });

  const createAstraCrystalGeometry = () => {
    const geometry = new THREE.BufferGeometry();
    const vertices = [0, 1.18, 0];
    for (const y of [0.52, -0.52]) {
      for (let index = 0; index < 6; index += 1) {
        const angle = (Math.PI * 2 * index) / 6 + Math.PI / 6;
        vertices.push(Math.cos(angle) * 0.72, y, Math.sin(angle) * 0.72);
      }
    }
    vertices.push(0, -1.18, 0);
    const indices = [];
    for (let index = 0; index < 6; index += 1) {
      const next = (index + 1) % 6;
      const upper = index + 1;
      const upperNext = next + 1;
      const lower = index + 7;
      const lowerNext = next + 7;
      indices.push(0, upperNext, upper);
      indices.push(upper, upperNext, lowerNext, upper, lowerNext, lower);
      indices.push(13, lower, lowerNext);
    }
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3),
    );
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  };

  const disposeAstraCrystal = () => {
    if (astraCrystalAnimationFrame !== null) {
      cancelAnimationFrame(astraCrystalAnimationFrame);
      astraCrystalAnimationFrame = null;
    }
    astraCrystalResizeObserver?.disconnect();
    astraCrystalResizeObserver = null;
    astraCrystalScene?.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.geometry.dispose();
      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];
      materials.forEach((material) => material.dispose());
    });
    astraCrystalScene = null;
    if (!astraCrystalRenderer) return;
    astraCrystalRenderer.dispose();
    astraCrystalRenderer.forceContextLoss();
    astraCrystalRenderer.domElement.remove();
    astraCrystalRenderer = null;
  };

  const mountAstraCrystal = () => {
    const container = astraCrystalContainer.value;
    if (!container || astraCrystalRenderer) return;
    const scene = new THREE.Scene();
    astraCrystalScene = scene;
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0.08, 4.4);
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);
    astraCrystalRenderer = renderer;
    const crystal = new THREE.Mesh(
      createAstraCrystalGeometry(),
      new THREE.MeshPhysicalMaterial({
        color: 0x8cefc2,
        emissive: 0x1a6d4a,
        emissiveIntensity: 0.12,
        roughness: 0.14,
        metalness: 0.04,
        transparent: true,
        opacity: 0.92,
        transmission: 0.28,
        thickness: 0.55,
        clearcoat: 0.7,
        clearcoatRoughness: 0.12,
      }),
    );
    crystal.rotation.set(-0.16, 0.3, -0.22);
    scene.add(crystal);
    scene.add(new THREE.HemisphereLight(0xe8fff3, 0x176c47, 2.2));
    const highlight = new THREE.DirectionalLight(0xffffff, 2.8);
    highlight.position.set(2.5, 3, 4);
    scene.add(highlight);
    const rimLight = new THREE.PointLight(0x5fdca3, 8, 8);
    rimLight.position.set(-2, -1, 2);
    scene.add(rimLight);
    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    astraCrystalResizeObserver = new ResizeObserver(resize);
    astraCrystalResizeObserver.observe(container);
    resize();
    const render = () => {
      crystal.rotation.y += 0.003;
      renderer.render(scene, camera);
      astraCrystalAnimationFrame = requestAnimationFrame(render);
    };
    render();
  };

  const go_home = () => {
    router.push("/");
  };
  const go_where = (path: string) => {
    router.push(path);
  };

  const confirmPasswordTodo = () => {
    if (
      !passwordForm.oldPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      passwordHint.value = "请完整填写密码信息";
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      passwordHint.value = "新密码至少需要 6 个字符";
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      passwordHint.value = "两次输入的新密码不一致";
      return;
    }

    passwordHint.value = "校验通过，密码修改接口待接入";
    console.info("确认修改密码");
  };

  const isValidEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value);

  const confirmMailTodo = () => {
    if (!mailForm.oldEmail || !mailForm.newEmail) {
      mailHint.value = "请完整填写邮箱信息";
      return;
    }

    if (!isValidEmail(mailForm.oldEmail) || !isValidEmail(mailForm.newEmail)) {
      mailHint.value = "请输入格式正确的邮箱地址";
      return;
    }

    if (mailForm.oldEmail === mailForm.newEmail) {
      mailHint.value = "新邮箱需要与当前邮箱不同";
      return;
    }

    mailHint.value = "校验通过，邮箱修改接口待接入";
    console.info("确认修改邮箱");
  };

  const cancelMailTodo = () => {
    mailForm.oldEmail = "";
    mailForm.newEmail = "";
    mailHint.value = "已取消修改";
    console.info("取消修改邮箱");
  };

  const selectModelProvider = (provider: number, event: MouseEvent) => {
    activeModelProvider.value = provider;
    indexStore.createRipple(event);
  };

  const handleTokenAction = (
    action: "add" | "search" | "clear",
    event: MouseEvent,
  ) => {
    indexStore.createRipple(event);

    if (action === "add") addTokenTodo();
    if (action === "search") searchTokenTodo();
    if (action === "clear") clearTokenTodo();
  };

  const openServiceTodo = (server: string) => console.info("打开服务入口");
  const openNoticeTodo = (notice: string) => console.info("打开公告");
  const openForumTodo = () => console.info("前往久引论坛");
  const joinCommunityTodo = () => console.info("加入久引用户群");
  const viewMessagesTodo = () => console.info("查看消息");
  const switchBackgroundTodo = () => console.info("切换背景");
  const addTokenTodo = () => console.info("添加令牌");
  const searchTokenTodo = () => console.info("搜索令牌");
  const clearTokenTodo = () => console.info("删除令牌");
  const editTokenTodo = (id: number) => console.info("编辑令牌", id);
  const disableTokenTodo = (id: number) => console.info("禁用令牌", id);
  const deleteTokenTodo = (id: number) => console.info("删除令牌", id);
  const openSkillTodo = (skill: (typeof skillItems)[number]) =>
    console.info("打开技能", skill);

  watch(showGpt6, (isOpen) => {
    if (isOpen) {
      nextTick(mountAstraCrystal);
      return;
    }
    disposeAstraCrystal();
  });

  onMounted(() => {
    const savedPanel = localStorage.getItem(ACTIVE_PANEL_STORAGE_KEY);
    if (isPanelId(savedPanel)) activePanel.value = savedPanel;
  });

  onBeforeUnmount(() => {
    disposeAstraCrystal();
    if (exitEyesTimer !== null) {
      window.clearTimeout(exitEyesTimer);
      exitEyesTimer = null;
    }
  });
</script>

<style lang="less" scoped>
  #pages_user_index {
    position: fixed;
    z-index: 0;
    inset: 0;
    overflow: hidden;
    &::before {
      position: absolute;
      inset: -10px;
      z-index: 0;
      background: url("/images/bg5.png") center / cover no-repeat;
      content: "";
      filter: blur(2px);
    }
    header {
      position: fixed;
      width: 100%;
      z-index: 2;
      height: 68px;
      background: white;
      box-shadow: 0 0 1px rgb(155, 147, 147);
      .header_main {
        display: flex;
        width: 88%;
        height: 100%;
        margin: 0 auto;
        > div {
          height: 100%;
          width: 50%;
        }
        > .l {
          display: flex;
          align-items: center;
          .img {
            display: flex;
            align-items: center;
            img:nth-of-type(1) {
              width: 30px;
              height: 30px;
            }
            img:nth-of-type(2) {
              width: 110px;
              margin-right: 20px;
            }
            p {
              margin-right: 20px;
              em:nth-of-type(1) {
                margin-right: 10px;
              }
            }
          }
        }
        > .r {
          display: flex;
          justify-content: flex-end;
          align-items: center;

          > p {
            margin-left: 20px;
          }
          .look_msg,
          .set_bg {
            position: relative;
            .yumao {
              font-size: 30px;
              color: rgb(78, 158, 54);
            }
            .set_bg_tip {
              position: absolute;
              top: 43px;
              left: 50%;
              z-index: 2;
              padding: 8px 10px;
              border-radius: 3px;
              background: #29a05f;
              color: white;
              font-size: 15px;
              font-style: normal;
              opacity: 0;
              pointer-events: none;
              transform: translate(-50%, -5px);
              transition:
                opacity 0.2s,
                transform 0.2s;
              white-space: nowrap;
            }
            &:hover .set_bg_tip {
              opacity: 1;
              transform: translate(-50%, 0);
            }
          }
          .user_menu {
            position: relative;
            display: flex;
            align-items: center;
            height: 100%;
            margin-left: 20px;

            > p + p {
              margin-left: 20px;
            }
            .info {
              display: flex;
              flex-direction: column;
              text-align: right;
              font-size: 16px;
              i {
                font-style: normal;
              }
              i:nth-of-type(1) {
                font-weight: 600;
              }
            }
            .img {
              position: relative;
              i {
                position: absolute;
                right: -3px;
                bottom: -3px;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 14px;
                height: 14px;
                border: 2px solid white;
                border-radius: 50%;
                background: #29a05f;
                box-shadow: 0 2px 5px rgb(31 41 55 / 20%);
                color: white;
                font-size: 12px;
                font-style: normal;
                line-height: 1;
              }
              img {
                width: 40px;
                height: 40px;
                border-radius: 90px;
              }
            }
            .show_li {
              position: absolute;
              top: 100%;
              right: 0;
              z-index: 3;
              box-sizing: border-box;
              width: 160px;
              margin: 0;
              padding: 8px 0;
              border: 1px solid #e5ece7;
              border-radius: 4px;
              background: white;
              box-shadow: 0 12px 28px rgb(31 41 55 / 15%);
              opacity: 0;
              pointer-events: none;
              transform: translateY(-6px);
              transition:
                opacity 0.2s,
                transform 0.2s;

              &.is-exiting {
                opacity: 0;
                pointer-events: none;
                transform: translateY(-8px) scale(0.94);
              }

              em {
                display: flex;
                align-items: center;
                height: 34px;
                padding: 0 12px;
                color: #72717f;
                font-size: 16px;
                transition:
                  background 0.2s,
                  color 0.2s;
                i {
                  font-style: normal;
                }
                .yumao {
                  width: 28px;
                  margin-right: 12px;
                  font-size: 21px;
                }
                &:hover {
                  background: #edf8f0;
                  color: #29a05f;
                }
                &.uid {
                  color: #29a05f;
                }
                &.is_divider {
                  margin-top: 6px;
                  border-top: 1px solid #edf0ee;
                  padding-top: 8px;
                }
              }
            }
            &:hover .show_li:not(.is-exiting) {
              opacity: 1;
              pointer-events: auto;
              transform: translateY(0);
            }
          }
        }
      }
    }
    nav {
      position: fixed;
      top: 88px;
      right: 0;
      left: 0;
      z-index: 1;
      height: 70px;
      width: 100%;
      > div {
        display: flex;
        align-items: center;
        width: 88%;
        height: 100%;
        margin: 0 auto;
        background: white;
        .item {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 90px;
          height: 42px;
          margin-left: 20px;
          border-radius: 5px;
          background: #f0f3f1;
          color: #517b61;
          font-size: 16px;
          font-style: normal;
          cursor: pointer;
          transition:
            background 0.2s,
            box-shadow 0.2s,
            color 0.2s,
            transform 0.2s;
          i {
            font-style: normal;
          }
          .yumao:first-child {
            margin-right: 4px;
            font-size: 26px;
          }
          .yumao:last-child {
            margin-left: 4px;
            font-size: 20px;
            opacity: 0.65;
          }
          &:hover {
            background: #e4f5e9;
            color: #38aa71;
            transform: translateY(-1px);
          }
          &.is_select {
            background: linear-gradient(135deg, #5cab8b, #50bfa0);
            box-shadow: 0 2px 5px rgba(37, 124, 89, 0.3);
            color: white;
            .yumao:last-child {
              opacity: 0.9;
            }
          }
        }
        .nav_easter_eggs {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-right: 18px;
          margin-left: auto;

          .flow_portal {
            position: relative;
            display: flex;
            align-items: center;
            width: 146px;
            height: 44px;
            padding: 0 14px;
            overflow: hidden;
            border: 1px solid rgba(65, 162, 119, 0.28);
            border-radius: 22px 8px 22px 8px;
            outline: 0;
            color: #286548;
            background: linear-gradient(135deg, #e9fff3, #c8f3dd);
            box-shadow:
              0 8px 18px rgba(53, 139, 95, 0.13),
              inset 0 1px rgba(255, 255, 255, 0.85);
            cursor: pointer;
            transition:
              border-radius 260ms ease,
              box-shadow 260ms ease,
              transform 260ms cubic-bezier(0.22, 1, 0.36, 1);

            &::before {
              position: absolute;
              top: -60%;
              bottom: -60%;
              left: -45%;
              width: 34%;
              background: rgba(255, 255, 255, 0.7);
              content: "";
              filter: blur(6px);
              transform: rotate(18deg);
              transition: left 480ms ease;
            }

            &::after {
              position: absolute;
              right: 10px;
              bottom: 8px;
              width: 5px;
              height: 5px;
              border-radius: 50%;
              background: #3dae75;
              box-shadow: 0 0 0 0 rgba(61, 174, 117, 0.35);
              content: "";
              animation: flow-portal-pulse 2.2s infinite;
            }

            > em {
              position: relative;
              z-index: 1;
              font-style: normal;

              &.yumao {
                margin-right: 8px;
                font-size: 21px;
                animation: flow-portal-float 2.8s ease-in-out infinite;
              }

              &:nth-child(2) {
                font-size: 14px;
                font-weight: 700;
              }
            }

            > span {
              position: absolute;
              top: 5px;
              right: 9px;
              color: rgba(40, 101, 72, 0.48);
              font-size: 7px;
              letter-spacing: 1px;
            }

            &:hover,
            &:focus-visible {
              border-radius: 8px 22px 8px 22px;
              box-shadow:
                0 12px 24px rgba(53, 139, 95, 0.22),
                0 0 0 3px rgba(113, 213, 163, 0.14);
              transform: translateY(-3px) scale(1.025);

              &::before {
                left: 118%;
              }
            }

            &:active {
              transform: translateY(0) scale(0.98);
            }

            &.flow_portal_editor {
              color: #f2fff8;
              background: linear-gradient(135deg, #3b9d70, #75d6aa);

              > span {
                color: rgba(255, 255, 255, 0.62);
              }

              &::after {
                background: #eafff3;
              }
            }
          }
        }
      }
    }

    @keyframes flow-portal-pulse {
      70% {
        box-shadow: 0 0 0 7px rgba(61, 174, 117, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(61, 174, 117, 0);
      }
    }

    @keyframes flow-portal-float {
      0%,
      100% {
        transform: translateY(0) rotate(0);
      }
      50% {
        transform: translateY(-2px) rotate(-4deg);
      }
    }

    @keyframes plan-feedback-in {
      from {
        opacity: 0;
        transform: translateY(8px) scale(0.96);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    main {
      position: relative;
      top: 185px;
      width: 100%;
      overflow: hidden;
      > section {
        box-sizing: border-box;
        width: 88%;
        height: 100%;
        margin: 0 auto;
        background: transparent;
      }
      > section.overview {
        height: 700px;
        .r1 {
          height: 168px;
          display: flex;
          margin-bottom: 30px;
          > div {
            height: 100%;
            background: white;
            margin-right: 2%;
          }
          > div:nth-last-of-type(1) {
            margin-right: 0;
          }
          .qian {
            width: 28%;
            border: 0.0001px solid transparent;
            > p {
              width: 90%;
              margin: 0 auto;
            }
            > p:nth-of-type(1) {
              margin-top: 20px;
              margin-bottom: 30px;
              font-size: 24px;
              border-bottom: 1px solid rgb(226, 219, 219);
              color: rgb(136, 120, 120);
            }
            > p:nth-of-type(2) {
              margin-bottom: 26px;
              font-size: 24px;
            }
            > p:nth-of-type(3) {
              box-sizing: border-box;
              padding: 0 5%;
              width: 100%;
              height: 34px;
              line-height: 34px;
              background: #eeeff1;
              color: #36b0bb;
            }
          }
          .jifen {
            width: 25%;
            width: 28%;
            border: 0.0001px solid transparent;
            > p {
              width: 90%;
              margin: 0 auto;
            }
            > p:nth-of-type(1) {
              margin-top: 20px;
              margin-bottom: 30px;
              font-size: 24px;
              border-bottom: 1px solid rgb(226, 219, 219);
              color: rgb(136, 120, 120);
            }
            > p:nth-of-type(2) {
              margin-bottom: 26px;
              font-size: 24px;
            }
            > p:nth-of-type(3) {
              box-sizing: border-box;
              padding: 0 5%;
              width: 100%;
              height: 34px;
              line-height: 34px;
              background: #eeeff1;
              color: #36b0bb;
            }
          }
          .xiaofei {
            width: 15%;
            border: 0.0001px solid transparent;
            > p {
              width: 90%;
              margin: 0 auto;
            }
            > p:nth-of-type(1) {
              margin-top: 20px;
              margin-bottom: 30px;
              font-size: 24px;
              border-bottom: 1px solid rgb(226, 219, 219);
              color: rgb(136, 120, 120);
            }
            > p:nth-of-type(2) {
              margin-bottom: 26px;
              font-size: 24px;
            }
            > p:nth-of-type(3) {
              box-sizing: border-box;
              padding: 0 5%;
              width: 100%;
              height: 34px;
              line-height: 34px;
              background: #eeeff1;
              color: #36b0bb;
            }
          }
          .shixiang {
            flex-grow: 1;
            border: 0.0001px solid transparent;
            > p {
              width: 90%;
              margin: 0 auto;
            }
            > p:nth-of-type(1) {
              margin-top: 20px;
              margin-bottom: 30px;
              font-size: 24px;
              border-bottom: 1px solid rgb(226, 219, 219);
              color: rgb(136, 120, 120);
            }
            > p:nth-of-type(2) {
              margin-bottom: 26px;
              font-size: 24px;
              display: flex;
              flex-wrap: wrap;

              em {
                margin: 0 4px;
                margin-bottom: 10px;
                padding: 3px 8px;
                font-size: 16px;
                border-radius: 999px;
                border: 1px solid #29a05f;
                color: #29a05f;
                .yumao {
                  font-size: 20px;
                }
              }
            }
          }
        }
        .r2 {
          width: 100%;
          height: calc(100% - 198px);
          min-height: 500px;
          display: flex;

          > .r2-content {
            display: flex;
            width: 100%;
            height: 100%;
            gap: 2%;
          }

          > .l,
          > .r {
            display: none;
          }

          .service-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            grid-template-rows: repeat(2, minmax(0, 1fr));
            width: 66%;
            height: 100%;
            gap: 28px 3.2%;
          }

          .service-card {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-width: 0;
            padding: 24px 16px;
            overflow: hidden;
            border: 0;
            border-top: 7px solid var(--card-color, #31b5c2);
            border-radius: 6px;
            background: rgba(255, 255, 255, 0.92);
            box-shadow: 0 10px 22px rgba(63, 117, 149, 0.14);
            color: #5b5b78;
            cursor: pointer;

            &::after {
              position: absolute;
              inset: 0;
              background: linear-gradient(
                135deg,
                rgba(255, 255, 255, 0.4),
                transparent 65%
              );
              content: "";
              pointer-events: none;
            }

            strong {
              position: relative;
              z-index: 1;
              font-size: clamp(18px, 1.25vw, 28px);
              font-weight: 700;
              white-space: nowrap;
            }

            small {
              position: relative;
              z-index: 1;
              margin-top: 9px;
              color: #8e8da1;
              font-size: 16px;
              opacity: 0.9;
              transform: translateY(15px);
            }
          }

          .service-card[data-grid-span="2"] {
            grid-column: span 2;
          }

          .service-card--chart {
            align-items: stretch;
            justify-content: flex-end;

            .service-card-chart {
              position: absolute;
              inset: 0;
              z-index: 0;
              width: 90%;
              height: 85%;
              pointer-events: auto;
              margin: 0 auto;
            }
          }

          .service-card--pie {
            align-items: stretch;
            justify-content: flex-end;

            .service-card-pie {
              position: absolute;
              inset: 7px 0 0;
              z-index: 0;
              width: 100%;
              height: calc(100% - 7px);
              pointer-events: auto;
            }
          }

          .service-card--realtime,
          .service-card--gpu,
          .service-card--context {
            align-items: stretch;
            justify-content: flex-end;
          }

          .service-card-realtime,
          .service-card-gpu {
            position: absolute;
            top: 14px;
            right: 8px;
            bottom: 48px;
            left: 8px;
            z-index: 0;
            width: auto;
            height: auto;
            pointer-events: auto;
          }

          .service-card-context {
            position: absolute;
            inset: 7px 0 0;
            z-index: 0;
            width: 100%;
            height: calc(100% - 7px);
            pointer-events: auto;
          }

          .service-card--multi-line {
            align-items: stretch;
            justify-content: flex-end;
            background: #fff;

            strong {
              position: absolute;
              top: 18px;
              left: 20px;
            }

            .service-card-multi-line {
              position: absolute;
              inset: 7px 0 0;
              z-index: 0;
              width: 100%;
              height: calc(100% - 7px);
              pointer-events: auto;
            }
          }

          .service-card--cyan {
            --card-color: #31b5c2;
          }
          .service-card--red {
            --card-color: #f15b60;
          }
          .service-card--green {
            --card-color: #2cbe74;
          }
          .service-card--dark {
            --card-color: #515151;
          }
          .notice-panel {
            display: flex;
            align-self: flex-start;
            flex: 1;
            flex-direction: column;
            overflow: hidden;
            border-radius: 7px;
            background: rgba(255, 255, 255, 0.96);
            box-shadow: 0 10px 22px rgba(63, 117, 149, 0.14);
            color: #5b5b78;
          }

          .title {
            display: flex;
            align-items: center;
            min-height: 56px;
            padding: 0 30px;
            border-bottom: 1px solid #dce2e8;
            gap: 34px;
          }

          .notice-tab {
            position: relative;
            height: 56px;
            padding: 0;
            border: 0;
            background: transparent;
            color: #5b5b78;
            font-size: 20px;
            font-weight: 400;
            cursor: pointer;
            transition: color 200ms ease;

            &.is_active {
              color: #29a05f;
              font-weight: 700;
            }

            &.is_active::after {
              position: absolute;
              right: 0;
              bottom: -1px;
              left: 0;
              height: 4px;
              background: #29a05f;
              content: "";
            }
          }

          .dy {
            position: relative;
            display: flex;
            overflow: hidden;

            .t1,
            .t2 {
              display: flex;
              flex: 0 0 100%;
              flex-direction: column;
              gap: 10px;
              box-sizing: border-box;
              padding: 16px 34px 14px;
              transition:
                transform 280ms ease,
                opacity 280ms ease;
              will-change: transform;

              a {
                overflow: hidden;
                color: #29a05f;
                font-size: 17px;
                text-overflow: ellipsis;
                white-space: nowrap;
                text-decoration: none;

                &:hover {
                  color: #1b7f4a;
                  text-decoration: underline;
                }
              }
            }

            .t1 {
              transform: translateX(0);
            }

            .t2 {
              position: absolute;
              inset: 0;
              opacity: 0;
              pointer-events: none;
              transform: translateX(100%);
            }

            &.is-activity {
              .t1 {
                opacity: 0;
                pointer-events: none;
                transform: translateX(-100%);
              }

              .t2 {
                opacity: 1;
                pointer-events: auto;
                transform: translateX(0);
              }
            }
          }

          .rc {
            border-top: 1px solid #dce2e8;
          }

          .forum-link {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 34px;
            color: #5b5b78;
            font-size: 20px;
            font-weight: 700;
            text-decoration: none;

            &:hover {
              color: #31b5c2;
            }
          }

          .community {
            padding: 10px 34px 22px;
            border-top: 1px solid #dce2e8;
            color: #727486;
            font-size: 17px;
            line-height: 1.9;

            p {
              margin: 0;
            }
            a {
              color: #29a05f;
              text-decoration: none;

              &:hover {
                color: #1b7f4a;
                text-decoration: underline;
              }
            }
          }
        }
      }
      > section.models {
        --panel-top-offset: 185px;
        --panel-bottom-gap: 30px;
        background: white;
        height: calc(100vh - var(--panel-top-offset) - var(--panel-bottom-gap));
        height: calc(
          100dvh - var(--panel-top-offset) - var(--panel-bottom-gap)
        );
        border: 0.0001px solid transparent;
        > .title {
          width: 97%;
          margin: 20px auto 20px;
          color: gray;
          font-size: 20px;
          display: flex;
          align-items: center;
          border-bottom: 1px solid rgb(212, 206, 206);
          padding-bottom: 4px;
          .yumao {
            font-size: 30px;
            margin-right: 15px;
          }
        }
        .model_item {
          width: 95%;
          display: flex;
          flex-wrap: wrap;
          gap: 2%;
          margin: 0 auto 50px;
          .item {
            width: 23.2%;
            height: 150px;
            background: white;
            border-radius: 4px;
            cursor: pointer;
            border-top: 3px solid rgb(49, 161, 138);
            box-shadow: 0 8px 17px rgba(103, 126, 163, 0.12);
            margin-bottom: 30px;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            column-gap: 14px;
            box-sizing: border-box;
            padding: 0 15px;
            transition:
              transform 200ms ease,
              box-shadow 200ms ease,
              border-color 200ms ease;

            p {
              margin: 0;
            }

            p:nth-of-type(1) {
              width: 70px;
              img {
                width: 70px;
                max-height: 70px;
                margin: 0 auto;
                object-fit: contain;
              }
            }
            p:nth-of-type(2) {
              width: 100%;
              min-width: 0;
              display: flex;
              flex-direction: column;
              i:nth-of-type(1) {
                font-size: 24px;
                margin-bottom: 18px;
              }
              i:nth-of-type(2) {
                display: -webkit-box;
                overflow: hidden;
                line-height: 1.45;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 2;
                font-size: 14px;
              }
            }
            p:nth-of-type(3) {
              position: relative;
              width: 110px;
              margin: 0;
              padding: 6px 0;
              border-radius: 2px;
              background: #3ba36c;
              box-shadow: inset 0 -3px rgba(0, 0, 0, 0.14);
              color: white;
              font-size: 14px;
              text-align: center;
            }

            &.is_active {
              border-top-color: #29a05f;
              box-shadow: 0 12px 24px rgba(41, 160, 95, 0.2);
              transform: translateY(-3px);
            }

            :deep(.btn_ripple) {
              position: absolute;
              z-index: 0;
              border-radius: 50%;
              background: rgba(255, 255, 255, 0.5);
              pointer-events: none;
              transform: scale(0);
              animation: model-card-ripple 650ms ease-out forwards;
            }
          }
          .item_gpt {
            p:nth-of-type(1) {
              img {
                width: 60px;
              }
            }
          }
          .item_claude {
            p:nth-of-type(1) {
              img {
                width: 60px;
              }
            }
          }
          .item_grok {
            p:nth-of-type(1) {
              img {
                width: 60px;
              }
            }
          }
          .item_deepseek {
            p:nth-of-type(1) {
              img {
                width: 60px;
              }
            }
          }
          .item:nth-last-of-type(1) {
            margin-right: 0;
          }

          @keyframes model-card-ripple {
            to {
              opacity: 0;
              transform: scale(1);
            }
          }
        }
        .model_item_son {
          width: 95%;
          margin: 0 auto;
          > div {
            width: 100%;
            display: flex;

            > p {
              position: relative;
              display: flex;
              flex-direction: column;
              width: 18%;
              height: 100px;
              box-shadow: 0 8px 17px rgba(103, 126, 163, 0.12);
              border-top: 3px solid rgb(85, 110, 105);
              margin-right: 25px;
              overflow: hidden;
              transition: transform 180ms ease;

              &:hover {
                transform: translateY(-3px);
              }

              img {
                position: absolute;
                width: 80px;
                right: -20px;
                bottom: -20px;
                opacity: 0.2;
                cursor: pointer;
              }
              em {
                width: 90%;
                margin: 0 auto;
                margin-top: 18px;
                cursor: pointer;
              }
              .name {
                font-size: 25px;
              }
              .desc {
                font-size: 17px;
                color: rgb(85, 108, 51);
              }
            }

            > p.model-astra {
              border-top-color: #2b9e5b;
              background: linear-gradient(135deg, #ffffff 58%, #e2f8ea 100%);
              box-shadow: 0 10px 22px rgba(43, 158, 91, 0.2);

              &::after {
                position: absolute;
                top: 8px;
                right: 10px;
                padding: 2px 7px;
                border: 1px solid rgba(43, 158, 91, 0.3);
                border-radius: 10px;
                background: rgba(43, 158, 91, 0.08);
                color: #267c4a;
                content: "ASTRA";
                font-size: 10px;
                letter-spacing: 1px;
              }

              .name {
                color: #237443;
              }

              .desc {
                color: #5b8168;
              }
            }

            > p.model-fable {
              border-top-color: #d97757;
              background: linear-gradient(135deg, #ffffff 58%, #fff0eb 100%);
              box-shadow: 0 10px 22px rgba(217, 119, 87, 0.22);

              &::after {
                position: absolute;
                top: 8px;
                right: 10px;
                padding: 2px 7px;
                border: 1px solid rgba(217, 119, 87, 0.34);
                border-radius: 10px;
                background: rgba(217, 119, 87, 0.09);
                color: #bd5f42;
                content: "FABLE";
                font-size: 10px;
                letter-spacing: 1px;
              }

              .name {
                color: #b85b3e;
              }

              .desc {
                color: #9a6c5c;
              }
            }

            > p.model-grok {
              border-top-color: #252525;
              background: linear-gradient(135deg, #fafafa 58%, #e7e7e7 100%);
              box-shadow: 0 10px 22px rgba(0, 0, 0, 0.2);

              &::after {
                position: absolute;
                top: 8px;
                right: 10px;
                padding: 2px 7px;
                border: 1px solid rgba(0, 0, 0, 0.24);
                border-radius: 10px;
                background: rgba(0, 0, 0, 0.06);
                color: #242424;
                content: "GROK";
                font-size: 10px;
                letter-spacing: 1px;
              }

              .name {
                color: #232323;
              }

              .desc {
                color: #686868;
              }
            }

            > p.model-deepseek-pro {
              border-top-color: #4d6bfe;
              background: linear-gradient(135deg, #ffffff 58%, #e9edff 100%);
              box-shadow: 0 10px 22px rgba(77, 107, 254, 0.22);

              &::after {
                position: absolute;
                top: 8px;
                right: 10px;
                padding: 2px 7px;
                border: 1px solid rgba(77, 107, 254, 0.32);
                border-radius: 10px;
                background: rgba(77, 107, 254, 0.08);
                color: #3d57d0;
                content: "PRO";
                font-size: 10px;
                letter-spacing: 1px;
              }

              .name {
                color: #3d57d0;
              }

              .desc {
                color: #6474b1;
              }
            }
          }

          &.model_item_old > div {
            display: grid;
            grid-template-columns: repeat(5, minmax(0, 1fr));
            gap: 16px;
          }

          &.model_item_old > div > p {
            width: auto;
            margin-right: 0;
          }

          .model-list-enter-active,
          .model-list-leave-active {
            transition:
              opacity 280ms ease,
              transform 280ms cubic-bezier(0.22, 1, 0.36, 1),
              filter 280ms ease;
            will-change: opacity, transform, filter;
          }

          .model-list-enter-from {
            opacity: 0;
            filter: blur(4px);
            transform: translate3d(32px, 12px, 0) scale(0.98);
          }

          .model-list-leave-to {
            opacity: 0;
            filter: blur(2px);
            transform: translate3d(-24px, -6px, 0) scale(0.98);
          }

          .model-list-enter-active > p {
            animation: model-card-enter 360ms cubic-bezier(0.22, 1, 0.36, 1)
              both;
          }

          .model-list-enter-active > p:nth-child(2) {
            animation-delay: 60ms;
          }

          .model-list-enter-active > p:nth-child(3) {
            animation-delay: 120ms;
          }

          &.model_item_old .model-list-enter-active > p:nth-child(1) {
            animation-delay: 0ms;
          }

          &.model_item_old .model-list-enter-active > p:nth-child(2) {
            animation-delay: 70ms;
          }

          &.model_item_old .model-list-enter-active > p:nth-child(3) {
            animation-delay: 140ms;
          }

          &.model_item_old .model-list-enter-active > p:nth-child(4) {
            animation-delay: 210ms;
          }

          &.model_item_old .model-list-enter-active > p:nth-child(5) {
            animation-delay: 280ms;
          }

          @keyframes model-card-enter {
            from {
              opacity: 0;
              transform: translateY(14px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        }
      }
      > section.tokens {
        --token-select-width: 42px;
        --token-name-width: 180px;
        --token-secret-width: 270px;
        --token-quota-width: 250px;
        --token-created-width: 230px;
        --token-used-width: 230px;
        --token-actions-width: 230px;
        height: 750px;
        background: white;
        .head {
          width: 100%;
          margin: 0 auto 20px;
          padding: 20px 20px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgb(210, 200, 200);
          display: flex;
          align-items: center;
          // color: gray;
          color: rgb(66, 157, 66);
          i {
            font-size: 20px;
          }
          .yumao {
            font-size: 28px;
            margin-right: 8px;
            transform: translateY(-3px);
          }
        }
        .head_btn {
          width: 95%;
          margin: 0 auto 20px;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          > p {
            margin-left: 20px;
          }
          input {
            transition: all 0.3s;
            border: 1px solid gray;
            margin-left: 20px;
            height: 30px;
            width: 180px;
            padding: 4px 8px;
            font-size: 18px;
          }
          > p {
            padding: 6px 18px;
            position: relative;
            overflow: hidden;
            border-radius: 3px;
            transition:
              background 200ms ease,
              box-shadow 200ms ease,
              transform 200ms ease;

            :deep(.btn_ripple) {
              position: absolute;
              z-index: 0;
              border-radius: 50%;
              background: rgba(255, 255, 255, 0.48);
              pointer-events: none;
              transform: scale(0);
              animation: model-card-ripple 650ms ease-out forwards;
            }
          }
          .add_btn {
            background: rgb(51, 159, 121);
            color: white;

            &:hover {
              transform: translateY(-2px);
            }
          }
          .search_btn {
            background: rgb(144, 135, 135);
            color: white;

            &:hover {
              transform: translateY(-2px);
            }
          }
          .clear_btn {
            color: white;
            background: rgb(203, 102, 102);

            &:hover {
              transform: translateY(-2px);
            }
          }
        }
        .list_head {
          display: grid;
          grid-template-columns:
            var(--token-select-width)
            var(--token-name-width)
            var(--token-secret-width)
            var(--token-quota-width)
            var(--token-created-width)
            var(--token-used-width)
            var(--token-actions-width);
          align-items: center;
          justify-content: space-between;
          box-sizing: border-box;
          width: 95%;
          min-height: 48px;
          margin: 0 auto;
          padding: 0 20px;
          border: 1px solid #e5eaed;
          border-radius: 5px;
          background: #f9fbfb;
          color: #6c7880;
          font-size: 14px;
          font-weight: 600;

          > i {
            overflow: hidden;
            font-style: normal;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          > i:first-child {
            position: relative;
            width: 16px;
            height: 16px;
            border: 1px solid #b8c5ca;
            border-radius: 4px;
            background: white;
          }
        }
        .list_token {
          display: grid;
          max-height: 480px;
          gap: 8px;
          width: 95%;
          margin: 0 auto;
          padding: 2px 8px 8px 0;
          overflow-x: hidden;
          overflow-y: auto;
          -ms-overflow-style: none;
          scrollbar-width: none;

          &::-webkit-scrollbar {
            display: none;
          }

          div[class^="list_head_"] {
            display: grid;
            grid-template-columns:
              var(--token-select-width)
              var(--token-name-width)
              var(--token-secret-width)
              var(--token-quota-width)
              var(--token-created-width)
              var(--token-used-width)
              var(--token-actions-width);
            align-items: center;
            justify-content: space-between;
            box-sizing: border-box;
            min-height: 56px;
            padding: 0 20px;
            border: 1px solid #edf0f2;
            border-radius: 5px;
            background: #fff;
            color: #46545b;
            transition:
              border-color 180ms ease,
              box-shadow 180ms ease,
              transform 180ms ease;

            > i {
              overflow: hidden;
              font-size: 18px;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            > i:first-child {
              position: relative;
              width: 16px;
              height: 16px;
              border: 1px solid #c5d0d4;
              border-radius: 50%;
              background: #fff;
              transition:
                border-color 180ms ease,
                background 180ms ease;

              &:hover {
                border-color: #339f79;
                background: #eaf8f2;
              }
            }

            > i:nth-of-type(2) {
              color: #256d58;
              font-weight: 700;
              font-size: 18px;
            }

            > i:nth-of-type(3) {
              color: #697a83;
              font-family: Consolas, "Courier New", monospace;
              font-size: 18px;
            }

            > i:nth-of-type(4) {
              color: #2a8a6e;
              font-weight: 600;
            }

            > i:nth-of-type(5),
            > i:nth-of-type(6) {
              color: #7c878c;
              font-size: 18px;
            }

            > em {
              display: flex;
              align-items: center;
              gap: 8px;
              font-style: normal;

              > i {
                padding: 5px 9px;
                border: 1px solid transparent;
                border-radius: 3px;
                font-size: 15px;
                font-style: normal;
                cursor: pointer;
                transition:
                  background 180ms ease,
                  color 180ms ease;

                &:nth-of-type(1) {
                  color: #258469;
                  background: #ebf8f3;

                  &:hover {
                    background: #d5f0e5;
                  }
                }

                &:nth-of-type(2) {
                  color: #a86c1f;
                  background: #fff5df;

                  &:hover {
                    background: #feeac2;
                  }
                }

                &:nth-of-type(3) {
                  color: #c65a5a;
                  background: #fff0f0;

                  &:hover {
                    background: #ffdddd;
                  }
                }
              }
            }

            > p.f5 {
              border-top-color: #d97757;
              background: linear-gradient(135deg, #ffffff 58%, #fff0eb 100%);
              box-shadow: 0 10px 22px rgba(217, 119, 87, 0.22);

              &::after {
                position: absolute;
                top: 8px;
                right: 10px;
                padding: 2px 7px;
                border: 1px solid rgba(217, 119, 87, 0.34);
                border-radius: 10px;
                background: rgba(217, 119, 87, 0.09);
                color: #bd5f42;
                content: "FABLE";
                font-size: 10px;
                letter-spacing: 1px;
              }

              .name {
                color: #b85b3e;
              }

              .desc {
                color: #9a6c5c;
              }
            }
          }
        }
      }
      > section.skills {
        --panel-top-offset: 185px;
        --panel-bottom-gap: 30px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        background: white;
        height: calc(100vh - var(--panel-top-offset) - var(--panel-bottom-gap));
        height: calc(
          100dvh - var(--panel-top-offset) - var(--panel-bottom-gap)
        );
        overflow: hidden;

        .title {
          display: flex;
          align-items: center;
          box-sizing: border-box;
          margin: 0;
          color: rgb(66, 157, 66);
          font-size: 20px;
          border-bottom: 1px solid #e5ebe8;
          padding: 20px 24px;
          padding-bottom: 12px;

          i:nth-of-type(1) {
            font-size: 18px;
            margin-right: 10px;
          }
        }

        .search {
          position: relative;
          width: min(620px, calc(100% - 48px));
          height: 40px;
          margin: 20px 24px 18px;

          input {
            box-sizing: border-box;
            width: 100%;
            height: 40px;
            padding: 0 64px 0 16px;
            border: 1px solid #cfded7;
            border-radius: 6px;
            outline: 0;
            color: #486158;
            font-size: 18px;
            transition:
              border-color 180ms ease,
              box-shadow 180ms ease;

            &::placeholder {
              color: #a9b6b0;
            }

            &:focus {
              border-color: #40ad80;
              box-shadow: 0 0 0 3px rgba(64, 173, 128, 0.14);
            }
          }

          > i {
            position: absolute;
            top: 0;
            right: 0;
            display: grid;
            place-items: center;
            width: 52px;
            height: 40px;
            border-radius: 0 6px 6px 0;
            background: #39a77a;
            color: white;
            font-size: 22px;
            cursor: pointer;
            transition: background 180ms ease;

            &:hover {
              background: #258963;
            }
          }
        }

        .category-filter {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin: 0;
          padding: 0 24px 22px;

          em {
            display: inline-flex;
            align-items: center;
            height: 30px;
            gap: 5px;
            box-sizing: border-box;
            padding: 0 12px;
            border: 1px solid #dce6e1;
            border-radius: 999px;
            background: #fff;
            color: #7a8882;
            font-size: 14px;
            font-style: normal;
            font-weight: 600;
            cursor: pointer;
            transition:
              border-color 180ms ease,
              background 180ms ease,
              color 180ms ease,
              transform 180ms ease;

            > i {
              font-style: normal;
            }

            > i:empty {
              display: none;
            }

            &:hover {
              border-color: #8fd3b7;
              background: #eefaf4;
              color: #278961;
              transform: translateY(-1px);
            }

            &.is_active {
              border-color: #39a77a;
              background: #39a77a;
              color: white;

              > i:first-child {
                font-size: 16px;
              }
            }
          }
        }

        .skill_items {
          flex: 1 1 auto;
          min-height: 0;
          width: 96%;
          margin: 0 auto 32px;
          box-sizing: border-box;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          grid-auto-rows: 195px;
          column-gap: 16px;
          row-gap: 16px;
          align-content: start;
          padding: 2px 8px 8px 0;
          overflow-x: hidden;
          overflow-y: auto;
          -ms-overflow-style: none;
          scrollbar-width: none;

          &::-webkit-scrollbar {
            display: none;
          }

          > .item {
            display: flex;
            flex-direction: column;
            min-width: 0;
            height: 100%;
            box-sizing: border-box;
            padding: 18px 20px;
            overflow: hidden;
            border: 1px solid #e0eee7;
            border-radius: 10px;
            background:
              linear-gradient(
                135deg,
                rgba(238, 251, 245, 0.88),
                transparent 54%
              ),
              #fff;
            box-shadow: 0 7px 18px rgba(62, 131, 100, 0.08);
            cursor: pointer;
            transition:
              border-color 220ms ease,
              box-shadow 220ms ease,
              transform 220ms ease;

            &:hover {
              border-color: #9fd9bd;
              box-shadow: 0 13px 26px rgba(62, 131, 100, 0.16);
              transform: translateY(-2px);
            }

            .head {
              min-width: 0;

              .left {
                display: flex;
                align-items: center;
                min-width: 0;
                margin: 0;

                > img {
                  flex: 0 0 auto;
                  width: 40px;
                  height: 40px;
                  margin-right: 12px;
                  border: 1px solid #d9eee3;
                  border-radius: 10px;
                  background: #effaf4;
                  box-shadow: 0 3px 8px rgba(61, 133, 99, 0.1);
                  object-fit: cover;
                }

                > em {
                  display: flex;
                  flex-direction: column;
                  min-width: 0;
                  font-style: normal;

                  > i {
                    overflow: hidden;
                    font-style: normal;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                  }

                  > i:first-child {
                    color: #486158;
                    font-size: 21px;
                    font-weight: 700;
                  }

                  > i:last-child {
                    align-self: flex-start;
                    margin-top: 6px;
                    padding: 2px 8px;
                    border-radius: 999px;
                    background: #dff5eb;
                    color: #2d9d72;
                    font-size: 12px;
                    font-weight: 600;
                  }

                  &.right {
                    display: inline-flex;
                    flex: 0 0 auto;
                    flex-direction: row;
                    align-items: center;
                    gap: 4px;
                    margin-left: auto;
                    padding: 7px 9px;
                    border-radius: 7px;
                    background: #eefaf4;
                    color: #38a579;

                    > i {
                      font-size: 12px;
                      font-weight: 700;
                    }

                    > i:first-child {
                      color: #44ae83;
                      font-size: 15px;
                    }

                    > i:last-child {
                      margin: 0;
                      padding: 0;
                      background: transparent;
                      color: inherit;
                    }
                  }
                }
              }
            }

            .main {
              display: -webkit-box;
              flex: 0 0 calc(1.55em * 2);
              width: 100%;
              min-width: 0;
              max-height: calc(1.55em * 2);
              overflow: hidden;
              margin-top: 14px;
              color: #718078;
              font-size: 14px;
              line-height: 1.55;
              text-overflow: ellipsis;
              -webkit-box-orient: vertical;
              -webkit-line-clamp: 2;
            }

            .bottom {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-top: 14px;

              .left {
                display: flex;
                align-items: center;
                gap: 16px;
                margin: 0;

                em {
                  display: inline-flex;
                  align-items: center;
                  gap: 4px;
                  color: #7a8b82;
                  font-size: 13px;
                  font-style: normal;

                  i {
                    font-style: normal;
                  }
                }
              }

              .right {
                display: inline-flex;
                align-items: center;
                gap: 5px;
                margin: 0;
                padding: 8px 13px;
                border-radius: 7px;
                background: #38aa7c;
                box-shadow: inset 0 -2px rgba(18, 104, 70, 0.18);
                color: white;
                font-size: 14px;
                font-weight: 700;
                transition:
                  background 180ms ease,
                  transform 180ms ease;

                i {
                  font-style: normal;
                }

                &:hover {
                  background: #278d64;
                  transform: translateY(-1px);
                }
              }
            }
          }
        }
      }
      > section.sandbox {
        --sandbox-top-offset: 185px;
        --sandbox-bottom-gap: 45px;
        box-sizing: border-box;
        display: flex;
        position: relative;
        isolation: isolate;
        height: calc(
          100vh - var(--sandbox-top-offset) - var(--sandbox-bottom-gap)
        );
        height: calc(
          100dvh - var(--sandbox-top-offset) - var(--sandbox-bottom-gap)
        );
        justify-content: space-between;
        > .l {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          gap: 14px;
          width: 14.5%;
          overflow: visible;
          align-self: flex-start;

          > .item_1,
          > .item_2,
          > .item_3 {
            display: flex;
            flex-direction: column;
            gap: 5px;
            box-sizing: border-box;
            padding: 8px;
            border: 1px solid #dceee3;
            // border-radius: 8px;
            overflow: visible;
            background: white;
            box-shadow: 0 6px 16px rgba(67, 139, 100, 0.1);

            > p {
              position: relative;
              display: flex;
              align-items: center;
              gap: 12px;
              margin: 0;
              padding: 8px 16px;
              border-radius: 6px;
              color: #5b5b78;
              font-size: 16px;
              font-weight: 700;
              line-height: 1.35;
              cursor: pointer;
              transition:
                background 180ms ease,
                color 180ms ease,
                transform 180ms ease;

              > i {
                font-style: normal;
              }

              > i:first-child {
                color: #68917a;
                font-size: 18px;
              }

              .dropdown {
                position: absolute;
                top: 50%;
                left: calc(100% - 74px);
                z-index: 101111;
                display: flex;
                flex-direction: column;
                gap: 3px;
                min-width: 128px;
                padding: 6px;
                border: 1px solid #cfe5d7;
                border-radius: 8px;
                background: rgba(255, 255, 255, 0.98);
                box-shadow: 0 10px 24px rgba(40, 110, 73, 0.16);
                font-style: normal;
                opacity: 0;
                pointer-events: none;
                transform: translate(-8px, -50%) scale(0.98);
                transition:
                  opacity 160ms ease,
                  transform 160ms ease;

                i {
                  padding: 7px 9px;
                  border-radius: 5px;
                  color: #527262;
                  font-size: 13px;
                  font-style: normal;
                  font-weight: 600;
                  line-height: 1.3;
                  white-space: nowrap;
                  transition:
                    background 160ms ease,
                    color 160ms ease;

                  &:hover {
                    background: #eaf8ef;
                    color: #258653;
                  }
                }
              }

              &:hover {
                z-index: 1;
                background: #eef9f2;
                color: #328a63;
                transform: translateX(2px);

                .dropdown {
                  opacity: 1;
                  pointer-events: auto;
                  transform: translate(0, -50%) scale(1);
                }
              }

              &.is-active {
                background: #eaf8ef;
                color: #258653;

                > i:first-child {
                  color: #258653;
                }
              }

              &.title {
                padding: 8px 10px 10px;
                border-radius: 0;
                border-bottom: 1px solid #dceee3;
                color: #367c5a;
                cursor: default;

                &:hover {
                  background: transparent;
                  color: #367c5a;
                  transform: none;
                }

                > i:first-child {
                  color: #367c5a;
                }
              }
            }
          }
          > .item_1 {
            > p {
              > i:first-child {
                font-size: 25px;
              }
            }
          }
        }
        > .r {
          position: relative;
          z-index: 0;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          width: 84%;
          height: 100%;
          min-height: 0;
          overflow: visible;
          background: white;
        }
        .h {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          width: 95%;
          margin: 0 auto;
          margin-top: 20px;

          .yumao {
            font-size: 30px;
            margin-right: 20px;
          }
          em {
            i:nth-of-type(1) {
              font-size: 20px;
            }
          }
        }

        .msg_m {
          display: flex;
          flex: 1;
          flex-direction: column;
          min-height: 0;
          gap: 18px;
          box-sizing: border-box;
          margin: 18px 2.5% 74px;
          padding: 20px;
          overflow-y: auto;
          -ms-overflow-style: none;
          scrollbar-width: none;
          border: 1px solid #e2f0e7;
          border-radius: 12px;
          background: #f8fcf9;

          &::-webkit-scrollbar {
            display: none;
          }

          .msg_l,
          .msg_r {
            display: flex;
            align-items: flex-end;
            gap: 10px;

            > p {
              margin: 0;
            }
          }

          .msg_r {
            justify-content: flex-end;
          }

          .msg_l .assistant_top > p:first-child,
          .msg_r .message_top > p:last-child {
            flex: 0 0 48px;
            width: 48px;
            height: 48px;
            overflow: hidden;
            border: 1px solid #d9ebe0;
            border-radius: 50%;
            background: white;

            img {
              display: block;
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          }

          .msg_l .assistant_top .message_text,
          .msg_r > .message_stack .message_text {
            // max-width: min(66%, 520px);
            padding: 10px 14px;
            border-radius: 12px;
            font-size: 18px;
            line-height: 1.55;
            word-break: break-word;
          }

          .msg_l .assistant_top .message_text {
            border: 1px solid #dfece4;
            border-bottom-left-radius: 3px;
            color: #53675c;
            background: white;
            box-shadow: 0 4px 12px rgba(51, 131, 87, 0.06);

            &.is_thinking {
              position: relative;
              isolation: isolate;
              overflow: hidden;
              color: #287c51;
              background: linear-gradient(
                100deg,
                #ffffff 20%,
                #e9fff1 46%,
                #ffffff 72%
              );
              background-size: 220% 100%;
              animation: sandbox-thinking-shine 1.35s linear infinite;

              &::after {
                position: absolute;
                top: -30%;
                bottom: -30%;
                left: 0;
                z-index: 1;
                width: 42%;
                background: linear-gradient(
                  90deg,
                  transparent,
                  rgba(255, 255, 255, 0.78),
                  transparent
                );
                content: "";
                pointer-events: none;
                transform: translateX(-160%) skewX(-18deg);
                animation: sandbox-thinking-sweep 1.35s ease-in-out infinite;
              }
            }
          }

          .msg_r > .message_stack .message_text {
            border-bottom-right-radius: 3px;
            color: white;
            background: #53b985;
            box-shadow: 0 4px 12px rgba(48, 147, 95, 0.2);
          }

          .msg_r > .message_stack {
            --message-avatar-size: 48px;
            --message-avatar-gap: 10px;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 8px;
            min-width: 0;

            > p,
            .message_top > p {
              margin: 0;
            }

            .message_top {
              display: flex;
              align-items: flex-start;
              justify-content: flex-end;
              gap: var(--message-avatar-gap);
            }
          }

          .msg_l > .assistant_stack {
            --assistant-avatar-size: 48px;
            --assistant-avatar-gap: 10px;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
            min-width: 0;

            > p,
            .assistant_top > p {
              margin: 0;
            }

            .assistant_top {
              display: flex;
              align-items: flex-start;
              gap: var(--assistant-avatar-gap);
            }
          }

          .chat_attachments {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            // max-width: min(66%, 520px);
            margin: 0;
            padding: 0;
            background: transparent;

            .image_attachment {
              position: relative;
              display: block;
              width: min(190px, 100%);
              max-height: 160px;
              overflow: hidden;
              border: 1px solid #b9e3c8;
              border-radius: 9px;
              box-shadow: 0 5px 14px rgba(48, 147, 95, 0.14);
              opacity: 0;
              transform: translateY(8px) scale(0.97);
              animation: sandbox-image-reveal 460ms ease-out 90ms forwards;

              > img,
              > video {
                display: block;
                width: 100%;
                max-height: 160px;
                object-fit: cover;
              }

              > video {
                height: 135px;
                background: #102c20;
              }

              .image_processing_mask {
                position: absolute;
                inset: 0;
                display: grid;
                overflow: hidden;
                background: linear-gradient(
                  135deg,
                  rgba(16, 95, 59, 0.7),
                  rgba(57, 205, 124, 0.26)
                );
                opacity: 0;
                place-items: center;
                transition: opacity 280ms ease;

                &::before {
                  position: absolute;
                  top: 0;
                  right: 0;
                  left: 0;
                  height: 3px;
                  background: #b5ffd0;
                  box-shadow: 0 0 16px 5px rgba(181, 255, 208, 0.9);
                  content: "";
                  transform: translateY(-100%);
                }

                i {
                  position: relative;
                  z-index: 1;
                  padding: 5px 8px;
                  border: 1px solid rgba(218, 255, 232, 0.68);
                  border-radius: 999px;
                  background: rgba(7, 68, 38, 0.4);
                  color: #f3fff7;
                  font-size: 11px;
                  font-style: normal;
                  font-weight: 700;
                  letter-spacing: 0.6px;
                }
              }

              &.is_processing .image_processing_mask {
                opacity: 1;

                &::before {
                  animation: sandbox-image-scan 3s ease-in-out forwards;
                }
              }

              &.is_processing > img {
                opacity: 0;
                animation: sandbox-processing-media-reveal 460ms ease-out
                  forwards;
              }

              &.video_attachment {
                width: min(240px, 100%);

                > img,
                > video {
                  height: 135px;
                }

                &.is_processing .image_processing_mask::before {
                  animation: sandbox-image-scan 3s ease-in-out infinite;
                }

                .video_play_button {
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  z-index: 2;
                  display: grid;
                  width: 48px;
                  height: 48px;
                  padding: 0;
                  border: 1px solid rgba(255, 255, 255, 0.82);
                  border-radius: 50%;
                  background: rgba(15, 91, 53, 0.8);
                  box-shadow: 0 6px 18px rgba(13, 71, 42, 0.3);
                  cursor: pointer;
                  place-items: center;
                  transform: translate(-50%, -50%);

                  &::before {
                    width: 0;
                    height: 0;
                    margin-left: 4px;
                    border-top: 9px solid transparent;
                    border-bottom: 9px solid transparent;
                    border-left: 14px solid white;
                    content: "";
                  }

                  &:hover {
                    background: #2f9f68;
                    transform: translate(-50%, -50%) scale(1.08);
                  }
                }
              }
            }

            .file_attachment {
              display: flex;
              align-items: center;
              gap: 7px;
              max-width: 230px;
              padding: 8px 10px;
              border: 1px solid #b9e3c8;
              border-radius: 8px;
              background: #eefaf3;
              color: #387853;
              font-size: 13px;
              line-height: 1.3;
              box-shadow: 0 4px 12px rgba(48, 147, 95, 0.1);

              > i {
                flex: 0 0 auto;
                color: #3aa96e;
                font-size: 18px;
                font-style: normal;
              }

              > span {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }
            }
          }

          @keyframes sandbox-image-reveal {
            from {
              opacity: 0;
              transform: translateY(8px) scale(0.97);
            }

            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes sandbox-processing-media-reveal {
            from {
              opacity: 0;
            }

            to {
              opacity: 1;
            }
          }

          @keyframes sandbox-image-scan {
            0% {
              top: 0;
              transform: translateY(-100%);
            }

            100% {
              top: 100%;
              transform: translateY(0);
            }
          }

          @keyframes sandbox-thinking-shine {
            from {
              background-position: 100% 0;
            }

            to {
              background-position: -120% 0;
            }
          }

          @keyframes sandbox-thinking-sweep {
            from {
              transform: translateX(-160%) skewX(-18deg);
            }

            to {
              transform: translateX(340%) skewX(-18deg);
            }
          }

          .msg_l > .assistant_stack > .assistant_attachments {
            justify-content: flex-start;
            margin-left: calc(
              var(--assistant-avatar-size) + var(--assistant-avatar-gap)
            );
          }

          .msg_r > .message_stack .chat_attachments {
            justify-content: flex-end;
            margin-right: calc(
              var(--message-avatar-size) + var(--message-avatar-gap)
            );
          }
        }

        .file_todo_area {
          position: absolute;
          right: 2.5%;
          bottom: 74px;
          left: 2.5%;
          z-index: 2;
          pointer-events: none;

          > input {
            display: none;
          }

          .file_list {
            display: flex;
            gap: 8px;
            max-width: 100%;
            overflow-x: auto;
            padding: 0 1px;
            scrollbar-width: thin;
          }

          .file_item {
            display: flex;
            flex: 0 0 auto;
            align-items: center;
            max-width: min(260px, 72vw);
            padding: 6px 7px 6px 9px;
            border: 1px solid #bde4ca;
            border-radius: 7px;
            background: #f4fcf7;
            box-shadow: 0 3px 9px rgba(49, 132, 85, 0.1);
            color: #37684b;
            pointer-events: auto;

            .file_type {
              flex: 0 0 auto;
              margin-right: 7px;
              padding: 2px 4px;
              border-radius: 3px;
              background: #d9f2e2;
              color: #318356;
              font-size: 9px;
              font-weight: 800;
              letter-spacing: 0.6px;
            }

            .file_name {
              overflow: hidden;
              font-size: 12px;
              line-height: 18px;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            button {
              flex: 0 0 auto;
              width: 20px;
              height: 20px;
              margin-left: 7px;
              padding: 0;
              border: 0;
              border-radius: 50%;
              background: transparent;
              color: #5d9471;
              cursor: pointer;
              font-size: 18px;
              line-height: 1;
              transition:
                background 160ms ease,
                color 160ms ease;

              &:hover {
                background: #d8f1e1;
                color: #237647;
              }
            }
          }

          .file-item-enter-active,
          .file-item-leave-active {
            transition:
              opacity 180ms ease,
              transform 180ms ease;
          }

          .file-item-enter-from,
          .file-item-leave-to {
            opacity: 0;
            transform: translateY(5px);
          }
        }

        .send_b {
          position: absolute;
          right: 0;
          bottom: 0;
          left: 0;
          z-index: 1;
          box-sizing: border-box;
          height: 74px;
          padding: 14px 2.5%;
          border-top: 1px solid #e1eee6;
          background: rgba(255, 255, 255, 0.96);

          > p {
            display: flex;
            align-items: center;
            gap: 12px;
            box-sizing: border-box;
            height: 44px;
            margin: 0;
            padding: 0 10px 0 14px;
            border: 1px solid #cde5d5;
            border-radius: 8px;
            background: #fbfefc;

            > i {
              flex: 0 0 auto;
              color: #6d9a7c;
              font-size: 28px;
              font-style: normal;
              cursor: pointer;
              transition:
                color 0.2s ease,
                transform 0.2s ease;

              &:hover {
                color: #329663;
                transform: translateY(-1px);
              }

              &:first-child:empty {
                display: none;
              }

              &:last-child {
                display: grid;
                width: 30px;
                height: 30px;
                color: white;
                border-radius: 6px;
                background: #53b985;
                place-items: center;

                &:hover {
                  color: white;
                  background: #3da773;
                }
              }
            }

            input {
              flex: 1;
              min-width: 0;
              height: 100%;
              border: 0;
              outline: 0;
              color: #496354;
              background: transparent;
              font-size: 20px;
            }
          }
        }
      }
      > section.account {
        box-sizing: border-box;
        display: flex;
        justify-content: space-between;

        > .l {
          width: 14.5%;
          align-self: flex-start;

          > .item_1 {
            display: flex;
            flex-direction: column;
            gap: 5px;
            box-sizing: border-box;
            padding: 8px;
            border: 1px solid #dceee3;
            border-radius: 8px;
            background: white;
            box-shadow: 0 6px 16px rgba(67, 139, 100, 0.1);

            > p {
              display: flex;
              align-items: center;
              gap: 12px;
              margin: 0;
              padding: 8px 16px;
              border-radius: 6px;
              color: #5b5b78;
              font-size: 16px;
              font-weight: 700;
              line-height: 1.35;
              cursor: pointer;
              transition:
                background 180ms ease,
                color 180ms ease,
                transform 180ms ease;

              > i {
                font-style: normal;
              }

              > i:first-child {
                color: #68917a;
                font-size: 18px;
              }

              &:hover {
                background: #eef9f2;
                color: #328a63;
                transform: translateX(2px);
              }

              &:first-child {
                background: #56b987;
                color: white;

                > i:first-child {
                  color: white;
                }
              }
            }
          }
        }
        > .r {
          position: relative;
          display: flex;
          box-sizing: border-box;
          width: 84%;
          overflow: hidden;
          .set_left {
            min-width: 30%;
            margin-right: 20px;
          }
          .set_right {
            position: relative;
            display: grid;
            flex-grow: 1;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            grid-template-rows: repeat(2, 360px);
            align-content: start;
            width: 100%;
            height: 100%;
            padding: 2px 4px 5px 2px;
            overflow: auto;
            gap: 19px;
            box-sizing: border-box;

            .plan_card {
              position: relative;
              display: flex;
              min-width: 0;
              height: 360px;
              flex-direction: column;
              box-sizing: border-box;
              padding: 14px;
              overflow: hidden;
              border: 1px solid #dceee3;
              border-radius: 4px;
              outline: 0;
              color: #315d49;
              background: #fbfefc;
              box-shadow: 0 6px 18px rgba(66, 137, 97, 0.09);
              cursor: pointer;
              transition:
                border-color 180ms ease,
                background 180ms ease;

              &:hover {
                border-color: #b8ddc8;
              }

              &:focus-visible {
                border-color: #67bb91;
                box-shadow: 0 0 0 3px rgba(83, 185, 133, 0.12);
              }

              &.is_selected {
                border-color: #56b987;
                background: #f5fcf8;

                .plan_head > span {
                  color: white;
                  background: #4eae7d;
                }

                .plan_footer > button {
                  color: white;
                  background: #45a875;
                }
              }

              &.sub_2,
              &.sub_3,
              &.sub_4 {
                color: #315d49;
              }
            }

            .plan_head {
              display: flex;
              align-items: center;
              justify-content: space-between;

              > span,
              > em {
                padding: 4px 9px;
                border-radius: 3px;
                font-style: normal;
                font-weight: 700;
                font-size: 20px;
              }

              > span {
                color: #397c59;
                background: #d7f2e3;
              }

              > em {
                color: #39825d;
                border: 1px solid #7ccaa3;
                background: rgba(255, 255, 255, 0.45);
              }
            }

            .plan_price {
              position: relative;
              display: flex;
              align-items: baseline;
              margin-top: 7px;
              color: #2f845c;

              > strong {
                font-size: clamp(30px, 2vw, 46px);
                font-weight: 500;
                line-height: 1;
                letter-spacing: -2px;
              }

              > span {
                margin-left: 4px;
                font-size: 17px;
              }

              > small {
                margin-left: auto;
                color: #78a28d;
                font-size: 11px;
              }
            }

            .plan_art {
              position: relative;
              height: 54px;
              margin: 9px 0;
              overflow: hidden;
              border-radius: 3px 12px 3px 12px;
              background:
                linear-gradient(120deg, rgba(255, 255, 255, 0.3), transparent),
                linear-gradient(135deg, #4eb780, #a2e7c4);

              > span {
                position: absolute;
                border: 1px solid rgba(255, 255, 255, 0.7);
                transition: transform 420ms cubic-bezier(0.22, 1, 0.36, 1);

                &:first-child {
                  top: -18px;
                  left: 12%;
                  width: 80px;
                  height: 80px;
                  border-radius: 50%;
                  background: rgba(255, 255, 255, 0.14);
                }

                &:nth-child(2) {
                  right: 15%;
                  bottom: -30px;
                  width: 92px;
                  height: 70px;
                  transform: rotate(-10deg);
                  background: rgba(32, 120, 77, 0.13);
                }

                &:nth-child(3) {
                  top: 0;
                  right: 38%;
                  width: 1px;
                  height: 100%;
                  border: 0;
                  background: rgba(255, 255, 255, 0.45);
                  transform: skewX(-24deg);
                }
              }

              > strong {
                position: absolute;
                right: 12px;
                bottom: 7px;
                color: rgba(255, 255, 255, 0.9);
                font-size: 13px;
                letter-spacing: 3px;
              }
            }

            .plan_card > ul {
              display: grid;
              gap: 4px;
              margin: 0;
              padding: 0;
              color: #4b7762;
              font-size: 11px;
              line-height: 1.45;
              list-style: none;

              > li {
                position: relative;
                padding-left: 13px;
                font-size: 20px;

                &::before {
                  position: absolute;
                  top: 6px;
                  left: 1px;
                  width: 5px;
                  height: 5px;
                  border-radius: 50%;
                  background: #62bf8f;
                  content: "";
                }
              }
            }

            .plan_card > .plan_footer {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-top: auto;
              padding-top: 9px;

              > button {
                min-width: 62px;
                padding: 5px 11px;
                border: 1px solid #68bd91;
                border-radius: 4px;
                outline: 0;
                color: #3c8e64;
                background: rgba(255, 255, 255, 0.66);
                cursor: pointer;
                font-size: 20px;
                transition:
                  color 180ms ease,
                  background 180ms ease;

                &:hover,
                &:focus-visible {
                  color: white;
                  background: #45a875;
                }
              }

              > span {
                color: #789d8b;
                font-size: 18px;
              }
            }

            .plan_feedback {
              position: absolute;
              z-index: 5;
              right: 14px;
              bottom: 12px;
              max-width: 280px;
              margin: 0;
              padding: 9px 13px;
              color: #f4fff8;
              background: rgba(43, 123, 79, 0.94);
              border-radius: 6px;
              font-size: 14px;
            }
          }
          .user_info {
            box-sizing: border-box;
            width: min(430px, 100%);
            padding: 16px;
            border: 1px solid #dceee3;
            border-radius: 4px;
            background: #fbfefc;
            box-shadow: 0 6px 18px rgba(66, 137, 97, 0.09);

            > .title {
              margin: 0 0 14px;
              color: #367c5a;
              font-size: 16px;
              font-weight: 700;
            }

            > div {
              display: flex;
              align-items: center;
              gap: 14px;
            }

            .img {
              flex: 0 0 68px;
              width: 68px;
              height: 68px;
              margin: 0;
              overflow: hidden;
              border: 2px solid #d7efe0;
              border-radius: 10px;
              background: #eef9f2;

              img {
                display: block;
                width: 100%;
                height: 100%;
                object-fit: cover;
              }
            }

            > div > .r {
              display: flex;
              flex: 1;
              flex-direction: column;
              gap: 7px;
              width: auto;
              height: auto;
              margin: 0;
              overflow: visible;
              background: transparent;

              em {
                overflow: hidden;
                color: #5f7567;
                font-size: 16px;
                font-style: normal;
                line-height: 1.45;
                text-overflow: ellipsis;
                white-space: nowrap;
              }
            }
          }

          .pass_set,
          .mail_set {
            box-sizing: border-box;
            width: min(430px, 100%);
            margin-top: 16px;
            padding: 16px;
            border: 1px solid #dceee3;
            border-radius: 4px;
            background: #fbfefc;
            box-shadow: 0 6px 18px rgba(66, 137, 97, 0.09);

            > p {
              margin: 0;
            }

            > .title {
              margin-bottom: 14px;
              color: #367c5a;
              font-size: 16px;
              font-weight: 700;
            }

            .pass_old,
            .pass_new,
            .pass_new_1,
            .mail_old,
            .mail_new {
              display: flex;
              align-items: center;
              height: 40px;
              margin-top: 10px;
              padding: 0 10px;
              border: 1px solid #d7ebe0;
              border-radius: 7px;
              background: white;
              transition:
                border-color 0.2s ease,
                box-shadow 0.2s ease;

              &:focus-within {
                border-color: #67bb91;
                box-shadow: 0 0 0 3px rgba(83, 185, 133, 0.12);
              }

              > em {
                flex: 0 0 auto;
                color: #648071;
                font-size: 13px;
                font-style: normal;

                &:first-child {
                  width: 58px;
                }

                &.yumao {
                  color: #8ca898;
                  font-size: 16px;
                  cursor: pointer;

                  &:hover {
                    color: #419f70;
                  }
                }
              }

              input {
                flex: 1;
                min-width: 0;
                height: 100%;
                border: 0;
                outline: 0;
                color: #496354;
                background: transparent;
                font-size: 13px;

                &::placeholder {
                  color: #a7b9ae;
                }
              }
            }

            .password_hint,
            .mail_hint {
              margin-top: 10px;
              color: #b87645;
              font-size: 12px;
              line-height: 1.4;
            }

            .send_btn {
              display: flex;
              justify-content: flex-end;
              gap: 10px;
              margin-top: 16px;

              > em {
                min-width: 78px;
                padding: 8px 12px;
                border: 1px solid #d4e8db;
                border-radius: 6px;
                color: #5d7969;
                background: white;
                font-size: 13px;
                font-style: normal;
                text-align: center;
                cursor: pointer;
                transition:
                  background 0.2s ease,
                  color 0.2s ease,
                  transform 0.2s ease;

                &:hover {
                  color: #367c5a;
                  background: #edf9f1;
                  transform: translateY(-1px);
                }

                &:first-child {
                  border-color: #53b985;
                  color: white;
                  background: #53b985;

                  &:hover {
                    color: white;
                    background: #3da773;
                  }
                }
              }
            }
          }
        }
      }
      > section.deploy {
        --deploy-top-offset: 185px;
        --deploy-bottom-gap: 45px;
        height: calc(
          100dvh - var(--deploy-top-offset) - var(--deploy-bottom-gap)
        );
        overflow-y: auto;
        overflow-x: hidden;
        overscroll-behavior: contain;
        scrollbar-width: none;
        background: white;
        > .deploy_main {
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          width: 95%;
          height: 95%;
          // border: 1px solid gray;
          overflow: visible;
          > p {
            display: flex;
            justify-content: flex-end;
            text-align: right;
            margin-top: 0;
            margin-bottom: 10px;
            em {
              display: flex;
              align-items: center;
            }
            i {
              font-size: 21px;
              margin-left: 5px;
            }
            .yumao {
              font-size: 30px;
            }
          }
          .grid_xx {
            display: grid;
            flex: 1 1 0;
            grid-template-columns: repeat(3, 1fr);
            grid-template-rows: repeat(2, 1fr);
            width: 100%;
            margin-bottom: 2px;
            gap: 14px;
            height: 200px;
            > div {
              position: relative;
              overflow: hidden;
              border: 1px solid #d8dbe1;
              border-radius: 2px;
              background: #fff;
              color: #32353b;
            }
            .node_heading {
              position: relative;
              z-index: 1;
              margin: 18px;

              span {
                color: #7a7d82;
                font-family: Consolas, "Courier New", monospace;
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 0.8px;
              }
              h3,
              p {
                margin: 0;
              }
              h3 {
                margin-top: 7px;
                color: #2d3035;
                font-size: 18px;
              }
              p {
                margin-top: 5px;
                color: #777a80;
                font-size: 13px;
              }
            }
            .r1 {
              grid-row: span 2;
              grid-column: 1;
              display: flex;
              flex-direction: column;

              > img {
                display: block;
                width: 92%;
                height: 270px;
                margin: 0 auto;
                filter: grayscale(1) contrast(1.12);
                object-fit: contain;
              }
              ul {
                display: grid;
                gap: 9px;
                margin: 14px 18px 18px;
                padding: 12px 0 0;
                border-top: 1px solid #dfe1e4;
                color: #565960;
                font-size: 13px;
                line-height: 1.45;
                list-style: none;
              }
              li::before {
                margin-right: 7px;
                color: #90949a;
                content: "◇";
              }
            }
            .r2,
            .r3 {
              display: flex;
              flex-direction: column;
              > img {
                width: 70%;
                height: 112px;
                margin: 0 auto;
                filter: grayscale(1) contrast(1.12);
                object-fit: contain;
              }
              > em {
                margin-left: 20px;
                color: #55585e;
                font-family: Consolas, "Courier New", monospace;
                font-size: 11px;
                font-style: normal;
                font-weight: 700;
              }
            }
            .mini_specs {
              display: grid;
              gap: 6px;
              margin: 0 18px 12px;
              padding: 10px 0 0;
              border-top: 1px solid #e0e2e5;
              color: #666970;
              font-size: 12px;
              line-height: 1.4;
              list-style: none;

              li::before {
                margin-right: 6px;
                color: #9a9da3;
                content: "◇";
              }
            }
            .r4 {
              border-color: #d8dbe1;
              color: #30333a;

              > span {
                display: block;
                margin: 18px 18px 0;
                color: #74777d;
                font-family: Consolas, "Courier New", monospace;
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 0.8px;
              }
              strong {
                display: block;
                margin: 7px 18px 0;
                font-size: 34px;
              }
              > p {
                margin: 3px 18px;
                color: #6b6e74;
                font-size: 12px;
              }
              .pool_specs {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 8px;
                margin: 16px 18px 0;
                list-style: none;

                li {
                  display: flex;
                  flex-direction: column;
                  gap: 4px;
                  border-left: 2px solid #c3c7cc;
                  color: #71757b;
                  font-size: 10px;
                  line-height: 1.2;
                  text-indent: 7px;
                  margin-bottom: 20px;
                }
                b {
                  color: #30333a;
                  font-family: Consolas, "Courier New", monospace;
                  font-size: 15px;
                }
              }
              > div {
                position: absolute;
                right: 18px;
                bottom: 16px;
                display: flex;
                gap: 14px;
              }
              i {
                color: #34373d;
                font-family: Consolas, "Courier New", monospace;
                font-size: 12px;
                font-style: normal;
                font-weight: 700;
              }
            }
            .r5 {
              > span {
                display: block;
                margin: 18px 18px 0;
                color: #6f7278;
                font-family: Consolas, "Courier New", monospace;
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 0.8px;
              }
              .model_list {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 8px;
                margin: 12px 18px;
                margin-top: 30px;
              }
              .model_list p {
                display: flex;
                align-items: center;
                gap: 6px;
                height: 36px;
                margin: 0 0 20px;
                border-bottom: 1px solid #e5e6e8;
                color: #41444a;
                font-size: 12px;
                font-weight: 700;
              }
              .model_list img {
                width: 28px;
                height: 28px;
                border: 1px solid #d7d9dc;
                border-radius: 2px;
                filter: grayscale(1) contrast(1.2);
                object-fit: cover;
              }
            }
          }
        }
      }
      .admin-panel-enter-active,
      .admin-panel-leave-active {
        transition:
          opacity 0.25s ease,
          transform 0.25s ease;
      }
      .admin-panel-enter-from {
        opacity: 0;
        transform: translateY(12px);
      }
      .admin-panel-leave-to {
        opacity: 0;
        transform: translateY(-12px);
      }
    }
    .show_gpt_6 {
      position: fixed;
      z-index: 30;
      inset: 0;
      display: grid;
      place-items: center;
      padding: 24px;

      .bg {
        position: absolute;
        inset: 0;
        background: rgba(21, 76, 56, 0.38);
        backdrop-filter: blur(10px);
      }

      .main {
        position: relative;
        z-index: 1;
        width: min(720px, 100%);
        overflow: hidden;
        border: 1px solid rgba(143, 223, 181, 0.62);
        border-radius: 12px;
        background:
          radial-gradient(
            circle at 88% 8%,
            rgba(119, 224, 166, 0.35),
            transparent 28%
          ),
          linear-gradient(145deg, #effff6, #c9f5dc 72%);
        box-shadow: 0 26px 80px rgba(27, 108, 69, 0.28);
        color: #174a32;
        animation: astra-dialog-in 260ms ease-out;
      }

      .hero {
        position: relative;
        padding: 30px 52px 36px;
        border-bottom: 1px solid rgba(42, 126, 79, 0.16);

        .eyebrow {
          margin: 0 0 15px;
          color: #34885b;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 2px;
        }

        .orb {
          position: absolute;
          top: 26px;
          right: 24px;
          width: 126px;
          height: 126px;
          margin: 0;
          filter: drop-shadow(0 0 16px rgba(77, 189, 121, 0.52));

          :deep(canvas) {
            display: block;
            width: 100%;
            height: 100%;
          }
        }

        h1 {
          text-align: center;
          margin: 0;
          margin-bottom: 50px;
          font-size: clamp(32px, 5vw, 50px);
          letter-spacing: -1.5px;
        }

        .summary {
          margin: 12px 0 10px;
          color: #236746;
          font-size: 19px;
          font-weight: 600;
        }

        .description {
          max-width: 510px;
          margin: 0;
          color: #527863;
          font-size: 15px;
          line-height: 1.8;
        }
      }

      .capabilities {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 14px;
        padding: 26px 52px;

        article {
          min-height: 122px;
          padding: 17px;
          padding-bottom: 0;
          border: 1px solid rgba(42, 126, 79, 0.14);
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.54);

          span {
            color: #3a9a63;
            font-size: 12px;
            font-weight: 700;
          }

          h3 {
            margin: 14px 0 7px;
            font-size: 17px;
          }

          p {
            margin: 0;
            color: #5e806b;
            font-size: 13px;
            line-height: 1.65;
          }
        }
      }

      .dialog-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 0 52px 32px;

        p {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0;
          color: #61806c;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.1px;

          i {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #38bc72;
            box-shadow: 0 0 12px #38bc72;
          }
        }

        button {
          padding: 10px 19px;
          border: 0;
          border-radius: 6px;
          background: linear-gradient(135deg, #6fd696, #2b9e5b);
          box-shadow: 0 8px 20px rgba(43, 158, 91, 0.28);
          color: #fff;
          cursor: pointer;
          font-size: 14px;
          font-weight: 700;
          transition:
            transform 180ms ease,
            box-shadow 180ms ease;

          &:hover {
            box-shadow: 0 12px 25px rgba(43, 158, 91, 0.4);
            transform: translateY(-2px);
          }
        }
      }

      @keyframes astra-dialog-in {
        from {
          opacity: 0;
          transform: translateY(14px) scale(0.97);
        }

        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @keyframes astra-orb-pulse {
        from {
          opacity: 0.72;
          transform: scale(0.9) rotate(-10deg);
        }

        to {
          opacity: 1;
          transform: scale(1.08) rotate(10deg);
        }
      }
    }
    .show_smart_app {
      position: fixed;
      z-index: 32;
      inset: 0;
      display: grid;
      place-items: center;
      box-sizing: border-box;
      padding: 24px;

      > .bg {
        position: absolute;
        inset: 0;
        background: rgba(38, 31, 27, 0.52);
        // cursor: pointer;
      }

      > .main {
        position: relative;
        z-index: 1;
        width: min(820px, calc(100vw - 48px));
        max-height: calc(100dvh - 48px);
        overflow: auto;
        border: 1px solid rgba(191, 114, 79, 0.28);
        border-radius: 18px;
        background:
          radial-gradient(
            circle at 8% 0,
            rgba(217, 119, 87, 0.19),
            transparent 28%
          ),
          linear-gradient(145deg, #fffdf9, #f8eee6);
        box-shadow: 0 30px 90px rgba(43, 31, 25, 0.34);
        color: #43362f;
        scrollbar-width: none;

        &::-webkit-scrollbar {
          display: none;
        }
      }

      .quick_connect_btn {
        position: absolute;
        z-index: 3;
        top: 18px;
        right: 18px;
        padding: 9px 16px;
        border: 1px solid rgba(191, 96, 62, 0.28);
        border-radius: 100px;
        outline: 0;
        background: rgba(255, 255, 255, 0.82);
        color: #a65338;
        cursor: pointer;
        font-size: 20px;
        font-weight: 800;
        transition:
          color 180ms ease,
          background 180ms ease,
          box-shadow 180ms ease,
          transform 180ms ease;

        &:hover,
        &:focus-visible {
          background: #d97757;
          box-shadow: 0 8px 18px rgba(217, 119, 87, 0.26);
          color: white;
          transform: translateY(-2px);
        }

        &:active {
          transform: translateY(0);
        }
      }

      .smart_intro {
        display: grid;
        grid-template-columns: 126px 1fr;
        align-items: center;
        gap: 30px;
        padding: 38px 48px 32px;
        border-bottom: 1px solid rgba(133, 86, 64, 0.14);

        .brand_image {
          display: grid;
          place-items: center;
          width: 126px;
          height: 126px;
          border: 1px solid rgba(200, 123, 89, 0.25);
          border-radius: 28px;
          background: rgba(255, 255, 255, 0.78);
          box-shadow: 0 16px 35px rgba(123, 78, 58, 0.13);

          img {
            display: block;
            width: 82px;
            height: 82px;
            border-radius: 18px;
            object-fit: cover;
          }
        }

        .intro_copy {
          min-width: 0;

          .eyebrow {
            margin: 0 0 8px;
            color: #ba6849;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 2px;
          }

          h2 {
            margin: 0;
            color: #3e302a;
            font-size: clamp(28px, 4vw, 40px);
            letter-spacing: -1px;
          }

          .summary {
            max-width: 540px;
            margin: 12px 0 17px;
            color: #765f54;
            font-size: 14px;
            line-height: 1.75;
          }

          .tags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;

            span {
              padding: 5px 10px;
              border: 1px solid rgba(196, 108, 73, 0.2);
              border-radius: 100px;
              background: rgba(255, 255, 255, 0.58);
              color: #9b563e;
              font-size: 12px;
              font-weight: 700;
            }
          }
        }
      }

      .smart_capabilities {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 13px;
        padding: 26px 48px 20px;

        article {
          min-height: 112px;
          padding: 17px;
          border: 1px solid rgba(133, 86, 64, 0.13);
          border-radius: 13px;
          background: rgba(255, 255, 255, 0.58);

          > span {
            color: #c06b4d;
            font-size: 11px;
            font-weight: 800;
          }

          h3 {
            margin: 12px 0 7px;
            color: #49392f;
            font-size: 16px;
          }

          p {
            margin: 0;
            color: #806b5f;
            font-size: 12px;
            line-height: 1.65;
          }
        }
      }

      .access_steps {
        margin: 0 48px 24px;
        padding: 20px;
        border: 1px solid rgba(133, 86, 64, 0.13);
        border-radius: 14px;
        background: rgba(248, 230, 218, 0.54);

        .steps_heading {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 15px;

          p {
            margin: 0;
            color: #4d3b32;
            font-size: 16px;
            font-weight: 800;
          }

          > span {
            color: #907569;
            font-size: 12px;
          }
        }

        ol {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin: 0;
          padding: 0;
          list-style: none;

          li {
            display: flex;
            align-items: flex-start;
            gap: 10px;

            > span {
              display: grid;
              flex: 0 0 27px;
              place-items: center;
              width: 27px;
              height: 27px;
              border-radius: 8px;
              background: #d97757;
              color: white;
              font-size: 10px;
              font-weight: 800;
            }

            p {
              display: flex;
              flex-direction: column;
              gap: 4px;
              margin: 0;

              strong {
                color: #503d33;
                font-size: 13px;
              }

              em {
                color: #897166;
                font-size: 11px;
                font-style: normal;
                line-height: 1.5;
              }
            }
          }
        }
      }

      footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 18px;
        padding: 0 48px 30px;

        p {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0;
          color: #765f54;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;

          i {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #d97757;
            box-shadow: 0 0 12px rgba(217, 119, 87, 0.82);
          }
        }

        > span {
          color: #92796d;
          font-size: 12px;
        }
      }

      &.show_gpt_app {
        > .bg {
          background: rgba(19, 22, 26, 0.56);
        }

        > .main {
          border-color: rgba(70, 77, 86, 0.28);
          background:
            radial-gradient(
              circle at 8% 0,
              rgba(92, 101, 112, 0.18),
              transparent 28%
            ),
            linear-gradient(145deg, #fcfcfc, #e8eaed);
          box-shadow: 0 30px 90px rgba(15, 18, 22, 0.34);
          color: #2d3238;
        }

        .quick_connect_btn {
          border-color: rgba(61, 68, 77, 0.28);
          color: #3c434c;

          &:hover,
          &:focus-visible {
            color: white;
            background: #3d444c;
            box-shadow: 0 8px 18px rgba(34, 39, 45, 0.28);
          }
        }

        .smart_intro {
          border-bottom-color: rgba(72, 79, 88, 0.14);

          .brand_image {
            border-color: rgba(78, 85, 94, 0.24);
            box-shadow: 0 16px 35px rgba(48, 54, 61, 0.13);
          }

          .intro_copy {
            .eyebrow {
              color: #68717b;
            }

            h2 {
              color: #292e34;
            }

            .summary {
              color: #626b75;
            }

            .tags span {
              border-color: rgba(81, 88, 97, 0.2);
              color: #4f5862;
            }
          }
        }

        .smart_capabilities article {
          border-color: rgba(72, 79, 88, 0.13);

          > span {
            color: #69727c;
          }

          h3 {
            color: #353b42;
          }

          p {
            color: #68717a;
          }
        }

        .access_steps {
          border-color: rgba(72, 79, 88, 0.13);
          background: rgba(231, 233, 236, 0.74);

          .steps_heading {
            p {
              color: #363c43;
            }

            > span {
              color: #737b84;
            }
          }

          ol li {
            > span {
              background: #3d444c;
            }

            p {
              strong {
                color: #383e45;
              }

              em {
                color: #707881;
              }
            }
          }
        }

        footer {
          p {
            color: #68717a;

            i {
              background: #4d555e;
              box-shadow: 0 0 12px rgba(77, 85, 94, 0.72);
            }
          }

          > span {
            color: #737b84;
          }
        }
      }

      @media (max-width: 760px) {
        padding: 14px;

        > .main {
          width: calc(100vw - 28px);
          max-height: calc(100dvh - 28px);
        }

        .smart_intro {
          grid-template-columns: 1fr;
          gap: 18px;
          padding: 30px 24px 24px;

          .brand_image {
            width: 92px;
            height: 92px;

            img {
              width: 62px;
              height: 62px;
            }
          }
        }

        .smart_capabilities {
          grid-template-columns: 1fr;
          padding: 22px 24px 18px;

          article {
            min-height: 0;
          }
        }

        .access_steps {
          margin: 0 24px 22px;

          .steps_heading {
            align-items: flex-start;
            flex-direction: column;
            gap: 5px;
          }

          ol {
            grid-template-columns: 1fr;
          }
        }

        footer {
          align-items: flex-start;
          flex-direction: column;
          padding: 0 24px 25px;
        }
      }
    }

    .smart-app-enter-active,
    .smart-app-leave-active,
    .smart-app-code-enter-active,
    .smart-app-code-leave-active {
      transition: opacity 220ms ease;

      .main {
        transition:
          opacity 220ms ease,
          transform 260ms cubic-bezier(0.22, 0.61, 0.36, 1);
      }
    }

    .smart-app-enter-from,
    .smart-app-leave-to,
    .smart-app-code-enter-from,
    .smart-app-code-leave-to {
      opacity: 0;

      .main {
        opacity: 0;
        transform: translateY(16px) scale(0.97);
      }
    }

    .smart_app_entry:focus-visible {
      outline: 2px solid rgba(217, 119, 87, 0.55);
      outline-offset: 2px;
    }

    .exit-transition-cover {
      position: fixed;
      top: var(--exit-origin-y);
      left: var(--exit-origin-x);
      z-index: 20;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #04c648;
      box-shadow: 0 0 0 8px rgb(4 198 72 / 18%);
      pointer-events: all;
      transform: translate(-50%, -50%) scale(0);
      animation: user-exit-cover-expand 820ms cubic-bezier(0.22, 0.61, 0.36, 1)
        forwards;
      will-change: transform;

      &.is-contracting {
        animation: user-exit-cover-contract 920ms
          cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
      }
    }
    .exit_ani {
      position: fixed;
      inset: 0;
      z-index: 19;
      overflow: hidden;
      pointer-events: all;

      p {
        position: absolute;
        margin: 0;
      }

      .bg {
        inset: 0;
        background: #fff;
      }

      .point {
        top: 50%;
        left: calc(50% - 100px);
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 15px;
        width: 150px;
        height: 150px;
        border-radius: 50%;
        background: #04c648;
        box-shadow: 5px 7px 16px rgb(0 72 26 / 18%);
        opacity: 0;
        transform: translate(-50%, -50%);

        .eye {
          position: absolute;
          top: 56px;
          width: 15px;
          height: 38px;
          border-radius: 100px;
          background: #fff;
          box-shadow: 0 2px 3px rgb(0 72 26 / 12%);
          opacity: 0;
          transform: scale(0.65);
        }

        .eye_left {
          left: 44px;
        }

        .eye_right {
          right: 44px;
        }
      }

      .text_r,
      .text_iuYin {
        top: 50%;
        z-index: 2;
        line-height: 1;
        letter-spacing: -0.06em;
        opacity: 0;
        white-space: nowrap;
      }

      .text_r {
        left: calc(50% - 100px);
        color: #fff;
        font-size: clamp(88px, 10vw, 142px);
        transform: translate(calc(-50% - 150px), -50%);
      }

      .text_iuYin {
        left: calc(50% - 75px);
        color: #000;
        font-size: clamp(72px, 8vw, 110px);
        transform: translate(200px, -50%);
      }

      &.is-running {
        .point {
          animation: exit-brand-point-move 660ms 1620ms
            cubic-bezier(0.16, 0.84, 0.44, 1) forwards;
          opacity: 1;
        }

        .text_r {
          animation:
            exit-brand-j-enter 620ms cubic-bezier(0.16, 0.84, 0.44, 1) forwards,
            exit-brand-j-darken 880ms 1620ms ease-out forwards;
        }

        .text_iuYin {
          animation: exit-brand-iuyin-enter 700ms 1620ms
            cubic-bezier(0.16, 0.84, 0.44, 1) forwards;
        }
      }

      &.is-looking {
        .point {
          animation: exit-brand-eyes-hold 1500ms linear forwards;
        }

        .eye_left {
          animation: exit-brand-eye-look-left 1500ms
            cubic-bezier(0.36, 0.01, 0.2, 1) forwards;
        }

        .eye_right {
          animation: exit-brand-eye-look-right 1500ms
            cubic-bezier(0.36, 0.01, 0.2, 1) forwards;
        }
      }
    }

    @keyframes user-exit-cover-expand {
      0% {
        transform: translate(-50%, -50%) scale(0.08);
      }

      12% {
        transform: translate(-50%, -50%) scale(1);
      }

      100% {
        transform: translate(-50%, -50%) scale(var(--exit-cover-scale));
      }
    }

    @keyframes user-exit-cover-contract {
      0% {
        top: var(--exit-origin-y);
        left: var(--exit-origin-x);
        width: 24px;
        height: 24px;
        transform: translate(-50%, -50%) scale(var(--exit-cover-scale));
      }

      64% {
        top: 50%;
        left: 50%;
        width: 150px;
        height: 150px;
        transform: translate(-50%, -50%) scale(1);
      }

      100% {
        top: 50%;
        left: calc(50% - 100px);
        width: 150px;
        height: 150px;
        transform: translate(-50%, -50%) scale(1);
      }
    }

    @keyframes exit-brand-j-enter {
      0% {
        opacity: 0;
        transform: translate(calc(-50% - 150px), -50%);
      }

      100% {
        opacity: 1;
        transform: translate(-50%, -50%);
      }
    }

    @keyframes exit-brand-j-darken {
      0% {
        color: #fff;
      }

      100% {
        color: #000;
      }
    }

    @keyframes exit-brand-point-move {
      0% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }

      100% {
        opacity: 0;
        transform: translate(calc(-50% + 242px), calc(-50% + 44px)) scale(0.18);
      }
    }

    @keyframes exit-brand-iuyin-enter {
      0% {
        opacity: 0;
        transform: translate(200px, -50%);
      }

      100% {
        opacity: 1;
        transform: translate(0, -50%);
      }
    }

    @keyframes exit-brand-eye-look-left {
      0% {
        opacity: 0;
        transform: translate(-3px, 3px) scale(0.65);
      }

      12% {
        opacity: 1;
        transform: translate(-3px, 0) scale(1);
      }

      34% {
        transform: translate(-8px, -3px) scale(1);
      }

      58% {
        transform: translate(7px, -2px) scale(1);
      }

      78% {
        transform: translate(3px, 4px) scale(1);
      }

      100% {
        opacity: 0;
        transform: translate(0, 0) scale(0.82);
      }
    }

    @keyframes exit-brand-eye-look-right {
      0% {
        opacity: 0;
        transform: translate(-3px, 3px) scale(0.65);
      }

      12% {
        opacity: 1;
        transform: translate(-3px, 0) scale(1);
      }

      34% {
        transform: translate(-8px, -3px) scale(1);
      }

      58% {
        transform: translate(7px, -2px) scale(1);
      }

      78% {
        transform: translate(3px, 4px) scale(1);
      }

      100% {
        opacity: 0;
        transform: translate(0, 0) scale(0.82);
      }
    }

    @keyframes exit-brand-eyes-hold {
      from,
      to {
        opacity: 1;
        transform: translate(-50%, -50%);
      }
    }

    .assistant-avatar-enter-active,
    .assistant-avatar-leave-active {
      transition:
        opacity 240ms ease,
        transform 240ms ease;
      will-change: opacity, transform;
    }

    .assistant-avatar-enter-from {
      opacity: 0;
      transform: translateY(100%);
    }

    .assistant-avatar-leave-to {
      opacity: 0;
      transform: translateY(-100%);
    }
  }
</style>
