<script setup lang="ts">
import type { ContextMenuItemAction, ContextMenuItemType, ContextMenuType } from "@/types/contextMenu";
import { getCurrentInstance, onMounted, onUpdated, ref, watch } from "vue";

const contextList = ref<ContextMenuType[]>([])
const contextMenu = ref<HTMLDivElement | null>(null)
const position = ref({ x: 0, y: 0 })
const isOpen = ref(false)
const submenuLeft = ref('100%')
const submenuTop = ref('0')
const width = ref(220)

onMounted(() => {
	window.app.contextMenu = {
		register,
		isOpen,
		list: contextList
	}
	const instance = getCurrentInstance()
	if (instance) instance.appContext.config.globalProperties.$contextMenu = window.app.contextMenu;
	window.addEventListener('mousedown', (e) => { if (!(e.target as HTMLElement).classList.contains('ContextMenuButton')) isOpen.value = false })
	document.addEventListener('contextmenu', contextMenuEvent);
})

function contextMenuEvent(e: MouseEvent) {
	e.stopPropagation()



	for (let index = 0; index < contextList.value.length; index++) {
		const item = contextList.value[index];
		if (e.target instanceof HTMLElement) {
			if (typeof item.context === 'string') {
				if (item.context.startsWith('#')) {
					item.show = e.target.id === item.context.slice(1)
				} else if (item.context.startsWith('.')) {
					item.show = e.target.classList.contains(item.context.slice(1))
				}

				if (!item.strict) item.show = e.target.closest(item.context) ? true : false || item.show
			} else if (item.context instanceof Node) {
				item.show = e.target.isSameNode(item.context)
			} else if (item.context === null) {
				item.show = true
			}
		}
		if (item.show) isOpen.value = true

	}

	if (isOpen.value) {
		e.preventDefault()

		position.value = { x: e.x + 1, y: e.y + 1 }
	}
}

function register(items: ContextMenuItemType[], context: Node | string | null = null, strict: boolean = true) {
	//console.log('register function');
	contextList.value.push({
		context: context,
		//@ts-ignore
		items: items,
		show: false,
		strict: strict,
		locked: false
	})
}


function checkBounds(e: MouseEvent) {
	if (e.target instanceof HTMLElement && e.target.firstElementChild instanceof Element && contextMenu.value) {
		const box = e.target.firstElementChild.getBoundingClientRect()
		const parent = e.target.getBoundingClientRect()
		submenuTop.value = (parent.top + box.height > window.innerHeight) ? `-${box.height - e.target.offsetHeight - 4}px` : '0'
		submenuLeft.value = window.innerWidth - (contextMenu.value.offsetLeft + contextMenu.value.offsetWidth) < width.value ? -width.value + 'px' : '100%'

	}
}

watch(isOpen, () => {

})

onUpdated(() => {
	//console.log('onUpdated', contextList.value);

	const box = contextMenu.value.getBoundingClientRect()
	//console.log('checkBounds');
	//console.log('position.value.y', position.value.y);
	//console.log('box.bottom', box.bottom);
	//console.log('window.innerHeight', window.innerHeight);

	position.value.y = box.bottom > window.innerHeight ? window.innerHeight - box.height : position.value.y
	position.value.x = box.right > window.innerWidth ? window.innerWidth - box.width : position.value.x
})

function action(context: ContextMenuItemAction) {
	if (context.locked) return

	context.action(context)
	isOpen.value = false
}

</script>


<template>
	<div v-show="isOpen" ref="contextMenu" class="ContextMenu"
		:style="{ top: position.y + 'px', left: position.x + 'px' }">
		<ul>

			<template v-for="contextItem in contextList">
				<template v-for="item in contextItem.items">
					<li v-if="item.type == 'action'" v-show="contextItem.show" class="ContextMenuButton"
						@click="action(item);" :class="{ locked: item.locked }">
						<!--<img :src="icon ? icon : 'blank.png'" width="16" height="16" alt="s" />-->
						{{ item.label }}

					</li>
					<li v-else-if="item.type == 'submenu'" v-show="contextItem.show"
						class="ContextMenuButton has-submenu" @mouseenter="checkBounds">
						{{ item.label }}
						<ul class="ContextSubmenu" :style="{ left: submenuLeft, top: submenuTop }">

							<template v-for="submenuItem in item.submenu">
								<li v-if="submenuItem.type == 'action'" class="ContextMenuButton"
									@click="action(submenuItem);">
									{{ submenuItem.label }}
								</li>
								<li v-else-if="submenuItem.type == 'checkbox'" class="ContextMenuButton"
									@click="submenuItem.value = !submenuItem.value"
									:class="{ checkbox: submenuItem.value }">
									{{ submenuItem.label }}
								</li>
								<li v-else-if="submenuItem.type == 'option'" class="ContextMenuButton"
									@click="submenuItem.model = submenuItem.value;"
									:class="{ radio: submenuItem.model == submenuItem.value }">
									{{ submenuItem.label }}
								</li>
								<li v-else-if="submenuItem.type == 'separator'">
									<hr />
								</li>
							</template>
						</ul>
					</li>

				</template>

			</template>
		</ul>
	</div>

</template>

<style scoped>
.hide {
	visibility: hidden;
}

hr {
	margin: 2px 0;
	border-bottom: 0;
}

.radio::after {
	content: "●";
	position: absolute;
	left: 4px;
	/*font-size: 14px;*/
}

.checkbox::after {
	content: "✓";
	position: absolute;
	left: 4px;
	font-size: 14px;
}

.ContextMenuButton.has-submenu::after {
	content: ">";
	position: absolute;
	right: 4px;
	/*font-size: 12px;*/
}

ul {
	list-style: none;
	margin: 0;
	padding: 0;
}

.ContextMenu {
	position: fixed;
	background-color: #2C2C2C;
	color: #fff;
	font-family: monospace, sans-serif, Arial, Helvetica;
	/*width: v-bind(width + 'px');*/
	min-width: v-bind(width + 'px');
	padding: 5px;
	z-index: 100;
	/*position-try-fallbacks: flip-block;*/
	/*position-area: right;*/
}

.ContextMenuButton {
	position: relative;
	padding: 2px 20px;
	cursor: pointer;
	white-space: nowrap;

	color: #fff;
	background-color: #2C2C2C;

}

.ContextMenuButton:hover {
	background-color: #3E3E3E;
}

.ContextSubmenu {
	position: absolute;
	top: -4px;
	left: 100%;
	background: #2a2a2a;
	min-width: v-bind(width + 'px');
	padding: 4px;
	margin: 0;
	display: none;
	/*z-index: 10001;*/
}

.ContextMenuButton:hover>.ContextSubmenu {
	display: block;
}

.locked {
	color: #636363;
}
</style>
