<script setup lang="ts">
import { ref } from 'vue';



const testValue = ref('none')

function test(text: string) {
	testValue.value = text
}

defineExpose({
	test
});
</script>

<template>
	{{ testValue }}
</template>


<style scoped></style>