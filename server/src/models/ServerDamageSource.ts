import ServerCard from './game/ServerCard'
import ServerCardOnBoard from '../libraries/game/ServerCardOnBoard'
import DamageInstance from '../shared/models/DamageInstance'
import DamageSource from '../shared/enums/DamageSource'

export default class ServerDamageInstance implements DamageInstance {
	value: number
	source: DamageSource
	sourceSpell: ServerCard | null
	sourceUnit: ServerCardOnBoard | null

	constructor() {
		this.value = 0
		this.sourceSpell = null
		this.sourceUnit = null
	}

	public static fromSpell(value: number, sourceSpell: ServerCard): ServerDamageInstance {
		const damageInstance = new ServerDamageInstance()
		damageInstance.value = value
		damageInstance.source = DamageSource.SPELL
		damageInstance.sourceSpell = sourceSpell
		return damageInstance
	}

	public static fromUnit(value: number, sourceUnit: ServerCardOnBoard): ServerDamageInstance {
		const damageInstance = new ServerDamageInstance()
		damageInstance.value = value
		damageInstance.source = DamageSource.UNIT
		damageInstance.sourceUnit = sourceUnit
		return damageInstance
	}
}
