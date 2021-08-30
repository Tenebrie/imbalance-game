<template>
	<div class="the-game-list-container">
		<div class="the-game-list">
			<div v-if="reconnectGames.length > 0">
				<h2>{{ $locale.get('ui.browser.reconnect.header') }}</h2>
				<button @click="onReconnect" class="primary">
					<i class="fas fa-arrow-alt-circle-left" /> {{ $locale.get('ui.browser.reconnect.button') }}
				</button>
			</div>
			<h2>{{ $locale.get('ui.browser.list.header') }}</h2>
			<div v-if="games.length === 0 && reconnectGames.length === 0">
				<span class="info-text">{{ $locale.get('ui.browser.empty') }}</span>
			</div>
			<div v-if="games.length === 0 && reconnectGames.length > 0">
				<span class="info-text">{{ $locale.get('ui.browser.almostEmpty') }}</span>
			</div>
			<div class="list">
				<game-list-item class="list-item" v-for="game in games" :key="getGameHash(game)" :game="game" />
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import GameMessage from '@shared/models/network/GameMessage'
import { hashCode } from '@shared/Utils'
import axios from 'axios'
import { computed, defineComponent } from 'vue'

import GameListItem from '@/Vue/components/home/TheGameListItem.vue'
import store from '@/Vue/store'

export default defineComponent({
	components: {
		GameListItem,
	},

	setup() {
		const games = computed<GameMessage[]>(() => store.state.gamesListModule.games)
		const reconnectGames: GameMessage[] = []

		const onReconnect = async (): Promise<void> => {
			await axios.post('/api/games/disconnect')
			// await store.dispatch.joinGame(this.reconnectGames[0])
		}

		const getGameHash = (game: GameMessage): number => {
			return hashCode(JSON.stringify(game))
		}

		return {
			games,
			reconnectGames,
			onReconnect,
			getGameHash,
		}
	},
})
</script>

<style scoped lang="scss">
@import '../../styles/generic';

.the-game-list-container {
	.the-game-list {
		width: calc(100% - 64px);
		height: 100%;
		padding: 32px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-direction: column;

		button {
			font-size: 1.2em;
		}

		.list {
			width: 100%;
			height: 100%;
			margin-bottom: 1em;
			overflow-y: auto;

			.list-item {
				padding: 4px 16px;
			}
		}

		.controls {
			width: 100%;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-direction: column;

			.button-container {
				display: flex;
				align-items: center;
				justify-content: center;

				button {
					margin: 4px;
					padding: 8px 16px;
					white-space: nowrap;
				}
			}
		}
	}
}
</style>
