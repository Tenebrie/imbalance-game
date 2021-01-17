<template>
	<div class="the-popup-view" v-if="popupComponent" @click="onSmokeScreenClick">
		<component :is="popupComponent" />
	</div>
</template>

<script lang="ts">
import store from '@/Vue/store'
import { computed, defineComponent, onMounted, onUnmounted } from 'vue'

export default defineComponent({
	setup() {
		const popupComponent = computed(() => store.getters.popupModule.component)

		onMounted(() => window.addEventListener('keydown', onKeyDown))
		onUnmounted(() => window.removeEventListener('keydown', onKeyDown))

		const onKeyDown = (event: KeyboardEvent): void => {
			if (event.key === 'Escape' && popupComponent.value) {
				store.dispatch.popupModule.close()
				event.preventDefault()
			}
		}

		const onSmokeScreenClick = (): void => {
			if (!store.getters.popupModule.sticky) {
				store.dispatch.popupModule.close()
			}
		}

		return {
			onKeyDown,
			popupComponent,
			onSmokeScreenClick,
		}
	},
})
</script>

<style scoped lang="scss">
@import '../../styles/generic';

.the-popup-view {
	z-index: 1000;
	position: absolute;
	width: 100vw;
	height: 100vh;
	background: rgba(0, 0, 0, 0.7);
}
</style>
