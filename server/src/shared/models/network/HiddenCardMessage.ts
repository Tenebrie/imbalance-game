import Card from '../Card'
import CardType from '../../enums/CardType'
import CardTribe from '../../enums/CardTribe'

export default class HiddenCardMessage {
	id: string
	cardType = CardType.HIDDEN
	cardClass = 'cardBack'

	cardName = ''
	cardTitle = ''
	cardTribes: CardTribe[] = []
	cardDescription = ''

	power = 1
	attack = 1
	attackRange = 1
	healthArmor = 0

	basePower = 1
	baseAttack = 1
	baseAttackRange = 1
	baseHealthArmor = 0

	constructor(card: Card) {
		this.id = card.id
	}

	static fromCard(card: Card): HiddenCardMessage {
		return new HiddenCardMessage(card)
	}
}
