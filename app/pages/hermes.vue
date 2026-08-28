<template>
  <div id="pages_hermes">
    <div class="hermes_stage" :style="{ transform: `translate(-50%, -50%) scale(${pageScale})` }">
    <header class="site_header" aria-label="Hermes navigation">
      <a class="nav_link" href="#about">JinYin</a>
      <!-- <a class="brand" href="#about" aria-label="Hermes Agent home">
        <strong>HERMES</strong>
      </a>
      <a class="nav_link" href="#downloads">PRODUCTS <i>▾</i></a>
      <a class="nav_link" href="#install">INSTALL <i>→</i></a> -->
    </header>

    <main>
      <section id="about" class="hero_section">
        <div class="hero_copy">
          <p class="eyebrow">OPEN SOURCE · MIT LICENSE</p>
          <h1><span>THE AGENT</span><span>THAT GROWS</span></h1>

          <div class="desktop_download">
            <p class="section_label">DOWNLOAD HERMES DESKTOP APP</p>
            <button type="button" class="primary_button" @click="notifyDownload('Windows')">
              <span class="windows_mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
              DOWNLOAD FOR WINDOWS
            </button>
          </div>

          <div id="install" class="terminal_install">
            <p class="section_label">INSTALL VIA TERMINAL</p>
            <div class="terminal_panel">
              <div class="terminal_tabs">
                <button
                  v-for="tab in terminalTabs"
                  :key="tab"
                  type="button"
                  :class="{ active: activeTerminal === tab }"
                  @click="activeTerminal = tab"
                >
                  {{ tab }}
                </button>
              </div>
              <button type="button" class="copy_command" @click="copyInstallCommand">
                <code>{{ activeCommand }}</code>
                <span aria-hidden="true">{{ copied ? "✓" : "□" }}</span>
              </button>
            </div>
          </div>

          <section id="downloads" class="downloads_section">
            <div class="downloads_heading">
              <p class="eyebrow">NATIVE APP</p>
              <h2>HERMES DESKTOP FOR MACOS, WINDOWS &amp; LINUX</h2>
            </div>
            <div class="platform_grid">
              <article v-for="platform in platforms" :key="platform.name" class="platform_card">
                <img :src="platform.image" alt="" aria-hidden="true" />
                <div class="platform_overlay">
                  <p>{{ platform.version }}</p>
                  <h3>{{ platform.name }}</h3>
                  <button type="button" class="primary_button platform_button" @click="notifyDownload(platform.name)">
                    <span class="platform_icon" aria-hidden="true">{{ platform.icon }}</span>
                    {{ platform.action }}
                  </button>
                </div>
              </article>
            </div>
          </section>
        </div>

        <div class="hero_art" aria-hidden="true">
          <div class="art_glow"></div>
          <img src="/images/harmes-removebg-preview.png" alt="" />
        </div>
        <a class="scroll_hint" href="#downloads" aria-label="Scroll to downloads">⌄</a>
      </section>

    </main>
    </div>

    <Transition name="toast">
      <p v-if="toastText" class="download_toast" role="status">{{ toastText }}</p>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  type TerminalTab = "macOS / Linux" | "Windows";

  const terminalTabs: TerminalTab[] = ["macOS / Linux", "Windows"];
  const activeTerminal = ref<TerminalTab>("macOS / Linux");
  const copied = ref(false);
  const toastText = ref("");
  const pageScale = ref(1);
  let toastTimer: ReturnType<typeof setTimeout> | undefined;

  const DESIGN_WIDTH = 1600;
  const DESIGN_HEIGHT = 900;

  const updatePageScale = () => {
    pageScale.value = Math.min(window.innerWidth / DESIGN_WIDTH, window.innerHeight / DESIGN_HEIGHT);
  };

  const commands: Record<TerminalTab, string> = {
    "macOS / Linux": "curl -fsSL https://jiuyin.877888.asia/install.sh | bash",
    Windows: "Windows installer is coming soon",
  };
  const activeCommand = computed(() => commands[activeTerminal.value]);

  const platforms = [
    { name: "Mac OS", version: "MACOS 12+", action: "DOWNLOAD DESKTOP APP", icon: "●", image: "/images/temp2.webp" },
    { name: "Windows", version: "WINDOWS 10/11", action: "DOWNLOAD DESKTOP APP", icon: "⊞", image: "/images/temp3.webp" },
    { name: "Linux", version: "ANY DISTRO", action: "INSTALL VIA TERMINAL", icon: "♙", image: "/images/temp4.webp" },
  ];

  const showToast = (message: string) => {
    toastText.value = message;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (toastText.value = ""), 1800);
  };

  const copyInstallCommand = async () => {
    try {
      await navigator.clipboard.writeText(activeCommand.value);
      copied.value = true;
      showToast("INSTALL COMMAND COPIED");
      setTimeout(() => (copied.value = false), 1500);
    } catch {
      showToast("COPY FAILED");
    }
  };

  const notifyDownload = (platform: string) => {
    if (platform === "Linux") {
      document.querySelector("#install")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    showToast(`${platform.toUpperCase()} DOWNLOAD COMING SOON`);
  };

  onMounted(() => {
    updatePageScale();
    window.addEventListener("resize", updatePageScale);
  });

  onBeforeUnmount(() => {
    clearTimeout(toastTimer);
    window.removeEventListener("resize", updatePageScale);
  });
  useHead({
    title: "Hermes Agent",
    meta: [{ name: "description", content: "Hermes Agent desktop app for macOS, Windows and Linux." }],
  });
</script>

<style scoped lang="less">
  @mint_background: #dff6ec;
  @mint_card: #c8ebdc;
  @mint_pale: #f6fffb;
  @green_ink: #163d33;

  :global(body) {
    background: #DFF6EC;
  }

  #pages_hermes {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    color: @green_ink;
    background: @mint_background;
    font-family: Georgia, "Times New Roman", serif;
    scroll-behavior: smooth;
  }

  .hermes_stage {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 1600px;
    height: 900px;
    overflow: hidden;
    transform-origin: center;
  }

  .site_header {
    position: absolute;
    z-index: 10;
    top: 0;
    left: 0;
    display: grid;
    grid-template-columns: 1fr 1fr 1.25fr 1fr 1fr;
    align-items: start;
    width: 1600px;
    padding: 40px 136px 0;
    box-sizing: border-box;
  }

  .nav_link,
  .brand {
    color: @green_ink;
    text-align: center;
    font-size: 40px;
  }

  .nav_link {
    padding-top: 13px;
    font-weight: 700;
    letter-spacing: -0.04em;
    transition: opacity 180ms ease, transform 180ms ease;
    &:hover { opacity: 0.65; transform: translateY(-2px); }
    i { margin-left: 7px; font-size: 0.7em; }
  }

  .brand {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 32px;
    line-height: 0.83;
    letter-spacing: -0.055em;
    strong { font-weight: 700; }
  }

  .brand_socials {
    display: flex;
    gap: 13px;
    margin-top: 18px;
    font-family: Arial, sans-serif;
    font-size: 12px;
    line-height: 1;
    i {
      display: grid;
      width: 23px;
      height: 23px;
      place-items: center;
      border: 1px solid rgb(22 61 51 / 42%);
      border-radius: 50%;
    }
  }

  .hero_section {
    position: relative;
    display: grid;
    grid-template-columns: 49% 51%;
    width: 1600px;
    height: 900px;
    padding: 86px 88px 28px 168px;
    box-sizing: border-box;
  }

  .hero_copy {
    position: relative;
    z-index: 2;
    align-self: start;
    margin-top: 64px;
  }

  .eyebrow,
  .section_label,
  .terminal_tabs,
  .copy_command,
  .platform_overlay > p,
  .primary_button {
    font-family: "Courier New", monospace;
    font-weight: 700;
    letter-spacing: 0.12em;
  }

  .eyebrow,
  .section_label { font-size: 13px; }

  h1 {
    margin: 18px 0 46px;
    font-size: 84px;
    font-weight: 400;
    line-height: 0.82;
    letter-spacing: -0.075em;
    span { display: block; white-space: nowrap; }
  }

  .desktop_download { margin-bottom: 42px; }
  .section_label { margin-bottom: 10px; }

  .primary_button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 48px;
    padding: 0 24px;
    border: 1px solid @green_ink;
    color: @green_ink;
    background: @mint_pale;
    font-size: 14px;
    cursor: pointer;
    transition: color 180ms ease, background 180ms ease, transform 180ms ease;
    &:hover { color: @mint_pale; background: @green_ink; transform: translateY(-2px); }
  }

  .windows_mark {
    display: grid;
    grid-template-columns: repeat(2, 8px);
    gap: 2px;
    margin-right: 13px;
    i { width: 8px; height: 8px; background: currentColor; }
  }

  .terminal_install { width: 570px; margin-bottom: 42px; scroll-margin-top: 30px; }
  .terminal_panel { overflow: hidden; border-radius: 4px; color: @green_ink; background: @mint_pale; }

  .terminal_tabs {
    display: flex;
    gap: 20px;
    padding: 12px 18px;
    border-bottom: 1px solid rgb(22 61 51 / 18%);
    button {
      padding: 0;
      border: 0;
      color: rgb(22 61 51 / 38%);
      background: none;
      font: inherit;
      cursor: pointer;
      &.active { color: @green_ink; }
    }
  }

  .copy_command {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    width: 100%;
    padding: 13px 18px;
    border: 0;
    color: @green_ink;
    background: transparent;
    text-align: left;
    cursor: pointer;
    code { overflow: hidden; color: inherit; font: inherit; text-overflow: ellipsis; white-space: nowrap; }
  }

  .hero_art {
    position: relative;
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    height: 100%;
    img {
      position: relative;
      z-index: 1;
      width: 752px;
      height: auto;
      max-height: 684px;
      object-fit: contain;
      transform: translateY(-24px);
      filter: brightness(0.52) saturate(1.35) contrast(1.2);
    }
  }

  .art_glow {
    position: absolute;
    top: 15%;
    right: 2%;
    width: 75%;
    aspect-ratio: 1;
    border-radius: 50%;
    background: rgb(255 255 255 / 42%);
    filter: blur(55px);
  }

  .scroll_hint {
    display: none;
  }

  .downloads_section {
    width: 680px;
    margin-top: 0;
    scroll-margin-top: 20px;
    h2 {
      margin: 5px 0 26px;
      font-size: 22px;
      font-weight: 400;
      line-height: 1.05;
      letter-spacing: -0.035em;
      white-space: nowrap;
    }
  }

  .platform_grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }

  .platform_card {
    position: relative;
    overflow: hidden;
    height: 126px;
    border: 1px solid rgb(22 61 51 / 36%);
    background: @mint_card;
    > img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0.58;
      mix-blend-mode: multiply;
      filter: brightness(0.72) saturate(0.65) contrast(1.15);
      transition: opacity 350ms ease, transform 600ms cubic-bezier(0.2, 0.7, 0.2, 1);
    }
    &:hover > img { opacity: 0.76; transform: scale(1.035); }
  }

  .platform_overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 10px 8px;
    text-align: center;
    > p { margin-bottom: 3px; font-size: 9px; }
    h3 { margin-bottom: 8px; font-size: 27px; font-weight: 400; line-height: 1; }
  }

  .platform_button { min-height: 30px; padding-inline: 10px; font-size: 8px; }
  .platform_icon { margin-right: 6px; font-family: Arial, sans-serif; font-size: 1.25em; }

  .download_toast {
    position: fixed;
    z-index: 30;
    right: 28px;
    bottom: 28px;
    padding: 14px 20px;
    border: 1px solid @green_ink;
    color: @green_ink;
    background: @mint_pale;
    font-family: "Courier New", monospace;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.08em;
  }

  .toast-enter-active,
  .toast-leave-active { transition: opacity 180ms ease, transform 180ms ease; }
  .toast-enter-from,
  .toast-leave-to { opacity: 0; transform: translateY(8px); }

  @keyframes art_float {
    0%, 100% { transform: translateY(0) rotate(-0.3deg); }
    50% { transform: translateY(-11px) rotate(0.3deg); }
  }

  @keyframes hint_bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(5px); }
  }

</style>
