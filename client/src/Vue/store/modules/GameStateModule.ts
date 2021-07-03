import ClientGameStatus from '../../../Pixi/enums/ClientGameStatus'
import { defineModule } from 'direct-vuex'
import Player from '@shared/models/Player'
import { moduleActionContext, rootActionContext } from '../index'
import RenderedCard from '@/Pixi/cards/RenderedCard'
import Core from '@/Pixi/Core'
import GameTurnPhase from '@shared/enums/GameTurnPhase'
import TargetMode from '@shared/enums/TargetMode'
import Ruleset from '@shared/models/ruleset/Ruleset'
import GameMessage from '@shared/models/network/GameMessage'

const gameStateModule = defineModule({
	namespaced: true,
	state: {
		gameId: null as string | null,
		turnPhase: GameTurnPhase.BEFORE_GAME as GameTurnPhase,
		gameStatus: ClientGameStatus.NOT_STARTED as ClientGameStatus,
		endScreenSuppressed: false as boolean,
		ruleset: null as Ruleset | null,
		opponent: null as Player | null,
		isPlayersTurn: false as boolean,
		isPlayerInRound: true as boolean,
		playerRoundWins: 0 as number,
		playerUnitMana: 0 as number,
		playerSpellMana: 0 as number,
		playerSpellManaInDanger: 0 as number,
		isOpponentInRound: true as boolean,
		opponentRoundWins: 0 as number,
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
		setGameId(state, id: string | null): void {
			state.gameId = id
		},

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

		setEndScreenSuppressed(state, value: boolean): void {
			state.endScreenSuppressed = value
		},

		setRuleset(state, value: Ruleset): void {
			state.ruleset = value
		},

		setPlayerRoundWins(state, value: number): void {
			state.playerRoundWins = value
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

		setOpponentRoundWins(state, value: number): void {
			state.opponentRoundWins = value
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

		setGameData(context, payload: GameMessage): void {
			const { commit } = moduleActionContext(context, gameStateModule)
			commit.setGameId(payload.id)
			commit.setRuleset(payload.ruleset)
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
			commit.setEndScreenSuppressed(false)
			commit.setOpponentData(null)
			commit.setIsSpectating(false)
			commit.setIsPlayersTurn(false)
			commit.setPlayerRoundWins(0)
			commit.setOpponentRoundWins(0)
			commit.setIsOpponentInRound(true)
			commit.setTargetingMode(null)
			rootDispatch.gameLogModule.clearLog()
		},
	},
})

export default gameStateModule
