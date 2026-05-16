<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppInput from './AppInput.vue';
import { ScraperManager } from '@/ScraperManager';


const model = defineModel<string>({ required: true })
const element = ref()

function addNewManga() {
	ScraperManager.parse(model.value)
	app.dialog.close()
}

onMounted(() => {
	element.value.element.focus({ focusVisible: true })
})
</script>

<template>
	<div class="wrapper">
		<h3>Add URL</h3>
		<AppInput v-model="model" type="string" ref="element" />

		<button @click="addNewManga()">Add</button>
	</div>

</template>

<style scoped>
.wrapper {
	padding: 10px;
}
</style>