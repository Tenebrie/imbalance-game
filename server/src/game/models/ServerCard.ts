import uuidv4 from 'uuid/v4'
import Card from '../shared/models/Card'
import CardType from '../shared/enums/CardType'
import ServerGame from './ServerGame'
import runCardEventHandler from '../utils/runCardEventHandler'
import ServerCardOnBoard from './ServerCardOnBoard'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import GameTurnPhase from '../shared/enums/GameTurnPhase'
import ServerDamageInstance from './ServerDamageSource'
import ServerDamageSource from './ServerDamageSource'
import ServerGameBoardRow from './ServerGameBoardRow'
import ServerCardTarget from './ServerCardTarget'
import TargetMode from '../shared/enums/TargetMode'
import TargetType from '../shared/enums/TargetType'
import TargetValidatorArguments from '../../types/TargetValidatorArguments'
import ServerTargetDefinition from './targetDefinitions/ServerTargetDefinition'
import TargetDefinitionBuilder from './targetDefinitions/TargetDefinitionBuilder'
import CardColor from '../shared/enums/CardColor'
import ServerCardBuffs from './ServerCardBuffs'
import ServerRichTextVariables from './ServerRichTextVariables'
import RichTextVariables from '../shared/models/RichTextVariables'
import ServerOwnedCard from './ServerOwnedCard'

export default class ServerCard extends Card {
	game: ServerGame
	isRevealed = false
	cardBuffs = new ServerCardBuffs(this)
	dynamicTextVariables: ServerRichTextVariables

	constructor(game: ServerGame, cardType: CardType, unitSubtype: CardColor) {
		super(uuidv4(), cardType, 'missingno')
		this.game = game
		this.unitSubtype = unitSubtype
		this.dynamicTextVariables = {}
	}

	public get spellCost(): number {
		return this.power
	}

	public get unit(): ServerCardOnBoard | null {
		return this.game.board.findUnitById(this.id)
	}

	public get owner(): ServerPlayerInGame | null {
		const thisCardInGame = this.game.findOwnedCardById(this.id)
		return thisCardInGame ? thisCardInGame.owner : null
	}

	setPower(value: number): void {
		if (this.power === value) { return }

		runCardEventHandler(() => this.onPowerChanged(value, this.power))

		this.power = value
		this.game.players.forEach(playerInGame => {
			OutgoingMessageHandlers.notifyAboutCardPowerChange(playerInGame.player, this)
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

	getValidTargets(targetMode: TargetMode, targetType: TargetType, targetDefinition: ServerTargetDefinition, args: TargetValidatorArguments = {}, previousTargets: ServerCardTarget[] = []): ServerCardTarget[] {
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

	isTargetLimitExceeded(targetMode: TargetMode, targetType: TargetType, targetDefinition: ServerTargetDefinition, previousTargets: ServerCardTarget[]): boolean {
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

	getValidUnitTargets(targetMode: TargetMode, targetDefinition: ServerTargetDefinition, args: TargetValidatorArguments = {}, previousTargets: ServerCardTarget[] = []): ServerCardTarget[] {
		if (this.isTargetLimitExceeded(targetMode, TargetType.UNIT, targetDefinition, previousTargets)) {
			return []
		}

		const unitTargetLabel = targetDefinition.getOrderLabel(targetMode, TargetType.UNIT)
		return this.game.board.getAllUnits()
			.filter(unit => targetDefinition.validate(targetMode, TargetType.UNIT, { ...args, thisCard: this, targetUnit: unit, previousTargets: previousTargets }))
			.map(targetUnit => ServerCardTarget.cardTargetUnit(targetMode, this, targetUnit, unitTargetLabel))
	}

	getValidRowTargets(targetMode: TargetMode, targetDefinition: ServerTargetDefinition, args: TargetValidatorArguments = {}, previousTargets: ServerCardTarget[] = []): ServerCardTarget[] {
		if (this.isTargetLimitExceeded(targetMode, TargetType.BOARD_ROW, targetDefinition, previousTargets)) {
			return []
		}

		const rowTargetLabel = targetDefinition.getOrderLabel(targetMode, TargetType.BOARD_ROW)
		return this.game.board.rows
			.filter(row => targetDefinition.validate(targetMode, TargetType.BOARD_ROW, { ...args, thisCard: this, targetRow: row, previousTargets: previousTargets }))
			.map(targetRow => ServerCardTarget.cardTargetRow(targetMode, this, targetRow, rowTargetLabel))
	}

	getPlayValidTargetDefinition(): ServerTargetDefinition {
		let targets = this.definePlayValidTargets()
		this.cardBuffs.buffs.forEach(buff => {
			targets = targets.merge(buff.definePlayValidTargetsMod())
			targets = buff.definePlayValidTargetsOverride(targets)
		})
		return targets.build()
	}

	getValidOrderTargetDefinition(): ServerTargetDefinition {
		let targets = this.defineValidOrderTargets()
		this.cardBuffs.buffs.forEach(buff => {
			targets = targets.merge(buff.defineValidOrderTargetsMod())
			targets = buff.defineValidOrderTargetsOverride(targets)
		})
		return targets.build()
	}

	getPostPlayRequiredTargetDefinition(): ServerTargetDefinition {
		let targets = this.definePostPlayRequiredTargets()
		this.cardBuffs.buffs.forEach(buff => {
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

	onPlayedAsUnit(thisUnit: ServerCardOnBoard, targetRow: ServerGameBoardRow): void { return }
	onPlayedAsSpell(owner: ServerPlayerInGame): void { return }
	onRevealed(owner: ServerPlayerInGame): void { return }

	onUnitPlayTargetCardSelected(thisUnit: ServerCardOnBoard, target: ServerCard): void { return }
	onUnitPlayTargetUnitSelected(thisUnit: ServerCardOnBoard, target: ServerCardOnBoard): void { return }
	onUnitPlayTargetRowSelected(thisUnit: ServerCardOnBoard, target: ServerGameBoardRow): void { return }
	onUnitPlayTargetsConfirmed(thisUnit: ServerCardOnBoard): void { return }
	onSpellPlayTargetCardSelected(owner: ServerPlayerInGame, target: ServerCard): void { return }
	onSpellPlayTargetUnitSelected(owner: ServerPlayerInGame, target: ServerCardOnBoard): void { return }
	onSpellPlayTargetRowSelected(owner: ServerPlayerInGame, target: ServerGameBoardRow): void { return }
	onSpellPlayTargetsConfirmed(owner: ServerPlayerInGame): void { return }

	onBeforeOtherCardPlayed(otherCard: ServerOwnedCard): void { return }
	onAfterOtherCardPlayed(otherCard: ServerOwnedCard): void { return }
	onBeforeOtherUnitDestroyed(destroyedUnit: ServerCardOnBoard): void { return }
	onAfterOtherUnitDestroyed(destroyedUnit: ServerCardOnBoard): void { return }

	onTurnStarted(thisUnit: ServerCardOnBoard): void { return }
	onTurnPhaseChanged(thisUnit: ServerCardOnBoard, phase: GameTurnPhase): void { return }
	onTurnEnded(thisUnit: ServerCardOnBoard): void { return }
	onUnitCustomOrderPerformed(thisUnit: ServerCardOnBoard, order: ServerCardTarget): void { return }
	onBeforeUnitOrderIssued(thisUnit: ServerCardOnBoard, order: ServerCardTarget): void { return }
	onAfterUnitOrderIssued(thisUnit: ServerCardOnBoard, order: ServerCardTarget): void { return }
	onPowerChanged(newValue: number, oldValue: number): void { return }
	onBeforeDamageTaken(thisUnit: ServerCardOnBoard, damage: ServerDamageInstance): void { return }
	onAfterDamageTaken(thisUnit: ServerCardOnBoard, damage: ServerDamageInstance): void { return }
	onDamageSurvived(thisUnit: ServerCardOnBoard, damage: ServerDamageInstance): void { return }
	onBeforePerformingUnitAttack(thisUnit: ServerCardOnBoard, target: ServerCardOnBoard, targetMode: TargetMode): void { return }
	onAfterPerformingUnitAttack(thisUnit: ServerCardOnBoard, target: ServerCardOnBoard, targetMode: TargetMode, dealtDamage: number): void { return }
	onBeforePerformingRowAttack(thisUnit: ServerCardOnBoard, target: ServerGameBoardRow, targetMode: TargetMode): void { return }
	onAfterPerformingRowAttack(thisUnit: ServerCardOnBoard, target: ServerGameBoardRow, targetMode: TargetMode): void { return }
	onBeforeBeingAttacked(thisUnit: ServerCardOnBoard, attacker: ServerCardOnBoard): void { return }
	onAfterBeingAttacked(thisUnit: ServerCardOnBoard, attacker: ServerCardOnBoard): void { return }
	onBeforePerformingMove(thisUnit: ServerCardOnBoard, target: ServerGameBoardRow): void { return }
	onAfterPerformingMove(thisUnit: ServerCardOnBoard, target: ServerGameBoardRow): void { return }
	onPerformingUnitSupport(thisUnit: ServerCardOnBoard, target: ServerCardOnBoard): void { return }
	onPerformingRowSupport(thisUnit: ServerCardOnBoard, target: ServerGameBoardRow): void { return }
	onBeforeBeingSupported(thisUnit: ServerCardOnBoard, support: ServerCardOnBoard): void { return }
	onAfterBeingSupported(thisUnit: ServerCardOnBoard, support: ServerCardOnBoard): void { return }
	onBeforeDestroyedAsUnit(thisUnit: ServerCardOnBoard): void { return }

	getAttackDamage(thisUnit: ServerCardOnBoard, target: ServerCardOnBoard, targetMode: TargetMode, targetType: TargetType): number { return this.attack }
	getBonusAttackDamage(thisUnit: ServerCardOnBoard, target: ServerCardOnBoard, targetMode: TargetMode, targetType: TargetType): number { return 0 }
	getDamageTaken(thisUnit: ServerCardOnBoard, damageSource: ServerDamageSource): number { return damageSource.value }
	getDamageReduction(thisUnit: ServerCardOnBoard, damageSource: ServerDamageSource): number { return 0 }

	definePlayValidTargets(): TargetDefinitionBuilder { return ServerTargetDefinition.defaultCardPlayTarget(this.game) }
	defineValidOrderTargets(): TargetDefinitionBuilder { return ServerTargetDefinition.defaultUnitOrder(this.game) }
	definePostPlayRequiredTargets(): TargetDefinitionBuilder { return ServerTargetDefinition.none(this.game) }
	isRequireCustomOrderLogic(thisUnit: ServerCardOnBoard, order: ServerCardTarget): boolean { return false }
}
