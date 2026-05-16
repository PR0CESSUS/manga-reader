<script setup lang="ts">
import { onUnmounted } from 'vue'
import AppInput from './AppInput.vue';
import { Manga } from '@/Manga';

const model = defineModel<Manga>({ required: true })

onUnmounted(() => {
	model.value.save()
})
</script>

<template>
	<div class="wrapper">
		<h3>Edit</h3>

		Last Read:
		<AppInput v-model="model.lastRead" type="integer" placeholder="0" />


	</div>

</template>

<style scoped>
.wrapper {
	padding: 10px;
}
</style>