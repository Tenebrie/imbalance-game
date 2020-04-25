import ServerCard from '../game/models/ServerCard'
import CardTribe from '@shared/enums/CardTribe'

export default {
	isLiving(card: ServerCard) {
		return !card.tribes.includes(CardTribe.BUILDING) && !card.tribes.includes(CardTribe.UNDEAD) && !card.tribes.includes(CardTribe.VAMPIRE)
	}
}
