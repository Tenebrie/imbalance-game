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
import Constants from '@shared/Constants'
import BuffTutoredCard from '../buffs/BuffTutoredCard'
import BuffDuration from '@shared/enums/BuffDuration'
import CardLibrary, {CardConstructor} from '../libraries/CardLibrary'
import CardType from '@shared/enums/CardType'
import GameEventCreators from '../models/GameEventCreators'
import CardFeature from '@shared/enums/CardFeature'
import GameTurnPhase from '@shared/enums/GameTurnPhase'
import Utils from '../../utils/Utils'
import ServerCardTarget from '../models/ServerCardTarget'
import TargetMode from '@shared/enums/TargetMode'

export default class ServerPlayerInGame implements PlayerInGame {
	initialized = false

	game: ServerGame
	leader: ServerCard
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
	cardsPlayed: ServerCard[]
	cardsMulliganed: number

	constructor(game: ServerGame, player: ServerPlayer) {
		this.game = game
		this.player = player
		this.cardHand = new ServerHand(game, this, [], [])
		this.cardDeck = new ServerDeck(game, this, [], [])
		this.cardGraveyard = new ServerGraveyard(this)
		this.morale = Constants.STARTING_PLAYER_MORALE
		this.unitMana = 0
		this.spellMana = 0
		this.mulliganMode = false
		this.turnEnded = true
		this.roundEnded = true
		this.cardsPlayed = []
		this.cardsMulliganed = 0
	}

	public get targetRequired(): boolean {
		if (!this.mulliganMode && this.turnEnded) {
			return false
		}

		const currentResolvingCard = this.game.cardPlay.cardResolveStack.currentCard
		return (this.game.turnPhase === GameTurnPhase.DEPLOY && currentResolvingCard && currentResolvingCard.owner === this) ||
			this.game.turnPhase === GameTurnPhase.MULLIGAN
	}

	public get opponent(): ServerPlayerInGame {
		return this.game.getOpponent(this)
	}

	public isInvertedBoard(): boolean {
		return this.game.players.indexOf(this) === 1
	}

	public canPlaySpell(card: ServerCard, rowIndex: number): boolean {
		const gameBoardRow = this.game.board.rows[rowIndex]
		return this.spellMana >= card.stats.spellCost &&
			!!card.targeting.getValidCardPlayTargets(this).find(playTarget => playTarget.sourceCard === card && playTarget.targetRow === gameBoardRow)
	}

	public canPlayUnit(card: ServerCard, rowIndex: number): boolean {
		const gameBoardRow = this.game.board.rows[rowIndex]
		return this.unitMana >= card.stats.unitCost &&
			!!card.targeting.getValidCardPlayTargets(this).find(playTarget => playTarget.sourceCard === card && playTarget.targetRow === gameBoardRow)
	}

	public drawUnitCards(count: number): ServerCard[] {
		const actualCount = Math.min(count, Constants.UNIT_HAND_SIZE_LIMIT - this.cardHand.unitCards.length)
		const drawnCards = []
		for (let i = 0; i < actualCount; i++) {
			const card = this.cardDeck.drawTopUnit()
			if (!card) {
				// TODO: Fatigue damage?
				continue
			}

			this.cardHand.onUnitDrawn(card)
			drawnCards.push(card)
		}
		return drawnCards
	}

	public drawSpellCards(count: number): ServerCard[] {
		const actualCount = Math.min(count, Constants.SPELL_HAND_SIZE_LIMIT - this.cardHand.spellCards.length)
		const drawnCards = []
		for (let i = 0; i < actualCount; i++) {
			const card = this.cardDeck.drawTopSpell()
			if (!card) {
				// TODO: Fatigue damage?
				continue
			}

			this.cardHand.onSpellDrawn(card)
			drawnCards.push(card)
		}
		return drawnCards
	}

	public summonCardFromUnitDeck(card: ServerCard): void {
		card.buffs.add(BuffTutoredCard, null, BuffDuration.END_OF_THIS_TURN)
		this.cardDeck.removeCard(card)
		this.cardHand.onUnitDrawn(card)
	}

	public createCardFromLibraryFromInstance(prototype: ServerCard): ServerCard {
		const card = CardLibrary.instantiateByInstance(this.game, prototype)
		return this.createCard(card)
	}

	public createCardFromLibraryFromPrototype(prototype: CardConstructor): ServerCard {
		const card = CardLibrary.instantiateByConstructor(this.game, prototype)
		return this.createCard(card)
	}

	public createCardFromLibraryFromClass(cardClass: string): ServerCard {
		const card = CardLibrary.instantiateByClass(this.game, cardClass)
		return this.createCard(card)
	}

	private createCard(card: ServerCard): ServerCard {
		card.buffs.add(BuffTutoredCard, null, BuffDuration.END_OF_THIS_TURN)
		if (card.type === CardType.UNIT) {
			this.cardHand.onUnitDrawn(card)
		} else if (card.type === CardType.SPELL) {
			this.cardHand.onSpellDrawn(card)
		}
		return card
	}

	public mulliganCard(card: ServerCard): void {
		const cardIndex = this.cardHand.unitCards.indexOf(card)
		this.cardHand.removeCard(card)
		this.cardDeck.addUnitToBottom(card)
		const cardToAdd = this.cardDeck.drawTopUnit()
		this.cardHand.addUnit(cardToAdd, cardIndex)
	}

	public useManaForInfuse(mana: number, card: ServerCard): void {
		this.addSpellMana(-mana)
		// TODO: Add special effect
	}

	public refillSpellHand(): void {
		const cardsMissing = Constants.SPELL_HAND_SIZE_MINIMUM - this.cardHand.spellCards.length
		if (cardsMissing > 0) {
			this.drawSpellCards(cardsMissing)
		}
	}

	public dealMoraleDamage(damage: ServerDamageInstance): void {
		this.setMorale(this.morale - damage.value)
	}

	public setMorale(morale: number): void {
		this.morale = morale
		const opponent = this.game.getOpponent(this)
		OutgoingMessageHandlers.notifyAboutMoraleChange(this.player, this)
		OutgoingMessageHandlers.notifyAboutMoraleChange(opponent.player, this)
	}

	public setUnitMana(value: number): void {
		if (this.unitMana === value) { return }

		const delta = value - this.unitMana

		this.unitMana = value
		OutgoingMessageHandlers.notifyAboutManaChange(this, delta)
		OutgoingMessageHandlers.notifyAboutValidActionsChanged(this.game, this)
	}

	public addSpellMana(value: number): void {
		this.setSpellMana(this.spellMana + value)
	}

	public setSpellMana(value: number): void {
		if (this.spellMana === value) { return }

		const delta = value - this.spellMana

		this.spellMana = value
		OutgoingMessageHandlers.notifyAboutManaChange(this, delta)
	}

	public addToPlayedCards(card: ServerCard): void {
		this.cardsPlayed.push(card)
	}

	public startRound(): void {
		if (!this.roundEnded) {
			return
		}
		this.roundEnded = false
		this.cardsPlayed = []
		OutgoingMessageHandlers.notifyAboutRoundStarted(this)
		this.onRoundStart()
	}

	public onRoundStart(): void {
		this.game.events.postEvent(GameEventCreators.roundStarted({
			player: this
		}))
	}

	public startMulligan(): void {
		this.mulliganMode = true
		this.showMulliganCards()
		OutgoingMessageHandlers.notifyAboutCardsMulliganed(this)
	}

	public showMulliganCards(): void {
		const cardsToMulligan = this.cardHand.unitCards
		const targets = Utils.sortCards(cardsToMulligan).map(card => ServerCardTarget.playerTargetCardInUnitDeck(TargetMode.MULLIGAN, card))
		OutgoingMessageHandlers.notifyAboutRequestedTargets(this.player, TargetMode.MULLIGAN, targets)
	}

	public finishMulligan(): void {
		this.mulliganMode = false
		this.cardsMulliganed = 0
		OutgoingMessageHandlers.notifyAboutRequestedTargets(this.player, TargetMode.MULLIGAN, [])
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
		this.game.events.postEvent(GameEventCreators.turnStarted({
			player: this
		}), { allowThreading: true })
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
		this.cardsPlayed = []

		// TODO: Move this to corresponding buffs
		this.cardHand.unitCards.filter(card => card.features.includes(CardFeature.TEMPORARY_CARD)).forEach(card => {
			this.cardHand.discardCard(card)
			this.cardGraveyard.addUnit(card)
		})
		this.cardHand.spellCards.filter(card => card.features.includes(CardFeature.TEMPORARY_CARD)).forEach(card => {
			this.cardHand.discardCard(card)
			this.cardGraveyard.addSpell(card)
		})

		this.game.events.postEvent(GameEventCreators.turnEnded({
			player: this
		}), { allowThreading: true })
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
		this.game.events.postEvent(GameEventCreators.roundEnded({
			player: this
		}))
	}

	static newInstance(game: ServerGame, player: ServerPlayer, cardDeck: ServerTemplateCardDeck): ServerPlayerInGame {
		const playerInGame = new ServerPlayerInGame(game, player)
		playerInGame.leader = CardLibrary.instantiateByInstance(game, cardDeck.leader)
		playerInGame.cardDeck.instantiateFrom(cardDeck)
		return playerInGame
	}
}
