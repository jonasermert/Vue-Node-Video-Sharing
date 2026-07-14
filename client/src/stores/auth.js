import { reactive } from 'vue';

const state = reactive({ user: null, ready: false });

async function request(url, options = {}) {
  const r = await fetch(url, {
    credentials: 'include',
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
    ...options,
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    throw Object.assign(new Error(data.message || 'Request failed'), {
      errors: data.errors || {},
    });
  }
  return data;
}

export const auth = {
  state,
  request,
  async load() {
    try {
      state.user = (await request('/api/auth/me')).user;
    } catch {
      state.user = null;
    } finally {
      state.ready = true;
    }
  },
  async login(payload) {
    state.user = (
      await request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    ).user;
  },
  async register(payload) {
    state.user = (
      await request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    ).user;
  },
  async logout() {
    await request('/api/auth/logout', { method: 'POST' });
    state.user = null;
  },
};
