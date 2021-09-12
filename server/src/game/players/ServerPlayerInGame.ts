import Constants from '@shared/Constants'
import AIBehaviour from '@shared/enums/AIBehaviour'
import CardType from '@shared/enums/CardType'
import GameTurnPhase from '@shared/enums/GameTurnPhase'
import TargetMode from '@shared/enums/TargetMode'
import CardPlayedMessage from '@shared/models/network/CardPlayedMessage'
import CardTargetMessage from '@shared/models/network/CardTargetMessage'
import { GenericActionMessageType } from '@shared/models/network/messageHandlers/ClientToServerGameMessages'
import PlayerInGame from '@shared/models/PlayerInGame'
import { sortCards } from '@shared/Utils'
import IncomingMessageHandlers from '@src/game/handlers/IncomingMessageHandlers'
import GameLibrary from '@src/game/libraries/GameLibrary'
import ServerEditorDeck from '@src/game/models/ServerEditorDeck'
import { EventSubscriber } from '@src/game/models/ServerGameEvents'
import ServerPlayerGroup from '@src/game/players/ServerPlayerGroup'
import OvermindClient from '@src/routers/overmind/OvermindClient'

import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import GameEventCreators from '../models/events/GameEventCreators'
import ServerCard from '../models/ServerCard'
import ServerCardTarget from '../models/ServerCardTarget'
import ServerDeck from '../models/ServerDeck'
import ServerGame from '../models/ServerGame'
import ServerGraveyard from '../models/ServerGraveyard'
import ServerHand from '../models/ServerHand'
import ServerTemplateCardDeck from '../models/ServerTemplateCardDeck'
import ServerPlayer from './ServerPlayer'

type Props = {
	player: ServerPlayer
	deck: ServerEditorDeck
}

export default class ServerPlayerInGame implements PlayerInGame {
	initialized = false

	game: ServerGame
	player: ServerPlayer
	cardHand: ServerHand
	cardDeck: ServerDeck
	cardGraveyard: ServerGraveyard
	unitMana: number
	spellMana: number
	isMulliganMode: boolean
	cardsMulliganed: number

	private __leader: ServerCard | null

	constructor(game: ServerGame, props: Props) {
		this.game = game
		this.player = props.player
		this.__leader = null
		this.cardHand = new ServerHand(game, this, [], [])
		this.cardDeck = new ServerDeck(game, this, [], [])
		this.cardGraveyard = new ServerGraveyard(this)
		this.unitMana = 0
		this.spellMana = 0
		this.isMulliganMode = false
		this.cardsMulliganed = 0

		const templateDeck = ServerTemplateCardDeck.fromEditorDeck(game, props.deck)
		this.cardDeck.instantiateFrom(templateDeck)
		this.leader = templateDeck.leader
	}

	public get group(): ServerPlayerGroup {
		return this.game.players.find((group) => group.players.includes(this))!
	}

	public get leader(): ServerCard {
		if (!this.__leader) {
			throw new Error('Player has no leader')
		}
		return this.__leader
	}

	public set leader(value: ServerCard) {
		this.__leader = value
	}

	public get targetRequired(): boolean {
		if (!this.group.mulliganMode && this.group.turnEnded) {
			return false
		}

		const currentResolvingCard = this.game.cardPlay.cardResolveStack.currentCard
		return (
			(this.game.turnPhase === GameTurnPhase.DEPLOY && currentResolvingCard && currentResolvingCard.owner === this) ||
			this.game.turnPhase === GameTurnPhase.MULLIGAN
		)
	}

	public get opponentNullable(): ServerPlayerGroup | null {
		return this.game.getOpponent(this.group)
	}

	public get opponent(): ServerPlayerGroup {
		const opponent = this.opponentNullable
		if (!opponent) {
			throw new Error('No opponent available!')
		}
		return opponent
	}

	public isInvertedBoard(): boolean {
		return this.game.players.indexOf(this.group) === 1
	}

	public get isHuman(): boolean {
		return true
	}

	public get isBot(): boolean {
		return false
	}

	public startTurn(): void {
		/* Not used for human players. See `ServerBotPlayerInGame`. */
	}

	public drawUnitCards(count: number, drawFromBottom = false): ServerCard[] {
		const actualCount = Math.min(count, this.game.ruleset.constants.UNIT_HAND_SIZE_LIMIT - this.cardHand.unitCards.length)
		const drawnCards = []
		for (let i = 0; i < actualCount; i++) {
			const card = drawFromBottom ? this.cardDeck.drawBottomUnit() : this.cardDeck.drawTopUnit()
			if (!card) {
				continue
			}

			this.cardHand.addCardAsDraw(card)
			drawnCards.push(card)
		}
		return drawnCards
	}

	public drawSpellCards(count: number): ServerCard[] {
		const actualCount = Math.min(count, this.game.ruleset.constants.SPELL_HAND_SIZE_LIMIT - this.cardHand.spellCards.length)
		const drawnCards = []
		for (let i = 0; i < actualCount; i++) {
			const card = this.cardDeck.drawTopSpell()
			if (!card) {
				continue
			}

			this.cardHand.addCardAsDraw(card)
			drawnCards.push(card)
		}
		return drawnCards
	}

	public mulliganCard(card: ServerCard): void {
		const cardIndex = this.cardHand.unitCards.indexOf(card)
		this.cardHand.removeCard(card)
		this.cardDeck.addUnitToBottom(card)
		const cardToAdd = this.cardDeck.drawTopUnit()
		if (!cardToAdd) {
			return
		}
		this.cardHand.addUnit(cardToAdd, cardIndex)
		this.game.events.postEvent(
			GameEventCreators.cardDrawn({
				game: this.game,
				owner: this,
				triggeringCard: cardToAdd,
			})
		)
	}

	public refillSpellHand(): void {
		const cardsMissing = this.game.ruleset.constants.SPELL_HAND_SIZE_MINIMUM - this.cardHand.spellCards.length
		if (cardsMissing > 0) {
			this.drawSpellCards(cardsMissing)
		}
	}

	public addUnitMana(value: number): void {
		this.setUnitMana(this.unitMana + value)
	}

	public setUnitMana(value: number): void {
		if (this.unitMana === value) {
			return
		}

		const delta = value - this.unitMana

		this.unitMana = value
		OutgoingMessageHandlers.notifyAboutManaChange(this, delta)
	}

	public addSpellMana(value: number, source: EventSubscriber): void {
		this.setSpellMana(this.spellMana + value, source)
	}

	public setSpellMana(value: number, source: EventSubscriber): void {
		if (this.spellMana === value) {
			return
		}

		const delta = value - this.spellMana

		if (delta > 0) {
			this.game.events.postEvent(
				GameEventCreators.spellManaGenerated({
					game: this.game,
					player: this,
					count: delta,
					source,
				})
			)
		}

		this.spellMana = value
		OutgoingMessageHandlers.notifyAboutManaChange(this, delta)
	}

	public startMulligan(): void {
		this.isMulliganMode = true
		this.showMulliganCards()
		OutgoingMessageHandlers.notifyAboutCardsMulliganed(this.player, this)
	}

	public showMulliganCards(): void {
		const cardsToMulligan = this.cardHand.unitCards
		const targets = sortCards(cardsToMulligan).map((card) => ServerCardTarget.anonymousTargetCardInUnitHand(TargetMode.MULLIGAN, card))
		OutgoingMessageHandlers.notifyAboutRequestedAnonymousTargets(this.player, TargetMode.MULLIGAN, targets)
	}

	public finishMulligan(): void {
		this.isMulliganMode = false
		OutgoingMessageHandlers.notifyAboutRequestedAnonymousTargets(this.player, TargetMode.MULLIGAN, [])
	}

	public resetMulliganState(): void {
		this.cardsMulliganed = 0
	}

	public disconnect(): void {
		this.player.disconnectGameSocket()
		this.initialized = false
	}
}

export class ServerBotPlayerInGame extends ServerPlayerInGame {
	public readonly behaviour: AIBehaviour

	private overmindId!: string

	constructor(game: ServerGame, player: ServerPlayer, deck: ServerEditorDeck, behaviour: AIBehaviour) {
		super(game, {
			player,
			deck,
		})
		this.behaviour = behaviour
		this.initialized = true
	}

	public startMulligan(): void {
		super.startMulligan()
		setTimeout(() => {
			IncomingMessageHandlers[GenericActionMessageType.CONFIRM_TARGETS](TargetMode.MULLIGAN, this.game, this)
		}, 0)
	}

	public startTurn(): void {
		// if (this.behaviour === AIBehaviour.OVERMIND) {
		// 	this.overmindTakesTheirTurn()
		// 	return
		// }
		setTimeout(() => {
			this.botTakesTheirTurn()
			OutgoingMessageHandlers.executeMessageQueue(this.game)
		}, 0)
	}

	public get isHuman(): boolean {
		return false
	}

	public get isBot(): boolean {
		return true
	}

	public setOvermindId(id: string): void {
		this.overmindId = id
	}

	private async overmindPlaysCard(): Promise<void> {
		const playableCards = this.cardHand.unitCards.filter((card) => card.targeting.getPlayTargets(this, { checkMana: true }).length > 0)

		const padArray = <T>(value: T[], length: number): (T | null)[] => [...value, ...Array(Math.max(0, length - value.length)).fill(null)]

		const alliedUnits = this.game.board
			.getControlledRows(this)
			.map((row) => row.cards.map((unit) => unit.card))
			.flatMap((arr) => padArray(arr, Constants.MAX_CARDS_PER_ROW))

		const enemyUnits = this.game.board
			.getControlledRows(this.opponent)
			.map((row) => row.cards.map((unit) => unit.card))
			.flatMap((arr) => padArray<ServerCard>(arr, Constants.MAX_CARDS_PER_ROW))

		console.log(`Requesting move for agent ${this.overmindId}`)
		const cardToPlay = await OvermindClient.getMove(this.overmindId, {
			playableCards,
			allCardsInHand: this.cardHand.unitCards,
			alliedUnits,
			enemyUnits,
		})
		console.log(`Received Overmind response: ${cardToPlay}.`)
		this.botPlaysCard(false, cardToPlay)
	}

	private async botTakesTheirTurn(): Promise<void> {
		const botTotalPower = this.game.board.getTotalPlayerPower(this.group)
		const opponentTotalPower = this.opponentNullable ? this.game.board.getTotalPlayerPower(this.opponentNullable) : 0

		const botWonRound = botTotalPower > opponentTotalPower && this.opponentNullable && this.opponentNullable.roundEnded
		const botLostRound = opponentTotalPower > botTotalPower + 55 && this.opponent.roundWins === 0
		const botHasGoodLead = botTotalPower > opponentTotalPower + 40 && this.opponent.roundWins === 0

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
		} else if (this.behaviour === AIBehaviour.OVERMIND) {
			if (botWonRound || botLostRound || botHasGoodLead) {
				this.botEndsTurn()
				return
			}

			try {
				while (this.canPlayUnitCard()) {
					await this.overmindPlaysCard()
				}
			} catch (e) {
				console.error('Unknown AI error', e)
				GameLibrary.destroyGame(this.game, 'Error')
			}
		}
		this.botEndsTurn()
	}

	private botPlaysCard(spellsOnly: boolean, targetCardId?: string): void {
		const baseCards = spellsOnly ? this.cardHand.spellCards : this.cardHand.allCards

		const cards = sortCards(baseCards)
			.filter((card) => card.targeting.getPlayTargets(this, { checkMana: true }).length > 0)
			.map((card) => ({
				card: card,
				bestExpectedValue: this.getBestExpectedValue(card),
			}))
			.sort((a, b) => b.bestExpectedValue - a.bestExpectedValue)

		const selectedCard = targetCardId ? cards.find((card) => card.card.id === targetCardId)?.card : cards[0].card
		if (!selectedCard) {
			throw new Error(`Unable to find a card with id ${targetCardId}!`)
		}

		const validRows = this.game.board.rows
			.filter((row) => row.owner === this.group)
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
		const validDeployTargets = this.game.cardPlay.getDeployTargets().sort((a, b) => b.target.expectedValue - a.target.expectedValue)
		if (validDeployTargets.length > 0) {
			const cardTargetMessage = new CardTargetMessage(validDeployTargets[0].target)
			IncomingMessageHandlers[GenericActionMessageType.CARD_TARGET](cardTargetMessage, this.game, this)
		}
		const validPlayTargets = this.game.cardPlay.getPlayTargets().sort((a, b) => b.target.expectedValue - a.target.expectedValue)
		if (validPlayTargets.length > 0) {
			const cardTargetMessage = new CardTargetMessage(validPlayTargets[0].target)
			IncomingMessageHandlers[GenericActionMessageType.CARD_TARGET](cardTargetMessage, this.game, this)
		}
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
