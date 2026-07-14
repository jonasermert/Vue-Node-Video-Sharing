<script setup>
import { auth } from './stores/auth.js';
import { useRouter } from 'vue-router';

const router = useRouter();

async function logout() {
  await auth.logout();
  router.push('/');
}
</script>

<template>
  <div class="app">
    <header>
      <router-link
        class="brand"
        to="/"
        >ClipShare</router-link
      >
      <nav>
        <template v-if="auth.state.user">
          <router-link to="/videos">My videos</router-link>
          <router-link to="/videos/create">Capture</router-link>
          <button
            class="link"
            @click="logout"
          >
            Logout
          </button>
        </template>
        <template v-else>
          <router-link to="/login">Login</router-link>
          <router-link
            class="button small"
            to="/register"
            >Register</router-link
          >
        </template>
      </nav>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>
