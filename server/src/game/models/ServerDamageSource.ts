import ServerCard from './ServerCard'
import ServerUnit from './ServerUnit'
import DamageInstance from '@shared/models/DamageInstance'
import DamageSource from '@shared/enums/DamageSource'

export default class ServerDamageInstance implements DamageInstance {
	value: number
	source: DamageSource
	sourceUnit: ServerUnit | null
	sourceSpell: ServerCard | null

	constructor() {
		this.value = 0
		this.sourceUnit = null
		this.sourceSpell = null
	}

	public static fromUnit(value: number, sourceUnit: ServerUnit): ServerDamageInstance {
		const damageInstance = new ServerDamageInstance()
		damageInstance.value = value
		damageInstance.source = DamageSource.UNIT
		damageInstance.sourceUnit = sourceUnit
		return damageInstance
	}

	public static fromSpell(value: number, sourceSpell: ServerCard): ServerDamageInstance {
		const damageInstance = new ServerDamageInstance()
		damageInstance.value = value
		damageInstance.source = DamageSource.SPELL
		damageInstance.sourceSpell = sourceSpell
		return damageInstance
	}

	public static fromUniverse(value: number): ServerDamageInstance {
		const damageInstance = new ServerDamageInstance()
		damageInstance.value = value
		damageInstance.source = DamageSource.UNIVERSE
		return damageInstance
	}
}
