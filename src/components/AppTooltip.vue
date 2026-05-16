<script setup lang="ts">
import { ref } from "vue";
const isVisible = ref(false);
const content = ref<HTMLDivElement>();

const mouseMove = (event) => {
  if (content.value.textContent == "") return;
  // const rect = event.target.getBoundingClientRect() as DOMRect;
  const rect = content.value.getBoundingClientRect() as DOMRect;
  const ySpaceAvailable = window.innerHeight - 20 - event.clientY;
  content.value.style.left = `${event.clientX + 20}px`;
  // console.log(rect, ySpaceAvailable);
  // console.log(content.value.getBoundingClientRect());

  if (rect.height > ySpaceAvailable) {
    content.value.style.top = `${event.clientY - (rect.height - ySpaceAvailable)}px`;
  } else {
    content.value.style.top = `${event.clientY}px`;
  }
};
</script>

<template>
  <div>
    <div class="trigger" @mouseenter="isVisible = true" @mousemove="mouseMove($event)" @mouseleave="isVisible = false">
      <slot name="trigger"></slot>
    </div>

    <div class="tooltip" v-show="isVisible && content.textContent != ''" ref="content">
      <slot name="content"></slot>
    </div>
  </div>
</template>

<style scoped>
.tooltip {
  font-family: "NotoSansBlack";
  font-size: 12px;
  position: absolute;
  max-width: 700px;
  overflow: hidden;
  color: #fff;
  border-radius: 0px;
  border-style: solid;
  border-width: 1px;
  border-color: black;
  padding: 10px;
  background: rgba(51, 51, 51, 0.95);
  z-index: 1;
}
.trigger {
  display: inline;
}
</style>
