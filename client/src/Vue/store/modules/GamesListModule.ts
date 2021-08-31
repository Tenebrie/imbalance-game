import GameMessage from '@shared/models/network/GameMessage'
import { defineModule } from 'direct-vuex'

import store, { moduleActionContext } from '@/Vue/store'

const GamesListModule = defineModule({
	namespaced: true,
	state: {
		games: [] as GameMessage[],
	},

	getters: {
		normalGames(state): GameMessage[] {
			const player = store.state.player
			if (!player) {
				throw new Error('No player data!')
			}
			return state.games.filter((game) => {
				const players = game.players.flatMap((playerGroup) => playerGroup.players)
				return !players.some((p) => p.player.id === player.id) && game.isSpectatable
			})
		},

		reconnectGames(state): GameMessage[] {
			const player = store.state.player
			if (!player) {
				throw new Error('No player data!')
			}
			return state.games.filter((game) => game.players.flatMap((playerGroup) => playerGroup.players).some((p) => p.player.id === player.id))
		},
	},

	mutations: {
		setGames(state, value: GameMessage[]): void {
			state.games = value
		},
	},

	actions: {
		setGames(context, data: GameMessage[]): void {
			const { commit } = moduleActionContext(context, GamesListModule)
			commit.setGames(data)
		},

		addGame(context, data: GameMessage): void {
			const { state, commit } = moduleActionContext(context, GamesListModule)
			if (state.games.some((game) => game.id === data.id)) {
				return
			}
			commit.setGames(state.games.concat(data))
		},

		updateGame(context, data: GameMessage): void {
			const { state, commit } = moduleActionContext(context, GamesListModule)
			const games = [...state.games]
			const existingGame = games.find((game) => game.id === data.id)
			if (!existingGame) {
				return
			}
			games.splice(games.indexOf(existingGame), 1, data)
			commit.setGames(games)
		},

		removeGame(context, data: GameMessage): void {
			const { state, commit } = moduleActionContext(context, GamesListModule)
			commit.setGames(state.games.filter((game) => game.id !== data.id))
		},
	},
})

export default GamesListModule
