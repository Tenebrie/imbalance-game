<template>
	<div class="the-game-list-container">
		<div class="the-game-list">
			<h2>Game browser</h2>
			<div v-if="games.length === 0"><span class="info-text">Nobody is playing :(</span></div>
			<div class="list">
				<game-list-item class="list-item" v-for="game in games" :key="game.id" :game="game" />
			</div>
			<div class="controls">
				<div class="button-container">
					<button @click="onCreateSinglePlayer" class="primary">Play vs AI</button>
					<button @click="onCreateMultiPlayer" class="primary">Create game</button>
					<button @click="onRefreshGames" class="secondary">Refresh</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import axios from 'axios'
import store from '@/Vue/store'
import GameMessage from '@shared/models/network/GameMessage'
import GameListItem from '@/Vue/components/home/TheGameListItem.vue'

export default Vue.extend({
	components: {
		GameListItem
	},

	data: () => ({
		games: [] as GameMessage[],
		updateTimer: NaN as number
	}),

	mounted(): void {
		this.fetchGames()
		this.updateTimer = setInterval(() => {
			this.fetchGames()
		}, 30000)
	},

	beforeDestroy(): void {
		clearInterval(this.updateTimer)
	},

	methods: {
		async fetchGames(): Promise<void> {
			const response = await axios.get('/api/games')
			this.games = response.data.data as GameMessage[]
		},

		async onCreateMultiPlayer(): Promise<void> {
			const response = await axios.post('/api/games')
			const gameMessage: GameMessage = response.data.data
			await store.dispatch.joinGame(gameMessage.id)
		},

		async onCreateSinglePlayer(): Promise<void> {
			const response = await axios.post('/api/games', { mode: 'sp_ai' })
			const gameMessage: GameMessage = response.data.data
			await store.dispatch.joinGame(gameMessage.id)
		},

		async onRefreshGames(): Promise<void> {
			return this.fetchGames()
		}
	}
})
</script>

<style scoped lang="scss">
	@import "../../styles/generic";

	.the-game-list-container {
		flex: 2;
		margin: 32px 16px 32px 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;

		.the-game-list {
			width: calc(100% - 64px);
			height: 100%;
			padding: 32px;
			display: flex;
			align-items: center;
			justify-content: space-between;
			flex-direction: column;
			background: $COLOR-BACKGROUND-TRANSPARENT;

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
