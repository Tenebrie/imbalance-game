import ServerCard from '../game/models/ServerCard'
import CardTribe from '../game/shared/enums/CardTribe'

export default {
	isLiving(card: ServerCard) {
		return !card.cardTribes.includes(CardTribe.BUILDING) && !card.cardTribes.includes(CardTribe.UNDEAD) && !card.cardTribes.includes(CardTribe.VAMPIRE)
	}
}
