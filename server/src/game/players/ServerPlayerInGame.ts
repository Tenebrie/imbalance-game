import ServerPlayer from './ServerPlayer'
import ServerGame from '../models/ServerGame'
import ServerCard from '../models/ServerCard'
import PlayerInGame from '@shared/models/PlayerInGame'
import ServerHand from '../models/ServerHand'
import ServerDeck from '../models/ServerDeck'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import ServerDamageInstance from '../models/ServerDamageSource'
import ServerGraveyard from '../models/ServerGraveyard'
import ServerTemplateCardDeck from '../models/ServerTemplateCardDeck'
import GameEventCreators from '../models/events/GameEventCreators'
import CardFeature from '@shared/enums/CardFeature'
import GameTurnPhase from '@shared/enums/GameTurnPhase'
import ServerCardTarget from '../models/ServerCardTarget'
import TargetMode from '@shared/enums/TargetMode'
import { sortCards } from '@shared/Utils'
import ServerEditorDeck from '@src/game/models/ServerEditorDeck'

export default class ServerPlayerInGame implements PlayerInGame {
	initialized = false

	game: ServerGame
	player: ServerPlayer
	cardHand: ServerHand
	cardDeck: ServerDeck
	cardGraveyard: ServerGraveyard
	morale: number
	unitMana: number
	spellMana: number
	mulliganMode: boolean
	turnEnded: boolean
	roundEnded: boolean
	cardsMulliganed: number
	startingDeck: ServerEditorDeck

	private __leader: ServerCard | null

	constructor(game: ServerGame, player: ServerPlayer, actualDeck: ServerEditorDeck, selectedDeck: ServerEditorDeck) {
		this.game = game
		this.player = player
		this.__leader = null
		this.cardHand = new ServerHand(game, this, [], [])
		this.cardDeck = new ServerDeck(game, this, [], [])
		this.cardGraveyard = new ServerGraveyard(this)
		this.morale = game.ruleset.constants.STARTING_PLAYER_MORALE
		this.unitMana = 0
		this.spellMana = 0
		this.mulliganMode = false
		this.turnEnded = true
		this.roundEnded = true
		this.cardsMulliganed = 0
		this.startingDeck = selectedDeck

		const templateDeck = ServerTemplateCardDeck.fromEditorDeck(game, actualDeck)
		this.cardDeck.instantiateFrom(templateDeck)
		this.leader = templateDeck.leader
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
		if (!this.mulliganMode && this.turnEnded) {
			return false
		}

		const currentResolvingCard = this.game.cardPlay.cardResolveStack.currentCard
		return (
			(this.game.turnPhase === GameTurnPhase.DEPLOY && currentResolvingCard && currentResolvingCard.owner === this) ||
			this.game.turnPhase === GameTurnPhase.MULLIGAN
		)
	}

	public get opponent(): ServerPlayerInGame | null {
		return this.game.getOpponent(this)
	}

	public get opponentInGame(): ServerPlayerInGame {
		const opponent = this.opponent
		if (!opponent) {
			throw new Error('No opponent available!')
		}
		return opponent
	}

	public isInvertedBoard(): boolean {
		return this.game.players.indexOf(this) === 1
	}

	public get isBot(): boolean {
		return false
	}

	public drawUnitCards(count: number, drawFromBottom = false): ServerCard[] {
		const actualCount = Math.min(count, this.game.ruleset.constants.UNIT_HAND_SIZE_LIMIT - this.cardHand.unitCards.length)
		const drawnCards = []
		for (let i = 0; i < actualCount; i++) {
			const card = drawFromBottom ? this.cardDeck.drawBottomUnit() : this.cardDeck.drawTopUnit()
			if (!card) {
				continue
			}

			this.cardHand.drawUnit(card)
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

			this.cardHand.drawSpell(card)
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

	public dealMoraleDamage(damage: ServerDamageInstance): void {
		this.setMorale(this.morale - damage.value)
	}

	public setMorale(morale: number): void {
		this.morale = morale
		const opponent = this.game.getOpponent(this)!
		OutgoingMessageHandlers.notifyAboutMoraleChange(this.player, this)
		OutgoingMessageHandlers.notifyAboutMoraleChange(opponent.player, this)
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

	public addSpellMana(value: number): void {
		this.setSpellMana(this.spellMana + value)
	}

	public setSpellMana(value: number): void {
		if (this.spellMana === value) {
			return
		}

		const delta = value - this.spellMana

		this.spellMana = value
		OutgoingMessageHandlers.notifyAboutManaChange(this, delta)
	}

	public startRound(): void {
		if (!this.roundEnded) {
			return
		}
		this.roundEnded = false
		OutgoingMessageHandlers.notifyAboutRoundStarted(this)
		this.onRoundStart()
	}

	public onRoundStart(): void {
		if (this.game.roundIndex === 0) {
			this.game.events.postEvent(
				GameEventCreators.gameStarted({
					game: this.game,
					player: this,
				})
			)
		}
		this.game.events.postEvent(
			GameEventCreators.roundStarted({
				game: this.game,
				player: this,
			})
		)
	}

	public startMulligan(): void {
		this.mulliganMode = true
		this.showMulliganCards()
		OutgoingMessageHandlers.notifyAboutCardsMulliganed(this.player, this)
	}

	public showMulliganCards(): void {
		const cardsToMulligan = this.cardHand.unitCards
		const targets = sortCards(cardsToMulligan).map((card) => ServerCardTarget.anonymousTargetCardInUnitHand(TargetMode.MULLIGAN, card))
		OutgoingMessageHandlers.notifyAboutRequestedAnonymousTargets(this.player, TargetMode.MULLIGAN, targets)
	}

	public finishMulligan(): void {
		this.mulliganMode = false
		this.cardsMulliganed = 0
		OutgoingMessageHandlers.notifyAboutRequestedAnonymousTargets(this.player, TargetMode.MULLIGAN, [])
	}

	public startTurn(): void {
		if (!this.turnEnded) {
			return
		}
		this.turnEnded = false
		this.mulliganMode = false
		this.setUnitMana(1)
		this.refillSpellHand()
		OutgoingMessageHandlers.notifyAboutTurnStarted(this)
		this.onTurnStart()
		OutgoingMessageHandlers.notifyAboutValidActionsChanged(this.game, this)
	}

	public onTurnStart(): void {
		this.game.events.postEvent(
			GameEventCreators.turnStarted({
				game: this.game,
				player: this,
			})
		)
	}

	public endTurn(): void {
		if (this.turnEnded) {
			return
		}
		this.turnEnded = true
		OutgoingMessageHandlers.notifyAboutTurnEnded(this)
		this.onTurnEnd()
	}

	public onTurnEnd(): void {
		this.cardHand.unitCards
			.filter((card) => card.features.includes(CardFeature.TEMPORARY_CARD))
			.forEach((card) => {
				this.cardHand.discardCard(card)
				this.cardGraveyard.addUnit(card)
			})
		this.cardHand.spellCards
			.filter((card) => card.features.includes(CardFeature.TEMPORARY_CARD))
			.forEach((card) => {
				this.cardHand.discardCard(card)
				this.cardGraveyard.addSpell(card)
			})

		this.game.events.postEvent(
			GameEventCreators.turnEnded({
				game: this.game,
				player: this,
			})
		)
	}

	public endRound(): void {
		if (this.roundEnded) {
			return
		}
		this.endTurn()
		this.roundEnded = true
		OutgoingMessageHandlers.notifyAboutRoundEnded(this)
		this.onEndRound()
	}

	public onEndRound(): void {
		this.game.events.postEvent(
			GameEventCreators.roundEnded({
				game: this.game,
				player: this,
			})
		)
	}

	public disconnect(): void {
		this.player.disconnect()
		this.initialized = false
	}
}
