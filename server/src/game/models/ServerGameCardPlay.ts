import ServerGame from './ServerGame'
import ServerOwnedCard from './ServerOwnedCard'
import ServerCardTarget, {ServerCardTargetCard, ServerCardTargetRow} from './ServerCardTarget'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import ServerAnimation from './ServerAnimation'
import CardType from '@shared/enums/CardType'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import ServerResolveStack from './ServerResolveStack'
import GameEventCreators from './GameEventCreators'
import Utils from '../../utils/Utils'
import TargetMode from '@shared/enums/TargetMode'

export default class ServerGameCardPlay {
	game: ServerGame
	cardResolveStack: ServerResolveStack

	constructor(game: ServerGame) {
		this.game = game
		this.cardResolveStack = new ServerResolveStack(game)
	}

	public playCard(ownedCard: ServerOwnedCard, rowIndex: number, unitIndex: number): void {
		/* Deduct mana */
		ownedCard.owner.setUnitMana(ownedCard.owner.unitMana - Math.max(0, ownedCard.card.stats.unitCost))
		ownedCard.owner.setSpellMana(ownedCard.owner.spellMana - Math.max(0, ownedCard.card.stats.spellCost))

		/* Resolve card */
		this.forcedPlayCardFromHand(ownedCard, rowIndex, unitIndex)
	}

	public forcedPlayCardFromHand(ownedCard: ServerOwnedCard, rowIndex: number, unitIndex: number): void {
		this.forcedPlayCard(ownedCard, rowIndex, unitIndex, 'hand')
	}

	public forcedPlayCardFromDeck(ownedCard: ServerOwnedCard, rowIndex: number, unitIndex: number): void {
		this.forcedPlayCard(ownedCard, rowIndex, unitIndex, 'deck')
	}

	private forcedPlayCard(ownedCard: ServerOwnedCard, rowIndex: number, unitIndex: number, source: 'hand' | 'deck'): void {
		const card = ownedCard.card
		const owner = ownedCard.owner

		/* Remember played card */
		owner.addToPlayedCards(card)

		/* Trigger card played event */
		this.game.events.postEvent(GameEventCreators.cardPlayed({
			owner: owner,
			triggeringCard: card,
		}))

		/* Announce card to opponent */
		OutgoingMessageHandlers.triggerAnimationForPlayer(owner.opponent!.player, ServerAnimation.cardAnnounce(card))

		/* Remove card from source */
		if (source === 'hand' && owner.cardHand.findCardById(card.id)) {
			owner.cardHand.removeCard(card)
		} else if (source === 'deck' && owner.cardDeck.findCardById(card.id)) {
			owner.cardDeck.removeCard(card)
		}

		/* Resolve card */
		if (card.type === CardType.UNIT) {
			this.playUnit(ownedCard, rowIndex, unitIndex)
		} else if (card.type === CardType.SPELL) {
			this.playSpell(ownedCard)
		}

		/* Play animation */
		OutgoingMessageHandlers.triggerAnimationForPlayer(owner.opponent!.player, ServerAnimation.delay())
	}

	private playUnit(ownedCard: ServerOwnedCard, rowIndex: number, unitIndex: number): void {
		const card = ownedCard.card
		const owner = ownedCard.owner

		/* Start resolving */
		this.cardResolveStack.startResolving(ownedCard)
		this.cardResolveStack.onResumeResolving(() => this.checkCardTargeting(ownedCard))

		/* Insert the card into the board */
		const unit = this.game.board.createUnit(card, owner, rowIndex, unitIndex)
		if (unit !== null) {
			/* Invoke the card Deploy effect */
			this.game.events.postEvent(GameEventCreators.unitDeployed({
				triggeringUnit: unit
			}))
			if (this.cardResolveStack.currentCard?.card === card) {
				this.cardResolveStack.resumeResolving()
			}
		}
	}

	private playSpell(ownedCard: ServerOwnedCard): void {
		const card = ownedCard.card

		/* Start resolving */
		this.cardResolveStack.startResolving(ownedCard)
		this.cardResolveStack.onResumeResolving(() => this.checkCardTargeting(ownedCard))

		/* Invoke the card onPlay effect */
		this.game.events.postEvent(GameEventCreators.spellDeployed({
			triggeringCard: card
		}))
		if (this.cardResolveStack.currentCard?.card === card) {
			this.cardResolveStack.resumeResolving()
		}
	}

	public checkCardTargeting(ownedCard: ServerOwnedCard): void {
		const validTargets = this.getValidTargets()

		if (validTargets.length === 0) {
			this.cardResolveStack.finishResolving()
		} else {
			OutgoingMessageHandlers.notifyAboutRequestedTargets(ownedCard.owner.player, TargetMode.DEPLOY_EFFECT, Utils.shuffle(validTargets))
		}
	}

	public getValidTargets(): (ServerCardTargetCard | ServerCardTargetRow)[] {
		const currentCard = this.cardResolveStack.currentCard
		if (!currentCard) {
			return []
		}
		const card = currentCard?.card

		return card.targeting.getDeployEffectTargets(this.cardResolveStack.currentTargets)
	}

	public selectCardTarget(playerInGame: ServerPlayerInGame, target: ServerCardTargetCard | ServerCardTargetRow): void {
		const currentResolvingCard = this.cardResolveStack.currentCard
		if (!currentResolvingCard) {
			return
		}

		let validTargets = this.getValidTargets()
		const isValidTarget = !!validTargets.find(validTarget => validTarget.isEqual(target))
		if (!isValidTarget) {
			OutgoingMessageHandlers.notifyAboutRequestedTargets(playerInGame.player, TargetMode.DEPLOY_EFFECT, Utils.shuffle(validTargets))
			return
		}

		this.cardResolveStack.pushTarget(target)

		this.cardResolveStack.onResumeResolving(() => {
			validTargets = this.getValidTargets()
			OutgoingMessageHandlers.notifyAboutRequestedTargets(playerInGame.player,TargetMode.DEPLOY_EFFECT, Utils.shuffle(validTargets))

			if (validTargets.length > 0) {
				return
			}

			this.game.events.postEvent(GameEventCreators.cardTargetsConfirmed({
				triggeringCard: currentResolvingCard.card,
				triggeringPlayer: playerInGame,
			}))
			this.cardResolveStack.finishResolving()
		})

		if (target instanceof ServerCardTargetCard) {
			this.game.events.postEvent(GameEventCreators.cardTargetCardSelected({
				targetMode: target.targetMode,
				targetType: target.targetType,
				triggeringCard: currentResolvingCard.card,
				triggeringPlayer: playerInGame,
				targetCard: target.targetCard,
			}))
			if (target.targetCard.unit) {
				this.game.events.postEvent(GameEventCreators.cardTargetUnitSelected({
					targetMode: target.targetMode,
					targetType: target.targetType,
					triggeringCard: currentResolvingCard.card,
					triggeringPlayer: playerInGame,
					targetCard: target.targetCard,
					targetUnit: target.targetCard.unit
				}))
			}
		} else {
			this.game.events.postEvent(GameEventCreators.cardTargetRowSelected({
				targetMode: target.targetMode,
				targetType: target.targetType,
				triggeringCard: currentResolvingCard.card,
				triggeringPlayer: playerInGame,
				targetRow: target.targetRow,
			}))
		}

		if (this.cardResolveStack.currentCard === currentResolvingCard) {
			this.cardResolveStack.resumeResolving()
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
			OutgoingMessageHandlers.notifyAboutRequestedTargets(playerInGame.player, TargetMode.MULLIGAN, Utils.shuffle(validTargets))
			return
		}
	}
}
