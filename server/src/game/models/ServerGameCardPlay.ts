import ServerGame from './ServerGame'
import ServerOwnedCard from './ServerOwnedCard'
import {ServerCardTargetCard, ServerCardTargetRow, ServerCardTargetUnit} from './ServerCardTarget'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import ServerAnimation from './ServerAnimation'
import CardType from '@shared/enums/CardType'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import ServerResolveStack from './ServerResolveStack'
import GameEventCreators from './events/GameEventCreators'
import Utils from '../../utils/Utils'
import TargetMode from '@shared/enums/TargetMode'
import ServerCard from './ServerCard'

type PlayedCard = {
	card: ServerCard
	player: ServerPlayerInGame
	turnIndex: number
	roundIndex: number
}

export default class ServerGameCardPlay {
	game: ServerGame
	playedCards: PlayedCard[]
	cardResolveStack: ServerResolveStack

	constructor(game: ServerGame) {
		this.game = game
		this.playedCards = []
		this.cardResolveStack = new ServerResolveStack(game)
	}

	public playCard(ownedCard: ServerOwnedCard, rowIndex: number, unitIndex: number): void {
		/*
		 * Check if the card can be played to specified row.
		 * This already includes the check for unit/spell mana
		 * Player is prevented from playing cards on their opponent's turn in IncomingMessageHandlers
		 */
		if (!ownedCard.card.targeting.getValidCardPlayTargets(ownedCard.owner).find(target => target.targetRow.index === rowIndex)) {
			return
		}

		/* Deduct mana */
		ownedCard.owner.setUnitMana(ownedCard.owner.unitMana - Math.max(0, ownedCard.card.stats.unitCost))
		ownedCard.owner.setSpellMana(ownedCard.owner.spellMana - Math.max(0, ownedCard.card.stats.spellCost))

		/* Resolve card */
		this.forcedPlayCard(ownedCard, rowIndex, unitIndex, 'hand')
	}

	public forcedPlayCardFromHand(ownedCard: ServerOwnedCard, rowIndex: number, unitIndex: number): void {
		if (!this.game.board.isExtraUnitPlayableToRow(rowIndex)) {
			return
		}

		this.forcedPlayCard(ownedCard, rowIndex, unitIndex, 'hand')
	}

	private forcedPlayCard(ownedCard: ServerOwnedCard, rowIndex: number, unitIndex: number, source: 'hand' | 'deck'): void {
		const card = ownedCard.card
		const owner = ownedCard.owner

		/* Announce card to opponent */
		OutgoingMessageHandlers.triggerAnimationForPlayer(owner.opponent!.player, ServerAnimation.cardAnnounce(card))

		/* Remove card from source */
		if (source === 'hand' && owner.cardHand.findCardById(card.id)) {
			owner.cardHand.removeCard(card)
		} else if (source === 'deck' && owner.cardDeck.findCardById(card.id)) {
			owner.cardDeck.removeCard(card)
		}

		/* Trigger card played event */
		this.game.events.postEvent(GameEventCreators.cardPlayed({
			owner: owner,
			triggeringCard: card,
		}))

		/* Resolve card */
		if (card.type === CardType.UNIT) {
			this.playUnit(ownedCard, rowIndex, unitIndex)
		} else if (card.type === CardType.SPELL) {
			this.playSpell(ownedCard)
		}

		/* Play animation */
		OutgoingMessageHandlers.triggerAnimationForPlayer(owner.opponent!.player, ServerAnimation.delay())

		/* Remember played card */
		this.playedCards.push({
			card: card,
			player: owner,
			turnIndex: this.game.turnIndex,
			roundIndex: this.game.roundIndex
		})
	}

	private playUnit(ownedCard: ServerOwnedCard, rowIndex: number, unitIndex: number): void {
		const card = ownedCard.card
		const owner = ownedCard.owner

		/* Start resolving */
		this.cardResolveStack.startResolving(ownedCard, () => this.updateResolvingCardTargetingStatus())

		/* Insert the card into the board */
		const unit = this.game.board.createUnit(card, owner, rowIndex, unitIndex)
		if (unit === null) {
			this.cardResolveStack.finishResolving()
			return
		}

		/* Invoke the card Deploy effect */
		this.game.events.postEvent(GameEventCreators.unitDeployed({
			triggeringUnit: unit
		}))
	}

	private playSpell(ownedCard: ServerOwnedCard): void {
		const card = ownedCard.card

		/* Start resolving */
		this.cardResolveStack.startResolving(ownedCard, () => this.updateResolvingCardTargetingStatus())

		/* Invoke the card onPlay effect */
		this.game.events.postEvent(GameEventCreators.spellDeployed({
			triggeringCard: card
		}))
	}

	public updateResolvingCardTargetingStatus(): void {
		const currentCard = this.cardResolveStack.currentCard
		if (!currentCard) {
			return
		}

		const validTargets = this.getValidTargets()

		if (validTargets.length === 0) {
			this.cardResolveStack.finishResolving()
		} else {
			OutgoingMessageHandlers.notifyAboutRequestedTargets(currentCard.owner.player, TargetMode.DEPLOY_EFFECT, Utils.shuffle(validTargets), currentCard.card)
		}
	}

	public getValidTargets(): (ServerCardTargetUnit | ServerCardTargetCard | ServerCardTargetRow)[] {
		const currentCard = this.cardResolveStack.currentCard
		if (!currentCard) {
			return []
		}
		const card = currentCard?.card

		return card.targeting.getDeployEffectTargets(this.cardResolveStack.currentTargets)
	}

	public selectCardTarget(playerInGame: ServerPlayerInGame, target: ServerCardTargetUnit | ServerCardTargetCard | ServerCardTargetRow): void {
		const currentResolvingCard = this.cardResolveStack.currentEntry
		if (!currentResolvingCard) {
			return
		}

		const currentCard = currentResolvingCard.ownedCard.card
		let validTargets = this.getValidTargets()
		const isValidTarget = !!validTargets.find(validTarget => validTarget.isEqual(target))
		if (!isValidTarget) {
			OutgoingMessageHandlers.notifyAboutRequestedTargets(playerInGame.player, TargetMode.DEPLOY_EFFECT, Utils.shuffle(validTargets), currentCard)
			return
		}

		this.cardResolveStack.pushTarget(target)

		currentResolvingCard.onResumeResolving = () => {
			validTargets = this.getValidTargets()
			OutgoingMessageHandlers.notifyAboutRequestedTargets(playerInGame.player,TargetMode.DEPLOY_EFFECT, Utils.shuffle(validTargets), currentCard)

			if (validTargets.length > 0) {
				return
			}

			this.game.events.postEvent(GameEventCreators.cardTargetsConfirmed({
				triggeringCard: currentCard,
				triggeringPlayer: playerInGame,
			}))
			this.cardResolveStack.finishResolving()
		}

		if (target instanceof ServerCardTargetCard || target instanceof ServerCardTargetUnit) {
			this.game.events.postEvent(GameEventCreators.cardTargetCardSelected({
				targetMode: target.targetMode,
				targetType: target.targetType,
				triggeringCard: currentCard,
				triggeringPlayer: playerInGame,
				targetCard: target.targetCard,
			}))
			if (target instanceof ServerCardTargetUnit) {
				this.game.events.postEvent(GameEventCreators.cardTargetUnitSelected({
					targetMode: target.targetMode,
					targetType: target.targetType,
					triggeringCard: currentCard,
					triggeringPlayer: playerInGame,
					targetCard: target.targetCard,
					targetUnit: target.targetCard.unit!
				}))
			}
		} else {
			this.game.events.postEvent(GameEventCreators.cardTargetRowSelected({
				targetMode: target.targetMode,
				targetType: target.targetType,
				triggeringCard: currentCard,
				triggeringPlayer: playerInGame,
				targetRow: target.targetRow,
			}))
		}
	}

	public selectPlayerMulliganTarget(playerInGame: ServerPlayerInGame, target: ServerCardTargetCard): void {
		this.game.events.postEvent(GameEventCreators.playerTargetSelectedCard({
			targetMode: target.targetMode,
			targetType: target.targetType,
			triggeringPlayer: playerInGame,
			targetCard: target.targetCard,
		}))

		const validTargets = this.getValidTargets()

		if (validTargets.length > 0) {
			OutgoingMessageHandlers.notifyAboutRequestedTargets(playerInGame.player, TargetMode.MULLIGAN, Utils.shuffle(validTargets), null)
			return
		}
	}
}
