import ServerGame from './ServerGame'
import SimpleTargetDefinitionBuilder from './targetDefinitions/SimpleTargetDefinitionBuilder'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import ServerCardTarget from './ServerCardTarget'
import CardType from '@shared/enums/CardType'
import TargetDefinition from './targetDefinitions/TargetDefinition'
import TargetMode from '@shared/enums/TargetMode'
import TargetType from '@shared/enums/TargetType'
import Utils from '../../utils/Utils'
import TargetValidatorArguments from '../../types/TargetValidatorArguments'
import CardFeature from '@shared/enums/CardFeature'
import GameLibrary from '../libraries/CardLibrary'
import ServerCard from './ServerCard'

export class ServerCardTargeting {
	private readonly card: ServerCard
	private readonly game: ServerGame

	public cardPlayTargetDefinitions: SimpleTargetDefinitionBuilder[] = []
	public unitOrderTargetDefinitions: SimpleTargetDefinitionBuilder[] = []
	public deployEffectTargetDefinitions: SimpleTargetDefinitionBuilder[] = []

	constructor(card: ServerCard) {
		this.card = card
		this.game = card.game
	}

	public getValidCardPlayTargets(cardOwner: ServerPlayerInGame): ServerCardTarget[] {
		if ((this.card.type === CardType.UNIT && cardOwner.unitMana < this.card.unitCost) || (this.card.type === CardType.SPELL && cardOwner.spellMana < this.card.spellCost)) {
			return []
		}

		let targetDefinitions = this.getCardPlayTargetDefinitions()
		if (targetDefinitions.length === 0) {
			targetDefinitions = [TargetDefinition.defaultCardPlayTarget(this.game).build()]
		}
		return targetDefinitions.map(targetDefinition => {
			return this.getValidTargets(TargetMode.CARD_PLAY, TargetType.BOARD_ROW, targetDefinition, {
				sourceCard: this.card,
				sourceCardOwner: cardOwner
			})
		}).reduce((acc, val) => acc.concat(val), [])
	}

	public getDeployEffectTargets(previousTargets: ServerCardTarget[] = []): ServerCardTarget[] {
		const targetDefinitions = this.getDeployEffectTargetDefinitions()
		return targetDefinitions
			.map(targetDefinition => this.getDeployEffectTargetsForTargetDefinition(targetDefinition, previousTargets))
			.reduce((acc, val) => acc.concat(val), [])
	}

	private getDeployEffectTargetsForTargetDefinition(targetDefinition: TargetDefinition, previousTargets: ServerCardTarget[] = []): ServerCardTarget[] {
		if (targetDefinition.getTargetCount() === 0) {
			return []
		}

		let validTargets = []
		const args = {
			sourceCard: this.card,
			sourceCardOwner: this.card.owner
		}

		Utils.forEachInNumericEnum(TargetType, (targetType: TargetType) => {
			validTargets = validTargets.concat(this.getValidTargets(TargetMode.DEPLOY_EFFECT, targetType, targetDefinition, args, previousTargets))
		})
		return validTargets
	}

	public getValidTargets(targetMode: TargetMode, targetType: TargetType, targetDefinition: TargetDefinition, args: TargetValidatorArguments = { sourceCard: this.card }, previousTargets: ServerCardTarget[] = []): ServerCardTarget[] {
		let targets: ServerCardTarget[] = []
		if (targetType === TargetType.UNIT) {
			targets = this.getValidUnitTargets(targetMode, targetDefinition, args, previousTargets)
		} else if (targetType === TargetType.BOARD_ROW) {
			targets = this.getValidRowTargets(targetMode, targetDefinition, args, previousTargets)
		} else if (targetType === TargetType.CARD_IN_LIBRARY) {
			targets = this.getValidCardLibraryTargets(targetMode, targetDefinition, args, previousTargets)
		} else if (targetType === TargetType.CARD_IN_UNIT_HAND) {
			targets = this.getValidUnitHandTargets(targetMode, targetDefinition, args, previousTargets)
		} else if (targetType === TargetType.CARD_IN_SPELL_HAND) {
			targets = this.getValidSpellHandTargets(targetMode, targetDefinition, args, previousTargets)
		} else if (targetType === TargetType.CARD_IN_UNIT_DECK) {
			targets = this.getValidUnitDeckTargets(targetMode, targetDefinition, args, previousTargets)
		} else if (targetType === TargetType.CARD_IN_SPELL_DECK) {
			targets = this.getValidSpellDeckTargets(targetMode, targetDefinition, args, previousTargets)
		}

		if (args.sourceCardOwner) {
			targets.forEach(target => target.sourceCardOwner = args.sourceCardOwner)
		}

		return targets
	}

	private isTargetLimitExceeded(targetMode: TargetMode, targetType: TargetType, targetDefinition: TargetDefinition, previousTargets: ServerCardTarget[]): boolean {
		if (previousTargets.length >= targetDefinition.getTargetCount()) {
			return true
		}

		const previousTargetsOfType = previousTargets.filter(target => target.targetMode === targetMode && target.targetType === targetType)
		return previousTargetsOfType.length >= targetDefinition.getTargetOfTypeCount(targetMode, targetType)
	}

	private getValidUnitTargets(targetMode: TargetMode, targetDefinition: TargetDefinition, args: TargetValidatorArguments = { sourceCard: this.card }, previousTargets: ServerCardTarget[] = []): ServerCardTarget[] {
		if (this.isTargetLimitExceeded(targetMode, TargetType.UNIT, targetDefinition, previousTargets)) {
			return []
		}

		const unitTargetLabel = targetDefinition.getOrderLabel(targetMode, TargetType.UNIT)
		args = {
			...args,
			sourceCard: this.card,
			previousTargets: previousTargets
		}

		return this.game.board.getAllUnits()
			.filter(unit => !unit.card.features.includes(CardFeature.UNTARGETABLE))
			.filter(unit => targetDefinition.validate(targetMode, TargetType.UNIT, { ...args, targetCard: unit.card }))
			.map(unit => ({
				unit: unit,
				expectedValue: targetDefinition.evaluate(targetMode, TargetType.UNIT, { ...args, targetCard: unit.card })
			}))
			.map(tuple => ({
				unit: tuple.unit,
				expectedValue: Math.max(tuple.expectedValue * tuple.unit.card.botEvaluation.threatMultiplier, tuple.unit.card.botEvaluation.baseThreat)
			}))
			.map(tuple => ServerCardTarget.cardTargetUnit(targetMode, this.card, tuple.unit, tuple.expectedValue, unitTargetLabel))
	}

	private getValidRowTargets(targetMode: TargetMode, targetDefinition: TargetDefinition, args: TargetValidatorArguments = { sourceCard: this.card }, previousTargets: ServerCardTarget[] = []): ServerCardTarget[] {
		if (this.isTargetLimitExceeded(targetMode, TargetType.BOARD_ROW, targetDefinition, previousTargets)) {
			return []
		}

		const rowTargetLabel = targetDefinition.getOrderLabel(targetMode, TargetType.BOARD_ROW)
		return this.game.board.rows
			.filter(row => targetDefinition.validate(targetMode, TargetType.BOARD_ROW, { ...args, sourceCard: this.card, targetRow: row, previousTargets: previousTargets }))
			.map(targetRow => ServerCardTarget.cardTargetRow(targetMode, this.card, targetRow, rowTargetLabel))
	}

	private getValidCardLibraryTargets(targetMode: TargetMode, targetDefinition: TargetDefinition, args: TargetValidatorArguments = { sourceCard: this.card }, previousTargets: ServerCardTarget[] = []): ServerCardTarget[] {
		if (this.isTargetLimitExceeded(targetMode, TargetType.CARD_IN_LIBRARY, targetDefinition, previousTargets)) {
			return []
		}

		const libraryCards = GameLibrary.cards as ServerCard[]
		const cardTargetLabel = targetDefinition.getOrderLabel(targetMode, TargetType.CARD_IN_LIBRARY)
		return libraryCards
			.filter(card => targetDefinition.validate(targetMode, TargetType.CARD_IN_LIBRARY, { ... args, sourceCard: this.card, targetCard: card, previousTargets: previousTargets }))
			.map(targetCard => ServerCardTarget.cardTargetCardInLibrary(targetMode, this.card, targetCard, cardTargetLabel))
	}

	private getValidUnitHandTargets(targetMode: TargetMode, targetDefinition: TargetDefinition, args: TargetValidatorArguments = { sourceCard: this.card }, previousTargets: ServerCardTarget[] = []): ServerCardTarget[] {
		if (this.isTargetLimitExceeded(targetMode, TargetType.CARD_IN_UNIT_HAND, targetDefinition, previousTargets)) {
			return []
		}

		const cardTargetLabel = targetDefinition.getOrderLabel(targetMode, TargetType.CARD_IN_UNIT_HAND)
		return this.game.players.map(player => player.cardHand.unitCards)
			.reduce((accumulator, cards) => accumulator.concat(cards))
			.filter(unit => !unit.features.includes(CardFeature.UNTARGETABLE))
			.filter(card => targetDefinition.validate(targetMode, TargetType.CARD_IN_UNIT_HAND, { ... args, sourceCard: this.card, targetCard: card, previousTargets: previousTargets }))
			.map(targetCard => ServerCardTarget.cardTargetCardInUnitHand(targetMode, this.card, targetCard, cardTargetLabel))
	}

	private getValidSpellHandTargets(targetMode: TargetMode, targetDefinition: TargetDefinition, args: TargetValidatorArguments = { sourceCard: this.card }, previousTargets: ServerCardTarget[] = []): ServerCardTarget[] {
		if (this.isTargetLimitExceeded(targetMode, TargetType.CARD_IN_SPELL_HAND, targetDefinition, previousTargets)) {
			return []
		}

		const cardTargetLabel = targetDefinition.getOrderLabel(targetMode, TargetType.CARD_IN_SPELL_HAND)
		return this.game.players.map(player => player.cardHand.spellCards)
			.reduce((accumulator, cards) => accumulator.concat(cards))
			.filter(unit => !unit.features.includes(CardFeature.UNTARGETABLE))
			.filter(card => targetDefinition.validate(targetMode, TargetType.CARD_IN_SPELL_HAND, { ... args, sourceCard: this.card, targetCard: card, previousTargets: previousTargets }))
			.map(targetCard => ServerCardTarget.cardTargetCardInSpellHand(targetMode, this.card, targetCard, cardTargetLabel))
	}

	private getValidUnitDeckTargets(targetMode: TargetMode, targetDefinition: TargetDefinition, args: TargetValidatorArguments = { sourceCard: this.card }, previousTargets: ServerCardTarget[] = []): ServerCardTarget[] {
		if (this.isTargetLimitExceeded(targetMode, TargetType.CARD_IN_UNIT_DECK, targetDefinition, previousTargets)) {
			return []
		}

		const cardTargetLabel = targetDefinition.getOrderLabel(targetMode, TargetType.CARD_IN_UNIT_DECK)
		return this.game.players.map(player => player.cardDeck.unitCards)
			.reduce((accumulator, cards) => accumulator.concat(cards))
			.filter(card => targetDefinition.validate(targetMode, TargetType.CARD_IN_UNIT_DECK, { ... args, sourceCard: this.card, targetCard: card, previousTargets: previousTargets }))
			.map(targetCard => ServerCardTarget.cardTargetCardInUnitDeck(targetMode, this.card, targetCard, cardTargetLabel))
	}

	private getValidSpellDeckTargets(targetMode: TargetMode, targetDefinition: TargetDefinition, args: TargetValidatorArguments = { sourceCard: this.card }, previousTargets: ServerCardTarget[] = []): ServerCardTarget[] {
		if (this.isTargetLimitExceeded(targetMode, TargetType.CARD_IN_SPELL_DECK, targetDefinition, previousTargets)) {
			return []
		}

		const cardTargetLabel = targetDefinition.getOrderLabel(targetMode, TargetType.CARD_IN_SPELL_DECK)
		return this.game.players.map(player => player.cardDeck.spellCards)
			.reduce((accumulator, cards) => accumulator.concat(cards))
			.filter(card => targetDefinition.validate(targetMode, TargetType.CARD_IN_SPELL_DECK, { ... args, sourceCard: this.card, targetCard: card, previousTargets: previousTargets }))
			.map(targetCard => ServerCardTarget.cardTargetCardInSpellDeck(targetMode, this.card, targetCard, cardTargetLabel))
	}

	public getCardPlayTargetDefinitions(): TargetDefinition[] {
		return this.cardPlayTargetDefinitions.map(targetDefinition => {
			let clone = targetDefinition.commit().clone()
			this.card.buffs.buffs.forEach(buff => {
				clone = clone.merge(buff.definePlayValidTargetsMod())
				clone = buff.definePlayValidTargetsOverride(clone)
			})
			return clone.build()
		})
	}

	public getUnitOrderTargetDefinitions(): TargetDefinition[] {
		return this.unitOrderTargetDefinitions.map(targetDefinition => {
			let clone = targetDefinition.commit().clone()
			this.card.buffs.buffs.forEach(buff => {
				clone = clone.merge(buff.defineValidOrderTargetsMod())
				clone = buff.defineValidOrderTargetsOverride(clone)
			})
			return clone.build()
		})
	}

	public getDeployEffectTargetDefinitions(): TargetDefinition[] {
		return this.deployEffectTargetDefinitions.map(targetDefinition => {
			let clone = targetDefinition.commit().clone()
			this.card.buffs.buffs.forEach(buff => {
				clone = clone.merge(buff.definePostPlayRequiredTargetsMod())
				clone = buff.definePostPlayRequiredTargetsOverride(clone)
			})
			return clone.build()
		})
	}
}
