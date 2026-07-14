<script setup>
import { computed, onBeforeUnmount, reactive, ref } from 'vue';
import { auth } from '../stores/auth.js';
import { useRouter } from 'vue-router';

const router = useRouter();
const live = ref();
const preview = ref();
const audio = ref(true);

const s = reactive({
  stream: null,
  audioStream: null,
  recorder: null,
  blob: null,
  recording: false,
  error: '',
});

const title = ref('');
const description = ref('');
const saving = ref(false);

const canRecord = computed(() => !!s.stream && !s.recording);

async function capture(kind) {
  cleanup();
  try {
    const stream =
      kind === 'screen'
        ? await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: audio.value,
          })
        : await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: audio.value,
          });

    s.stream = stream;
    live.value.srcObject = stream;
    stream.getVideoTracks()[0].addEventListener('ended', stop);
  } catch (e) {
    s.error = e.message;
  }
}

function start() {
  const type = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
    ? 'video/webm;codecs=vp9,opus'
    : 'video/webm';
  const chunks = [];

  s.recorder = new MediaRecorder(s.stream, { mimeType: type });
  s.recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  s.recorder.onstop = () => {
    s.blob = new Blob(chunks, { type });
    preview.value.src = URL.createObjectURL(s.blob);
    title.value = `Recording ${new Date().toLocaleString()}`;
  };
  s.recorder.start(500);
  s.recording = true;
}

function stop() {
  if (s.recorder && s.recorder.state !== 'inactive') s.recorder.stop();
  s.recording = false;
  s.stream?.getTracks().forEach((t) => t.stop());
  s.audioStream?.getTracks().forEach((t) => t.stop());
  s.stream = null;
}

function cleanup() {
  s.stream?.getTracks().forEach((t) => t.stop());
  s.audioStream?.getTracks().forEach((t) => t.stop());
}

async function save() {
  saving.value = true;
  const f = new FormData();
  f.append('video', s.blob, 'recording.webm');
  f.append('title', title.value);
  f.append('description', description.value);

  try {
    const data = await auth.request('/api/videos', { method: 'POST', body: f });
    router.push(`/videos/${data.video.id}`);
  } catch (e) {
    s.error = e.message;
  } finally {
    saving.value = false;
  }
}

onBeforeUnmount(cleanup);
</script>

<template>
  <section>
    <div class="title-row">
      <div>
        <span class="eyebrow">Recorder</span>
        <h1>Capture a video</h1>
      </div>
    </div>

    <div class="card capture">
      <template v-if="!s.blob">
        <video
          ref="live"
          autoplay
          muted
          playsinline
        />

        <div
          v-if="!s.stream"
          class="capture-actions"
        >
          <button
            class="button"
            @click="capture('screen')"
          >
            Share screen
          </button>
          <button
            class="button secondary"
            @click="capture('camera')"
          >
            Use webcam
          </button>
          <label class="check">
            <input
              v-model="audio"
              type="checkbox"
            />
            Include audio
          </label>
        </div>

        <div
          v-else
          class="capture-actions"
        >
          <button
            v-if="canRecord"
            class="button danger"
            @click="start"
          >
            Start recording
          </button>
          <button
            v-else
            class="button danger"
            @click="stop"
          >
            Stop recording
          </button>
        </div>
      </template>

      <form
        v-else
        @submit.prevent="save"
      >
        <video
          ref="preview"
          controls
        />
        <label>
          Title
          <input
            v-model="title"
            required
            maxlength="160"
          />
        </label>
        <label>
          Description
          <textarea
            v-model="description"
            rows="4"
            maxlength="2000"
          />
        </label>
        <button
          class="button"
          :disabled="saving"
        >
          {{ saving ? 'Saving…' : 'Save video' }}
        </button>
      </form>

      <p
        v-if="s.error"
        class="error"
      >
        {{ s.error }}
      </p>
    </div>
  </section>
</template>
