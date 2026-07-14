<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
const route = useRoute(),
  video = ref(),
  error = ref('');
onMounted(async () => {
  const r = await fetch(`/api/public/videos/${route.params.id}`);
  if (r.ok) video.value = (await r.json()).video;
  else error.value = 'Video not found';
});
</script>
<template>
  <div
    class="public card"
    v-if="video"
  >
    <video
      :src="video.videoUrl"
      controls
      autoplay
    ></video>
    <h1>{{ video.title }}</h1>
    <p>{{ video.description }}</p>
  </div>
  <p
    class="error center"
    v-else
  >
    {{ error || 'Loading…' }}
  </p>
</template>
