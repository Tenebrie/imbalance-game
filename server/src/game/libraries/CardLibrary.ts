import ServerCard from '../models/ServerCard'
import HeroNightMaiden from '../cards/experimental/heroes/HeroNightMaiden'
import HeroSatia from '../cards/experimental/heroes/HeroSatia'
import UnitPossessedVulture from '../cards/experimental/units/UnitPossessedVulture'
import UnitRavenMessenger from '../cards/experimental/units/UnitRavenMessenger'
import ServerGame from '../models/ServerGame'
import VoidGame from '../utils/VoidGame'
import UnitMadBerserker from '../cards/experimental/units/UnitMadBerserker'
import UnitForestScout from '../cards/experimental/units/UnitForestScout'
import UnitTwinBowArcher from '../cards/experimental/units/UnitTwinBowArcher'
import UnitUnfeelingWarrior from '../cards/experimental/units/UnitUnfeelingWarrior'
import UnitChargingKnight from '../cards/experimental/units/UnitChargingKnight'
import UnitSpinningBarbarian from '../cards/experimental/units/UnitSpinningBarbarian'
import SpellRainOfFire from '../cards/experimental/spells/SpellRainOfFire'
import SpellMagicalStarfall from '../cards/experimental/spells/SpellMagicalStarfall'
import CardType from '../shared/enums/CardType'
import UnitSubtype from '../shared/enums/UnitSubtype'
import BuildingTreeOfLife from '../cards/experimental/buildings/BuildingTreeOfLife'
import UnitVampireFledgling from '../cards/experimental/units/UnitVampireFledgling'
import HeroIgnea from '../cards/experimental/heroes/HeroIgnea'
import UnitPriestessOfAedine from '../cards/experimental/units/UnitPriestessOfAidine'

export default class GameLibrary {
	static cards: any[]

	constructor() {
		const cards = [
			HeroSatia,
			HeroNightMaiden,
			HeroIgnea,
			UnitPossessedVulture,
			UnitRavenMessenger,
			UnitMadBerserker,
			UnitForestScout,
			UnitTwinBowArcher,
			UnitUnfeelingWarrior,
			UnitChargingKnight,
			UnitSpinningBarbarian,
			UnitVampireFledgling,
			UnitPriestessOfAedine,
			BuildingTreeOfLife,
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
			console.error(`No registered card with class '${cardClass}'!`)
			throw new Error(`No registered card with class '${cardClass}'!`)
		}

		let unitSubtype = null
		if (cardClass.startsWith('hero')) {
			unitSubtype = UnitSubtype.HERO
		} else if (cardClass.startsWith('veteran')) {
			unitSubtype = UnitSubtype.VETERAN
		} else if (cardClass.startsWith('unit')) {
			unitSubtype = UnitSubtype.PAWN
		} else if (cardClass.startsWith('building')) {
			unitSubtype = UnitSubtype.BUILDING
		} else {
			unitSubtype = UnitSubtype.OTHER
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
