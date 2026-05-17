<script setup lang="ts">
import type { DialogMode } from "@/types/dialog";
import { getCurrentInstance, onMounted, ref, shallowRef, type Component } from "vue";

const dialog = ref<HTMLDialogElement>();
const isLocked = ref(false);
const confirmPromise = ref<((value: boolean) => void)>();
const confirmText = ref('Are you sure?');
const mode = ref<DialogMode>(null);
const promptText = ref('');
const customComponent = shallowRef<Component | null>(null)
const customProps = ref({})
const customModel = ref({})
const emit = defineEmits<{
  (e: 'open'): void
  (e: 'close'): void
}>()


onMounted(() => {
  //console.log(dialog.value);
  window.app.dialog = {
    confirm,
    open,
    custom,
    prompt,
    close
  }
  const instance = getCurrentInstance()
  if (instance) instance.appContext.config.globalProperties.$dialog = window.app.dialog;



})

function custom(component: Component, model: any = null, props: any = null,) {
  mode.value = 'custom'
  open();
  if (component) customComponent.value = component;
  if (props) customProps.value = props;
  if (model) customModel.value = model;
}


function open() {
  if (!dialog.value) return;
  dialog.value.showModal()
  emit('open')
}

function close(event: Event | null = null) {
  if (isLocked.value || !dialog.value) return;
  if (event) {
    if ((event.target as HTMLDialogElement).nodeName == dialog.value.nodeName) {
      dialog.value.close();
      event.stopPropagation();
      if (mode.value == 'confirm' && confirmPromise.value) confirmPromise.value(false);

      emit('close')
    }
  } else {
    dialog.value.close();
    emit('close')
  }
}

function confirm(text: string = 'Are you sure?'): Promise<boolean> {
  confirmText.value = text;
  mode.value = 'confirm'
  open();
  return new Promise((resolve) => { confirmPromise.value = resolve });
}

function prompt(text: string = 'Enter value:') {
  promptText.value = text;
  mode.value = 'prompt'
  open();

}

</script>

<template>
  <dialog ref="dialog" @mousedown="close">

    <div v-if="mode == 'custom'">
      <!--<slot name="default">Dialog Content</slot>-->
      <component :is="customComponent" v-bind="customProps" v-model="customModel"></component>
    </div>
    <div v-if="mode == 'prompt'">
      {{ promptText }}
    </div>


    <div v-if="mode == 'confirm' && confirmPromise" class="confirm">
      {{ confirmText }}<br />
      <button @click="confirmPromise(true); close()" style="float: right;">Yes</button>
      <button @click="confirmPromise(false); close()" style="float: left;">No</button>
    </div>


  </dialog>
</template>

<style scoped>
dialog {
  padding: 0;
  min-width: 400px;
  background: rgba(51, 51, 51, 0.95);
  color: #fff;
  border-width: 1px;
  border-color: #525252;
  text-align: center;
}

dialog:focus-visible {
  outline: 0px solid crimson;
  border-radius: 0px;
}

.confirm {
  padding: 10px;
}
</style>
