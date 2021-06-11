<template>
	<div class="home-view">
		<the-home-action-list class="action-list" />
		<the-game-list class="game-list" />
		<the-changelog class="changelog" />
	</div>
</template>

<script lang="ts">
import store from '@/Vue/store'
import TheGameList from '../components/home/TheGameList.vue'
import TheChangelog from '@/Vue/components/home/TheChangelog.vue'
import TextureAtlas from '@/Pixi/render/TextureAtlas'
import TheWelcomePopup from '@/Vue/components/popup/TheWelcomePopup.vue'
import { defineComponent } from 'vue'
import TheHomeActionList from '../components/home/TheHomeActionList.vue'

export default defineComponent({
	components: {
		TheGameList,
		TheChangelog,
		TheHomeActionList,
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
	max-width: $CONTENT_WIDTH;

	& > div {
		height: 100%;
		display: flex;
		flex-direction: column;
		background: $COLOR-BACKGROUND-TRANSPARENT;

		&.action-list {
			flex: 3;
			margin: 0 16px 0 0;
		}
		&.game-list {
			flex: 4;
			margin: 0 16px 0 16px;
		}
		&.changelog {
			flex: 3;
			margin: 0 0 0 16px;
		}
	}
}
</style>
