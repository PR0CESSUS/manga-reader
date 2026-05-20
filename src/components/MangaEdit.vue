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


		<ul>
			<li> Title:
				<AppInput v-model="model.title" type="string" />
			</li>
			<li> Last Read:
				<AppInput v-model="model.lastRead" type="integer" placeholder="0" />
			</li>
			<li>Status:
				<select v-model="model.status">
					<option value="ready">ready</option>
					<option value="update">update</option>
					<option value="error">error</option>
				</select>
			</li>
			<li>
				Current link:
				<AppInput v-model="model.current" type="string" />
			</li>
			<li>
				Next link:
				<AppInput v-model="model.next" type="string" />
			</li>

			<li><button @click="model.save()">Save</button></li>
		</ul>



	</div>

</template>

<style scoped>
.wrapper {
	padding: 10px;
	text-align: left;
}
</style>