<template>
	<div class="the-game-list-container">
		<div class="the-game-list">
			<div v-if="reconnectGames.length > 0">
				<h2>{{ $locale.get('ui.browser.reconnect.header') }}</h2>
				<button @click="onReconnect" class="primary">{{ $locale.get('ui.browser.reconnect.button') }}</button>
			</div>
			<h2>{{ $locale.get('ui.browser.list.header') }}</h2>
			<div v-if="games.length === 0">
				<span class="info-text">{{ $locale.get('ui.browser.empty') }}</span>
			</div>
			<div class="list">
				<game-list-item class="list-item" v-for="game in games" :key="game.id" :game="game" />
			</div>
			<div class="controls">
				<div class="button-container">
					<button @click="onCreateSinglePlayer" class="primary">{{ $locale.get('ui.play.ai.normal') }}</button>
					<button @click="onCreateMultiPlayer" class="primary">{{ $locale.get('ui.play.pvp.normal') }}</button>
					<button @click="onRefreshGames" class="secondary">{{ $locale.get('ui.play.refresh') }}</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import axios from 'axios'
import store from '@/Vue/store'
import GameMessage from '@shared/models/network/GameMessage'
import GameListItem from '@/Vue/components/home/TheGameListItem.vue'
import Localization from '@/Pixi/Localization'
import TheChallengeAISelection from '@/Vue/components/popup/escapeMenu/TheChallengeAISelection.vue'
import GameMode from '@shared/enums/GameMode'
import { defineComponent } from 'vue'

export default defineComponent({
	components: {
		GameListItem,
	},

	data: () => ({
		games: [] as GameMessage[],
		reconnectGames: [] as GameMessage[],
		updateTimer: NaN as number,
	}),

	mounted(): void {
		this.fetchGames()
		this.updateTimer = setInterval(() => {
			this.fetchGames()
		}, 30000)
	},

	beforeUnmount(): void {
		clearInterval(this.updateTimer)
	},

	methods: {
		async fetchGames(): Promise<void> {
			const allGamesResponse = await axios.get('/api/games')
			const reconnectGamesResponse = await axios.get('/api/games', { params: { reconnect: '1' } })

			const games = allGamesResponse.data.data as GameMessage[]
			this.games = games.sort((a, b) => a.players.length - b.players.length)
			this.reconnectGames = reconnectGamesResponse.data.data as GameMessage[]
		},

		async onCreateSinglePlayer(): Promise<void> {
			if (!store.state.selectedDeckId) {
				this.$noty.error(Localization.get('ui.noty.deckRequired'))
				return
			}

			store.dispatch.popupModule.open({
				component: TheChallengeAISelection,
			})
		},

		async onCreateMultiPlayer(): Promise<void> {
			if (!store.state.selectedDeckId) {
				this.$noty.error(Localization.get('ui.noty.deckRequired'))
				return
			}

			const response = await axios.post('/api/games', { mode: GameMode.VS_PLAYER })
			const gameMessage: GameMessage = response.data.data
			await store.dispatch.joinGame(gameMessage)
		},

		async onRefreshGames(): Promise<void> {
			return this.fetchGames()
		},

		async onReconnect(): Promise<void> {
			await axios.post('/api/games/disconnect')
			await store.dispatch.joinGame(this.reconnectGames[0])
		},
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
