<script setup lang="ts">
import {ref} from "vue";

// A screenshot that opens full size over the page on click: a native <dialog>, so Esc and the
// focus work as for any modal. The full-size file loads only when it's opened.
const props = defineProps<{
  src: string,
  srcset: string,
  sizes: string,
  alt: string,
  /** The image's own size, for the box before it loads. */
  width: number,
  height: number,
  /** The file shown when zoomed, the largest one. */
  zoomSrc: string,
  /** The open button's label, for screen readers. */
  zoomLabel: string,
  closeLabel: string,
}>()

const dialog = ref<HTMLDialogElement>()
const opened = ref(false)

const open = () => {
  opened.value = true
  dialog.value?.showModal()
}
const close = () => dialog.value?.close()
</script>

<template>
  <button class="zoom" type="button" :aria-label="props.zoomLabel" @click="open">
    <img
        :src="props.src"
        :srcset="props.srcset"
        :sizes="props.sizes"
        :alt="props.alt"
        :width="props.width"
        :height="props.height"
        loading="lazy" />
    <span class="zoom-hint" aria-hidden="true">
      <svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21M10.5 7.5v6M7.5 10.5h6"/></svg>
    </span>
  </button>
  <dialog ref="dialog" class="zoom-dialog" :aria-label="props.alt" @click="close">
    <img v-if="opened" :src="props.zoomSrc" :alt="props.alt" :width="props.width" :height="props.height" />
    <button class="zoom-close" type="button" :aria-label="props.closeLabel" @click.stop="close">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
    </button>
  </dialog>
</template>

<style scoped>
.zoom{display:block;position:relative;width:100%;padding:0;border:0;background:none;cursor:zoom-in}
/* height:auto keeps the aspect ratio when the width shrinks below the width attribute. */
.zoom img{display:block;width:100%;height:auto}
.zoom:focus-visible{outline:2px solid var(--color-accent);outline-offset:3px}
.zoom-hint{
  position:absolute;right:12px;bottom:12px;width:40px;height:40px;border-radius:12px;
  display:flex;align-items:center;justify-content:center;
  background:rgb(17 24 39 / 70%);color:#fff;opacity:.85;transition:opacity .15s ease,transform .15s ease;
}
.zoom:hover .zoom-hint,.zoom:focus-visible .zoom-hint{opacity:1;transform:scale(1.06)}
.zoom-hint svg,.zoom-close svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}

.zoom-dialog{
  max-width:100vw;max-height:100vh;width:100vw;height:100vh;margin:0;padding:24px;border:0;
  background:transparent;display:none;align-items:center;justify-content:center;cursor:zoom-out;
}
.zoom-dialog[open]{display:flex}
.zoom-dialog::backdrop{background:rgb(10 12 16 / 85%)}
.zoom-dialog img{max-width:100%;max-height:100%;width:auto;height:auto;border-radius:14px;box-shadow:0 20px 60px rgb(0 0 0 / 45%)}
.zoom-close{
  position:fixed;top:16px;right:16px;width:44px;height:44px;border-radius:50%;border:0;cursor:pointer;
  display:flex;align-items:center;justify-content:center;background:rgb(255 255 255 / 14%);color:#fff;
}
.zoom-close:hover,.zoom-close:focus-visible{background:rgb(255 255 255 / 26%)}
</style>
