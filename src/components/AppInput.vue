<script setup lang="ts">
import type { AppInputType } from '@/types/input';
import { ref, unref } from 'vue';

const { type = 'string', size = 10, min, max = 999999999999999, placeholder, precision = 3 } = defineProps<AppInputType>()
//type: "text" | "number" | "integer" | "float" | "checkbox" | "textarea"
//min?: number
//max?: number
//size?: number | string
//placeholder?: any
const isInvalid = ref(false)
const inputElement = ref<HTMLInputElement | null>(null)
const autoSize = ref(10)




const [model, modifiers] = defineModel<any>({
	required: true,
	set(value: string) {
		//console.log('model set with value:', value, 'and modifiers:', modifiers, 'for type:', props.type);
		if (value === '') return undefined
		switch (type) {
			case 'integer':
				isInvalid.value = value.match(/^(?!^[+-]?\d+$).*/)?.length ? true : false
				if (isInvalid.value) return model.value ? model.value : undefined
				return Math.max(min ?? -Infinity, Math.min(max ?? Infinity, parseInt(value)))
			case 'float':
				isInvalid.value = value.match(/^(?!^[+-]?(?:\d+\.?\d*|\.\d+)$).*/)?.length ? true : false
				if (isInvalid.value) return model.value ? model.value : undefined
				return Math.max(min ?? -Infinity, Math.min(max ?? Infinity, parseFloat(value)))
			default:
				return value
		}
	},

	get(v) {
		//console.log('getter', v);
		if (typeof v == 'number') {
			if (type == 'float') {
				autoSize.value = Math.max(precision, v.toString().length)
				console.log(Math.max(precision, v.toString().length));

				return v.toPrecision(precision)
			} else {
				autoSize.value = Math.max(10, v.toString().length)
			}
		} else if (typeof v == 'string' && type == 'string') {
			autoSize.value = Math.max(10, v.length)
		}

		return v
	}
})

defineExpose({
	element: inputElement
})

</script>

<template>
	<input v-if="type == 'string'" type="text" ref="inputElement" v-model="model" :size="autoSize" />
	<input v-if="type == 'boolean'" type="checkbox" v-model="model" />
	<input v-if="type == 'integer' || type == 'float'" ref="inputElement" type="text" v-model="model" :size="autoSize"
		:class="{ invalid: isInvalid }" @focusout="isInvalid = false" :placeholder="placeholder" />

	<!--<input v-if="type == 'float'" ref="inputElement" type="text" v-model.lazy="model" :size="size"
		:class="{ invalid: isInvalid }" @focusout="isInvalid = false" @input="validateInput"
		:placeholder="placeholder" />-->

	<!--<textarea v-if="type == 'textarea'" v-model="model" :rows="4" :cols="40"></textarea>-->

</template>


<style scoped>
.invalid {
	border: 2px solid red;
}
</style>