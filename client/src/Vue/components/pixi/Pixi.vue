<template>
	<div>
		<div ref="game" class="game-container"></div>
		<pixi-user-interface v-if="isInGame" class="pixi-user-interface" />
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import store from '@/Vue/store'
import Core from '../../../Pixi/Core'
import TextureAtlas from '@/Pixi/render/TextureAtlas'
import PixiUserInterface from '@/Vue/components/pixi/PixiUserInterface.vue'

export default Vue.extend({
	components: {
		PixiUserInterface
	},

	watch: {
		selectedGameId(newGameId, oldGameId) {
			if (oldGameId) {
				Core.reset()
			}

			if (!newGameId) { return }

			const container = (this.$refs.game as HTMLElement)
			Core.init(newGameId, container)
		}
	},

	mounted(): void {
		setTimeout(() => {
			TextureAtlas.prepare()
		}, 500)
		window.addEventListener('resize', this.onWindowResize)
	},

	beforeDestroy(): void {
		store.commit.setSelectedGameId('')
		Core.reset()
		window.removeEventListener('resize', this.onWindowResize)
	},

	computed: {
		isInGame(): boolean {
			return !!this.selectedGameId
		},

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
