<template>
	<div ref="game"></div>
</template>

<script lang="ts">
import Vue from 'vue'
import store from '@/Vue/store'
import Core from '../../Pixi/Core'

export default Vue.extend({
	watch: {
		selectedGameId(gameId) {
			if (!gameId) { return }

			const container = (this.$refs.game as Element)
			Core.init(gameId, container)
		}
	},

	mounted(): void {

	},

	beforeDestroy(): void {
		store.commit.setSelectedGameId(null)
		Core.reset()
	},

	computed: {
		selectedGameId() {
			return store.state.selectedGameId
		}
	}
})
</script>

<style scoped lang="scss">

</style>
