<template>
	<div class="home-view">
		<the-deck-list class="deck-list" />
		<the-game-list class="game-list" />
		<the-changelog class="changelog" />
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import store from '@/Vue/store'
import TheGameList from '../components/home/TheGameList.vue'
import TheChangelog from '@/Vue/components/home/TheChangelog.vue'
import TextureAtlas from '@/Pixi/render/TextureAtlas'
import TheDeckList from '@/Vue/components/editor/TheDeckList.vue'

export default Vue.extend({
	components: {
		TheDeckList,
		TheGameList,
		TheChangelog
	},

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
	@import "../styles/generic";

	.home-view {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;

		& > div {
			height: 75%;
			display: flex;
			flex-direction: column;
			background: $COLOR-BACKGROUND-TRANSPARENT;

			&.deck-list {
				flex: 1;
				margin: 32px 16px 32px 32px;
			}
			&.game-list {
				flex: 2;
				margin: 32px 16px 32px 16px;
			}
			&.changelog {
				flex: 1;
				margin: 32px 32px 32px 16px;
			}
		}
	}
</style>
