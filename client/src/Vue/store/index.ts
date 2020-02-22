import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import Core from '@/Pixi/Core'
import router from '@/Vue/router'
import Player from '@/Pixi/shared/models/Player'
import ClientGameStatus from '@/Pixi/enums/ClientGameStatus'
import { createDirectStore, createModule } from 'direct-vuex'

Vue.use(Vuex)

const gameStateModule = createModule({
	namespaced: true,
	state: {
		gameStatus: ClientGameStatus.NOT_STARTED as ClientGameStatus,
		opponent: null as Player | null,
		isPlayersTurn: false as boolean,
		playerUnitMana: 0 as number
	},

	mutations: {
		setOpponentData(state, player: Player | null): void {
			state.opponent = player
		},

		setIsPlayersTurn(state, isPlayersTurn: boolean): void {
			state.isPlayersTurn = isPlayersTurn
		},

		setGameStatus(state, gameStatus: ClientGameStatus): void {
			state.gameStatus = gameStatus
		},

		setPlayerUnitMana(state, playerUnitMana: number): void {
			state.playerUnitMana = playerUnitMana
		}
	},

	getters: {
		isInGame: (state): boolean => {
			return state.gameStatus !== ClientGameStatus.NOT_STARTED
		}
	},

	actions: {
		setGameLoading(context): void {
			const { commit } = moduleActionContext(context, gameStateModule)
			commit.setGameStatus(ClientGameStatus.LOADING)
		},

		startGame(context): void {
			const { commit } = moduleActionContext(context, gameStateModule)
			commit.setGameStatus(ClientGameStatus.IN_PROGRESS)
			console.info('Game started!')
		},

		winGame(context): void {
			const { commit } = moduleActionContext(context, gameStateModule)
			commit.setGameStatus(ClientGameStatus.VICTORY)
		},

		loseGame(context): void {
			const { commit } = moduleActionContext(context, gameStateModule)
			commit.setGameStatus(ClientGameStatus.DEFEAT)
		},

		drawGame(context): void {
			const { commit } = moduleActionContext(context, gameStateModule)
			commit.setGameStatus(ClientGameStatus.DRAW)
		},

		reset(context): void {
			const { commit } = moduleActionContext(context, gameStateModule)
			commit.setGameStatus(ClientGameStatus.NOT_STARTED)
			commit.setOpponentData(null)
			commit.setIsPlayersTurn(false)
		}
	}
})

const { store, rootActionContext, moduleActionContext } = createDirectStore({
	modules: {
		gameStateModule: gameStateModule
	},

	state: {
		player: null as Player | null,
		isLoggedIn: false as boolean,
		selectedGameId: '' as string
	},

	mutations: {
		setPlayerData(state, player: Player): void {
			state.isLoggedIn = true
			state.player = player
		},

		setSelectedGameId(state, selectedGameId: string): void {
			state.selectedGameId = selectedGameId
		},

		resetPlayerData(state): void {
			state.isLoggedIn = false
			state.player = null
		}
	},

	getters: {
		player: (state): Player => {
			if (!state.player) {
				throw new Error('Player is not available!')
			}
			return state.player
		}
	},

	actions: {
		async logout(context): Promise<void> {
			const { commit } = rootActionContext(context)
			await axios.post('/api/logout')
			commit.resetPlayerData()
			await router.push({ name: 'login' })
		},

		joinGame(context, selectedGameId: string): void {
			const { commit } = rootActionContext(context)
			commit.setSelectedGameId(selectedGameId)
			router.push({ name: 'game' })
		},

		leaveGame(): void {
			if (store.state.gameStateModule.gameStatus === ClientGameStatus.NOT_STARTED) { return }

			store.dispatch.gameStateModule.reset()
			router.push({ name: 'home' })
			Core.socket.close(1000, 'Player disconnect')
		}
	}
})

// Export the direct-store instead of the classic Vuex store.
export default store

// The following exports will be used to enable types in the
// implementation of actions.
export { rootActionContext, moduleActionContext }

// The following lines enable types in the injected store '$store'.
export type AppStore = typeof store
declare module 'vuex' {
	interface Store<S> {
		direct: AppStore
	}
}
