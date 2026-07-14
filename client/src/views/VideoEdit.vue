<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { auth } from '../stores/auth.js';

const route = useRoute();
const router = useRouter();
const video = ref();
const message = ref('');

onMounted(async () => {
  video.value = (await auth.request(`/api/videos/${route.params.id}`)).video;
});

async function save() {
  video.value = (
    await auth.request(`/api/videos/${route.params.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        title: video.value.title,
        description: video.value.description,
      }),
    })
  ).video;
  message.value = 'Saved';
}

async function remove() {
  if (!confirm('Delete this video permanently?')) return;
  await auth.request(`/api/videos/${route.params.id}`, { method: 'DELETE' });
  router.push('/videos');
}

async function copy() {
  await navigator.clipboard.writeText(video.value.shareUrl);
  message.value = 'Link copied';
}
</script>

<template>
  <section v-if="video">
    <div class="title-row">
      <h1>Edit video</h1>
      <button
        class="button danger"
        @click="remove"
      >
        Delete
      </button>
    </div>

    <div class="card form wide">
      <video
        :src="video.videoUrl"
        controls
      />

      <label>
        Share link
        <div class="inline">
          <input
            :value="video.shareUrl"
            readonly
          />
          <button
            type="button"
            class="button small"
            @click="copy"
          >
            Copy
          </button>
        </div>
      </label>

      <label>
        Title
        <input v-model="video.title" />
      </label>

      <label>
        Description
        <textarea
          v-model="video.description"
          rows="4"
        />
      </label>

      <button
        class="button"
        @click="save"
      >
        Save changes
      </button>
      <p class="success">{{ message }}</p>
    </div>
  </section>
</template>
