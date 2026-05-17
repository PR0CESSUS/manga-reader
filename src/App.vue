<script lang="ts" setup>
import { Manga } from './Manga';
import { MangaManager } from './MangaManager';
import { ScraperManager } from './ScraperManager';
import { HTMLWebviewTag, WebviewArgs, WebviewHandlers, WebviewReturn } from './types/webview';
import { WebviewTag } from 'electron';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import MangaAdd from './components/MangaAdd.vue';
import { ConfigManager } from './ConfigManager';
import AppConfig from './components/AppConfig.vue';
import AppToast from './components/AppToast.vue';
import AppDialog from './components/AppDialog.vue';
import AppContextMenu from './components/AppContextMenu.vue';
import MangaEdit from '@components/MangaEdit.vue';
import pkg from './../package.json';

const testURL = ref(' ')
const mangaSelected = ref<Manga | null>(null)
const readerMode = ref(false)
const webview = ref<HTMLWebviewTag | null>(null)
const pendingRequests = reactive(new Map());
var requestId = 0;
const cloudflare = ref(true)

async function sendMessage<C extends keyof WebviewHandlers>(channel: C, ...args: WebviewArgs<C>): Promise<WebviewReturn<C>> {
  const id = `req_${++requestId}_${Date.now()}`;
  if (!cloudflare.value && webview.value) webview.value.send(channel, id, ...args)
  return new Promise((resolve, reject) => pendingRequests.set(id, { resolve, reject, channel, args: [...args] }))
}

watch(cloudflare, (cloudflareProtected) => {
  if (!cloudflareProtected) pendingRequests.forEach((data, id) => webview.value.send(data.channel, id, ...data.args))
})




onMounted(() => {
  document.title = document.title.includes(pkg.version) ? document.title : `${document.title} ${pkg.version}`
  window.app.config = new ConfigManager()
  webview.value.sendMessage = sendMessage
  window.webview = webview.value
  ScraperManager.init();
  MangaManager.init();
  ipcRenderer.on('main-process-message', (_event, ...args) => {
    console.log('[Main-process]:', ...args)
  })



  webview.value.addEventListener("ipc-message", (event: Electron.IpcMessageEvent & { target: WebviewTag }) => {
    const channel = event.channel
    const id = event.args[0]
    const data = event.args[1]
    switch (channel) {
      case 'response':
        console.log('response', id, data);

        pendingRequests.get(id).resolve(data);
        pendingRequests.delete(id)
        break;
      case 'DOMContentLoaded':
        console.log(channel, 'cloudflare: ', ...event.args);
        cloudflare.value = event.args[0]
        if (cloudflare.value) app.toast.add('Cloudflare protected. Wait')
        break
      case 'reject':
        console.log(channel, ...event.args);

        break
      default:
        console.log(channel, ...event.args);
        break;
    }
  });

  webview.value.addEventListener('did-navigate-in-page', (event: Electron.IpcMessageEvent & { target: WebviewTag, url: string }) => {
    //console.log('did-navigate-in-page', event.url);
    const scraper = ScraperManager.test(event.url)

    if (scraper) {
      const url = scraper.parseURL(event.url)
      const manga = MangaManager.test(url.url)
      if (manga && url.episode > manga.lastRead) {
        manga.lastRead = url.episode
        manga.save()
      }

    }
  })

  // Context Menu
  app.contextMenu.register([
    { type: 'action', label: 'Update', action: () => mangaSelected.value.update() },
    { type: 'action', label: 'Edit', action: () => app.dialog.custom(MangaEdit, mangaSelected.value) },


    {
      type: 'action', label: 'Delete', action: () => {
        app.dialog.confirm(`Delete ${mangaSelected.value.title}?`).then((e) => e ? MangaManager.delete(mangaSelected.value) : null
        )
      }
    },
    {
      type: 'submenu', label: 'Debug', submenu: [
        { type: 'action', label: 'Parse', action: () => mangaSelected.value.scraper.parse(mangaSelected.value.url) },
        { type: 'action', label: 'Info', action: () => console.log(mangaSelected.value) },
        { type: 'action', label: 'Save', action: () => mangaSelected.value.save() },

        //{ type: 'separator' },
        //{ type: 'option', label: 'Option 1', model: optionsTest, value: 'option1' },
        //{ type: 'option', label: 'Option 2', model: optionsTest, value: 'option2' },
        //{ type: 'option', label: 'Option 3', model: optionsTest, value: 'option3' },
      ],
    },
  ], '.manga', false
  )
  app.contextMenu.register([
    {
      type: 'submenu', label: 'View', submenu: [
        { type: 'option', label: 'Small', model: computed({ get: () => app.config.get('viewSize'), set: (v) => app.config.set('viewSize', v) }), value: 'small' },
        { type: 'option', label: 'Normal', model: computed({ get: () => app.config.get('viewSize'), set: (v) => app.config.set('viewSize', v) }), value: 'normal' },
        { type: 'option', label: 'Big', model: computed({ get: () => app.config.get('viewSize'), set: (v) => app.config.set('viewSize', v) }), value: 'big' },
        { type: 'separator' },
        { type: 'checkbox', label: 'Show Titles', value: computed({ get: () => app.config.get('showTitle'), set: (v) => app.config.set('showTitle', v) }) },
      ],
    },
    {
      type: 'action', label: 'Update All', action: (context) => {
        MangaManager.update()
        context.locked = MangaManager.locked
      }
    },
    { type: 'action', label: 'Settings', action: () => app.dialog.custom(AppConfig) },
  ], '.shelf'
  )
})



async function readManga(manga: Manga) {
  readerMode.value = true
  await webview.value.loadURL(manga.getNewEpisodeLink())
  manga.lastRead++
  manga.save()
}
//TODO preload webview path
// preload="file:///D:/Project/manga/public/preload.js"
</script>

<template>
  <AppToast />
  <AppDialog />
  <AppContextMenu />
  <webview ref="webview" src="./webview.html" :class="{ fadeIn: readerMode, fadeOut: !readerMode }"
    partition="persist:webview">
  </webview>


  <div style="position: fixed; background-color: cadetblue; z-index: 90; bottom: 0;">
    <button @click="readerMode = !readerMode">Toogle Reader Mode</button>
    <!--<span>{{ mangaSelected?.url }}</span>-->
    <!--<code
      v-for="[key, value] in pendingRequests"><b @click="console.log(pendingRequests.get(key))">{{ key }} </b> {{ value }}</br></code>-->

  </div>

  <div class="shelf" :class="{ fadeIn: !readerMode, fadeOut: readerMode }">
    <div v-for="manga in MangaManager.list" :key="manga.title" class="container manga"
      :class="[$config.get('viewSize')]" @click.right="!$contextMenu.isOpen.value ? mangaSelected = manga : null">

      <img :src="manga.image" class="icon" :class="[$config.get('viewSize')]" />
      <a v-show="$config.get('showTitle')" :href="manga.url" target="_blank" :title="manga.url" class="bottom">{{
        manga.title }}</a>

      <div v-if="manga.status == 'update'" class="loader"></div>

      <div v-if="manga.lastRead < manga.chapters" class="top-right" @click="readManga(manga)">New
      </div>

      <div class="top-left"> {{ manga.lastRead }} / {{ manga.chapters }}</div>
    </div>
    <div v-if="webview" class="container" :class="[$config.get('viewSize')]"
      :style="{ fontSize: $config.get('viewSize') == 'small' ? '80px' : $config.get('viewSize') == 'normal' ? '150px' : '240px' }"
      style="cursor: pointer; display: flex; align-content: center; justify-content: center; align-items: center;"
      @click="$dialog.custom(MangaAdd, testURL)">+


    </div>

  </div>



</template>

<style scoped>
.small {
  width: 96px;
  height: 124px;
  font-size: x-small;
}

.normal {
  width: 192px;
  height: 249px;
}

.big {
  width: 288px;
  height: 374px;
}


.icon {
  resize: both;
}



webview {
  position: absolute;
  width: 100%;
  top: 0;
  height: 100%;
}

.fadeOut {
  visibility: hidden;
  opacity: 0;
  transition: visibility 0s 1s, opacity 1s linear;
}

.fadeIn {
  visibility: visible;
  opacity: 1;
  transition: visibility 1s 0s, opacity 1s linear;
}





button {
  display: inline-flex;
  align-items: center;
  font-family: Roboto, NotoSans, sans-serif;
  position: relative;
  top: -2px;
}



.loader {
  position: absolute;
  /*top: 40%;*/
  /*left: 40%;*/
  top: 10%;
  width: 90%;
  margin-left: 5%;
  padding: 10px;
  aspect-ratio: 1;
  border-radius: 50%;
  background: #ffffff;
  --_m:
    conic-gradient(#0000 10%, #000),
    linear-gradient(#000 0 0) content-box;
  -webkit-mask: var(--_m);
  mask: var(--_m);
  -webkit-mask-composite: source-out;
  mask-composite: subtract;
  animation: l3 1s infinite linear;
}

@keyframes l3 {
  to {
    transform: rotate(1turn)
  }
}

.shelf {

  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  /*margin: 16px;*/
  width: 100%;
  height: 100vh;
  justify-content: flex-start;
  align-items: flex-start;
  align-content: flex-start;
  overflow-y: scroll;
  scrollbar-width: none;
  padding: 10px;
}

a {
  text-decoration: none;
  color: white;
}

.container {
  position: relative;
  text-align: center;
  color: white;
  box-sizing: border-box;
  align-self: flex-start;
}

.container:hover {
  box-shadow: 0px 0px 15px 10px #FFFFFF;
}

.centered {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);


}

.bottom {
  position: absolute;
  display: inline-block;
  bottom: 0%;
  left: 50%;
  transform: translate(-50%, -0%);
  background-color: grey;
  width: 100%;

}

.top-right {
  position: absolute;
  top: 8px;
  right: 16px;
  background-color: chartreuse;
  padding: 4px;
  color: black;
  cursor: pointer;
}

.top-left {
  position: absolute;
  top: 0px;
  left: 0px;
  background-color: grey;
}
</style>