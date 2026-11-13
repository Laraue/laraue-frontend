<script setup lang="ts">
import {nextTick, ref} from "vue";

// A YouTube video that costs nothing until it's played: a local poster loads with the page, and
// YouTube's player (youtube-nocookie, no cookies until playback) is requested only after a click.
// The same approach as the Laraue Boards landing.
const props = defineProps<{
  videoId: string,
  /** The player's title, for screen readers. */
  title: string,
  /** The play button's label, for screen readers. */
  playLabel: string,
  /** The poster at 640, 960 and 1280 pixels wide, 16:9. */
  posters: { 640: string, 960: string, 1280: string },
  /** The poster's width on the page, as an img `sizes` attribute. */
  sizes: string,
}>()

const playing = ref(false)
const player = ref<HTMLIFrameElement>()

const play = async () => {
  playing.value = true
  await nextTick()
  player.value?.focus()
}
</script>

<template>
  <iframe
      v-if="playing"
      ref="player"
      class="video"
      allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
      allowfullscreen
      :src="`https://www.youtube-nocookie.com/embed/${props.videoId}?autoplay=1&rel=0`"
      :title="props.title"></iframe>
  <button v-else class="video" type="button" :aria-label="props.playLabel" @click="play">
    <img
        alt=""
        fetchpriority="high"
        width="1280"
        height="720"
        :sizes="props.sizes"
        :src="props.posters[640]"
        :srcset="`${props.posters[640]} 640w, ${props.posters[960]} 960w, ${props.posters[1280]} 1280w`" />
    <span class="video-play">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.53.85l10.4-6.5a1 1 0 0 0 0-1.7L9.53 4.65A1 1 0 0 0 8 5.5Z" fill="currentColor"/></svg>
    </span>
  </button>
</template>

<style scoped>
/* The poster and, once pressed, the player take the same 16:9 box. */
.video{
  aspect-ratio:16/9;width:100%;display:block;position:relative;overflow:hidden;padding:0;
  background:var(--color-workspace);border:1px solid var(--color-border);border-radius:var(--radius-card);
  box-shadow:var(--shadow-popover);
}
button.video{cursor:pointer}
button.video:focus-visible{outline:2px solid var(--color-accent);outline-offset:2px}
.video img{display:block;width:100%;height:100%;object-fit:cover}
.video-play{
  position:absolute;inset:0;margin:auto;width:76px;height:54px;border-radius:14px;
  display:flex;align-items:center;justify-content:center;
  background:var(--color-accent);color:#fff;transition:background .12s ease,transform .12s ease;
}
button.video:hover .video-play,button.video:focus-visible .video-play{background:var(--accent-mid);transform:scale(1.05)}
.video-play svg{width:30px;height:30px}
</style>
