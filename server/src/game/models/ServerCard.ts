import uuidv4 from 'uuid/v4'
import Card from '@shared/models/Card'
import CardType from '@shared/enums/CardType'
import ServerGame from './ServerGame'
import runCardEventHandler from '../utils/runCardEventHandler'
import ServerUnit from './ServerUnit'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import GameTurnPhase from '@shared/enums/GameTurnPhase'
import ServerDamageInstance from './ServerDamageSource'
import ServerDamageSource from './ServerDamageSource'
import ServerBoardRow from './ServerBoardRow'
import ServerCardTarget from './ServerCardTarget'
import TargetMode from '@shared/enums/TargetMode'
import TargetType from '@shared/enums/TargetType'
import TargetValidatorArguments from '../../types/TargetValidatorArguments'
import TargetDefinition from './targetDefinitions/TargetDefinition'
import TargetDefinitionBuilder from './targetDefinitions/TargetDefinitionBuilder'
import CardColor from '@shared/enums/CardColor'
import ServerBuffContainer from './ServerBuffContainer'
import ServerRichTextVariables from './ServerRichTextVariables'
import RichTextVariables from '@shared/models/RichTextVariables'
import ServerOwnedCard from './ServerOwnedCard'
import BuffImmunity from '../buffs/BuffImmunity'

export default class ServerCard extends Card {
	game: ServerGame
	isRevealed = false
	buffs = new ServerBuffContainer(this)
	dynamicTextVariables: ServerRichTextVariables

	constructor(game: ServerGame, cardType: CardType, unitSubtype: CardColor) {
		super(uuidv4(), cardType, 'missingno')
		this.game = game
		this.color = unitSubtype
		this.dynamicTextVariables = {}
	}

	public get spellCost(): number {
		return this.power
	}

	public get unit(): ServerUnit | null {
		return this.game.board.findUnitById(this.id)
	}

	public get owner(): ServerPlayerInGame | null {
		const thisCardInGame = this.game.findOwnedCardById(this.id)
		return thisCardInGame ? thisCardInGame.owner : null
	}

	setPower(value: number): void {
		if (this.power === value) { return }

		this.power = value
		runCardEventHandler(() => this.onPowerChanged(value, this.power))

		this.game.players.forEach(playerInGame => {
			OutgoingMessageHandlers.notifyAboutCardPowerChange(playerInGame.player, this)
		})
	}

	setHealthArmor(value: number): void {
		if (this.healthArmor === value) { return }

		runCardEventHandler(() => this.onHealthArmorChanged(value, this.healthArmor))

		this.healthArmor = value
		this.game.players.forEach(playerInGame => {
			OutgoingMessageHandlers.notifyAboutCardHealthArmorChange(playerInGame.player, this)
		})
	}

	reveal(owner: ServerPlayerInGame, opponent: ServerPlayerInGame): void {
		if (this.isRevealed) { return }

		this.isRevealed = true
		runCardEventHandler(() => this.onRevealed(owner))
		OutgoingMessageHandlers.notifyAboutOpponentCardRevealed(opponent.player, this)
	}

	getValidPlayTargets(cardOwner: ServerPlayerInGame): ServerCardTarget[] {
		return this.getValidTargets(TargetMode.ON_PLAY_VALID_TARGET, TargetType.BOARD_ROW, this.getPlayValidTargetDefinition(), {
			thisCardOwner: cardOwner
		})
	}

	getValidTargets(targetMode: TargetMode, targetType: TargetType, targetDefinition: TargetDefinition, args: TargetValidatorArguments = {}, previousTargets: ServerCardTarget[] = []): ServerCardTarget[] {
		let targets: ServerCardTarget[] = []
		if (targetType === TargetType.UNIT) {
			targets = this.getValidUnitTargets(targetMode, targetDefinition, args, previousTargets)
		} else if (targetType === TargetType.BOARD_ROW) {
			targets = this.getValidRowTargets(targetMode, targetDefinition, args, previousTargets)
		}

		if (args.thisCardOwner) {
			targets.forEach(target => target.sourceCardOwner = args.thisCardOwner)
		}
		if (args.thisUnit) {
			targets.forEach(target => target.sourceUnit = args.thisUnit)
		}

		return targets
	}

	isTargetLimitExceeded(targetMode: TargetMode, targetType: TargetType, targetDefinition: TargetDefinition, previousTargets: ServerCardTarget[]): boolean {
		if (previousTargets.length >= targetDefinition.getTargetCount()) {
			return true
		}

		const previousTargetsOfType = previousTargets.filter(target => target.targetMode === targetMode && target.targetType === targetType)
		return previousTargetsOfType.length >= targetDefinition.getTargetOfTypeCount(targetMode, targetType)

		/*
		 * All orders are considered to be valid simultaneously
		 * - TODO: Remove allowSimultaneously from targeting API if no other use is found
		 * */
		// const otherTypeOrders = previousTargets.filter(target => target.targetMode !== targetMode || target.targetType !== targetType)
		// const incompatibleOtherTypeOrder = otherTypeOrders.find(performedOrder => {
		// 	return !targetDefinition.isValidSimultaneously({ targetMode, targetType }, performedOrder)
		// })
		// return !!incompatibleOtherTypeOrder
	}

	getValidUnitTargets(targetMode: TargetMode, targetDefinition: TargetDefinition, args: TargetValidatorArguments = {}, previousTargets: ServerCardTarget[] = []): ServerCardTarget[] {
		if (this.isTargetLimitExceeded(targetMode, TargetType.UNIT, targetDefinition, previousTargets)) {
			return []
		}

		const unitTargetLabel = targetDefinition.getOrderLabel(targetMode, TargetType.UNIT)
		return this.game.board.getAllUnits()
			.filter(unit => !unit.card.buffs.has(BuffImmunity))
			.filter(unit => targetDefinition.validate(targetMode, TargetType.UNIT, { ...args, thisCard: this, targetUnit: unit, previousTargets: previousTargets }))
			.map(targetUnit => ServerCardTarget.cardTargetUnit(targetMode, this, targetUnit, unitTargetLabel))
	}

	getValidRowTargets(targetMode: TargetMode, targetDefinition: TargetDefinition, args: TargetValidatorArguments = {}, previousTargets: ServerCardTarget[] = []): ServerCardTarget[] {
		if (this.isTargetLimitExceeded(targetMode, TargetType.BOARD_ROW, targetDefinition, previousTargets)) {
			return []
		}

		const rowTargetLabel = targetDefinition.getOrderLabel(targetMode, TargetType.BOARD_ROW)
		return this.game.board.rows
			.filter(row => targetDefinition.validate(targetMode, TargetType.BOARD_ROW, { ...args, thisCard: this, targetRow: row, previousTargets: previousTargets }))
			.map(targetRow => ServerCardTarget.cardTargetRow(targetMode, this, targetRow, rowTargetLabel))
	}

	getPlayValidTargetDefinition(): TargetDefinition {
		let targets = this.definePlayValidTargets()
		this.buffs.buffs.forEach(buff => {
			targets = targets.merge(buff.definePlayValidTargetsMod())
			targets = buff.definePlayValidTargetsOverride(targets)
		})
		return targets.build()
	}

	getValidOrderTargetDefinition(): TargetDefinition {
		let targets = this.defineValidOrderTargets()
		this.buffs.buffs.forEach(buff => {
			targets = targets.merge(buff.defineValidOrderTargetsMod())
			targets = buff.defineValidOrderTargetsOverride(targets)
		})
		return targets.build()
	}

	getPostPlayRequiredTargetDefinition(): TargetDefinition {
		let targets = this.definePostPlayRequiredTargets()
		this.buffs.buffs.forEach(buff => {
			targets = targets.merge(buff.definePostPlayRequiredTargetsMod())
			targets = buff.definePostPlayRequiredTargetsOverride(targets)
		})
		return targets.build()
	}

	evaluateVariables(): RichTextVariables {
		const evaluatedVariables: RichTextVariables = {}
		Object.keys(this.dynamicTextVariables).forEach(key => {
			const value = this.dynamicTextVariables[key]
			if (typeof(value) === 'function') {
				evaluatedVariables[key] = value()
			} else {
				evaluatedVariables[key] = value
			}
		})
		return evaluatedVariables
	}

	onPlayedAsUnit(thisUnit: ServerUnit, targetRow: ServerBoardRow): void { return }
	onPlayedAsSpell(owner: ServerPlayerInGame): void { return }
	onRevealed(owner: ServerPlayerInGame): void { return }

	onUnitPlayTargetCardSelected(thisUnit: ServerUnit, target: ServerCard): void { return }
	onUnitPlayTargetUnitSelected(thisUnit: ServerUnit, target: ServerUnit): void { return }
	onUnitPlayTargetRowSelected(thisUnit: ServerUnit, target: ServerBoardRow): void { return }
	onUnitPlayTargetsConfirmed(thisUnit: ServerUnit): void { return }
	onSpellPlayTargetCardSelected(owner: ServerPlayerInGame, target: ServerCard): void { return }
	onSpellPlayTargetUnitSelected(owner: ServerPlayerInGame, target: ServerUnit): void { return }
	onSpellPlayTargetRowSelected(owner: ServerPlayerInGame, target: ServerBoardRow): void { return }
	onSpellPlayTargetsConfirmed(owner: ServerPlayerInGame): void { return }

	onBeforeOtherCardPlayed(otherCard: ServerOwnedCard): void { return }
	onAfterOtherCardPlayed(otherCard: ServerOwnedCard): void { return }
	onBeforeOtherUnitDestroyed(destroyedUnit: ServerUnit): void { return }
	onAfterOtherUnitDestroyed(destroyedUnit: ServerUnit): void { return }

	onTurnStarted(thisUnit: ServerUnit): void { return }
	onTurnPhaseChanged(thisUnit: ServerUnit, phase: GameTurnPhase): void { return }
	onTurnEnded(thisUnit: ServerUnit): void { return }
	onRoundEnded(thisUnit: ServerUnit): void { return }
	onUnitCustomOrderPerformed(thisUnit: ServerUnit, order: ServerCardTarget): void { return }
	onBeforeUnitOrderIssued(thisUnit: ServerUnit, order: ServerCardTarget): void { return }
	onAfterUnitOrderIssued(thisUnit: ServerUnit, order: ServerCardTarget): void { return }
	onPowerChanged(newValue: number, oldValue: number): void { return }
	onAttackChanged(newValue: number, oldValue: number): void { return }
	onAttackRangeChanged(newValue: number, oldValue: number): void { return }
	onHealthArmorChanged(newValue: number, oldValue: number): void { return }
	onBeforeDamageTaken(thisUnit: ServerUnit, damage: ServerDamageInstance): void { return }
	onAfterDamageTaken(thisUnit: ServerUnit, damage: ServerDamageInstance): void { return }
	onDamageSurvived(thisUnit: ServerUnit, damage: ServerDamageInstance): void { return }
	onBeforePerformingUnitAttack(thisUnit: ServerUnit, target: ServerUnit, targetMode: TargetMode): void { return }
	onAfterPerformingUnitAttack(thisUnit: ServerUnit, target: ServerUnit, targetMode: TargetMode, dealtDamage: number): void { return }
	onBeforePerformingRowAttack(thisUnit: ServerUnit, target: ServerBoardRow, targetMode: TargetMode): void { return }
	onAfterPerformingRowAttack(thisUnit: ServerUnit, target: ServerBoardRow, targetMode: TargetMode): void { return }
	onBeforeBeingAttacked(thisUnit: ServerUnit, attacker: ServerUnit): void { return }
	onAfterBeingAttacked(thisUnit: ServerUnit, attacker: ServerUnit): void { return }
	onBeforePerformingMove(thisUnit: ServerUnit, target: ServerBoardRow): void { return }
	onAfterPerformingMove(thisUnit: ServerUnit, target: ServerBoardRow): void { return }
	onPerformingUnitSupport(thisUnit: ServerUnit, target: ServerUnit): void { return }
	onPerformingRowSupport(thisUnit: ServerUnit, target: ServerBoardRow): void { return }
	onBeforeBeingSupported(thisUnit: ServerUnit, support: ServerUnit): void { return }
	onAfterBeingSupported(thisUnit: ServerUnit, support: ServerUnit): void { return }
	onBeforeDestroyedAsUnit(thisUnit: ServerUnit): void { return }

	getAttackDamage(thisUnit: ServerUnit, target: ServerUnit, targetMode: TargetMode, targetType: TargetType): number { return this.attack }
	getBonusAttackDamage(thisUnit: ServerUnit, target: ServerUnit, targetMode: TargetMode, targetType: TargetType): number { return 0 }
	getDamageTaken(thisUnit: ServerUnit, damageSource: ServerDamageSource): number { return damageSource.value }
	getDamageReduction(thisUnit: ServerUnit, damageSource: ServerDamageSource): number { return 0 }

	definePlayValidTargets(): TargetDefinitionBuilder { return TargetDefinition.defaultCardPlayTarget(this.game) }
	defineValidOrderTargets(): TargetDefinitionBuilder { return TargetDefinition.defaultUnitOrder(this.game) }
	definePostPlayRequiredTargets(): TargetDefinitionBuilder { return TargetDefinition.none(this.game) }
	isRequireCustomOrderLogic(thisUnit: ServerUnit, order: ServerCardTarget): boolean { return false }
}
