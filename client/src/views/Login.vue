<script setup>
import AuthForm from '../components/AuthForm.vue';
import { auth } from '../stores/auth.js';
import { useRouter } from 'vue-router';

const router = useRouter();

async function submit(values) {
  await auth.login(values);
  router.push('/videos');
}
</script>

<template>
  <div class="center">
    <AuthForm
      mode="login"
      @submit="submit"
    />
  </div>
</template>
