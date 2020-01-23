import ServerCard from '../models/ServerCard'
import HeroNightMaiden from '../cards/heroes/HeroNightMaiden'
import HeroSatia from '../cards/heroes/HeroSatia'
import UnitPossessedVulture from '../cards/units/UnitPossessedVulture'
import UnitRavenMessenger from '../cards/units/UnitRavenMessenger'
import ServerGame from '../models/ServerGame'
import VoidGame from '../utils/VoidGame'
import UnitMadBerserker from '../cards/units/UnitMadBerserker'
import UnitForestScout from '../cards/units/UnitForestScout'
import UnitTwinBowArcher from '../cards/units/UnitTwinBowArcher'
import UnitUnfeelingWarrior from '../cards/units/UnitUnfeelingWarrior'
import UnitChargingKnight from '../cards/units/UnitChargingKnight'
import UnitSpinningBarbarian from '../cards/units/UnitSpinningBarbarian'
import SpellRainOfFire from '../cards/spells/SpellRainOfFire'
import SpellMagicalStarfall from '../cards/spells/SpellMagicalStarfall'
import CardType from '../shared/enums/CardType'
import UnitSubtype from '../shared/enums/UnitSubtype'

export default class GameLibrary {
	static cards: any[]

	constructor() {
		const cards = [
			HeroNightMaiden,
			HeroSatia,
			UnitPossessedVulture,
			UnitRavenMessenger,
			UnitMadBerserker,
			UnitForestScout,
			UnitTwinBowArcher,
			UnitUnfeelingWarrior,
			UnitChargingKnight,
			UnitSpinningBarbarian,
			SpellRainOfFire,
			SpellMagicalStarfall
		]

		GameLibrary.cards = cards.map(prototype => {
			const cardPrototype = new prototype(VoidGame.get())
			cardPrototype.cardClass = prototype.name.substr(0, 1).toLowerCase() + prototype.name.substr(1)
			cardPrototype.power = cardPrototype.basePower
			cardPrototype.attack = cardPrototype.baseAttack
			return cardPrototype
		})
	}

	public static createCard(card: ServerCard): ServerCard {
		const cardClass = card.constructor.name.substr(0, 1).toLowerCase() + card.constructor.name.substr(1)
		return this.createCardByClass(card.game, cardClass)
	}

	public static createCardByClass(game: ServerGame, cardClass: string): ServerCard {
		const original = GameLibrary.cards.find(card => {
			return card.cardClass === cardClass
		})
		if (!original) {
			throw new Error(`No registered card with class '${cardClass}'!`)
		}

		let unitSubtype = null
		if (cardClass.startsWith('hero')) {
			unitSubtype = UnitSubtype.HERO
		} else if (cardClass.startsWith('veteran')) {
			unitSubtype = UnitSubtype.VETERAN
		} else if (cardClass.startsWith('unit')) {
			unitSubtype = UnitSubtype.PAWN
		}

		const clone: ServerCard = new original.constructor()
		clone.cardType = original.cardType
		clone.cardClass = cardClass
		clone.unitSubtype = unitSubtype

		clone.cardName = `card.name.${cardClass}`
		clone.cardTitle = `card.title.${cardClass}`
		clone.cardTribes = (original.cardTribes || []).slice()
		clone.cardDescription = `card.description.${cardClass}`
		clone.game = game
		clone.power = clone.basePower
		clone.attack = clone.baseAttack
		clone.attackRange = clone.baseAttackRange
		clone.healthArmor = clone.baseHealthArmor
		return clone
	}
}
