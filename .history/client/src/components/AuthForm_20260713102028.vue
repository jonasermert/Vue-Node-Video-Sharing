<script setup>
import { reactive, ref } from 'vue';

defineProps({ mode: String });
const emit = defineEmits(['submit']);

const form = reactive({ name: '', email: '', password: '' });
const error = ref('');

async function go() {
  error.value = '';
  try {
    await emit('submit', { ...form });
  } catch (e) {
    error.value = e.message;
  }
}
</script>

<template>
  <form
    class="card form"
    @submit.prevent="go"
  >
    <h1>{{ mode === 'login' ? 'Welcome back' : 'Create account' }}</h1>

    <label v-if="mode !== 'login'">
      Name
      <input
        v-model="form.name"
        required
        minlength="2"
      />
    </label>

    <label>
      Email
      <input
        v-model="form.email"
        required
        type="email"
      />
    </label>

    <label>
      Password
      <input
        v-model="form.password"
        required
        type="password"
        minlength="8"
      />
    </label>

    <p
      v-if="error"
      class="error"
    >
      {{ error }}
    </p>

    <button class="button">
      {{ mode === 'login' ? 'Login' : 'Register' }}
    </button>
  </form>
</template>
