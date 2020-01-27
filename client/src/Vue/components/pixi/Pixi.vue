<template>
	<div class="pixi">
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
		Core.init(this.selectedGameId, container)
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
	.pixi-user-interface {
		z-index: 1;
	}
</style>
