import ServerGame from './ServerGame'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import ServerCardTarget, {
	ServerCardTargetCard,
	ServerCardTargetPosition,
	ServerCardTargetRow,
	ServerCardTargetUnit,
} from './ServerCardTarget'
import TargetMode from '@shared/enums/TargetMode'
import TargetType, { CardTargetTypes } from '@shared/enums/TargetType'
import CardFeature from '@shared/enums/CardFeature'
import GameLibrary from '../libraries/CardLibrary'
import ServerCard from './ServerCard'
import PlayTargetDefinition from '@src/game/models/targetDefinitions/PlayTargetDefinition'
import PlayTargetDefinitionBuilder from '@src/game/models/targetDefinitions/PlayTargetDefinitionBuilder'
import DeployTargetDefinitionBuilder from '@src/game/models/targetDefinitions/DeployTargetDefinitionBuilder'
import TargetValidatorArguments, {
	PositionTargetValidatorArguments,
	RowTargetValidatorArguments,
	UnitTargetValidatorArguments,
} from '@src/types/TargetValidatorArguments'
import DeployTargetDefinition from '@src/game/models/targetDefinitions/DeployTargetDefinition'
import OrderTargetDefinitionBuilder from '@src/game/models/targetDefinitions/OrderTargetDefinitionBuilder'
import OrderTargetDefinition from '@src/game/models/targetDefinitions/OrderTargetDefinition'
import { OrderTarget } from '@src/game/models/ServerBoardOrders'
import { ResolutionStackTarget } from './ServerResolveStack'
import { sortCards } from '@shared/Utils'

export type ValidServerCardTarget = ServerCardTargetCard | ServerCardTargetUnit | ServerCardTargetRow | ServerCardTargetPosition

export type PlayTarget = {
	target: ServerCardTargetPosition
	definition: PlayTargetDefinition
}

export type DeployTarget = {
	target: ValidServerCardTarget
	definition: DeployTargetDefinition<any>
}

export class ServerCardTargeting {
	private readonly card: ServerCard
	private readonly game: ServerGame

	public playTargetDefinitions: PlayTargetDefinitionBuilder[] = []
	public deployTargetDefinitions: DeployTargetDefinitionBuilder<TargetValidatorArguments>[] = []
	public orderTargetDefinitions: OrderTargetDefinitionBuilder<TargetValidatorArguments>[] = []

	constructor(card: ServerCard) {
		this.card = card
		this.game = card.game
	}

	/*
	 * ------------------------------------
	 *            Play targets
	 * ------------------------------------
	 */
	public getPlayTargets(cardOwner: ServerPlayerInGame, attrs: { checkMana: boolean }): PlayTarget[] {
		if (this.card.features.includes(CardFeature.PASSIVE)) {
			return []
		}

		if (attrs.checkMana && (cardOwner.unitMana < this.card.stats.unitCost || cardOwner.spellMana < this.card.stats.spellCost)) {
			return []
		}

		if (this.playTargetDefinitions.length === 0) {
			this.playTargetDefinitions = [PlayTargetDefinitionBuilder.base(this.game)]
		}
		const targetDefinitions = this.getPlayTargetDefinitions()

		return targetDefinitions
			.map((targetDefinition) => {
				return this.game.board.rows
					.flatMap((row, index) => {
						const positions = [...Array(row.cards.length + 1).keys()]
						return positions.map((pos) => ({
							row: row,
							position: pos,
							rowIndex: index,
						}))
					})
					.filter((rowPosition) =>
						targetDefinition.require({
							card: this.card,
							owner: cardOwner,
							targetRow: rowPosition.row,
							targetPosition: rowPosition.position,
						})
					)
					.map((target) => ({
						target: ServerCardTarget.cardTargetPosition(targetDefinition.id, TargetMode.CARD_PLAY, this.card, target.row, target.position),
						definition: targetDefinition,
					}))
			})
			.flat()
	}

	/*
	 * ------------------------------------
	 *          Deploy targets
	 * ------------------------------------
	 */
	public getDeployTargets(previousTargets: ResolutionStackTarget[] = []): DeployTarget[] {
		const mappedDefinitions = this.getDeployTargetDefinitions()
			.filter((targetDefinition) => targetDefinition.totalTargetCount > previousTargets.length)
			.map((targetDefinition) => ({
				targets: this.getDeployTargetsForDefinition(targetDefinition, previousTargets),
				definition: targetDefinition,
			}))
		const deployTargets: DeployTarget[] = []
		mappedDefinitions.forEach((mappedDefinition) => {
			mappedDefinition.targets.forEach((target) => {
				deployTargets.push({
					target: target,
					definition: mappedDefinition.definition,
				})
			})
		})
		return deployTargets
	}

	private getDeployTargetsForDefinition(
		targetDefinition: DeployTargetDefinition<TargetValidatorArguments>,
		previousTargets: ResolutionStackTarget[] = []
	): ValidServerCardTarget[] {
		const applicableTargets = previousTargets.filter((previousTarget) => {
			return previousTarget.definition.id === targetDefinition.id
		})

		if (applicableTargets.length >= targetDefinition.targetCount) {
			return []
		}

		switch (targetDefinition.targetType) {
			case TargetType.UNIT:
				return this.getDeployTargetsForDefinitionAsUnits(targetDefinition, previousTargets)
			case TargetType.BOARD_ROW:
				return this.getDeployTargetsForDefinitionAsRows(targetDefinition, previousTargets)
			case TargetType.BOARD_POSITION:
				return this.getDeployTargetsForDefinitionAsPositions(targetDefinition, previousTargets)
			default:
				return this.getDeployTargetsForDefinitionAsCards(targetDefinition.targetType, targetDefinition, previousTargets)
		}
	}

	private getDeployTargetsForDefinitionAsUnits(
		targetDefinition: DeployTargetDefinition<UnitTargetValidatorArguments>,
		previousTargets: ResolutionStackTarget[]
	): ValidServerCardTarget[] {
		return this.game.board
			.getAllUnits()
			.filter((unit) => !unit.card.features.includes(CardFeature.UNTARGETABLE))
			.filter((unit) =>
				targetDefinition.require({
					player: this.card.ownerPlayer,
					sourceCard: this.card,
					targetCard: unit.card,
					targetUnit: unit,
					previousTargets: previousTargets.map((wrapper) => wrapper.target),
				})
			)
			.map((unit) => ({
				unit: unit,
				expectedValue: targetDefinition.evaluate(
					{
						player: this.card.ownerPlayer,
						sourceCard: this.card,
						targetCard: unit.card,
						targetUnit: unit,
						previousTargets: previousTargets.map((wrapper) => wrapper.target),
					},
					0
				),
			}))
			.map((tuple) => ({
				unit: tuple.unit,
				expectedValue: Math.max(
					tuple.expectedValue * tuple.unit.card.botEvaluation.threatMultiplier,
					tuple.unit.card.botEvaluation.baseThreat
				),
			}))
			.map((tuple) =>
				ServerCardTarget.cardTargetUnit(
					targetDefinition.id,
					TargetMode.DEPLOY_EFFECT,
					this.card,
					tuple.unit,
					tuple.expectedValue,
					targetDefinition.label
				)
			)
	}

	public getDeployTargetsForDefinitionAsRows(
		targetDefinition: DeployTargetDefinition<RowTargetValidatorArguments>,
		previousTargets: ResolutionStackTarget[] = []
	): ServerCardTargetRow[] {
		return this.game.board.rows
			.filter((row) =>
				targetDefinition.require({
					player: this.card.ownerPlayer,
					sourceCard: this.card,
					targetRow: row,
					previousTargets: previousTargets.map((previousTarget) => previousTarget.target),
				})
			)
			.map((targetRow) =>
				ServerCardTarget.cardTargetRow(targetDefinition.id, TargetMode.DEPLOY_EFFECT, this.card, targetRow, targetDefinition.label)
			)
	}

	public getDeployTargetsForDefinitionAsPositions(
		targetDefinition: DeployTargetDefinition<PositionTargetValidatorArguments>,
		previousTargets: ResolutionStackTarget[] = []
	): ServerCardTargetPosition[] {
		return this.game.board.rows
			.flatMap((row, index) => {
				const positions = [...Array(row.cards.length + 1).keys()]
				return positions.map((pos) => ({
					row: row,
					position: pos,
					rowIndex: index,
				}))
			})
			.filter((rowPosition) =>
				targetDefinition.require({
					player: this.card.ownerPlayer,
					sourceCard: this.card,
					targetRow: rowPosition.row,
					targetPosition: rowPosition.position,
					previousTargets: previousTargets.map((previousTarget) => previousTarget.target),
				})
			)
			.map((target) =>
				ServerCardTarget.cardTargetPosition(
					targetDefinition.id,
					TargetMode.DEPLOY_EFFECT,
					this.card,
					target.row,
					target.position,
					targetDefinition.label
				)
			)
	}

	public getDeployTargetsForDefinitionAsCards(
		targetType: CardTargetTypes,
		targetDefinition: DeployTargetDefinition<any>,
		previousTargets: ResolutionStackTarget[]
	): ServerCardTargetCard[] {
		let targets: ServerCardTargetCard[] = []
		if (targetType === TargetType.CARD_IN_LIBRARY) {
			targets = this.getValidCardLibraryTargets(targetDefinition, previousTargets)
		} else if (targetType === TargetType.CARD_IN_UNIT_HAND) {
			targets = this.getValidUnitHandTargets(targetDefinition, previousTargets)
		} else if (targetType === TargetType.CARD_IN_SPELL_HAND) {
			targets = this.getValidSpellHandTargets(targetDefinition, previousTargets)
		} else if (targetType === TargetType.CARD_IN_UNIT_DECK) {
			targets = this.getValidUnitDeckTargets(targetDefinition, previousTargets)
		} else if (targetType === TargetType.CARD_IN_SPELL_DECK) {
			targets = this.getValidSpellDeckTargets(targetDefinition, previousTargets)
		} else if (targetType === TargetType.CARD_IN_UNIT_GRAVEYARD) {
			targets = this.getValidUnitGraveyardTargets(targetDefinition, previousTargets)
		} else if (targetType === TargetType.CARD_IN_SPELL_GRAVEYARD) {
			targets = this.getValidSpellGraveyardTargets(targetDefinition, previousTargets)
		}

		return targets
	}

	private getValidCardLibraryTargets(
		targetDefinition: DeployTargetDefinition<any>,
		previousTargets: ResolutionStackTarget[] = []
	): ServerCardTargetCard[] {
		return sortCards(
			GameLibrary.cards
				.filter((card) => this.card.isExperimental || card.isExperimental === this.card.isExperimental)
				.filter((card) =>
					targetDefinition.require({
						sourceCard: this.card,
						targetCard: card,
						previousTargets: previousTargets.map((previousTarget) => previousTarget.target),
					})
				)
		).map((targetCard) =>
			ServerCardTarget.cardTargetCardInLibrary(targetDefinition.id, TargetMode.DEPLOY_EFFECT, this.card, targetCard, targetDefinition.label)
		)
	}

	private getValidUnitHandTargets(
		targetDefinition: DeployTargetDefinition<any>,
		previousTargets: ResolutionStackTarget[] = []
	): ServerCardTargetCard[] {
		return sortCards(
			this.game.players
				.flatMap((player) => player.players)
				.map((player) => player.cardHand.unitCards)
				.reduce((accumulator, cards) => accumulator.concat(cards))
				.filter((unit) => !unit.features.includes(CardFeature.UNTARGETABLE))
				.filter((card) =>
					targetDefinition.require({
						sourceCard: this.card,
						targetCard: card,
						previousTargets: previousTargets.map((previousTarget) => previousTarget.target),
					})
				)
		).map((targetCard) =>
			ServerCardTarget.cardTargetCardInUnitHand(
				targetDefinition.id,
				TargetMode.DEPLOY_EFFECT,
				this.card,
				targetCard,
				targetDefinition.label
			)
		)
	}

	private getValidSpellHandTargets(
		targetDefinition: DeployTargetDefinition<any>,
		previousTargets: ResolutionStackTarget[] = []
	): ServerCardTargetCard[] {
		return sortCards(
			this.game.players
				.flatMap((player) => player.players)
				.map((player) => player.cardHand.spellCards)
				.reduce((accumulator, cards) => accumulator.concat(cards))
				.filter((unit) => !unit.features.includes(CardFeature.UNTARGETABLE))
				.filter((card) =>
					targetDefinition.require({
						sourceCard: this.card,
						targetCard: card,
						previousTargets: previousTargets.map((previousTarget) => previousTarget.target),
					})
				)
		).map((targetCard) =>
			ServerCardTarget.cardTargetCardInSpellHand(
				targetDefinition.id,
				TargetMode.DEPLOY_EFFECT,
				this.card,
				targetCard,
				targetDefinition.label
			)
		)
	}

	private getValidUnitDeckTargets(
		targetDefinition: DeployTargetDefinition<any>,
		previousTargets: ResolutionStackTarget[] = []
	): ServerCardTargetCard[] {
		let targetedCards = this.game.players
			.flatMap((player) => player.players)
			.map((player) => player.cardDeck.unitCards)
			.reduce((accumulator, cards) => accumulator.concat(cards))
			.filter((card) =>
				targetDefinition.require({
					sourceCard: this.card,
					targetCard: card,
					previousTargets: previousTargets.map((previousTarget) => previousTarget.target),
				})
			)

		if (!targetDefinition.shouldPreventSorting()) {
			targetedCards = sortCards(targetedCards)
		}

		return targetedCards.map((targetCard) =>
			ServerCardTarget.cardTargetCardInUnitDeck(
				targetDefinition.id,
				TargetMode.DEPLOY_EFFECT,
				this.card,
				targetCard,
				targetDefinition.label
			)
		)
	}

	private getValidSpellDeckTargets(
		targetDefinition: DeployTargetDefinition<any>,
		previousTargets: ResolutionStackTarget[] = []
	): ServerCardTargetCard[] {
		let targetedCards = this.game.players
			.flatMap((player) => player.players)
			.map((player) => player.cardDeck.spellCards)
			.reduce((accumulator, cards) => accumulator.concat(cards))
			.filter((card) =>
				targetDefinition.require({
					sourceCard: this.card,
					targetCard: card,
					previousTargets: previousTargets.map((previousTarget) => previousTarget.target),
				})
			)

		if (!targetDefinition.shouldPreventSorting()) {
			targetedCards = sortCards(targetedCards)
		}

		return targetedCards.map((targetCard) =>
			ServerCardTarget.cardTargetCardInSpellDeck(
				targetDefinition.id,
				TargetMode.DEPLOY_EFFECT,
				this.card,
				targetCard,
				targetDefinition.label
			)
		)
	}

	private getValidUnitGraveyardTargets(
		targetDefinition: DeployTargetDefinition<any>,
		previousTargets: ResolutionStackTarget[] = []
	): ServerCardTargetCard[] {
		const targetedCards = this.game.players
			.flatMap((player) => player.players)
			.map((player) => player.cardGraveyard.unitCards)
			.reduce((accumulator, cards) => accumulator.concat(cards))
			.filter((card) =>
				targetDefinition.require({
					sourceCard: this.card,
					targetCard: card,
					previousTargets: previousTargets.map((previousTarget) => previousTarget.target),
				})
			)

		return targetedCards.map((targetCard) =>
			ServerCardTarget.cardTargetCardInUnitGraveyard(
				targetDefinition.id,
				TargetMode.DEPLOY_EFFECT,
				this.card,
				targetCard,
				targetDefinition.label
			)
		)
	}

	private getValidSpellGraveyardTargets(
		targetDefinition: DeployTargetDefinition<any>,
		previousTargets: ResolutionStackTarget[] = []
	): ServerCardTargetCard[] {
		const targetedCards = this.game.players
			.flatMap((player) => player.players)
			.map((player) => player.cardGraveyard.spellCards)
			.reduce((accumulator, cards) => accumulator.concat(cards))
			.filter((card) =>
				targetDefinition.require({
					sourceCard: this.card,
					targetCard: card,
					previousTargets: previousTargets.map((previousTarget) => previousTarget.target),
				})
			)

		return targetedCards.map((targetCard) =>
			ServerCardTarget.cardTargetCardInSpellGraveyard(
				targetDefinition.id,
				TargetMode.DEPLOY_EFFECT,
				this.card,
				targetCard,
				targetDefinition.label
			)
		)
	}

	/*
	 * ------------------------------------
	 *           Order targets
	 * ------------------------------------
	 */
	public getOrderTargets(previousTargets: OrderTarget[]): OrderTarget[] {
		let targets: OrderTarget[] = []
		this.getOrderTargetDefinitions()
			.filter((targetDefinition) => targetDefinition.totalTargetCount > previousTargets.length)
			.forEach((targetDefinition) => {
				targets = targets
					.concat(this.getOrderTargetsAsUnits(targetDefinition, previousTargets))
					.concat(this.getOrderTargetsAsRows(targetDefinition, previousTargets))
			})

		return targets
	}

	public getOrderTargetsAsUnits(
		targetDefinition: OrderTargetDefinition<UnitTargetValidatorArguments>,
		previousTargets: OrderTarget[] = []
	): OrderTarget[] {
		if (targetDefinition.targetType !== TargetType.UNIT) {
			return []
		}

		const applicablePreviousTargets = previousTargets.filter((previousTarget) => previousTarget.definition.id === targetDefinition.id)
		if (applicablePreviousTargets.length >= targetDefinition.targetCount) {
			return []
		}

		return this.game.board
			.getAllUnits()
			.filter((unit) => !unit.card.features.includes(CardFeature.UNTARGETABLE))
			.filter((unit) =>
				targetDefinition.require({
					player: this.card.unit!.originalOwner,
					sourceCard: this.card,
					previousTargets: applicablePreviousTargets.map((previousTarget) => previousTarget.target),
					targetCard: unit.card,
					targetUnit: unit,
				})
			)
			.map((unit) => ({
				unit: unit,
				expectedValue: targetDefinition.evaluate(
					{
						player: this.card.unit!.originalOwner,
						sourceCard: this.card,
						previousTargets: applicablePreviousTargets.map((previousTarget) => previousTarget.target),
						targetCard: unit.card,
						targetUnit: unit,
					},
					0
				),
			}))
			.map((tuple) => ({
				unit: tuple.unit,
				expectedValue: Math.max(
					tuple.expectedValue * tuple.unit.card.botEvaluation.threatMultiplier,
					tuple.unit.card.botEvaluation.baseThreat
				),
			}))
			.map((tuple) => ({
				target: ServerCardTarget.cardTargetUnit(
					targetDefinition.id,
					TargetMode.UNIT_ORDER,
					this.card,
					tuple.unit,
					tuple.expectedValue,
					targetDefinition.label
				),
				definition: targetDefinition,
			}))
	}

	public getOrderTargetsAsRows(
		targetDefinition: OrderTargetDefinition<RowTargetValidatorArguments>,
		previousTargets: OrderTarget[] = []
	): OrderTarget[] {
		if (targetDefinition.targetType !== TargetType.BOARD_ROW) {
			return []
		}

		const applicablePreviousTargets = previousTargets.filter((previousTarget) => previousTarget.definition.id === targetDefinition.id)
		if (applicablePreviousTargets.length >= targetDefinition.targetCount) {
			return []
		}

		return this.game.board.rows
			.filter((row) =>
				targetDefinition.require({
					player: this.card.unit!.originalOwner,
					sourceCard: this.card,
					targetRow: row,
					previousTargets: applicablePreviousTargets.map((previousTarget) => previousTarget.target),
				})
			)
			.map((row) => ({
				target: ServerCardTarget.cardTargetRow(targetDefinition.id, TargetMode.UNIT_ORDER, this.card, row, targetDefinition.label),
				definition: targetDefinition,
			}))
	}

	public getPlayTargetDefinitions(): PlayTargetDefinition[] {
		return this.playTargetDefinitions.map((definition) => definition.__build())
	}

	public getDeployTargetDefinitions(): DeployTargetDefinition<TargetValidatorArguments>[] {
		return this.deployTargetDefinitions.map((definition) => definition.__build())
	}

	public getOrderTargetDefinitions(): OrderTargetDefinition<TargetValidatorArguments>[] {
		return this.orderTargetDefinitions.map((definition) => definition.__build())
	}
}
