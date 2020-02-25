import uuidv4 from 'uuid/v4'
import Buff from '../shared/models/Buff'
import BuffStackType from '../shared/enums/BuffStackType'
import ServerGame from './ServerGame'
import ServerCard from './ServerCard'
import ServerCardOnBoard from './ServerCardOnBoard'
import TargetDefinitionBuilder from './targetDefinitions/TargetDefinitionBuilder'
import ServerTargetDefinition from './targetDefinitions/ServerTargetDefinition'
import ServerGameBoardRow from './ServerGameBoardRow'
import ServerDamageInstance from './ServerDamageSource'

export default class ServerBuff implements Buff {
	id: string
	game: ServerGame
	card: ServerCard
	source: ServerCard | null
	buffClass: string
	stackType: BuffStackType

	duration: number
	intensity: number
	baseDuration: number
	baseIntensity: number

	constructor(stackType: BuffStackType) {
		this.id = uuidv4()
		this.stackType = stackType
		this.baseDuration = Infinity
		this.baseIntensity = 1
	}

	protected get unit(): ServerCardOnBoard | null {
		return this.game.board.findUnitById(this.card.id)
	}

	public addDuration(delta: number): void {
		this.setDuration(this.duration + delta)
	}

	public setDuration(value: number): void {
		this.duration = value
		if (this.duration <= 0) {
			this.card.cardBuffs.removeByReference(this)
		}
	}

	public addIntensity(delta: number): void {
		this.setIntensity(this.intensity + delta)
	}

	public setIntensity(value: number): void {
		this.intensity = value
		if (this.intensity <= 0) {
			this.card.cardBuffs.removeByReference(this)
		}
	}

	onCreated(): void { return }
	onDurationChanged(delta: number): void { return }
	onIntensityChanged(delta: number): void { return }
	onTurnStarted(): void { return }
	onTurnEnded(): void { return }
	getDamageTaken(thisUnit: ServerCardOnBoard, damage: number, damageSource: ServerDamageInstance): number { return damage }
	getDamageReduction(thisUnit: ServerCardOnBoard, damage: number, damageSource: ServerDamageInstance): number { return 0 }
	onBeforeBeingAttacked(thisUnit: ServerCardOnBoard, attacker: ServerCardOnBoard): void { return }
	onAfterBeingAttacked(thisUnit: ServerCardOnBoard, attacker: ServerCardOnBoard): void { return }
	onBeforePerformingMove(thisUnit: ServerCardOnBoard, target: ServerGameBoardRow): void { return }
	onAfterPerformingMove(thisUnit: ServerCardOnBoard, target: ServerGameBoardRow): void { return }
	onPerformingUnitSupport(thisUnit: ServerCardOnBoard, target: ServerCardOnBoard): void { return }
	onPerformingRowSupport(thisUnit: ServerCardOnBoard, target: ServerGameBoardRow): void { return }
	onBeforeBeingSupported(thisUnit: ServerCardOnBoard, support: ServerCardOnBoard): void { return }
	onAfterBeingSupported(thisUnit: ServerCardOnBoard, support: ServerCardOnBoard): void { return }
	onDestroyed(): void { return }

	definePlayValidTargetsMod(): TargetDefinitionBuilder { return ServerTargetDefinition.none(this.game) }
	defineValidOrderTargetsMod(): TargetDefinitionBuilder { return ServerTargetDefinition.none(this.game) }
	definePostPlayRequiredTargetsMod(): TargetDefinitionBuilder { return ServerTargetDefinition.none(this.game) }
	definePlayValidTargetsOverride(targetDefinition: TargetDefinitionBuilder): TargetDefinitionBuilder { return targetDefinition }
	defineValidOrderTargetsOverride(targetDefinition: TargetDefinitionBuilder): TargetDefinitionBuilder { return targetDefinition }
	definePostPlayRequiredTargetsOverride(targetDefinition: TargetDefinitionBuilder): TargetDefinitionBuilder { return targetDefinition }
}
