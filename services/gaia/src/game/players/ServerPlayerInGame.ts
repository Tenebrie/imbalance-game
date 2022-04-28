import Constants from '@shared/Constants'
import AIBehaviour from '@shared/enums/AIBehaviour'
import CardFeature from '@shared/enums/CardFeature'
import GameTurnPhase from '@shared/enums/GameTurnPhase'
import TargetMode from '@shared/enums/TargetMode'
import AnonymousTargetMessage from '@shared/models/network/AnonymousTargetMessage'
import CardPlayedMessage from '@shared/models/network/CardPlayedMessage'
import CardTargetMessage from '@shared/models/network/CardTargetMessage'
import { GenericActionMessageType } from '@shared/models/network/messageHandlers/ClientToServerGameMessages'
import PlayerInGame from '@shared/models/PlayerInGame'
import { sortCards } from '@shared/Utils'
import GameCloseReason from '@src/enums/GameCloseReason'
import IncomingMessageHandlers from '@src/game/handlers/IncomingMessageHandlers'
import GameLibrary from '@src/game/libraries/GameLibrary'
import ServerEditorDeck from '@src/game/models/ServerEditorDeck'
import { EventSubscriber } from '@src/game/models/ServerGameEvents'
import ServerPlayerGroup from '@src/game/players/ServerPlayerGroup'
import OvermindClient from '@src/routers/overmind/OvermindClient'
import { getCardBaseExpectedValue, getRandomArrayValue, safeWhile } from '@src/utils/Utils'

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
	startingDeck: ServerTemplateCardDeck
	unitMana: number
	spellMana: number
	isMulliganMode: boolean
	cardsMulliganed: number
	leaderCardUsed: boolean

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
		this.leaderCardUsed = false

		const templateDeck = ServerTemplateCardDeck.fromEditorDeck(game, props.deck)
		this.cardDeck.instantiateFrom(templateDeck)
		this.leader = templateDeck.leader
		this.startingDeck = templateDeck
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

			this.cardHand.addUnitCardAsDraw(card)
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

			this.cardHand.addSpellCardAsDraw(card)
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
		this.cardHand.addUnit(cardToAdd, {
			index: cardIndex,
		})
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
		if (this.cardHand.unitCards.length === 0) {
			IncomingMessageHandlers[GenericActionMessageType.CONFIRM_TARGETS](TargetMode.MULLIGAN, this.game, this)
		}
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

	public markLeaderAsUsed(): void {
		this.leaderCardUsed = true
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
		this.botTakesTheirMulligan().then(() => {
			IncomingMessageHandlers[GenericActionMessageType.CONFIRM_TARGETS](TargetMode.MULLIGAN, this.game, this)
			OutgoingMessageHandlers.executeMessageQueue(this.game)
		})
	}

	public startTurn(): void {
		this.botTakesTheirTurn().then(() => {
			IncomingMessageHandlers[GenericActionMessageType.TURN_END](null, this.game, this)
			OutgoingMessageHandlers.executeMessageQueue(this.game)
		})
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
		const playableCards = this.getCardsWithLeader(this).filter(
			(card) => card.targeting.getPlayTargets(this, { checkMana: true }).length > 0
		)

		if (playableCards.length === 0) {
			return
		}

		const padArray = <T>(value: T[], length: number): (T | null)[] => [...value, ...Array(Math.max(0, length - value.length)).fill(null)]

		const alliedUnits = this.game.board
			.getControlledRows(this)
			.map((row) => row.cards.map((unit) => unit.card))
			.flatMap((arr) => padArray(arr, Constants.MAX_CARDS_PER_ROW))

		const enemyUnits = this.game.board
			.getControlledRows(this.opponent)
			.map((row) => row.cards.map((unit) => unit.card))
			.flatMap((arr) => padArray<ServerCard>(arr, Constants.MAX_CARDS_PER_ROW))

		const cardToPlay = await OvermindClient.getMove(this.overmindId, {
			playableCards,
			allCardsInHand: this.getCardsWithLeader(this),
			alliedUnits,
			enemyUnits,
		})
		this.botPlaysCard(false, cardToPlay)
	}

	private async botTakesTheirMulligan(): Promise<void> {
		const mulligan = (card: ServerCard): void => {
			const message = new AnonymousTargetMessage(ServerCardTarget.anonymousTargetCardInUnitHand(TargetMode.MULLIGAN, card))
			IncomingMessageHandlers[GenericActionMessageType.ANONYMOUS_TARGET](message, this.game, this)
			this.game.events.resolveEvents()
		}

		let mulligansLeft = this.game.maxMulligans - this.cardsMulliganed
		safeWhile(
			() => mulligansLeft > 0,
			(breakWhile) => {
				const interestingCards = this.cardHand.allCards.filter((card) => card.botMetadata.mulliganPreference !== 'ignore')
				if (interestingCards.length === 0) {
					breakWhile()
					return
				}

				const cardsToAvoid = interestingCards.filter((card) => card.botMetadata.mulliganPreference === 'avoid')
				const cardsToKeepSingular = interestingCards
					.filter((card) => card.botMetadata.mulliganPreference === 'singular')
					.map((card) => ({
						card,
						count: interestingCards.filter((filteredCard) => filteredCard.class === card.class).length,
					}))
					.filter((tuple) => tuple.count > 1)
				const cardsToPrefer = this.cardDeck.allCards.filter((card) => card.botMetadata.mulliganPreference === 'prefer')

				const cardToAvoid = getRandomArrayValue(cardsToAvoid)
				const cardToKeepSingular = getRandomArrayValue(cardsToKeepSingular)
				const cardToDigFor = getRandomArrayValue(cardsToPrefer)
				if (cardToAvoid) {
					console.log(`Bot mulliganed ${cardToAvoid.class} because it's to be avoided.`)
					mulligan(cardToAvoid)
				} else if (cardToKeepSingular) {
					console.log(`Bot mulliganed ${cardToKeepSingular.card.class} because it has ${cardToKeepSingular.count} copies of it.`)
					mulligan(cardToKeepSingular.card)
				} else if (cardToDigFor && mulligansLeft > 1) {
					const randomCard = getRandomArrayValue(this.cardHand.allCards.filter((card) => card.botMetadata.mulliganPreference === 'ignore'))
					if (!randomCard) {
						breakWhile()
						return
					}
					mulligan(randomCard)
					console.log(`Bot mulliganed ${randomCard.class} because it's looking for ${cardToDigFor.class}.`)
				} else {
					breakWhile()
					return
				}

				mulligansLeft = this.game.maxMulligans - this.cardsMulliganed
			}
		)
	}

	private async botTakesTheirTurn(): Promise<void> {
		const opponent = this.opponentNullable
		if (!opponent) {
			return
		}
		const botBoonCount = this.game.board.getControlledRows(this).filter((row) => row.hasBoon).length
		const botHazardCount = this.game.board.getControlledRows(this).filter((row) => row.hasHazard).length
		const opponentBoonCount = this.game.board.getControlledRows(opponent).filter((row) => row.hasBoon).length
		const opponentHazardCount = this.game.board.getControlledRows(opponent).filter((row) => row.hasHazard).length

		const botTotalPower = this.game.board.getTotalPlayerPower(this.group) + botBoonCount * 2 - botHazardCount * 2
		const opponentTotalPower = this.game.board.getTotalPlayerPower(opponent) + opponentBoonCount * 2 - opponentHazardCount * 2
		const botCardCount = this.getCardsWithLeader(this).length
		const opponentCardCount = this.getCardsWithLeader(opponent.players[0]).length

		const maxSelfProfit = botCardCount * botBoonCount - botCardCount * opponentHazardCount
		const maxOponentProfit = opponentCardCount * opponentBoonCount - opponentCardCount * botHazardCount

		const bestBotScore = this.getBestPlayableCardScore()
		const botWonRound =
			this.game.board.getTotalPlayerPower(this.group) > this.game.board.getTotalPlayerPower(opponent) && opponent.roundEnded
		const botLostRound = opponentTotalPower + maxOponentProfit > botTotalPower + bestBotScore + maxSelfProfit && opponent.roundWins === 0
		const botHasGoodLead =
			(botTotalPower > opponentTotalPower + 11 ||
				(botTotalPower > opponentTotalPower && botCardCount > opponentCardCount) ||
				(botTotalPower > opponentTotalPower && maxOponentProfit > maxSelfProfit)) &&
			this.opponent.roundWins === 0

		if (this.behaviour === AIBehaviour.DEFAULT) {
			if (botWonRound || botLostRound || botHasGoodLead) {
				return
			}

			try {
				safeWhile(
					() => this.canPlayUnitCard(),
					() => {
						this.botPlaysCard(false)
					}
				)
			} catch (e) {
				console.error('Unknown AI error', e)
			}
		} else if (this.behaviour === AIBehaviour.RANDOM) {
			try {
				let attempts = 0
				while (this.canPlayUnitCard() && attempts < 10) {
					attempts += 1
					const playableCards = this.getCardsWithLeader(this).filter(
						(card) => card.targeting.getPlayTargets(this, { checkMana: true }).length > 0
					)
					const card = getRandomArrayValue(playableCards)
					if (!card) {
						break
					}
					this.botPlaysCard(false, card.id)
				}
			} catch (e) {
				console.error('Unknown AI error', e)
				GameLibrary.destroyGame(this.game, GameCloseReason.AI_ACTION_LOGIC_ERROR)
			}
		} else if (this.behaviour === AIBehaviour.OVERMIND) {
			if (botWonRound || botLostRound || botHasGoodLead) {
				return
			}

			try {
				let attempts = 0
				while (this.canPlayUnitCard() && attempts < 10) {
					attempts += 1
					await this.overmindPlaysCard()
				}
			} catch (e) {
				console.error('Unknown AI error', e)
				GameLibrary.destroyGame(this.game, GameCloseReason.AI_ACTION_LOGIC_ERROR)
			}
		}
	}

	private botPlaysCard(spellsOnly: boolean, targetCardId?: string): void {
		const baseCards = spellsOnly ? this.cardHand.spellCards : this.getCardsWithLeader(this)

		const cards = sortCards(baseCards)
			.filter((card) => card.targeting.getPlayTargets(this, { checkMana: true }).length > 0)
			.map((card) => ({
				card: card,
				bestExpectedValue: card.botMetadata.evaluateBotScore() - getCardBaseExpectedValue(card),
			}))
			.sort((a, b) => b.bestExpectedValue - a.bestExpectedValue)
		console.info(
			'Bot card weights:',
			cards.map((card) => ({
				card: card.card.class,
				value: card.bestExpectedValue,
			}))
		)

		const selectedCard = targetCardId ? cards.find((card) => card.card.id === targetCardId)?.card : cards[0].card
		if (!selectedCard) {
			throw new Error(`Unable to find a card with id ${targetCardId}!`)
		}

		const validRows = this.game.board.rows
			.filter((row) => row.owner === this.group)
			.filter((row) => !row.isFull())
			.map((row) => ({
				row,
				expectedScore: selectedCard.botMetadata.evaluateBotPlayRowScore({
					card: selectedCard,
					owner: selectedCard.ownerPlayer,
					targetRow: row,
					targetPosition: row.farRightUnitIndex,
				}),
			}))
			.sort((a, b) => b.expectedScore - a.expectedScore)

		if (validRows.length === 0) {
			return
		}
		const highestScore = validRows[0].expectedScore
		const rowsWithHighestScore = validRows.filter((row) => row.expectedScore === highestScore)
		const targetRow = getRandomArrayValue(rowsWithHighestScore)
		if (!targetRow) {
			return
		}

		const cardPlayerMessage = CardPlayedMessage.fromCardOnRow(selectedCard, targetRow.row.index, targetRow.row.cards.length)
		IncomingMessageHandlers[GenericActionMessageType.CARD_PLAY](cardPlayerMessage, this.game, this)

		safeWhile(
			() => this.game.cardPlay.cardResolveStack.hasCards(),
			() => {
				this.botChoosesTarget()
			}
		)
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

	private getBestPlayableCardScore(): number {
		return (
			sortCards(this.getCardsWithLeader(this))
				.filter((card) => card.targeting.getPlayTargets(this, { checkMana: true }).length > 0)
				.map((card) => ({
					card: card,
					bestExpectedValue: card.botMetadata.evaluateExpectedScore(),
				}))
				.sort((a, b) => b.bestExpectedValue - a.bestExpectedValue)[0]?.bestExpectedValue || 0
		)
	}

	private getCardsWithLeader(player: ServerPlayerInGame): ServerCard[] {
		return player.cardHand.allCards.concat(player.leader.features.includes(CardFeature.UNPLAYABLE) ? [] : player.leader)
	}

	private canPlayUnitCard(): boolean {
		const cards = this.getCardsWithLeader(this)
		return cards.filter((card) => card.targeting.getPlayTargets(this, { checkMana: true }).length > 0).length > 0
	}
}
