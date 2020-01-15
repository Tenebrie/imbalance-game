import ServerCard from '../../models/game/ServerCard'
import HeroNightLady from '../../cards/heroes/HeroNightLady'
import HeroSatia from '../../cards/heroes/HeroSatia'
import SpellCardDrawer from '../../cards/spells/SpellCardDrawer'
import SpellCardRevealer from '../../cards/spells/SpellCardRevealer'
import UnitPossessedVulture from '../../cards/units/UnitPossessedVulture'
import UnitPostalRaven from '../../cards/units/UnitPostalRaven'
import ServerGame from '../game/ServerGame'
import VoidGame from '../../utils/VoidGame'

export default class GameLibrary {
	static cards: any[]

	constructor() {
		const cards = [
			HeroNightLady,
			HeroSatia,
			SpellCardDrawer,
			SpellCardRevealer,
			UnitPossessedVulture,
			UnitPostalRaven
		]

		GameLibrary.cards = cards.map(prototype => {
			const cardPrototype = new prototype(VoidGame.get())
			cardPrototype.cardClass = prototype.name
			cardPrototype.power = cardPrototype.basePower
			cardPrototype.attack = cardPrototype.baseAttack
			return cardPrototype
		})
	}

	public static createCard(card: ServerCard): ServerCard {
		return this.createCardById(card.game, card.constructor.name)
	}

	public static createCardById(game: ServerGame, cardClass: string): ServerCard {
		const cardClassLowerCase = cardClass.toLowerCase()
		const original = GameLibrary.cards.find(card => {
			return card.cardClass.toLowerCase() === cardClassLowerCase
		})
		if (!original) {
			throw new Error(`No registered card with class '${cardClass}'!`)
		}
		const clone: ServerCard = new original.constructor()
		clone.cardClass = original.constructor.name
		clone.game = game
		clone.power = clone.basePower
		clone.attack = clone.baseAttack
		return clone
	}
}
