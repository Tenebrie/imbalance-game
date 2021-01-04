import ServerGame from './ServerGame'
import ServerOwnedCard from './ServerOwnedCard'
import ServerCardTarget, {
	ServerAnonymousTargetCard,
	ServerCardTargetCard,
	ServerCardTargetRow,
	ServerCardTargetUnit,
} from './ServerCardTarget'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import ServerAnimation from './ServerAnimation'
import CardType from '@shared/enums/CardType'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import ServerResolveStack from './ServerResolveStack'
import GameEventCreators from './events/GameEventCreators'
import TargetMode from '@shared/enums/TargetMode'
import ServerCard from './ServerCard'
import { DeployTarget } from '@src/game/models/ServerCardTargeting'
import CardTargetMessage from '@shared/models/network/CardTargetMessage'
import TargetType from '@shared/enums/TargetType'
import DeployTargetDefinition from '@src/game/models/targetDefinitions/DeployTargetDefinition'
import {
	CardTargetValidatorArguments,
	RowTargetValidatorArguments,
	UnitTargetValidatorArguments,
} from '@src/types/TargetValidatorArguments'

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
	requestedDeployTargets: DeployTarget[]

	constructor(game: ServerGame) {
		this.game = game
		this.playedCards = []
		this.cardResolveStack = new ServerResolveStack(game)
		this.requestedDeployTargets = []
	}

	public playCard(ownedCard: ServerOwnedCard, rowIndex: number, unitIndex: number): void {
		/*
		 * Check if the card can be played to specified row.
		 * This already includes the check for unit/spell mana
		 * Player is prevented from playing cards on their opponent's turn in IncomingMessageHandlers
		 */
		if (!ownedCard.card.targeting.getPlayTargets(ownedCard.owner).find((target) => target.targetRow.index === rowIndex)) {
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
		this.game.events.postEvent(
			GameEventCreators.cardPlayed({
				owner: owner,
				triggeringCard: card,
			})
		)

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
			roundIndex: this.game.roundIndex,
		})
	}

	private playUnit(ownedCard: ServerOwnedCard, rowIndex: number, unitIndex: number): void {
		const card = ownedCard.card

		/* Start resolving */
		this.cardResolveStack.startResolving(ownedCard, () => this.updateResolvingCardTargetingStatus())

		/* Insert the card into the board */
		const unit = this.game.board.createUnit(card, rowIndex, unitIndex)
		if (unit === null) {
			this.cardResolveStack.finishResolving()
			return
		}

		/* Invoke the card Deploy effect */
		this.game.events.postEvent(
			GameEventCreators.unitDeployed({
				triggeringUnit: unit,
			})
		)
	}

	private playSpell(ownedCard: ServerOwnedCard): void {
		const card = ownedCard.card

		/* Start resolving */
		this.cardResolveStack.startResolving(ownedCard, () => this.updateResolvingCardTargetingStatus())

		/* Invoke the card onPlay effect */
		this.game.events.postEvent(
			GameEventCreators.spellDeployed({
				triggeringCard: card,
			})
		)
	}

	public updateResolvingCardTargetingStatus(): void {
		const currentCard = this.cardResolveStack.currentCard
		if (!currentCard) {
			return
		}

		const validTargets = this.getDeployTargets()

		if (validTargets.length === 0) {
			this.cardResolveStack.finishResolving()
		} else {
			OutgoingMessageHandlers.notifyAboutRequestedCardTargets(
				currentCard.owner.player,
				TargetMode.DEPLOY_EFFECT,
				validTargets.map((deployTarget) => deployTarget.target),
				currentCard.card
			)
		}
		this.requestedDeployTargets = validTargets
	}

	public getDeployTargets(): DeployTarget[] {
		const currentCard = this.cardResolveStack.currentCard
		if (!currentCard) {
			return []
		}
		const card = currentCard?.card

		return card.targeting.getDeployTargets(this.cardResolveStack.previousTargets)
	}

	public selectCardTarget(playerInGame: ServerPlayerInGame, message: CardTargetMessage): void {
		const currentResolvingCard = this.cardResolveStack.currentEntry
		if (!currentResolvingCard) {
			return
		}

		const currentCard = currentResolvingCard.ownedCard.card

		const correspondingTarget = this.requestedDeployTargets.find((target) => target.target.id === message.id)

		if (!correspondingTarget) {
			OutgoingMessageHandlers.notifyAboutRequestedCardTargets(
				playerInGame.player,
				TargetMode.DEPLOY_EFFECT,
				this.requestedDeployTargets.map((deployTarget) => deployTarget.target),
				currentCard
			)
			return
		}

		this.cardResolveStack.pushTarget(correspondingTarget)

		currentResolvingCard.onResumeResolving = () => {
			this.requestedDeployTargets = this.getDeployTargets()
			OutgoingMessageHandlers.notifyAboutRequestedCardTargets(
				playerInGame.player,
				TargetMode.DEPLOY_EFFECT,
				this.requestedDeployTargets.map((deployTarget) => deployTarget.target),
				currentCard
			)

			if (this.requestedDeployTargets.length > 0) {
				return
			}

			this.game.events.postEvent(
				GameEventCreators.cardTargetsConfirmed({
					triggeringCard: currentCard,
					triggeringPlayer: playerInGame,
				})
			)
			this.cardResolveStack.finishResolving()
		}

		const target = correspondingTarget.target
		const targetType = correspondingTarget.definition.targetType
		if (targetType === TargetType.BOARD_ROW && target instanceof ServerCardTargetRow) {
			;(correspondingTarget.definition as DeployTargetDefinition<RowTargetValidatorArguments>).perform({
				sourceCard: currentCard,
				targetRow: target.targetRow,
				previousTargets: this.cardResolveStack.previousTargets.map((deployTarget) => deployTarget.target),
			})
		} else if (targetType === TargetType.UNIT && target instanceof ServerCardTargetUnit) {
			;(correspondingTarget.definition as DeployTargetDefinition<UnitTargetValidatorArguments>).perform({
				sourceCard: currentCard,
				targetCard: target.targetCard,
				targetUnit: target.targetCard.unit!,
				previousTargets: this.cardResolveStack.previousTargets.map((deployTarget) => deployTarget.target),
			})
		} else if (target instanceof ServerCardTargetCard) {
			;(correspondingTarget.definition as DeployTargetDefinition<CardTargetValidatorArguments>).perform({
				sourceCard: currentCard,
				targetCard: target.targetCard,
				previousTargets: this.cardResolveStack.previousTargets.map((deployTarget) => deployTarget.target),
			})
		}

		if (target instanceof ServerCardTargetCard || target instanceof ServerCardTargetUnit) {
			this.game.events.postEvent(
				GameEventCreators.cardTargetCardSelected({
					targetMode: target.targetMode,
					targetType: target.targetType,
					triggeringCard: currentCard,
					triggeringPlayer: playerInGame,
					targetCard: target.targetCard,
				})
			)
			if (target instanceof ServerCardTargetUnit) {
				this.game.events.postEvent(
					GameEventCreators.cardTargetUnitSelected({
						targetMode: target.targetMode,
						targetType: target.targetType,
						triggeringCard: currentCard,
						triggeringPlayer: playerInGame,
						targetCard: target.targetCard,
						targetUnit: target.targetCard.unit!,
					})
				)
			}
		} else {
			this.game.events.postEvent(
				GameEventCreators.cardTargetRowSelected({
					targetMode: target.targetMode,
					targetType: target.targetType,
					triggeringCard: currentCard,
					triggeringPlayer: playerInGame,
					targetRow: target.targetRow,
				})
			)
		}
	}

	public selectPlayerMulliganTarget(playerInGame: ServerPlayerInGame, target: ServerAnonymousTargetCard): void {
		this.game.events.postEvent(
			GameEventCreators.playerTargetSelectedCard({
				targetMode: target.targetMode,
				targetType: target.targetType,
				triggeringPlayer: playerInGame,
				targetCard: target.targetCard,
			})
		)

		const cardsToMulligan = playerInGame.cardHand.unitCards
		const targets = cardsToMulligan.map((card) => ServerCardTarget.anonymousTargetCardInUnitHand(TargetMode.MULLIGAN, card))
		OutgoingMessageHandlers.notifyAboutRequestedAnonymousTargets(playerInGame.player, TargetMode.MULLIGAN, targets)
	}
}
