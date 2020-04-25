import Unit from './Unit'

export default class AttackOrder {
	attacker: Unit
	target: Unit

	constructor(attacker: Unit, target: Unit) {
		this.attacker = attacker
		this.target = target
	}
}
