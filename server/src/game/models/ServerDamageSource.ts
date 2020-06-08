import ServerCard from './ServerCard'
import ServerUnit from './ServerUnit'
import DamageInstance from '@shared/models/DamageInstance'
import DamageSource from '@shared/enums/DamageSource'

export default class ServerDamageInstance implements DamageInstance {
	value: number
	source: DamageSource
	sourceCard: ServerCard | null

	constructor() {
		this.value = 0
		this.sourceCard = null
	}

	public clone(): ServerDamageInstance {
		const clone = new ServerDamageInstance()
		clone.value = this.value
		clone.source = this.source
		clone.sourceCard = this.sourceCard
		return clone
	}

	public static fromCard(value: number, sourceCard: ServerCard): ServerDamageInstance {
		const damageInstance = new ServerDamageInstance()
		damageInstance.value = value
		damageInstance.source = DamageSource.CARD
		damageInstance.sourceCard = sourceCard
		return damageInstance
	}

	public static fromUnit(value: number, sourceUnit: ServerUnit): ServerDamageInstance {
		const damageInstance = new ServerDamageInstance()
		damageInstance.value = value
		damageInstance.source = DamageSource.CARD
		damageInstance.sourceCard = sourceUnit.card
		return damageInstance
	}

	public static fromUniverse(value: number): ServerDamageInstance {
		const damageInstance = new ServerDamageInstance()
		damageInstance.value = value
		damageInstance.source = DamageSource.UNIVERSE
		return damageInstance
	}
}
