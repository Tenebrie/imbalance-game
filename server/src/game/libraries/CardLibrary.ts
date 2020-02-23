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
import UnitChargingKnight from '../cards/neutral/UnitChargingKnight'
import UnitSpinningBarbarian from '../cards/experimental/units/UnitSpinningBarbarian'
import SpellRainOfFire from '../cards/experimental/spells/SpellRainOfFire'
import SpellMagicalStarfall from '../cards/experimental/spells/SpellMagicalStarfall'
import UnitTreeOfLife from '../cards/experimental/units/UnitTreeOfLife'
import UnitVampireFledgling from '../cards/neutral/UnitVampireFledgling'
import HeroIgnea from '../cards/experimental/heroes/HeroIgnea'
import UnitPriestessOfAedine from '../cards/neutral/UnitPriestessOfAedine'
import HeroRider1Famine from '../cards/experimental/heroes/HeroRider1Famine'
import HeroRider2Conquest from '../cards/experimental/heroes/HeroRider2Conquest'
import HeroRider3War from '../cards/experimental/heroes/HeroRider3War'
import HeroRider4Death from '../cards/experimental/heroes/HeroRider4Death'
import SpellSpark from '../cards/experimental/spells/SpellSpark'
import UnitSupplyWagon from '../cards/neutral/UnitSupplyWagon'
import SpellSpeedPotion from '../cards/experimental/spells/SpellSpeedPotion'
import UnitArcaneElemental from '../cards/arcane/UnitArcaneElemental'
import HeroZamarath from '../cards/arcane/HeroZamarath'
import HeroSparklingSpirit from '../cards/arcane/HeroSparklingSpirit'
import UnitFlameTouchCrystal from '../cards/arcane/UnitFlameTouchCrystal'
import UnitStoneElemental from '../cards/arcane/UnitStoneElemental'
import UnitTinySparkling from '../cards/arcane/UnitTinySparkling'

export default class GameLibrary {
	static cards: any[]

	constructor() {
		const cards = [
			HeroSatia,
			HeroNightMaiden,
			HeroIgnea,
			HeroRider1Famine,
			HeroRider2Conquest,
			HeroRider3War,
			HeroRider4Death,
			HeroZamarath,
			HeroSparklingSpirit,
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
			UnitTreeOfLife,
			UnitSupplyWagon,
			UnitArcaneElemental,
			UnitFlameTouchCrystal,
			UnitStoneElemental,
			UnitTinySparkling,
			SpellRainOfFire,
			SpellMagicalStarfall,
			SpellSpark,
			SpellSpeedPotion
		]

		GameLibrary.cards = cards.map(prototype => {
			const cardPrototype = new prototype(VoidGame.get())
			cardPrototype.cardClass = prototype.name.substr(0, 1).toLowerCase() + prototype.name.substr(1)
			cardPrototype.power = cardPrototype.basePower
			cardPrototype.attack = cardPrototype.baseAttack
			return cardPrototype
		})
	}

	public static instantiate(card: ServerCard): ServerCard {
		const cardClass = card.constructor.name.substr(0, 1).toLowerCase() + card.constructor.name.substr(1)
		return this.instantiateByClass(card.game, cardClass)
	}

	public static instantiateByClass(game: ServerGame, cardClass: string): ServerCard {
		const original = GameLibrary.cards.find(card => {
			return card.cardClass === cardClass
		})
		if (!original) {
			console.error(`No registered card with class '${cardClass}'!`)
			throw new Error(`No registered card with class '${cardClass}'!`)
		}

		const clone: ServerCard = new original.constructor(game)
		clone.cardType = original.cardType
		clone.cardClass = cardClass

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
