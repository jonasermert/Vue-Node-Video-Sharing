<script setup>
import AuthForm from '../components/AuthForm.vue';
import { auth } from '../stores/auth.js';
import { useRouter } from 'vue-router';
const r = useRouter();
async function submit(v) {
  await auth.login(v);
  r.push('/videos');
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
