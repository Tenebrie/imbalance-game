<template>
	<div class="game-list">
		<game-list-item v-for="game in games" :key="game.id" :game="game" />
		<button @click="onCreateGame">Create game</button>
		<button @click="onRefreshGames">Refresh</button>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import axios from 'axios'
import store from '@/Vue/store'
import GameListItem from '@/Vue/components/GameListItem.vue'
import GameMessage from '@/Pixi/shared/models/network/GameMessage'

export default Vue.extend({
	components: {
		GameListItem
	},

	data: () => ({
		games: [] as GameMessage[]
	}),

	watch: {
		isLoggedIn(isLoggedInNow): void {
			if (isLoggedInNow) {
				this.fetchGames()
			}
		}
	},

	computed: {
		isLoggedIn(): boolean {
			return store.state.isLoggedIn
		}
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

</style>
