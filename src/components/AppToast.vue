<script setup lang="ts">
import type { ToastProps, ToastType } from "@/types/toast";
import { getCurrentInstance, onMounted, Ref, ref } from "vue";



const timer = ref<number | undefined>(undefined)
const countdown = ref(0)
const { default_timeout = 5000, position = "bottom_center", interval = 10 } = defineProps<ToastProps>()
const list = ref<ToastType[]>([])
const isDynamic = ref(false)
const progress = ref(true)
const dynamicText = ref()

onMounted(() => {
  timer.value = window.setInterval(update, interval)
  window.app.toast = {
    add,
    dynamic,
    endDynamic
  }
  const instance = getCurrentInstance()
  if (instance) instance.appContext.config.globalProperties.$toast = window.app.toast;

})

function add(text: string, timeout: number = default_timeout) {
  list.value.push({ text, timeout, })
  if (timer.value == undefined) timer.value = window.setInterval(update, interval)
}

function dynamic(text: Ref<string>) {
  dynamicText.value = text
  isDynamic.value = true

}

function endDynamic() {
  isDynamic.value = false
  dynamicText.value = null
}

function update() {
  if (list.value.length === 0) {
    clearInterval(timer.value)
    timer.value = undefined
  } else {
    if (countdown.value >= list.value[0].timeout) {
      list.value.shift()
      countdown.value = 0
    } else {
      countdown.value += interval
    }
  }
}

</script>

<template>
  <div class="toast" :class="[position]" v-if="list.length">
    <div class="toast_text"> {{ list[0].text }} </div>
    <progress :max="list[0].timeout" :value="countdown"></progress>
  </div>
  <div class="toast" :class="[position]" v-if="isDynamic">
    <div class="toast_text"> {{ dynamicText }} </div>
  </div>
</template>

<style scoped>
progress {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 5px;
  border-radius: 0;
  background-color: inherit;
  border-width: 0;
  position: inherit;
  bottom: 0;
}

progress::-moz-progress-bar {
  background-color: #203e68;

}

.toast_text {
  text-align: center;
  padding: 0.5em;
  min-width: 200px;
}

.toast {
  position: absolute;
  background-color: gray;
  z-index: 200;
  margin: 1em;
  /*margin-bottom: 20px;*/
}

.bottom_center {
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
}


.bottom_left {
  bottom: 0;
  left: 0;
}

.bottom_right {
  bottom: 0;
  right: 0;
}

.center_left {
  top: 50%;
  left: 0;
  transform: translateY(-50%);
}

.center_center {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.center_right {
  top: 50%;
  right: 0;
  transform: translateY(-50%);
}

.top_left {
  top: 0;
  left: 0;
}

.top_center {
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}

.top_right {
  top: 0;
  right: 0;
}
</style>
