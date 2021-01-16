<template>
	<div class="pixi">
		<div class="background" />
		<div ref="gameContainer" class="game-container"></div>
		<pixi-user-interface class="pixi-user-interface" />
	</div>
</template>

<script lang="ts">
import store from '@/Vue/store'
import Core from '../../../Pixi/Core'
import PixiUserInterface from '@/Vue/components/pixi/PixiUserInterface.vue'
import { isMobile } from '@/utils/Utils'
import { defineComponent, onBeforeUnmount, onMounted, ref } from 'vue'

export default defineComponent({
	components: {
		PixiUserInterface,
	},

	setup() {
		store.dispatch.gameStateModule.setGameLoading()
		if (isMobile()) {
			// const elem = document.documentElement
			// if (elem.requestFullscreen) {elem.requestFullscreen()}
			// window.scrollTo(0, 1)
		}

		const gameContainer = ref<HTMLElement>()
		onMounted(() => {
			window.addEventListener('resize', onWindowResize)

			Core.init(store.state.selectedGame, store.state.selectedDeckId, gameContainer.value)
		})

		onBeforeUnmount(() => {
			window.removeEventListener('resize', onWindowResize)
			if (Core.socket) {
				Core.socket.close()
			}
		})

		const onWindowResize = (): void => {
			Core.renderer.resize()
		}

		return {
			gameContainer,
			onWindowResize,
		}
	},
})
</script>

<style scoped lang="scss">
.pixi {
	min-width: 1366px;

	.background {
		position: absolute;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: url('../../assets/background-game.webp');
		background-size: cover;
		background-position-x: center;
		background-position-y: bottom;
	}
	.game-container {
		position: absolute;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		z-index: 1;
		overflow: hidden;
	}
	.pixi-user-interface {
		z-index: 2;
	}
	.inspected-card {
		z-index: 3;
	}
}
</style>
