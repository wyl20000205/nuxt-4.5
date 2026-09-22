const base = 'https://eng-link-ai.com';
const login = await fetch(`${base}/api/user/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: process.env.ENGLINK_USER, password: process.env.ENGLINK_PASSWORD }),
});
const cookie = login.headers.get('set-cookie')?.split(';')[0];
if (!login.ok || !cookie) throw new Error('Login failed');
const headers = { Cookie: cookie, 'New-Api-User': '112' };

for (const path of [
  '/api/token/?p=0&size=100',
  '/api/asset/verify/create',
  '/api/asset/verify/session',
  '/api/asset/verify/create-session',
  '/api/asset/verify',
]) {
  const response = await fetch(base + path, { headers });
  const text = await response.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  if (path.startsWith('/api/token/') && body?.data) {
    const items = Array.isArray(body.data) ? body.data : body.data.items || body.data.data || [];
    body = { ...body, data: items.map(item => ({ id: item.id, name: item.name, status: item.status })) };
  }
  console.log(JSON.stringify({ path, status: response.status, body }, null, 2));
}
