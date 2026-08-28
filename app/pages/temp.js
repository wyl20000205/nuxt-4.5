(function() {
  const API_URL = 'https://www.eng-link-ai.com/api/user/register?turnstile=';  // ⚠️ 替换成真实地址
  const TOTAL = 10;                           // 注册次数
  const DELAY = 1000;                         // 间隔毫秒
  const PASSWORD = 'Mm123456789@';

  function randomUsername() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let r = '';
    for (let i = 0; i < 8 + Math.floor(Math.random() * 5); i++) r += chars[Math.floor(Math.random() * chars.length)];
    return r;
  }

  function buildPayload(username) {
    return { username, password: PASSWORD, password2: PASSWORD, email: '', verification_code: '', wechat_verification_code: '', aff_code: null };
  }

  function register(username) {
    return $.ajax({ url: API_URL, method: 'POST', contentType: 'application/json', data: JSON.stringify(buildPayload(username)), dataType: 'json' });
  }

  async function batchRegister() {
    console.log(`🚀 开始批量注册 ${TOTAL} 个账号...`);
    for (let i = 1; i <= TOTAL; i++) {
      const username = randomUsername();
      console.log(`[${i}/${TOTAL}] 正在注册: ${username}`);
      try {
        const res = await register(username);
        console.log(`✅ ${username} 注册成功`, res);
      } catch (e) {
        console.error(`❌ ${username} 注册失败`, e.responseText || e.message);
      }
      if (i < TOTAL) await new Promise(r => setTimeout(r, DELAY));
    }
    console.log('📊 全部完成');
  }

  if (typeof jQuery === 'undefined') {
    console.log('⏳ 加载 jQuery...');
    const s = document.createElement('script');
    s.src = 'https://code.jquery.com/jquery-3.7.1.min.js';
    s.onload = () => { console.log('✅ jQuery 已加载'); batchRegister(); };
    s.onerror = () => console.error('❌ jQuery 加载失败');
    document.head.appendChild(s);
  } else {
    batchRegister();
  }
})();