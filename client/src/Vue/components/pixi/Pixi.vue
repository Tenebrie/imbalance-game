<template>
	<div class="pixi">
		<div class="background"/>
		<div ref="game" class="game-container"></div>
		<pixi-user-interface class="pixi-user-interface" />
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import store from '@/Vue/store'
import Core from '../../../Pixi/Core'
import PixiUserInterface from '@/Vue/components/pixi/PixiUserInterface.vue'
import {isMobile} from '@/utils/Utils'

export default Vue.extend({
	components: {
		PixiUserInterface,
	},

	created(): void {
		store.dispatch.gameStateModule.setGameLoading()
		if (isMobile()) {
			const elem = document.documentElement
			// if (elem.requestFullscreen) {elem.requestFullscreen()}
			// window.scrollTo(0, 1)
		}
	},

	mounted(): void {
		window.addEventListener('resize', this.onWindowResize)

		const container = (this.$refs.game as HTMLElement)
		Core.init(store.state.selectedGame, store.state.selectedDeckId, container)
	},

	beforeDestroy(): void {
		window.removeEventListener('resize', this.onWindowResize)
		if (Core.socket) {
			Core.socket.close()
		}
	},

	methods: {
		onWindowResize() {
			Core.renderer.resize()
		}
	}
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
			background: url('../../assets/background-game.jpg');
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
