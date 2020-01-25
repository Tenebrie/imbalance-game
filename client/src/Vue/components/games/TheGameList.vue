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
					<button @click="onCreateGame" class="primary">Create game</button>
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
import GameMessage from '@/Pixi/shared/models/network/GameMessage'
import GameListItem from '@/Vue/components/games/TheGameListItem.vue'

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

		async onCreateGame(): Promise<void> {
			await axios.post('/api/games')
			this.fetchGames()
		},

		async onRefreshGames(): Promise<void> {
			return this.fetchGames()
		}
	}
})
</script>

<style scoped lang="scss">
	.the-game-list-container {
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;

		.the-game-list {
			min-width: 64em;
			height: 50%;
			display: flex;
			align-items: center;
			justify-content: space-between;
			flex-direction: column;
			padding: 32px;
			background: rgba(white, 0.1);

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
						width: 8em;
					}
				}
			}
		}
	}
</style>
