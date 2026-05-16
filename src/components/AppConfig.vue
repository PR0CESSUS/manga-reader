<script setup lang="ts">

import { getCurrentInstance, onUnmounted } from 'vue';
import AppInput from './AppInput.vue';

const instance = getCurrentInstance()
console.log(instance);

const model = window.app.config.value



</script>

<template>
	<div class="config">
		<div class="header">Settings</div>
		<div class="wrapper">
			<ul>
				<li>
					Update Intreval:
					<AppInput v-model="model.updateInterval" type="integer" />
				</li>
				<li>
					Show Titles:
					<AppInput v-model="model.showTitle" type="boolean" />
				</li>
				<li>
					View size:
					<select v-model="model.viewSize">
						<option value="small">Small</option>
						<option value="normal">Normal</option>
						<option value="big">Big</option>
					</select>

				</li>
			</ul>

		</div>

	</div>


</template>

<style scoped>
.config {
	width: 60vw;

}

.wrapper {
	padding: 0 10px;
	text-align: left;
}

.header {
	background-color: rgb(90, 90, 90);
	text-align: center;
	font-size: large;
	margin-bottom: 10px;
}
</style>