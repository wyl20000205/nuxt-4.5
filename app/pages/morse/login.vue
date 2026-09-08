<template>
  <div id="pages_login">
    <div
      id="login_main"
      :class="{
        'is-right-closing': isRightPanelClosing,
        'is-left-centered': isLeftPanelCentered,
      }"
    >
      <div class="l">
        <p class="logo" @click="go_home">
          <img src="/images/logo_2.png" alt="" />
          <img src="/images/logo_1.png" alt="" />
        </p>
        <p class="title">
          {{ isRegisterMode ? "注册一个久引账号" : "欢迎登录久引" }}
        </p>
        <div v-show="!isRegisterMode" class="login_box">
          <em class="title_user">账号</em>
          <p class="inp_user btn">
            <input
              :value="loginForm.account"
              type="text"
              maxlength="18"
              placeholder="请输入账号"
              @input="handleLoginInput('account', $event)"
            /><em class="yumao icon-yanjing" style="opacity: 0"></em>
          </p>
          <em class="title_pass">密码</em>
          <p class="inp_pass btn">
            <input
              :value="loginForm.password"
              :type="showLoginPassword ? 'text' : 'password'"
              maxlength="18"
              placeholder="请输入密码"
              @input="handleLoginInput('password', $event)"
            /><em
              class="yumao icon-yanjing"
              :class="{ is_visible: showLoginPassword }"
              role="button"
              :aria-label="showLoginPassword ? '隐藏密码' : '显示密码'"
              tabindex="0"
              @click="showLoginPassword = !showLoginPassword"
              @keydown.enter="showLoginPassword = !showLoginPassword"
            ></em>
          </p>
          <p
            class="re_me btn"
            :class="{ is_checked: has_rember }"
            role="checkbox"
            :aria-checked="Boolean(has_rember)"
            tabindex="0"
            @click="toggleRemember"
            @keydown.enter="toggleRemember"
            @keydown.space.prevent="toggleRemember"
          >
            <em></em><i>记住我</i>
          </p>
          <p
            v-if="formMessage"
            class="form_message"
            :class="{ is_success: formMessageKind === 'success' }"
          >
            {{ formMessage }}
          </p>
          <p
            class="btn_login btn"
            :class="{ is_loading: isSubmitting }"
            :aria-disabled="isSubmitting"
            @click="loginTodo"
          >
            {{ isSubmitting ? "正在验证..." : "登录" }}
          </p>
          <p class="btn_go_reg btn" @click="showRegister">暂无账号? 立即注册</p>
        </div>
        <div v-show="isRegisterMode" class="register_box">
          <em class="title_user">账号</em>
          <p class="inp_user btn">
            <input
              :value="registerForm.account"
              type="text"
              maxlength="18"
              placeholder="请输入账号"
              @input="handleRegisterInput('account', $event)"
            /><em class="yumao icon-yanjing" style="opacity: 0"></em>
          </p>

          <em class="title_pass">密码</em>
          <p class="inp_pass btn">
            <input
              :value="registerForm.password"
              :type="showRegisterPassword ? 'text' : 'password'"
              maxlength="18"
              placeholder="请输入密码"
              @input="handleRegisterInput('password', $event)"
            /><em
              class="yumao icon-yanjing"
              :class="{ is_visible: showRegisterPassword }"
              role="button"
              :aria-label="showRegisterPassword ? '隐藏密码' : '显示密码'"
              tabindex="0"
              @click="showRegisterPassword = !showRegisterPassword"
              @keydown.enter="showRegisterPassword = !showRegisterPassword"
            ></em>
          </p>

          <em class="title_pass">确认密码</em>
          <p class="inp_pass btn">
            <input
              :value="registerForm.confirmPassword"
              :type="showRegisterConfirmPassword ? 'text' : 'password'"
              maxlength="18"
              placeholder="请再次输入密码"
              @input="handleRegisterInput('confirmPassword', $event)"
            /><em
              class="yumao icon-yanjing"
              :class="{ is_visible: showRegisterConfirmPassword }"
              role="button"
              :aria-label="
                showRegisterConfirmPassword ? '隐藏密码' : '显示密码'
              "
              tabindex="0"
              @click="
                showRegisterConfirmPassword = !showRegisterConfirmPassword
              "
              @keydown.enter="
                showRegisterConfirmPassword = !showRegisterConfirmPassword
              "
            ></em>
          </p>

          <em class="title_email">邮箱</em>
          <p class="inp_email btn">
            <input
              :value="registerForm.email"
              type="email"
              maxlength="254"
              autocomplete="email"
              placeholder="请输入邮箱"
              @input="handleRegisterInput('email', $event)"
            />
            <button
              type="button"
              class="send_btn btn"
              :disabled="isVerificationSending || verificationCountdown > 0"
              aria-live="polite"
              @click="sendVerificationCode"
            >
              {{
                isVerificationSending
                  ? "发送中..."
                  : verificationCountdown > 0
                    ? `${verificationCountdown}s`
                    : "发送"
              }}
            </button>
          </p>

          <em class="title_code">验证码</em>
          <p class="inp_code btn">
            <input
              :value="registerForm.verificationCode"
              type="text"
              inputmode="numeric"
              maxlength="6"
              autocomplete="one-time-code"
              placeholder="请输入验证码"
              @input="handleRegisterInput('verificationCode', $event)"
            />
          </p>

          <p
            class="re_me btn"
            :class="{ is_checked: hasTerms }"
            role="checkbox"
            :aria-checked="Boolean(hasTerms)"
            tabindex="0"
            @click="toggleTerms"
            @keydown.enter="toggleTerms"
            @keydown.space.prevent="toggleTerms"
          >
            <em></em><i>我已记住并接受</i><i>服务条例</i>
          </p>
          <p
            v-if="formMessage"
            class="form_message"
            :class="{ is_success: formMessageKind === 'success' }"
          >
            {{ formMessage }}
          </p>
          <p
            class="btn_register btn"
            :class="{ is_loading: isSubmitting }"
            :aria-disabled="isSubmitting"
            @click="registerTodo"
          >
            {{ isSubmitting ? "正在验证..." : "注册" }}
          </p>
          <p class="btn_go_login btn" @click="showLogin">已有账号? 立即登录</p>
        </div>
        <button
          v-if="!isRightPanelHidden"
          type="button"
          class="clear_r yumao icon-changyong_youhua"
          aria-label="Close right panel"
          @click="closeRightPanel"
          style="opacity: 0"
        ></button>
      </div>
    </div>
    <p id="btn_chat" class="btn" @click="toggleChat">
      <i class="yumao icon-kefu"></i><i>咨询</i>
    </p>
    <div id="web_info">
      <p>
        2020-2026 久引智能科技（江苏）有限公司 Inc. 保留所有权利 — All Rights
        Reserved. 苏ICP备2026050001号
      </p>
      <p>
        {{ poemQuote }}
      </p>
    </div>
    <Transition name="chat">
      <div v-if="chatVisible" id="chat">
        <div class="bg" @click="toggleChat"></div>
        <div class="main">
          <p class="head">
            <em class="btn">
              <i class="yumao icon-kefu"></i>
              <i class="text">发起咨询</i>
            </em>
            <!-- <em class="btn">
              <i class="yumao icon-kefu"></i>
              <i  class="text">工单列表</i>
            </em> -->
          </p>
          <div class="content">
            <div
              v-for="item in ws_item"
              :key="item.id"
              class="item"
              :class="item.position"
            >
              <div class="l"><img :src="item.avatar" :alt="item.title" /></div>
              <div class="r">
                <p class="title">{{ item.title }}</p>
                <p class="text">{{ item.text }}</p>
              </div>
            </div>
          </div>
          <div class="send">
            <p>
              <input
                v-model="sendMessage"
                type="text"
                maxlength="200"
                placeholder="简述你的问题🤔"
                @keydown.enter.prevent="sendTodo"
              />
            </p>
            <p class="btn send_btn" @click="sendTodo">
              <i class="yumao icon-a-042_faxian"></i><i>发送</i>
            </p>
          </div>
          <p class="cancel btn" @click="toggleChat">
            <i class="yumao icon-close"></i>
          </p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import apiIndex from "~/composables/api_index";
  import { useIndexStore } from "@/stores";
  import { useUserStore } from "~/stores/user";

  type PoetryResponse = {
    data: {
      title: string;
      content: string[];
      author: { name: string };
      dynasty: { name: string };
    };
  };

  const qq_img = ref("https://q1.qlogo.cn/g?b=qq&nk=754796037&s=640");
  const other_qq_img = ref("https://q1.qlogo.cn/g?b=qq&nk=1799498990&s=640");
  const poemQuote = ref("");
  const ws_item = ref<
    {
      id: number;
      position: "msg_l" | "msg_r";
      title: string;
      text: string;
      avatar: string;
    }[]
  >([
    {
      id: 1,
      position: "msg_l",
      title: "久引-韦英林",
      text: "久引答疑！🤔",
      avatar: qq_img.value,
    },
  ]);
  const indexStore = useIndexStore();
  const userStore = useUserStore();
  const USER_TOKEN_STORAGE_KEY = "token_user";
  const userTokenCookie = useCookie<string | null>(USER_TOKEN_STORAGE_KEY, {
    maxAge: 3600,
    path: "/",
    sameSite: "strict",
    secure: import.meta.env.PROD,
  });
  const engLinkUserIdCookie = useCookie<string | null>("eng_link_user_id", {
    path: "/",
    sameSite: "lax",
    secure: import.meta.env.PROD,
  });
  const has_rember = ref(1);
  const hasTerms = ref(1);
  const isRegisterMode = ref(false);
  const showLoginPassword = ref(false);
  const showRegisterPassword = ref(false);
  const showRegisterConfirmPassword = ref(false);
  const chatVisible = ref(false);
  const isRightPanelClosing = ref(false);
  const isRightPanelHidden = ref(false);
  const isLeftPanelCentered = ref(false);
  const formMessage = ref("");
  const formMessageKind = ref<"error" | "success">("error");
  const isSubmitting = ref(false);
  const isVerificationSending = ref(false);
  const verificationCountdown = ref(0);
  const sendMessage = ref("");
  const latestItems = ref([
    {
      id: 1,
      title: "久引尝试用硬盘拯救人类",
      time: "2026-09-18 19:22",
    },
    {
      id: 2,
      title: "关于久引账号服务的新说明",
      time: "2026-09-15 10:30",
    },
    {
      id: 3,
      title: "本周内容更新与维护公告",
      time: "2026-09-12 16:45",
    },
  ]);
  const loginForm = reactive({ account: "", password: "" });
  const registerForm = reactive({
    account: "",
    password: "",
    confirmPassword: "",
    email: "",
    verificationCode: "",
  });

  const toggleRemember = () => {
    has_rember.value = has_rember.value ? 0 : 1;
  };

  const toggleTerms = () => {
    hasTerms.value = hasTerms.value ? 0 : 1;
  };

  const handleLoginInput = (field: "account" | "password", event: Event) => {
    loginForm[field] = indexStore.handle_inp(event);
  };

  const handleRegisterInput = (
    field:
      | "account"
      | "password"
      | "confirmPassword"
      | "email"
      | "verificationCode",
    event: Event,
  ) => {
    registerForm[field] = indexStore.handle_inp(event);
  };

  const validateAccount = (account: string) => {
    if (!/^\S{3,18}$/.test(account)) {
      return "账号需为 3 至 18 位，且不能包含空白字符";
    }
    return "";
  };

  const validatePassword = (password: string) => {
    if (password.length < 6 || password.length > 18) {
      return "密码长度需为 6 至 18 位";
    }
    return "";
  };

  const validateEmail = (email: string) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "请输入格式正确的邮箱地址";
    }
    return "";
  };

  const validateVerificationCode = (code: string) => {
    if (!/^\d{6}$/.test(code)) {
      return "验证码需为 6 位数字";
    }
    return "";
  };

  let verificationCountdownTimer: ReturnType<typeof setInterval> | undefined;

  const sendVerificationCode = async () => {
    if (isVerificationSending.value || verificationCountdown.value > 0) return;

    const validationMessage = validateEmail(registerForm.email);
    if (validationMessage) {
      showFormMessage(validationMessage);
      return;
    }

    isVerificationSending.value = true;
    showFormMessage("正在发送验证码...");

    try {
      const result = await $fetch<{ message?: string }>(
        "/api/eng-link/verification",
        {
          method: "GET",
          credentials: "include",
          query: { email: registerForm.email, turnstile: "" },
        },
      );
      showFormMessage(result.message || "验证码已发送", "success");
      verificationCountdown.value = 30;
      verificationCountdownTimer = setInterval(() => {
        verificationCountdown.value -= 1;
        if (verificationCountdown.value === 0) {
          clearInterval(verificationCountdownTimer);
          verificationCountdownTimer = undefined;
        }
      }, 1000);
    } catch {
      showFormMessage("验证码发送失败，请稍后重试");
    } finally {
      isVerificationSending.value = false;
    }
  };

  const router = useRouter();
  let authDebounceTimer: ReturnType<typeof setTimeout> | undefined;
  let authRestoreTimer: ReturnType<typeof setTimeout> | undefined;
  let authRequestTimer: ReturnType<typeof setTimeout> | undefined;

  const showFormMessage = (
    message: string,
    kind: "error" | "success" = "error",
  ) => {
    formMessage.value = message;
    formMessageKind.value = kind;
  };

  const saveUserToken = (token: string) => {
    userStore.token_user = token;
    userTokenCookie.value = token;
    localStorage.setItem(USER_TOKEN_STORAGE_KEY, token);
  };

  const restoreAuthForm = (delay = 1200) => {
    if (authRestoreTimer) clearTimeout(authRestoreTimer);
    authRestoreTimer = setTimeout(() => {
      isSubmitting.value = false;
      formMessage.value = "";
    }, delay);
  };

  const handleLoginRequest = async () => {
    if (isSubmitting.value) return;

    const validationMessage =
      validateAccount(loginForm.account) ||
      validatePassword(loginForm.password);
    if (validationMessage) {
      showFormMessage(validationMessage);
      return;
    }

    isSubmitting.value = true;
    showFormMessage("登录中...");

    try {
      const result = await $fetch<{
        success: boolean;
        message?: string;
        data?: { id?: number };
      }>("/api/eng-link-login", {
        method: "POST",
        credentials: "include",
        body: {
          username: loginForm.account.trim(),
          password: loginForm.password,
        },
      });

      if (!result.success || !result.data?.id) {
        throw new Error(result.message || "登录失败");
      }

      engLinkUserIdCookie.value = String(result.data.id);
      if (has_rember.value) {
        localStorage.setItem("jiuyinRememberedAccount", loginForm.account);
      } else {
        localStorage.removeItem("jiuyinRememberedAccount");
      }
      showFormMessage("登录成功", "success");
      await navigateTo(
        loginForm.account.trim() === "admin"
          ? "/morse/admin/"
          : "/morse/user/",
      );
    } catch (error) {
      engLinkUserIdCookie.value = null;
      const message =
        (error as { data?: { message?: string } }).data?.message ??
        (error instanceof Error ? error.message : "登录请求失败");
      showFormMessage(message);
    } finally {
      isSubmitting.value = false;
    }
  };

  const loginTodo = (event: Event) => {
    indexStore.createRipple(event as MouseEvent);
    if (isSubmitting.value) return;
    if (authDebounceTimer) clearTimeout(authDebounceTimer);
    authDebounceTimer = setTimeout(() => void handleLoginRequest(), 300);
  };

  const handleRegisterRequest = async () => {
    if (isSubmitting.value) return;

    const validationMessage =
      validateAccount(registerForm.account) ||
      validatePassword(registerForm.password) ||
      (registerForm.password !== registerForm.confirmPassword
        ? "两次输入的密码不一致"
        : "") ||
      validateEmail(registerForm.email) ||
      validateVerificationCode(registerForm.verificationCode) ||
      (!hasTerms.value ? "请先接受服务条例" : "");
    if (validationMessage) {
      showFormMessage(validationMessage);
      return;
    }

    const registerTime = Number(localStorage.getItem("registerTime"));
    const elapsed = Date.now() - registerTime;
    if (registerTime > 0 && elapsed < 60000) {
      showFormMessage(
        `请在 ${Math.ceil((60000 - elapsed) / 1000)} 秒后再次注册`,
      );
      return;
    }

    isSubmitting.value = true;
    showFormMessage("正在验证注册信息...");
    if (authRestoreTimer) clearTimeout(authRestoreTimer);
    if (authRequestTimer) clearTimeout(authRequestTimer);

    let requestTimedOut = false;
    authRequestTimer = setTimeout(() => {
      requestTimedOut = true;
      showFormMessage("请求超时，请稍后重试");
      restoreAuthForm();
    }, 10000);

    try {
      const { code, msg, data } = await apiIndex.register({
        user: registerForm.account,
        pass1: registerForm.password,
        pass2: registerForm.confirmPassword,
        email: registerForm.email,
        verification_code: registerForm.verificationCode,
      });
      if (requestTimedOut) return;

      if (code === 200) {
        if (typeof data?.token !== "string" || !data.token) {
          showFormMessage("注册成功，但登录令牌生成失败");
          restoreAuthForm();
          return;
        }
        saveUserToken(data.token);
        localStorage.setItem("registerTime", String(Date.now()));
        showFormMessage("注册成功", "success");
        loginForm.account = registerForm.account;
        registerForm.account = "";
        registerForm.password = "";
        registerForm.confirmPassword = "";
        registerForm.email = "";
        registerForm.verificationCode = "";
        if (authRestoreTimer) clearTimeout(authRestoreTimer);
        authRestoreTimer = setTimeout(() => {
          isSubmitting.value = false;
          formMessage.value = "";
          void router.push("/user");
        }, 1200);
        return;
      }

      if (code === 409 || msg === "USER_EXISTS") {
        showFormMessage("该账号已经存在");
      } else if (msg === "PASSWORD_MISMATCH") {
        showFormMessage("两次输入的密码不一致");
      } else {
        showFormMessage("注册失败，请检查输入信息");
      }
      restoreAuthForm();
    } catch {
      if (requestTimedOut) return;
      showFormMessage("网络异常，请稍后重试");
      restoreAuthForm();
    } finally {
      if (authRequestTimer) clearTimeout(authRequestTimer);
    }
  };

  const registerTodo = (event: Event) => {
    indexStore.createRipple(event as MouseEvent);
    if (isSubmitting.value) return;
    if (authDebounceTimer) clearTimeout(authDebounceTimer);
    authDebounceTimer = setTimeout(() => void handleRegisterRequest(), 300);
  };

  let go_home = () => {
    navigateTo("/");
  };

  const showLogin = () => {
    if (isSubmitting.value) return;
    isRegisterMode.value = false;
    formMessage.value = "";
  };

  const showRegister = () => {
    if (isSubmitting.value) return;
    isRegisterMode.value = true;
    formMessage.value = "";
  };

  const toggleChat = () => {
    chatVisible.value = !chatVisible.value;
  };

  let rightPanelTimer: ReturnType<typeof setTimeout> | undefined;
  let centerPanelFrame: number | undefined;

  const closeRightPanel = () => {
    if (isRightPanelClosing.value || isRightPanelHidden.value) return;

    isRightPanelClosing.value = true;
    rightPanelTimer = setTimeout(() => {
      isRightPanelHidden.value = true;
      isRightPanelClosing.value = false;
      centerPanelFrame = requestAnimationFrame(() => {
        isLeftPanelCentered.value = true;
      });
    }, 450);
  };

  const fetchPoem = async () => {
    try {
      const response = await fetch(
        "https://poetry.palemoky.com/api/poems/random",
      );
      if (!response.ok) throw new Error("诗词接口请求失败");

      const { data } = (await response.json()) as PoetryResponse;
      const content = data.content.slice(0, 2).join("");
      poemQuote.value = `“${content}”——【${data.dynasty.name}】${data.author.name}《${data.title}》`;
    } catch (error) {
      console.error("获取随机诗词失败", error);
    }
  };

  const sendTodo = (event: MouseEvent | KeyboardEvent) => {
    if (event instanceof MouseEvent) {
      indexStore.createRipple(event);
    }

    const text = sendMessage.value.trim();
    if (!text) return;

    const isFirstVisitorMessage = !ws_item.value.some(
      (item) => item.position === "msg_r",
    );
    const messageId = Date.now();
    ws_item.value.push({
      id: messageId,
      position: "msg_r",
      title: "游客",
      text,
      avatar: other_qq_img.value,
    });
    // if (isFirstVisitorMessage) {
    //   setTimeout(() => {
    //     ws_item.value.push({
    //       id: messageId + 1,
    //       position: "msg_l",
    //       title: "久引剪辑实习生 韦英林",
    //       text: "hello",
    //       avatar: qq_img.value,
    //     });
    //   }, 1500);
    // }
    sendMessage.value = "";

    // TODO: 在这里调用发送聊天消息接口。
  };

  onMounted(() => {
    void fetchPoem();
    const rememberedAccount = localStorage.getItem("jiuyinRememberedAccount");
    if (rememberedAccount) loginForm.account = rememberedAccount;
  });

  onBeforeUnmount(() => {
    if (authDebounceTimer) clearTimeout(authDebounceTimer);
    if (authRestoreTimer) clearTimeout(authRestoreTimer);
    if (authRequestTimer) clearTimeout(authRequestTimer);
    if (verificationCountdownTimer) clearInterval(verificationCountdownTimer);
    if (rightPanelTimer) clearTimeout(rightPanelTimer);
    if (centerPanelFrame) cancelAnimationFrame(centerPanelFrame);
  });
</script>

<style lang="less" scoped>
  #pages_login {
    position: fixed;
    inset: 0;
    overflow: hidden;
    &::before {
      position: absolute;
      inset: -10px;
      z-index: 0;
      background: url("/images/bg4.jpg") center / cover no-repeat;
      content: "";
      filter: blur(2px);
    }

    #login_main {
      position: relative;
      z-index: 1;
      display: flex;
      justify-content: center;
      width: 60%;
      margin: 0 auto;
      // border: 1px solid gray;
      margin-top: 160px;

      > .l {
        position: relative;
        box-sizing: border-box;
        width: 43%;
        align-self: flex-start;
        background: white;
        border-radius: 3px;
        box-shadow: 0 8px 24px rgb(41 160 95 / 14%);

        > div,
        > p {
          width: 80%;
          margin: 0 auto;
          margin-bottom: 25px;
          text-align: center;
        }
        .logo {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 35px;
          cursor: pointer;
          img {
            width: 30px;
            height: 30px;
          }
          img:nth-of-type(2) {
            width: 146px;
          }
        }
        .title {
          font-size: 20px;
          color: rgb(74, 66, 66);
        }
        .clear_r {
          position: absolute;
          z-index: 2;
          top: 12px;
          right: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          padding: 0;
          border: 0;
          border-radius: 50%;
          outline: 0;
          background: rgb(41 160 95 / 10%);
          color: #29a05f;
          font-size: 18px;
          cursor: pointer;
          transition:
            color 0.2s,
            background-color 0.2s,
            transform 0.2s;

          &:hover {
            background: #29a05f;
            color: white;
          }

          &:active {
            transform: scale(0.88);
          }
        }
        .login_box,
        .register_box {
          .inp_user,
          .inp_pass,
          .inp_email,
          .inp_code {
            border: 1px solid rgb(162, 153, 153);
            height: 32px;
            display: flex;
            justify-content: center;
            align-items: center;
            transition: all 0.3s;
            border-radius: 3px;
            margin-bottom: 20px;
            box-shadow: 0 0 1px transparent;

            &:focus-within {
              border-color: #8fd19e;
              box-shadow: 0 0 0 1px rgb(201, 229, 201);
            }
            input {
              width: 85%;
              height: 90%;
              border: 0;
              outline: 0;
              transition: all 0.3s;
              font-size: 17px;
              &:focus {
                transform: translateX(2px);
              }
            }
            .yumao {
              font-size: 18px;
              cursor: pointer;
              color: #7b7b7b;
              transition: color 0.3s;
              &.is_visible {
                color: #4fa768;
              }
            }
          }
          .inp_user {
            margin-bottom: 20px;
          }
          .inp_email {
            justify-content: flex-start;

            input {
              flex: 1;
              min-width: 0;
              width: auto;
              padding-left: 5%;
            }

            .send_btn {
              align-self: stretch;
              flex: 0 0 78px;
              padding: 0;
              border: 0;
              border-radius: 0 2px 2px 0;
              background: #29a05f;
              color: white;
              cursor: pointer;

              &:disabled {
                cursor: not-allowed;
                opacity: 0.65;
              }
            }
          }
          em[class^="title_"] {
            text-align: left;
            display: block;
            font-size: 14px;
            color: gray;
            margin-bottom: 5px;
          }
          .re_me {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
            cursor: pointer;
            > em {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              transition: all 0.3s;
              height: 14px;
              width: 14px;
              border: 2px solid gray;
              margin-right: 8px;
              border-radius: 2px;
              color: white;
              font-size: 12px;
              line-height: 1;
            }
            &.is_checked > em {
              border-color: #69bd7c;
              background: #69bd7c;
            }
            &.is_checked > em::after {
              content: "✓";
            }
            > i {
              font-size: 15px;
            }
          }
          .form_message {
            margin: 0 0 12px;
            color: #d44848;
            font-size: 13px;
            text-align: left;

            &.is_success {
              color: #238b52;
            }
          }
          .btn_login,
          .btn_register {
            height: 34px;
            line-height: 34px;
            background: #29a05f;
            margin-bottom: 20px;
            border-radius: 3px;
            color: white;
            transition: all 0.3s;
            box-shadow: 1px 1px 3px transparent;
            &:hover {
              box-shadow: 1px 1px 2px rgb(174, 184, 174);
            }

            &.is_loading {
              cursor: wait;
              opacity: 0.72;
              pointer-events: none;
            }
          }
          .btn_go_reg,
          .btn_go_login {
            font-size: 15px;
            color: rgb(26, 139, 209);
          }
        }
      }
     

      &.is-right-closing > .r {
        flex-grow: 0;
        opacity: 0;
        transform: scaleX(0);
        pointer-events: none;
      }

    }
    #btn_chat {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: absolute;
      z-index: 2;
      right: 10px;
      bottom: calc(50% - 260px);
      height: 60px;
      width: 60px;
      background: #29a05f;
      border-bottom: 5px solid #1f7d49;
      border-radius: 10px;
      font-size: 17px;
      color: white;
      transition: all 0.3s;
      &:active {
        transform: translateY(2px);
        border-bottom-width: 1px;
      }
      .yumao {
        margin-bottom: 5px;
        font-size: 20px;
      }
    }
    #chat {
      position: fixed;
      inset: 0;
      z-index: 3;
      > div {
        position: absolute;
      }
      .bg {
        inset: 0;
        background: rgba(91, 94, 93, 0.7);
      }
      .main {
        z-index: 1;
        left: 50%;
        top: 50%;
        width: 850px;
        height: 650px;
        transform: translate(-50%, -50%);
        background: rgb(255, 255, 255);
        border-radius: 4px;
        box-shadow: 0 8px 24px rgb(41 160 95 / 14%);

        .head {
          width: 100%;
          margin: 0 auto;
          margin-bottom: 25px;
          display: flex;
          align-items: center;
          em {
            height: 30px;
            line-height: 30px;
            transition: all 0.3s;
            text-align: center;
            border-bottom: 3.4px solid rgb(90, 144, 54);
            padding: 10px 20px;
            color: #1f7d49;
            .yumao {
              margin-right: 12px;
              font-size: 22px;
            }
            .text {
              font-size: 18px;
              font-weight: 700;
            }
          }
        }
        .content {
          width: 98%;
          height: calc(100% - 170px);
          box-sizing: border-box;
          overflow-y: auto;
          -ms-overflow-style: none;
          scrollbar-width: none;
          padding: 0 28px;
          margin: 0 auto;
          &::-webkit-scrollbar {
            display: none;
          }
          .item {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            width: 100%;
            margin-bottom: 16px;
            .l {
              flex: 0 0 58px;
              img {
                display: block;
                width: 45px;
                height: 45px;
                border-radius: 50%;
                object-fit: cover;
              }
            }
            .r {
              max-width: calc(100% - 70px);
              .title {
                margin: 3px 0 7px;
                color: #687077;
                font-size: 17px;
                font-weight: 700;
              }
              .text {
                display: inline-block;
                margin: 0;
                padding: 10px 14px;
                border-radius: 4px 12px 12px;
                background: #fff;
                box-shadow: 0 2px 7px rgb(31 41 55 / 12%);
                color: #5d6570;
                font-size: 16px;
                line-height: 1.4;
                word-break: break-word;
              }
            }
            &.msg_r {
              flex-direction: row-reverse;
              .r {
                text-align: right;
                .text {
                  border-radius: 12px 4px 12px 12px;
                  background: #e3f4e7;
                }
              }
            }
          }
        }
        .send {
          display: flex;
          position: absolute;
          left: 50%;
          bottom: 20px;
          box-sizing: border-box;
          width: 90%;
          height: 40px;
          gap: 20px;
          transform: translateX(-50%);
          > p {
            margin: 0;
          }
          > p:first-child {
            flex: 1;
            input {
              box-sizing: border-box;
              width: 100%;
              height: 40px;
              padding: 0 20px;
              border: 1px solid #92d8a8;
              border-radius: 5px;
              outline: 0;
              color: #3c5142;
              font-size: 17px;
              transition:
                border-color 0.25s,
                box-shadow 0.25s;
              &::placeholder {
                color: #aab6ad;
              }
              &:focus {
                border-color: #29a05f;
                box-shadow: 0 0 0 3px rgb(41 160 95 / 14%);
              }
            }
          }
          .send_btn {
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
            width: 100px;
            border-radius: 8px;
            background: #29a05f;
            border-bottom: 4px solid #1f7d49;
            color: white;
            font-size: 18px;
            font-weight: 700;
            cursor: pointer;
            transition:
              transform 0.2s,
              border-bottom-width 0.2s;
            .yumao {
              margin-right: 8px;
              font-size: 20px;
            }
            &:hover {
              background: #35ad6d;
            }
            &:active {
              transform: translateY(2px);
              border-bottom-width: 2px;
            }
          }
        }
        .cancel {
          position: absolute;
          right: -10px;
          top: -10px;
          height: 32px;
          line-height: 32px;
          text-align: center;
          width: 32px;
          border-radius: 4px;
          background: white;
          cursor: pointer;
          transition: transform 0.2s;
          &:hover {
            transform: rotate(90deg) scale(0.9);
          }
        }
      }
    }
    #web_info {
      position: absolute;
      left: 0;
      width: 100%;
      bottom: 0px;
      height: 40px;
      line-height: 40px;
      background: rgba(2, 2, 2, 0.2);
      color: #fff;
      font-size: 14px;
      display: flex;
      justify-content: space-between;
      p {
        margin: 0 20px;
      }
    }
    #chat.chat-enter-active,
    #chat.chat-leave-active {
      transition: opacity 0.4s ease;
      .main {
        transition:
          opacity 0.4s ease,
          filter 0.4s ease,
          transform 0.4s ease;
      }
    }
    #chat.chat-enter-from {
      opacity: 0;
      .main {
        opacity: 0;
        filter: blur(2px);
        transform: translate(-50%, -50%) translateY(-18px);
      }
    }
    #chat.chat-leave-to {
      opacity: 0;
      .main {
        opacity: 0;
        filter: blur(2px);
        transform: translate(-50%, -50%) translateY(18px);
      }
    }
  }
</style>
