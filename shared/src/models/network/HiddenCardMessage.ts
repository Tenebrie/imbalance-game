import Card from '../Card'
import CardType from '../../enums/CardType'
import CardTribe from '../../enums/CardTribe'
import CardColor from '../../enums/CardColor'
import HiddenBuffContainerMessage from './HiddenBuffContainerMessage'
import RichTextVariables from '../RichTextVariables'
import CardFeature from '../../enums/CardFeature'

export default class HiddenCardMessage implements Card {
	id: string
	type = CardType.HIDDEN
	class = 'cardBack'
	color: CardColor

	name = ''
	title = ''
	buffs: HiddenBuffContainerMessage
	baseTribes: CardTribe[] = []
	baseFeatures: CardFeature[] = []

	description = ''
	variables = {}

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
		this.buffs = new HiddenBuffContainerMessage(card.buffs)
	}

	evaluateVariables(): RichTextVariables {
		return this.variables
	}

	static fromCard(card: Card): HiddenCardMessage {
		return new HiddenCardMessage(card)
	}
}
