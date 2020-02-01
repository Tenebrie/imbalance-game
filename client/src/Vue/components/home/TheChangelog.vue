<template>
	<div class="the-changelog">
		<div class="iframe-container">
			<iframe id="frame" src="/changelog" />
		</div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import axios from 'axios'
import store from '@/Vue/store'
import GameMessage from '@/Pixi/shared/models/network/GameMessage'

export default Vue.extend({
	components: {
	},

	data: () => ({
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
			store.dispatch.joinGame(gameMessage.id)
		},

		async onCreateSinglePlayer(): Promise<void> {
			const response = await axios.post('/api/games', { mode: 'test' })
			const gameMessage: GameMessage = response.data.data
			store.dispatch.joinGame(gameMessage.id)
		},

		async onRefreshGames(): Promise<void> {
			return this.fetchGames()
		}
	}
})
</script>

<style scoped lang="scss">
	@import "../../styles/generic";

	.the-changelog {
		flex: 1;
		margin: 32px 32px 32px 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;

		.iframe-container {
			width: calc(100% - 64px);
			height: 100%;
			padding: 32px;
			background: $COLOR-BACKGROUND-TRANSPARENT;

			iframe {
				width: 100%;
				height: 100%;
				border: none;

				color: red !important;
			}

		}
	}
</style>
