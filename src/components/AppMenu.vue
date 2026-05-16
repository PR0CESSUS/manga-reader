<script setup lang="ts">
//@ts-nocheck
import { onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";

const routes = useRouter().getRoutes()
const isHidden = ref(true)
const sidebar = ref<HTMLDivElement>()
const timeout = ref<number | undefined>(undefined)


const handleMouseMove = (e: MouseEvent) => {
	//const sidebar = document.querySelector('.sidebar')
	if (sidebar.value == null) return

	if (e.clientX > 60 && isHidden.value && timeout.value) {
		clearTimeout(timeout.value)
		timeout.value = undefined
	}

	if (e.clientX < 60 && isHidden.value && !timeout.value) {           // myszka w odległości 60px od lewej
		//clearTimeout(timeout.value)
		timeout.value = setTimeout((yyy: HTMLDivElement) => {
			yyy.style.transform = 'translateX(0)';
			isHidden.value = false
		}, 1000, sidebar.value)
		//sidebar.value.style.transform = 'translateX(0)'
		//isHidden.value = false
	} else if (e.clientX > sidebar.value.clientWidth && !isHidden.value) {
		timeout.value = setTimeout((yyy: HTMLDivElement) => {
			yyy.style.transform = 'translateX(-100%)';
			isHidden.value = true
		}, 300, sidebar.value)
	}
}

onMounted(() => {
	document.addEventListener('mousemove', handleMouseMove)
})

onUnmounted(() => {
	document.removeEventListener('mousemove', handleMouseMove)
})


</script>

<template>

	<nav class="sidebar" ref="sidebar">
		<ul>
			<li v-for="route in routes">
				<RouterLink :to="route.path" :title="route.meta.name">{{ route.meta.name }}</RouterLink>
			</li>


		</ul>
	</nav>

</template>

<style scoped>
.router-link-active {
	color: burlywood;
}

.sidebar {
	position: fixed;
	top: 0;
	left: 0;
	height: 100vh;
	width: 280px;
	background: #1f2937;
	transform: translateX(-100%);
	transition: transform 0.4s cubic-bezier(0.32, 0.72, 0, 1);
	box-shadow: 4px 0 20px rgba(0, 0, 0, 0.35);
	z-index: 100;
}


/* Style the navigation menu */
nav {
	background: #353535;
	padding: 0px 37px 0px 5px;
	color: #7a7a7a;
	width: 100%;
	max-width: fit-content;
	border-right-width: 1px;
	border-right-color: #464646;
	border-right-style: solid;
}

nav ul {
	list-style-type: none;
	padding: 0;
}


a {
	text-decoration: none;
	color: rgb(133, 133, 133);
}

a:hover {
	color: #fff;
}
</style>
