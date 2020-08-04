import ClientGameStatus from '../../../Pixi/enums/ClientGameStatus'
import { createModule } from 'direct-vuex'
import Player from '@shared/models/Player'
import {moduleActionContext, rootActionContext} from '../index'
import RenderedCard from '@/Pixi/cards/RenderedCard'
import Core from '@/Pixi/Core'

const gameStateModule = createModule({
	namespaced: true,
	state: {
		gameStatus: ClientGameStatus.NOT_STARTED as ClientGameStatus,
		opponent: null as Player | null,
		isPlayersTurn: false as boolean,
		playerUnitMana: 0 as number,
		inspectedCardId: null as string | null
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
		},

		setInspectedCard(state, inspectedCard: RenderedCard | null): void {
			state.inspectedCardId = inspectedCard ? inspectedCard.id : null
		}
	},

	getters: {
		isInGame: (state): boolean => {
			return state.gameStatus !== ClientGameStatus.NOT_STARTED
		},

		inspectedCard: (state): RenderedCard | null => {
			return state.inspectedCardId === null ? null : Core.game.findRenderedCardById(state.inspectedCardId)
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
