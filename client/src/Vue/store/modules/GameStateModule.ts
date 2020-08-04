import ClientGameStatus from '../../../Pixi/enums/ClientGameStatus'
import { createModule } from 'direct-vuex'
import Player from '@shared/models/Player'
import {moduleActionContext, rootActionContext} from '../index'

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
			const { rootDispatch } = rootActionContext(context)
			commit.setGameStatus(ClientGameStatus.NOT_STARTED)
			commit.setOpponentData(null)
			commit.setIsPlayersTurn(false)
			rootDispatch.gameLogModule.clearLog()
		}
	}
})

export default gameStateModule
