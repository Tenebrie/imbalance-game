import Card from '../Card'
import CardType from '../../enums/CardType'
import HiddenBuffContainerMessage from './HiddenBuffContainerMessage'
import CardFaction from '../../enums/CardFaction'

export default class HiddenCardMessage {
	id: string
	type = CardType.HIDDEN
	class: string
	faction = CardFaction.NEUTRAL

	buffs: HiddenBuffContainerMessage
	variables = {}

	name = 'card.hidden.name'

	power = 1
	armor = 0
	attack = 1
	attackRange = 1

	basePower = 1
	baseArmor = 0
	baseAttack = 1
	baseAttackRange = 1

	constructor(card: Card) {
		this.id = card.id
		this.buffs = new HiddenBuffContainerMessage(card.buffs)
		if (card.type === CardType.UNIT || card.type === CardType.TOKEN) {
			this.class = 'unitCardBack'
		} else {
			this.class = 'spellCardBack'
		}
	}

	static fromCard(card: Card): HiddenCardMessage {
		return new HiddenCardMessage(card)
	}
}
