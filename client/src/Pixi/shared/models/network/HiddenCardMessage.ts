import Card from '../Card'
import CardType from '../../enums/CardType'
import CardTribe from '../../enums/CardTribe'
import RichTextVariables from '../RichTextVariables'
import UnitSubtype from '../../enums/CardColor'
import HiddenCardBuffsMessage from './HiddenCardBuffsMessage'

export default class HiddenCardMessage implements Card {
	id: string
	cardType = CardType.HIDDEN
	cardClass = 'cardBack'
	unitSubtype: UnitSubtype | null

	cardName = ''
	cardTitle = ''
	cardBuffs: HiddenCardBuffsMessage
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
		this.cardBuffs = new HiddenCardBuffsMessage(card.cardBuffs)
	}

	evaluateVariables(): RichTextVariables {
		return {}
	}

	static fromCard(card: Card): HiddenCardMessage {
		return new HiddenCardMessage(card)
	}
}
