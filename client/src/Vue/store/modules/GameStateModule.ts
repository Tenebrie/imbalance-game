import ClientGameStatus from '../../../Pixi/enums/ClientGameStatus'
import { defineModule } from 'direct-vuex'
import Player from '@shared/models/Player'
import { moduleActionContext, rootActionContext } from '../index'
import RenderedCard from '@/Pixi/cards/RenderedCard'
import Core from '@/Pixi/Core'
import GameTurnPhase from '@shared/enums/GameTurnPhase'
import TargetMode from '@shared/enums/TargetMode'
import GameMode from '@shared/enums/GameMode'

const gameStateModule = defineModule({
	namespaced: true,
	state: {
		turnPhase: GameTurnPhase.BEFORE_GAME as GameTurnPhase,
		gameStatus: ClientGameStatus.NOT_STARTED as ClientGameStatus,
		gameMode: GameMode.PVE as GameMode,
		opponent: null as Player | null,
		isPlayersTurn: false as boolean,
		isPlayerInRound: true as boolean,
		playerMorale: 0 as number,
		playerUnitMana: 0 as number,
		playerSpellMana: 0 as number,
		playerSpellManaInDanger: 0 as number,
		isOpponentInRound: true as boolean,
		opponentMorale: 0 as number,
		opponentSpellMana: 0 as number,
		inspectedCardId: null as string | null,
		isSpectating: false as boolean,
		cardsMulliganed: 0 as number,
		maxCardMulligans: 0 as number,
		targetingMode: null as TargetMode | null,
		popupTargetingCardCount: 0 as number,
		popupTargetingCardsVisible: true as boolean,
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

		setIsPlayerInRound(state, value: boolean): void {
			state.isPlayerInRound = value
		},

		setGameStatus(state, gameStatus: ClientGameStatus): void {
			state.gameStatus = gameStatus
		},

		setGameMode(state, value: GameMode): void {
			state.gameMode = value
		},

		setPlayerMorale(state, value: number): void {
			state.playerMorale = value
		},

		setPlayerUnitMana(state, playerUnitMana: number): void {
			state.playerUnitMana = playerUnitMana
		},

		setPlayerSpellMana(state, value: number): void {
			state.playerSpellMana = value
		},

		setPlayerSpellManaInDanger(state, value: number): void {
			state.playerSpellManaInDanger = value
		},

		setIsOpponentInRound(state, value: boolean): void {
			state.isOpponentInRound = value
		},

		setOpponentMorale(state, value: number): void {
			state.opponentMorale = value
		},

		setOpponentSpellMana(state, value: number): void {
			state.opponentSpellMana = value
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

		setTargetingMode(state, mode: TargetMode | null): void {
			state.targetingMode = mode
		},

		setPopupTargetingCardCount(state, count: number): void {
			state.popupTargetingCardCount = count
		},

		setPopupTargetingCardsVisible(state, mode: boolean): void {
			state.popupTargetingCardsVisible = mode
		},
	},

	getters: {
		isInGame: (state): boolean => {
			return state.gameStatus !== ClientGameStatus.NOT_STARTED
		},

		inspectedCard: (state): RenderedCard | null => {
			if (!Core.game) {
				return null
			}
			return state.inspectedCardId === null ? null : Core.game.findRenderedCardById(state.inspectedCardId)
		},
	},

	actions: {
		setGameLoading(context): void {
			const { commit } = moduleActionContext(context, gameStateModule)
			commit.setGameStatus(ClientGameStatus.LOADING)
		},

		setGameMode(context, payload: GameMode): void {
			const { commit } = moduleActionContext(context, gameStateModule)
			commit.setGameMode(payload)
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
			commit.setPlayerMorale(0)
			commit.setOpponentMorale(0)
			commit.setIsOpponentInRound(true)
			rootDispatch.gameLogModule.clearLog()
		},
	},
})

export default gameStateModule
