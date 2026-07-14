import { createRouter, createWebHistory } from 'vue-router';
import { auth } from './stores/auth.js';
import Home from './views/Home.vue';
import Login from './views/Login.vue';
import Register from './views/Register.vue';
import Videos from './views/Videos.vue';
import Capture from './views/Capture.vue';
import VideoEdit from './views/VideoEdit.vue';
import PublicVideo from './views/PublicVideo.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/login', component: Login, meta: { guest: true } },
    { path: '/register', component: Register, meta: { guest: true } },
    { path: '/videos', component: Videos, meta: { auth: true } },
    { path: '/videos/create', component: Capture, meta: { auth: true } },
    { path: '/videos/:id', component: VideoEdit, meta: { auth: true } },
    { path: '/view/:id', component: PublicVideo },
  ],
});

router.beforeEach(async (to) => {
  if (!auth.state.ready) await auth.load();
  if (to.meta.auth && !auth.state.user) return '/login';
  if (to.meta.guest && auth.state.user) return '/videos';
});

export default router;
