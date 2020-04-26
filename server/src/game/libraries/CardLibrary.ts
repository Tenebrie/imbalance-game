import ServerCard from '../models/ServerCard'
import HeroNightMaiden from '../cards/experimental/heroes/HeroNightMaiden'
import HeroSatia from '../cards/experimental/heroes/HeroSatia'
import UnitPossessedVulture from '../cards/experimental/units/UnitPossessedVulture'
import UnitRavenMessenger from '../cards/neutral/UnitRavenMessenger'
import ServerGame from '../models/ServerGame'
import VoidGame from '../utils/VoidGame'
import UnitMadBerserker from '../cards/experimental/units/UnitMadBerserker'
import UnitForestScout from '../cards/neutral/UnitForestScout'
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
import SpellSpark from '../cards/arcane/SpellSpark'
import UnitSupplyWagon from '../cards/neutral/UnitSupplyWagon'
import SpellSpeedPotion from '../cards/arcane/SpellSpeedPotion'
import UnitArcaneElemental from '../cards/arcane/UnitArcaneElemental'
import HeroZamarath from '../cards/arcane/HeroZamarath'
import HeroSparklingSpirit from '../cards/arcane/HeroSparklingSpirit'
import UnitFlameTouchCrystal from '../cards/arcane/UnitFlameTouchCrystal'
import UnitStoneElemental from '../cards/arcane/UnitStoneElemental'
import UnitTinySparkling from '../cards/arcane/UnitTinySparkling'
import UnitArcaneCrystal from '../cards/arcane/UnitArcaneCrystal'
import UnitIceSkinCrystal from '../cards/arcane/UnitIceSkinCrystal'
import SpellPermafrost from '../cards/arcane/SpellPermafrost'
import HeroRagingElemental from '../cards/arcane/HeroRagingElemental'
import HeroKroLah from '../cards/arcane/HeroKroLah'
import HeroGarellion from '../cards/arcane/HeroGarellion'

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
			HeroRagingElemental,
			HeroKroLah,
			HeroGarellion,
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
			UnitArcaneCrystal,
			UnitFlameTouchCrystal,
			UnitIceSkinCrystal,
			UnitStoneElemental,
			UnitTinySparkling,
			SpellRainOfFire,
			SpellMagicalStarfall,
			SpellSpark,
			SpellSpeedPotion,
			SpellPermafrost
		]

		GameLibrary.cards = cards.map(prototype => {
			const cardPrototype = new prototype(VoidGame.get())
			const className = prototype.name.substr(0, 1).toLowerCase() + prototype.name.substr(1)
			cardPrototype.class = className
			cardPrototype.power = cardPrototype.basePower
			cardPrototype.attack = cardPrototype.baseAttack
			cardPrototype.name = `card.name.${className}`
			cardPrototype.title = `card.title.${className}`
			cardPrototype.description = `card.description.${className}`
			return cardPrototype
		})
	}

	public static findPrototypeById(id: string): ServerCard | null {
		return this.cards.find(card => card.id === id)
	}

	public static instantiate(card: ServerCard): ServerCard {
		const cardClass = card.constructor.name.substr(0, 1).toLowerCase() + card.constructor.name.substr(1)
		return this.instantiateByClass(card.game, cardClass)
	}

	public static instantiateByClass(game: ServerGame, cardClass: string): ServerCard {
		const original = GameLibrary.cards.find(card => {
			return card.class === cardClass
		})
		if (!original) {
			console.error(`No registered card with class '${cardClass}'!`)
			throw new Error(`No registered card with class '${cardClass}'!`)
		}

		const clone: ServerCard = new original.constructor(game)
		clone.type = original.type
		clone.class = cardClass

		clone.name = original.name
		clone.title = original.title
		clone.baseTribes = (original.baseTribes || []).slice()
		clone.baseFeatures = (original.baseFeatures || []).slice()
		clone.description = original.description
		clone.game = game
		clone.power = clone.basePower
		clone.attack = clone.baseAttack
		clone.attackRange = clone.baseAttackRange
		clone.healthArmor = clone.baseHealthArmor
		return clone
	}
}
