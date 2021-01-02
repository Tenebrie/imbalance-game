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
import TheWelcomePopup from '@/Vue/components/popup/escapeMenu/TheWelcomePopup.vue'

export default Vue.extend({
	components: {
		TheDeckList,
		TheGameList,
		TheChangelog,
	},

	mounted(): void {
		setTimeout(() => {
			TextureAtlas.preloadComponents()
		}, 500)

		if (store.state.userPreferencesModule.welcomeModalSeenAt === null) {
			store.dispatch.popupModule.open({
				component: TheWelcomePopup,
				sticky: true,
			})
			store.dispatch.userPreferencesModule.markWelcomeModalAsSeen()
		}
	},

	computed: {
		isInGame() {
			return store.getters.gameStateModule.isInGame
		},
	},
})
</script>

<style scoped lang="scss">
@import '../styles/generic';

.home-view {
	display: flex;
	align-items: flex-end;
	justify-content: center;

	& > div {
		height: 100%;
		display: flex;
		flex-direction: column;
		background: $COLOR-BACKGROUND-TRANSPARENT;

		&.deck-list {
			flex: 1;
			margin: 0 16px 0 32px;
		}
		&.game-list {
			flex: 2;
			margin: 0 16px 0 16px;
		}
		&.changelog {
			flex: 1;
			margin: 0 32px 0 16px;
		}
	}
}
</style>
