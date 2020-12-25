import ClientGameStatus from '../../../Pixi/enums/ClientGameStatus'
import {defineModule} from 'direct-vuex'
import Player from '@shared/models/Player'
import {moduleActionContext, rootActionContext} from '../index'
import RenderedCard from '@/Pixi/cards/RenderedCard'
import Core from '@/Pixi/Core'
import GameTurnPhase from '@shared/enums/GameTurnPhase'
import TargetMode from '@shared/enums/TargetMode'

const gameStateModule = defineModule({
	namespaced: true,
	state: {
		turnPhase: GameTurnPhase.BEFORE_GAME as GameTurnPhase,
		gameStatus: ClientGameStatus.NOT_STARTED as ClientGameStatus,
		opponent: null as Player | null,
		isPlayersTurn: false as boolean,
		playerUnitMana: 0 as number,
		inspectedCardId: null as string | null,
		isSpectating: false as boolean,
		cardsMulliganed: 0 as number,
		maxCardMulligans: 0 as number,
		popupTargetingMode: null as TargetMode | null,
		popupTargetingCardCount: 0 as number,
		popupTargetingCardsVisible: true as boolean
	},

	mutations: {
		setTurnPhase(state, turnPhase: GameTurnPhase): void {
			state.turnPhase = turnPhase
		},

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
		},

		setIsSpectating(state, isSpectating: boolean): void {
			state.isSpectating = isSpectating
		},

		setCardsMulliganed(state, number: number): void {
			state.cardsMulliganed = number
		},

		setMaxCardMulligans(state, number: number): void {
			state.maxCardMulligans = number
		},

		setPopupTargetingMode(state, mode: TargetMode | null): void {
			state.popupTargetingMode = mode
		},

		setPopupTargetingCardCount(state, count: number): void {
			state.popupTargetingCardCount = count
		},

		setPopupTargetingCardsVisible(state, mode: boolean): void {
			state.popupTargetingCardsVisible = mode
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
			commit.setIsSpectating(false)
			commit.setIsPlayersTurn(false)
			rootDispatch.gameLogModule.clearLog()
		}
	}
})

export default gameStateModule
