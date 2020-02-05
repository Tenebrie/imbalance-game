import ServerPlayer from './ServerPlayer'
import ServerGame from '../models/ServerGame'
import ServerCard from '../models/ServerCard'
import PlayerInGame from '../shared/models/PlayerInGame'
import ServerCardHand from '../models/ServerCardHand'
import ServerCardDeck from '../models/ServerCardDeck'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import runCardEventHandler from '../utils/runCardEventHandler'
import ServerDamageInstance from '../models/ServerDamageSource'
import Ruleset from '../Ruleset'
import ServerAnimation from '../models/ServerAnimation'
import ServerCardGraveyard from '../models/ServerCardGraveyard'
import TargetMode from '../shared/enums/TargetMode'
import TargetType from '../shared/enums/TargetType'
import TargetValidatorArguments from '../../types/TargetValidatorArguments'
import ServerCardTarget from '../models/ServerCardTarget'
import CardType from '../shared/enums/CardType'

export default class ServerPlayerInGame extends PlayerInGame {
	initialized = false

	game: ServerGame
	player: ServerPlayer
	cardHand: ServerCardHand
	cardDeck: ServerCardDeck
	cardGraveyard: ServerCardGraveyard
	morale: number
	timeUnits: number
	turnEnded: boolean

	targetRequired: boolean
	validRequiredTargets: ServerCardTarget[]
	targetsSelected: ServerCardTarget[]

	constructor(game: ServerGame, player: ServerPlayer, cardDeck: ServerCardDeck) {
		super(player)
		this.game = game
		this.player = player
		this.cardHand = new ServerCardHand(this.player, [])
		this.cardDeck = cardDeck
		this.cardGraveyard = new ServerCardGraveyard(this)
		this.morale = Ruleset.STARTING_PLAYER_MORALE
		this.timeUnits = 0
		this.turnEnded = false

		this.targetRequired = false
		this.targetsSelected = []
	}

	public canPlaySpell(card: ServerCard): boolean {
		return this.timeUnits > 0
	}

	public canPlayUnit(card: ServerCard, rowIndex: number, unitIndex: number): boolean {
		const gameBoardRow = this.game.board.rows[rowIndex]
		if (gameBoardRow.cards.length >= Ruleset.MAX_CARDS_PER_ROW || gameBoardRow.owner !== this) {
			return false
		}

		return this.timeUnits > 0
	}

	public playUnit(card: ServerCard, rowIndex: number, unitIndex: number): void {
		/* Remove card from hand */
		this.cardHand.removeCard(card)

		/* Announce card to opponent */
		const opponent = this.game.getOpponent(this)
		card.reveal(this, opponent)
		OutgoingMessageHandlers.triggerAnimation(opponent.player, ServerAnimation.cardPlay(card))

		/* Insert the card into the board */
		const gameBoardRow = this.game.board.rows[rowIndex]
		const unit = gameBoardRow.playCard(card, this, unitIndex)

		/* Advance the time */
		this.setTimeUnits(this.timeUnits - 1)

		/* Send notifications */
		OutgoingMessageHandlers.notifyAboutPlayerCardDestroyed(this.player, card)
		OutgoingMessageHandlers.notifyAboutOpponentCardDestroyed(opponent.player, card)

		OutgoingMessageHandlers.triggerAnimation(opponent.player, ServerAnimation.delay())

		/* Require play effect targets */
		this.requirePlayTargets(card, { thisCardOwner: this, thisUnit: unit })
	}

	public playSpell(card: ServerCard): void {
		/* Remove card from hand */
		this.cardHand.removeCard(card)

		/* Announce card to opponent */
		const opponent = this.game.getOpponent(this)
		card.reveal(this, opponent)
		OutgoingMessageHandlers.triggerAnimation(opponent.player, ServerAnimation.cardPlay(card))

		/* Invoke the card onPlay effect */
		runCardEventHandler(() => card.onPlaySpell(this))

		/* Advance the time */
		this.setTimeUnits(this.timeUnits - 1)

		/* Send notifications */
		OutgoingMessageHandlers.notifyAboutPlayerCardDestroyed(this.player, card)
		OutgoingMessageHandlers.notifyAboutOpponentCardDestroyed(opponent.player, card)

		/* Spells go directly to the graveyard */
		this.cardGraveyard.addCard(card)
		OutgoingMessageHandlers.notifyAboutPlayerCardInGraveyard(this.player, card)
		OutgoingMessageHandlers.notifyAboutOpponentCardInGraveyard(this.player, card)

		/* Require play effect targets */
		this.requirePlayTargets(card, { thisCardOwner: this })
	}

	public selectCardTarget(target: ServerCardTarget): void {
		const originalTarget = this.validRequiredTargets.find(validTarget => validTarget.isEqual(target))
		if (!originalTarget) {
			OutgoingMessageHandlers.notifyAboutRequiredTarget(this.player, this.validRequiredTargets)
			return
		}

		const sourceUnit = target.sourceUnit
		const sourceCard = target.sourceCard || sourceUnit.card

		if (sourceCard.cardType === CardType.UNIT && target.targetMode === TargetMode.ON_PLAY && target.targetCard) {
			sourceCard.onUnitPlayTargetCardSelected(sourceUnit, target.targetCard)
		}
		if (sourceCard.cardType === CardType.UNIT && target.targetMode === TargetMode.ON_PLAY && target.targetUnit) {
			sourceCard.onUnitPlayTargetUnitSelected(sourceUnit, target.targetUnit)
		}
		if (sourceCard.cardType === CardType.UNIT && target.targetMode === TargetMode.ON_PLAY && target.targetRow) {
			sourceCard.onUnitPlayTargetRowSelected(sourceUnit, target.targetRow)
		}
		if (sourceCard.cardType === CardType.SPELL && target.targetMode === TargetMode.ON_PLAY && target.targetCard) {
			sourceCard.onSpellPlayTargetCardSelected(this, target.targetCard)
		}
		if (sourceCard.cardType === CardType.SPELL && target.targetMode === TargetMode.ON_PLAY && target.targetUnit) {
			sourceCard.onSpellPlayTargetUnitSelected(this, target.targetUnit)
		}
		if (sourceCard.cardType === CardType.SPELL && target.targetMode === TargetMode.ON_PLAY && target.targetRow) {
			sourceCard.onSpellPlayTargetRowSelected(this, target.targetRow)
		}

		this.targetsSelected.push(target)
		this.requirePlayTargets(sourceCard, { thisCardOwner: this, thisUnit: sourceUnit })

		if (this.targetRequired) {
			return
		}

		if (sourceCard.cardType === CardType.UNIT) {
			sourceCard.onUnitPlayTargetsConfirmed(sourceUnit)
		} else if (sourceCard.cardType === CardType.SPELL) {
			sourceCard.onSpellPlayTargetsConfirmed(this)
		}
	}

	public requirePlayTargets(card: ServerCard, args: TargetValidatorArguments): void {
		let validTargets: ServerCardTarget[] = []
		const targetDefinition = card.getPlayRequiredTargetDefinition()

		if (targetDefinition.getTargetCount() > 0) {
			validTargets = []
				.concat(card.getValidTargets(TargetMode.ON_PLAY, TargetType.UNIT, targetDefinition, args, this.targetsSelected))
				.concat(card.getValidTargets(TargetMode.ON_PLAY, TargetType.BOARD_ROW, targetDefinition, args, this.targetsSelected))
		}

		if (validTargets.length > 0) {
			this.targetRequired = true
			this.validRequiredTargets = validTargets
			OutgoingMessageHandlers.notifyAboutRequiredTarget(this.player, validTargets)
		} else if (this.targetRequired) {
			this.targetRequired = false
			this.targetsSelected = []
			this.validRequiredTargets = []
			OutgoingMessageHandlers.notifyAboutRequiredTargetAccepted(this.player)
		}
	}

	public drawCards(count: number): void {
		const actualCount = Math.min(count, Ruleset.HAND_SIZE_LIMIT - this.cardHand.cards.length)
		const cards: ServerCard[] = []
		for (let i = 0; i < actualCount; i++) {
			const card = this.cardDeck.drawCard()
			if (!card) {
				// TODO: Fatigue damage?
				continue
			}

			this.cardHand.drawCard(card)
			cards.push(card)
		}

		OutgoingMessageHandlers.notifyAboutCardsDrawn(this.player, cards)
		const opponent = this.game.getOpponent(this)
		if (opponent) {
			OutgoingMessageHandlers.notifyAboutOpponentCardsDrawn(opponent.player, cards)
		}
	}

	public dealMoraleDamage(damage: ServerDamageInstance): void {
		this.setMorale(this.morale - damage.value)
	}

	public setMorale(morale: number): void {
		this.morale = morale
		const opponent = this.game.getOpponent(this)
		OutgoingMessageHandlers.notifyAboutPlayerMoraleChange(this.player, this)
		OutgoingMessageHandlers.notifyAboutOpponentMoraleChange(opponent.player, this)
	}

	public setTimeUnits(timeUnits: number): void {
		if (this.timeUnits === timeUnits) { return }

		const delta = timeUnits - this.timeUnits

		this.timeUnits = timeUnits
		const opponent = this.game.getOpponent(this)
		OutgoingMessageHandlers.notifyAboutPlayerTimeBankChange(this.player, this, delta)
		OutgoingMessageHandlers.notifyAboutOpponentTimeBankChange(opponent.player, this)
	}

	public startTurn(): void {
		this.turnEnded = false
		OutgoingMessageHandlers.notifyAboutTurnStarted(this.player)
		OutgoingMessageHandlers.notifyAboutUnitValidOrdersChanged(this.game, this)

		const opponent = this.game.getOpponent(this)
		if (opponent) {
			OutgoingMessageHandlers.notifyAboutOpponentTurnStarted(opponent.player)
		}
	}

	public isAnyActionsAvailable(): boolean {
		return this.timeUnits > 0 || !!this.game.board.getUnitsOwnedByPlayer(this).find(unit => unit.getValidOrders().length > 0) || this.targetRequired
	}

	public endTurn(): void {
		this.turnEnded = true

		OutgoingMessageHandlers.notifyAboutTurnEnded(this.player)
		const opponent = this.game.getOpponent(this)
		if (opponent) {
			OutgoingMessageHandlers.notifyAboutOpponentTurnEnded(opponent.player)
		}
	}

	static newInstance(game: ServerGame, player: ServerPlayer, cardDeck: ServerCardDeck) {
		return new ServerPlayerInGame(game, player, cardDeck)
	}
}
