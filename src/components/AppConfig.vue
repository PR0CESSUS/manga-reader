<script setup lang="ts">
import { importBookmarks } from '@/importBookmarks';
import AppInput from './AppInput.vue';
import { MangaManager } from '@/MangaManager';
import { ScraperManager } from '@/ScraperManager';
import { ref } from 'vue';


const model = window.app.config.value

// W komponencie Vue lub dowolnym pliku w rendererze

function downloadJson(data: any, fileName: string = 'data.json') {
	const jsonString = JSON.stringify(data, null, 2);
	const blob = new Blob([jsonString], { type: 'application/json' });

	const url = URL.createObjectURL(blob);

	const link = document.createElement('a');
	link.href = url;
	link.download = fileName;        // nazwa pliku
	document.body.appendChild(link);
	link.click();

	// Sprzątanie
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

function msToDuration(ms: number): string {
	const seconds = Math.floor(ms / 1000);
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = seconds % 60;

	const parts = [];
	if (h > 0) parts.push(`${h}h`);
	if (m > 0) parts.push(`${m}m`);
	if (s > 0 || parts.length === 0) parts.push(`${s}s`);

	return parts.join(' ');
}
function importJson<T = any>(): Promise<T | null> {
	return new Promise((resolve) => {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.json,application/json';

		input.onchange = (e: Event) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (!file) {
				resolve(null);
				return;
			}

			const reader = new FileReader();

			reader.onload = (event) => {
				try {
					const result = JSON.parse(event.target?.result as string);
					resolve(result as T);
					app.toast.add('Import parsing')
				} catch (err) {
					app.toast.add('Import parsing error')
					resolve(null);
				}
			};

			reader.onerror = () => {
				console.error('❌ Błąd odczytu pliku');
				resolve(null);
			};

			reader.readAsText(file);
		};

		input.click();
	});
}

// ==================== Użycie ====================
//C:\Users\YOUR_USERNAME\AppData\Local\Google\Chrome\User Data\Default\Bookmarks
async function importDatabase() {
	const data = await importJson();

	if (data) MangaManager.load(data)


}

function unpack(array: { children?: [], type: "url" | "folder", url: string, uri: string }[]) {
	let list = []

	for (let index = 0; index < array.length; index++) {
		if (array[index].children) {
			list = list.concat(unpack(array[index].children))
		} else {
			if (array[index].url) list.push(array[index].url)
			if (array[index].uri) list.push(array[index].uri)
		}
	}
	return list
}

async function importBookmark() {
	const data = await importBookmarks();
	if (!data) return
	let list = []

	if (data.roots) {
		console.log('chrome');
		for (const key in data.roots) {
			if (data.roots[key]?.children.length) {
				list = list.concat(unpack(data.roots[key].children))
			}
		}
	}

	if (data.type == "text/x-moz-place-container") {
		console.log('Firefox');
		list = list.concat(unpack(data.children))
	}



	const dynamic = ref(`Parsing Bookmarks 0/${list.length}`)
	app.toast.dynamic(dynamic)

	// nadpisywanie
	// 45
	for (let i = 48; i < list.length; i++) {
		dynamic.value = `Parsing Bookmarks ${i}/${list.length}`

		if (MangaManager.test(list[i]) == false) await ScraperManager.parse(list[i])
	}

	app.toast.endDynamic()
	//console.log(data);
	//console.log(list);

	//if (data) MangaManager.load(data)


}
// Otwórz folder
async function openFolder(path: string) {
	electron.openFolder(path)
}
</script>

<template>
	<div class="config">
		<div class="header">Settings</div>
		<div class="wrapper">
			<ul>
				<li>
					Minimum Update Intreval: {{ msToDuration(model.updateInterval) }}
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
				<li><button @click="downloadJson(MangaManager.list, 'database.json')">Export database</button>&nbsp;
					<button @click="importDatabase()">Import database</button>&nbsp;
					<button @click="openFolder('appData')">appData Folder</button>&nbsp;
					<button @click="openFolder('userData')">userData Folder</button>&nbsp;
				</li>
				<li><button @click="importBookmark()">Import Bookmarks</button>&nbsp;</li>
				<li></li>
			</ul>

		</div>

	</div>


</template>

<style scoped>
li {
	margin: 5px;
}

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