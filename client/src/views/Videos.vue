<script setup>
import { onMounted, ref } from 'vue';
import { auth } from '../stores/auth.js';

const videos = ref([]);
const loading = ref(true);

onMounted(async () => {
  videos.value = (await auth.request('/api/videos')).videos;
  loading.value = false;
});
</script>

<template>
  <section>
    <div class="title-row">
      <div>
        <span class="eyebrow">Library</span>
        <h1>My videos</h1>
      </div>
      <router-link
        class="button"
        to="/videos/create"
        >New recording</router-link
      >
    </div>

    <p v-if="loading">Loading…</p>

    <div
      v-else-if="videos.length"
      class="grid"
    >
      <router-link
        v-for="video in videos"
        :key="video.id"
        :to="`/videos/${video.id}`"
        class="video-card"
      >
        <video
          :src="video.videoUrl"
          preload="metadata"
        />
        <div>
          <h2>{{ video.title }}</h2>
          <p>{{ video.description || 'No description' }}</p>
          <small>{{ new Date(video.createdAt).toLocaleString() }}</small>
        </div>
      </router-link>
    </div>

    <div
      v-else
      class="empty"
    >
      No recordings yet. Capture your first video.
    </div>
  </section>
</template>
