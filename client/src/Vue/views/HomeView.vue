<template>
	<div class="home-view">
		<the-game-list />
		<the-changelog />
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import store from '@/Vue/store'
import TheGameList from '../components/home/TheGameList.vue'
import TheChangelog from '@/Vue/components/home/TheChangelog.vue'
import TextureAtlas from '@/Pixi/render/TextureAtlas'

export default Vue.extend({
	components: { TheGameList, TheChangelog },

	mounted(): void {
		setTimeout(() => {
			TextureAtlas.prepare()
		}, 500)
	},

	computed: {
		isInGame() {
			return store.getters.gameStateModule.isInGame
		}
	}
})
</script>

<style scoped lang="scss">
	.home-view {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;

		& > div {
			height: 75%;
		}
	}
</style>
