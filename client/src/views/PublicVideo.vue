<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const video = ref();
const error = ref('');

onMounted(async () => {
  const response = await fetch(`/api/public/videos/${route.params.id}`);
  if (response.ok) {
    video.value = (await response.json()).video;
  } else {
    error.value = 'Video not found';
  }
});
</script>

<template>
  <div
    v-if="video"
    class="public card"
  >
    <video
      :src="video.videoUrl"
      controls
      autoplay
    />
    <h1>{{ video.title }}</h1>
    <p>{{ video.description }}</p>
  </div>
  <p
    v-else
    class="error center"
  >
    {{ error || 'Loading…' }}
  </p>
</template>
