<template>
  <section class="hero">
    <div>
      <span class="eyebrow"></span>
      <h1>Record. Share. Done.</h1>
      <p>
        Capture your screen or webcam directly in the browser, save recordings privately and share
        them with one simple link.
      </p>
      <div class="actions">
        <router-link
          class="button"
          to="/videos/create"
          >Start recording</router-link
        ><router-link
          class="button secondary"
          to="/register"
          >Create account</router-link
        >
      </div>
    </div>
    <div class="preview">
      <div class="camera">● REC</div>
      <div class="screen">
        <div class="play">▶</div>
      </div>
    </div>
  </section>
</template>
