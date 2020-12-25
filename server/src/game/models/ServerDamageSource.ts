import ServerCard from './ServerCard'
import ServerUnit from './ServerUnit'
import DamageInstance from '@shared/models/DamageInstance'
import DamageSource from '@shared/enums/DamageSource'

type NumberOrGetter = number | ((card: ServerCard) => number)

const collapseValue = (value: NumberOrGetter, sourceCard: ServerCard) => {
	if (typeof value === 'function') {
		return value(sourceCard)
	}
	return value
}

export default class ServerDamageInstance implements DamageInstance {
	value: number
	source: DamageSource | undefined
	sourceCard: ServerCard | undefined
	proxyCard: ServerCard | undefined
	redirectHistory: ServerDamageInstance[] = []

	private constructor() {
		this.value = 0
	}

	public clone(): ServerDamageInstance {
		const clone = new ServerDamageInstance()
		clone.value = this.value
		clone.source = this.source
		clone.sourceCard = this.sourceCard
		clone.proxyCard = this.proxyCard
		clone.redirectHistory = this.redirectHistory.slice()
		return clone
	}

	public static fromCard(value: NumberOrGetter, sourceCard: ServerCard): ServerDamageInstance {
		const damageInstance = new ServerDamageInstance()
		damageInstance.value = collapseValue(value, sourceCard)
		damageInstance.source = DamageSource.CARD
		damageInstance.sourceCard = sourceCard
		return damageInstance
	}

	public static fromUnit(value: NumberOrGetter, sourceUnit: ServerUnit): ServerDamageInstance {
		const damageInstance = new ServerDamageInstance()
		damageInstance.value = collapseValue(value, sourceUnit.card)
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

	public static redirectedFrom(original: ServerDamageInstance, proxy: ServerCard): ServerDamageInstance {
		const damageInstance = original.clone()
		damageInstance.proxyCard = proxy
		damageInstance.redirectHistory = original.redirectHistory.concat(damageInstance)
		return damageInstance
	}
}
