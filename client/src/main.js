import { createApp } from 'vue';
import App from './App.vue';
import router from './router.js';
import './tailwind.css';
import './theme-overrides.css';

createApp(App).use(router).mount('#app');
