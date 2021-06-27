import ServerPlayerInGame from '../players/ServerPlayerInGame'
import ServerGame from '../models/ServerGame'
import ServerPlayer from '../players/ServerPlayer'
import IncomingMessageHandlers from '../handlers/IncomingMessageHandlers'
import CardPlayedMessage from '@shared/models/network/CardPlayedMessage'
import CardTargetMessage from '@shared/models/network/CardTargetMessage'
import GameTurnPhase from '@shared/enums/GameTurnPhase'
import ServerCard from '../models/ServerCard'
import CardType from '@shared/enums/CardType'
import { GenericActionMessageType } from '@shared/models/network/messageHandlers/ClientToServerMessageTypes'
import AIBehaviour from '@shared/enums/AIBehaviour'
import { sortCards } from '@shared/Utils'
import ServerEditorDeck from '@src/game/models/ServerEditorDeck'

export default class ServerBotPlayerInGame extends ServerPlayerInGame {
	behaviour: AIBehaviour = AIBehaviour.DEFAULT

	constructor(game: ServerGame, player: ServerPlayer, deck: ServerEditorDeck) {
		super(game, {
			player,
			actualDeck: deck,
			selectedDeck: deck,
		})
		this.initialized = true
	}

	public setBehaviour(behaviour: AIBehaviour): void {
		this.behaviour = behaviour
	}

	public startMulligan(): void {
		setTimeout(() => {
			this.finishMulligan()
		})
	}

	public startTurn(): void {
		super.startTurn()

		setTimeout(() => {
			this.botTakesTheirTurn()
		}, 0)
	}

	public get isBot(): boolean {
		return true
	}

	private botTakesTheirTurn(): void {
		const botTotalPower = this.game.board.getTotalPlayerPower(this)
		const opponentTotalPower = this.opponent ? this.game.board.getTotalPlayerPower(this.opponent) : 0

		const botWonRound = botTotalPower > opponentTotalPower && this.opponent && this.opponent.roundEnded
		const botLostRound = opponentTotalPower > botTotalPower + 55 && this.morale > 1
		const botHasGoodLead = botTotalPower > opponentTotalPower + 40 && this.morale > 1

		if (this.behaviour === AIBehaviour.DEFAULT) {
			if (botHasGoodLead && !botWonRound) {
				while (this.hasAnySpellPlays()) {
					this.botPlaysCard(true)
				}
			}

			if (botWonRound || botLostRound || botHasGoodLead) {
				this.botEndsTurn()
				return
			}

			try {
				while (this.canPlayUnitCard() || (this.hasHighValueSpellPlays() && this.game.turnPhase === GameTurnPhase.DEPLOY)) {
					this.botPlaysCard(false)
				}
			} catch (e) {
				console.error('Unknown AI error', e)
			}
		}
		this.botEndsTurn()
	}

	private botPlaysCard(spellsOnly: boolean): void {
		const baseCards = spellsOnly ? this.cardHand.spellCards : this.cardHand.allCards

		const cards = sortCards(baseCards)
			.filter((card) => card.targeting.getPlayTargets(this, { checkMana: true }).length > 0)
			.map((card) => ({
				card: card,
				bestExpectedValue: this.getBestExpectedValue(card),
			}))
			.sort((a, b) => b.bestExpectedValue - a.bestExpectedValue)

		const selectedCard = cards[0].card

		const validRows = this.game.board.rows
			.filter((row) => row.owner === this)
			.filter((row) => !row.isFull())
			.reverse()

		const distanceFromFront = 0
		const targetRow = validRows[Math.min(distanceFromFront, validRows.length - 1)]
		const cardPlayerMessage = CardPlayedMessage.fromCardOnRow(selectedCard, targetRow.index, targetRow.cards.length)
		IncomingMessageHandlers[GenericActionMessageType.CARD_PLAY](cardPlayerMessage, this.game, this)

		while (this.game.cardPlay.cardResolveStack.hasCards()) {
			this.botChoosesTarget()
		}
	}

	private botChoosesTarget(): void {
		const validTargets = this.game.cardPlay.getDeployTargets().sort((a, b) => b.target.expectedValue - a.target.expectedValue)
		const cardTargetMessage = new CardTargetMessage(validTargets[0].target)
		IncomingMessageHandlers[GenericActionMessageType.CARD_TARGET](cardTargetMessage, this.game, this)
	}

	private botEndsTurn(): void {
		IncomingMessageHandlers[GenericActionMessageType.TURN_END](null, this.game, this)
	}

	private getBestExpectedValue(card: ServerCard): number {
		const targets = card.targeting.getDeployTargets()

		const cardBaseValue = card.type === CardType.SPELL ? card.stats.baseSpellCost * 2 : card.stats.basePower
		const spellExtraValue = this.cardHand.unitCards.length <= 2 ? 1 : 0

		if (targets.length === 0) {
			return card.botEvaluation.expectedValue - cardBaseValue + spellExtraValue
		}
		const bestTargetingValue = targets.sort((a, b) => b.target.expectedValue - a.target.expectedValue)[0].target.expectedValue || 0
		return bestTargetingValue + card.botEvaluation.expectedValue - cardBaseValue + spellExtraValue
	}

	private canPlayUnitCard(): boolean {
		return this.cardHand.unitCards.filter((card) => card.stats.unitCost <= this.unitMana).length > 0
	}

	private hasHighValueSpellPlays(): boolean {
		return (
			sortCards(this.cardHand.spellCards)
				.filter((card) => card.targeting.getPlayTargets(this, { checkMana: true }).length > 0)
				.map((card) => ({
					card: card,
					bestExpectedValue: this.getBestExpectedValue(card),
				}))
				.filter((tuple) => tuple.bestExpectedValue > 0).length > 0
		)
	}

	private hasAnySpellPlays(): boolean {
		return (
			sortCards(this.cardHand.spellCards).filter((card) => card.targeting.getPlayTargets(this, { checkMana: true }).length > 0).length > 0
		)
	}
}
