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

export default Vue.extend({
	components: {
		PixiUserInterface
	},

	created(): void {
		store.dispatch.gameStateModule.setGameLoading()
	},

	mounted(): void {
		window.addEventListener('resize', this.onWindowResize)

		const container = (this.$refs.game as HTMLElement)
		Core.init(this.selectedGameId, store.state.selectedDeckId, container)
	},

	beforeDestroy(): void {
		Core.reset()
		window.removeEventListener('resize', this.onWindowResize)
	},

	computed: {
		selectedGameId(): string {
			return store.state.selectedGameId
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
	}
</style>
