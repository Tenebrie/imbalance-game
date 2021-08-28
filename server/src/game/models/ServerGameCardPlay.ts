import ServerGame from './ServerGame'
import ServerOwnedCard from './ServerOwnedCard'
import ServerCardTarget, {
	ServerAnonymousTargetCard,
	ServerCardTargetCard,
	ServerCardTargetPosition,
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
import { DeployTarget, PlayTarget } from '@src/game/models/ServerCardTargeting'
import CardTargetMessage from '@shared/models/network/CardTargetMessage'
import TargetType from '@shared/enums/TargetType'
import DeployTargetDefinition from '@src/game/models/targetDefinitions/DeployTargetDefinition'
import {
	CardTargetValidatorArguments,
	PositionTargetValidatorArguments,
	RowTargetValidatorArguments,
	UnitTargetValidatorArguments,
} from '@src/types/TargetValidatorArguments'
import CardTarget from '@shared/models/CardTarget'

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

	public playCardAsPlayerAction(ownedCard: ServerOwnedCard, rowIndex: number, unitIndex: number): void {
		/*
		 * Check if the card can be played to specified row.
		 * This already includes the check for unit/spell mana
		 * Player is prevented from playing cards on their opponent's turn in IncomingMessageHandlers
		 */
		const owner = ownedCard.owner
		if (
			!ownedCard.card.targeting
				.getPlayTargets(owner, { checkMana: true })
				.map((playTarget) => playTarget.target)
				.find(({ targetRow, targetPosition }) => targetRow.index === rowIndex && targetPosition === unitIndex)
		) {
			return
		}

		/* Deduct mana */
		ownedCard.owner.setUnitMana(ownedCard.owner.unitMana - Math.max(0, ownedCard.card.stats.unitCost))
		ownedCard.owner.setSpellMana(ownedCard.owner.spellMana - Math.max(0, ownedCard.card.stats.spellCost))

		/* Resolve card */
		this.playCard(ownedCard, rowIndex, unitIndex, 'hand')
	}

	public playCardFromHand(ownedCard: ServerOwnedCard, rowIndex: number, unitIndex: number): void {
		if (!this.game.board.isExtraUnitPlayableToRow(rowIndex)) {
			return
		}

		this.playCard(ownedCard, rowIndex, unitIndex, 'hand')
	}

	public playCardToResolutionStack(ownedCard: ServerOwnedCard): void {
		/* Start resolving */
		const targetMode = ownedCard.card.type === CardType.UNIT ? TargetMode.CARD_PLAY : TargetMode.DEPLOY_EFFECT
		this.cardResolveStack.startResolvingImmediately(ownedCard, targetMode, () => this.updateResolvingCardTargetingStatus())

		this.game.events.postEvent(
			GameEventCreators.cardPlayed({
				game: this.game,
				owner: ownedCard.owner,
				triggeringCard: ownedCard.card,
			})
		)
		if (ownedCard.card.type === CardType.UNIT && ownedCard.card.unit) {
			/* Invoke the card Deploy effect */
			this.game.events.postEvent(
				GameEventCreators.unitDeployed({
					game: this.game,
					owner: ownedCard.owner,
					triggeringUnit: ownedCard.card.unit,
				})
			)
		} else if (ownedCard.card.type === CardType.SPELL) {
			/* Invoke the card onPlay effect */
			this.game.events.postEvent(
				GameEventCreators.spellDeployed({
					game: this.game,
					owner: ownedCard.owner,
					triggeringCard: ownedCard.card,
				})
			)
		}
	}

	private playCard(ownedCard: ServerOwnedCard, rowIndex: number, unitIndex: number, source: 'hand' | 'deck' | 'aether'): void {
		const card = ownedCard.card
		const owner = ownedCard.owner

		/* Announce card to other players */
		const otherPlayers = this.game.allPlayers.filter((player) => player !== ownedCard.owner)
		OutgoingMessageHandlers.triggerAnimationForPlayers(otherPlayers, ServerAnimation.cardAnnounce(card))
		OutgoingMessageHandlers.triggerAnimationForPlayers(otherPlayers, ServerAnimation.clearAnnouncedCard(card))

		/* Remove card from source */
		if (source === 'hand' && owner.cardHand.findCardById(card.id)) {
			owner.cardHand.removeCard(card)
		} else if (source === 'deck' && owner.cardDeck.findCardById(card.id)) {
			owner.cardDeck.removeCard(card)
		}
		/* Trigger card played event */
		this.game.events.postEvent(
			GameEventCreators.cardPlayed({
				game: this.game,
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
		if (owner.opponent) {
			OutgoingMessageHandlers.triggerAnimationForPlayers(owner.opponent.players, ServerAnimation.delay(500))
		}

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
		this.cardResolveStack.startResolvingImmediately(ownedCard, TargetMode.DEPLOY_EFFECT, () => this.updateResolvingCardTargetingStatus())

		/* Insert the card into the board */
		const unit = this.game.board.createUnit(card, ownedCard.owner, rowIndex, unitIndex)
		if (unit === null) {
			this.cardResolveStack.finishResolving()
			return
		}

		/* Invoke the card Deploy effect */
		this.game.events.postEvent(
			GameEventCreators.unitDeployed({
				game: this.game,
				triggeringUnit: unit,
				owner: ownedCard.owner,
			})
		)
	}

	private playSpell(ownedCard: ServerOwnedCard): void {
		const card = ownedCard.card

		/* Start resolving */
		this.cardResolveStack.startResolvingImmediately(ownedCard, TargetMode.DEPLOY_EFFECT, () => this.updateResolvingCardTargetingStatus())

		/* Invoke the card onPlay effect */
		this.game.events.postEvent(
			GameEventCreators.spellDeployed({
				game: this.game,
				triggeringCard: card,
				owner: ownedCard.owner,
			})
		)
	}

	public updateResolvingCardTargetingStatus(): void {
		const currentEntry = this.cardResolveStack.currentEntry
		if (!currentEntry) {
			return
		}

		const validTargets = this.getResolvingCardTargets()

		if (validTargets.length === 0) {
			this.cardResolveStack.finishResolving()
		}
		OutgoingMessageHandlers.notifyAboutRequestedCardTargets(
			currentEntry.ownedCard.owner.player,
			currentEntry.targetMode,
			validTargets.map((wrapper) => wrapper.target),
			currentEntry.ownedCard.card
		)
	}

	public getResolvingCardTargets(): (PlayTarget | DeployTarget)[] {
		const currentEntry = this.cardResolveStack.currentEntry
		if (!currentEntry) {
			return []
		}

		if (currentEntry.targetMode === TargetMode.CARD_PLAY) {
			return this.getPlayTargets()
		} else if (currentEntry.targetMode === TargetMode.DEPLOY_EFFECT) {
			return this.getDeployTargets()
		}
		console.error(`Unable to resolve card with mode ${currentEntry.targetMode}. It will be skipped.`, currentEntry)
		return []
	}

	public getPlayTargets(): PlayTarget[] {
		const currentCard = this.cardResolveStack.currentCard
		if (!currentCard) {
			return []
		}
		const card = currentCard.card

		return card.targeting.getPlayTargets(card.ownerPlayer, { checkMana: false })
	}

	public getDeployTargets(): DeployTarget[] {
		const currentCard = this.cardResolveStack.currentCard
		if (!currentCard) {
			return []
		}
		const card = currentCard?.card

		return card.targeting.getDeployTargets(this.cardResolveStack.previousTargets)
	}

	public selectCardTarget(playerInGame: ServerPlayerInGame, message: CardTargetMessage | CardTarget): void {
		const currentEntry = this.cardResolveStack.currentEntry
		if (!currentEntry) {
			return
		}

		const currentCard = currentEntry.ownedCard.card

		const validTargets = this.getResolvingCardTargets()
		const correspondingTarget = validTargets.find((wrapper) => wrapper.target.id === message.id)

		if (!correspondingTarget) {
			OutgoingMessageHandlers.notifyAboutInvalidTarget(playerInGame.player, currentEntry.targetMode, currentCard)
			OutgoingMessageHandlers.notifyAboutRequestedCardTargets(
				playerInGame.player,
				currentEntry.targetMode,
				validTargets.map((wrapper) => wrapper.target),
				currentCard
			)
			return
		}

		this.cardResolveStack.pushTarget(correspondingTarget)

		const target = correspondingTarget.target
		const targetMode = correspondingTarget.target.targetMode
		const targetType = correspondingTarget.definition.targetType
		if (targetMode === TargetMode.CARD_PLAY && target instanceof ServerCardTargetPosition) {
			this.cardResolveStack.finishResolving()
			this.playCard(currentEntry.ownedCard, target.targetRow.index, target.targetPosition, 'aether')
		} else if (targetMode === TargetMode.DEPLOY_EFFECT) {
			if (targetType === TargetType.BOARD_ROW && target instanceof ServerCardTargetRow) {
				;(correspondingTarget.definition as DeployTargetDefinition<RowTargetValidatorArguments>).perform({
					player: playerInGame,
					sourceCard: currentCard,
					targetRow: target.targetRow,
					previousTargets: this.cardResolveStack.previousTargets.map((deployTarget) => deployTarget.target),
				})
			} else if (targetType === TargetType.BOARD_POSITION && target instanceof ServerCardTargetPosition) {
				;(correspondingTarget.definition as DeployTargetDefinition<PositionTargetValidatorArguments>).perform({
					player: playerInGame,
					sourceCard: currentCard,
					targetRow: target.targetRow,
					targetPosition: target.targetPosition,
					previousTargets: this.cardResolveStack.previousTargets.map((deployTarget) => deployTarget.target),
				})
			} else if (targetType === TargetType.UNIT && target instanceof ServerCardTargetUnit) {
				;(correspondingTarget.definition as DeployTargetDefinition<UnitTargetValidatorArguments>).perform({
					player: playerInGame,
					sourceCard: currentCard,
					targetCard: target.targetCard,
					targetUnit: target.targetCard.unit!,
					previousTargets: this.cardResolveStack.previousTargets.map((deployTarget) => deployTarget.target),
				})
			} else if (target instanceof ServerCardTargetCard) {
				;(correspondingTarget.definition as DeployTargetDefinition<CardTargetValidatorArguments>).perform({
					player: playerInGame,
					sourceCard: currentCard,
					targetCard: target.targetCard,
					previousTargets: this.cardResolveStack.previousTargets.map((deployTarget) => deployTarget.target),
				})
			}

			if (target instanceof ServerCardTargetCard || target instanceof ServerCardTargetUnit) {
				this.game.events.postEvent(
					GameEventCreators.cardTargetCardSelected({
						game: this.game,
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
							game: this.game,
							targetMode: target.targetMode,
							targetType: target.targetType,
							triggeringCard: currentCard,
							triggeringPlayer: playerInGame,
							targetCard: target.targetCard,
							targetUnit: target.targetCard.unit!,
						})
					)
				}
			}

			if (target instanceof ServerCardTargetRow || target instanceof ServerCardTargetPosition) {
				this.game.events.postEvent(
					GameEventCreators.cardTargetRowSelected({
						game: this.game,
						targetMode: target.targetMode,
						targetType: target.targetType,
						triggeringCard: currentCard,
						triggeringPlayer: playerInGame,
						targetRow: target.targetRow,
					})
				)
				if (target instanceof ServerCardTargetPosition) {
					this.game.events.postEvent(
						GameEventCreators.cardTargetPositionSelected({
							game: this.game,
							targetMode: target.targetMode,
							targetType: target.targetType,
							triggeringCard: currentCard,
							triggeringPlayer: playerInGame,
							targetRow: target.targetRow,
							targetPosition: target.targetPosition,
						})
					)
				}
			}
		}

		currentEntry.onResumeResolving = () => {
			const updatedTargets = this.getResolvingCardTargets()
			OutgoingMessageHandlers.notifyAboutRequestedCardTargets(
				playerInGame.player,
				currentEntry.targetMode,
				updatedTargets.map((wrapper) => wrapper.target),
				currentCard
			)

			if (updatedTargets.length > 0) {
				return
			}

			const target = correspondingTarget.target
			const targetMode = correspondingTarget.target.targetMode
			const targetType = correspondingTarget.definition.targetType
			if (targetMode === TargetMode.DEPLOY_EFFECT) {
				if (targetType === TargetType.BOARD_ROW && target instanceof ServerCardTargetRow) {
					;(correspondingTarget.definition as DeployTargetDefinition<RowTargetValidatorArguments>).finalize({
						player: playerInGame,
						sourceCard: currentCard,
						targetRow: target.targetRow,
						previousTargets: this.cardResolveStack.previousTargets.map((deployTarget) => deployTarget.target),
					})
				} else if (targetType === TargetType.BOARD_POSITION && target instanceof ServerCardTargetPosition) {
					;(correspondingTarget.definition as DeployTargetDefinition<PositionTargetValidatorArguments>).finalize({
						player: playerInGame,
						sourceCard: currentCard,
						targetRow: target.targetRow,
						targetPosition: target.targetPosition,
						previousTargets: this.cardResolveStack.previousTargets.map((deployTarget) => deployTarget.target),
					})
				} else if (targetType === TargetType.UNIT && target instanceof ServerCardTargetUnit) {
					;(correspondingTarget.definition as DeployTargetDefinition<UnitTargetValidatorArguments>).finalize({
						player: playerInGame,
						sourceCard: currentCard,
						targetCard: target.targetCard,
						targetUnit: target.targetCard.unit!,
						previousTargets: this.cardResolveStack.previousTargets.map((deployTarget) => deployTarget.target),
					})
				} else if (target instanceof ServerCardTargetCard) {
					;(correspondingTarget.definition as DeployTargetDefinition<CardTargetValidatorArguments>).finalize({
						player: playerInGame,
						sourceCard: currentCard,
						targetCard: target.targetCard,
						previousTargets: this.cardResolveStack.previousTargets.map((deployTarget) => deployTarget.target),
					})
				}

				this.game.events.postEvent(
					GameEventCreators.cardTargetsConfirmed({
						game: this.game,
						triggeringCard: currentCard,
						triggeringPlayer: playerInGame,
					})
				)
			}

			this.cardResolveStack.finishResolving()
		}
	}

	public selectPlayerMulliganTarget(playerInGame: ServerPlayerInGame, target: ServerAnonymousTargetCard): void {
		this.game.events.postEvent(
			GameEventCreators.playerMulliganedCard({
				game: this.game,
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
