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
import LeaderVelRaminea from '../cards/arcane/LeaderVelRaminea'
import LeaderNighterie from '../cards/arcane/LeaderNighterie'
import LeaderVelElleron from '../cards/arcane/LeaderVelElleron'
import HeroEpicPlaceholder01 from '../cards/arcane/HeroEpicPlaceholder01'
import HeroEpicPlaceholder02 from '../cards/arcane/HeroEpicPlaceholder02'
import HeroEpicPlaceholder03 from '../cards/arcane/HeroEpicPlaceholder03'
import HeroEpicPlaceholder04 from '../cards/arcane/HeroEpicPlaceholder04'
import HeroLegendaryPlaceholder01 from '../cards/arcane/HeroLegendaryPlaceholder01'

export default class GameLibrary {
	static cards: ServerCard[]

	constructor() {
		const cardPrototypes = [
			LeaderVelElleron,
			LeaderVelRaminea,
			LeaderNighterie,
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
			SpellPermafrost,
			HeroLegendaryPlaceholder01,
			HeroEpicPlaceholder01,
			HeroEpicPlaceholder02,
			HeroEpicPlaceholder03,
			HeroEpicPlaceholder04,
		]

		GameLibrary.cards = cardPrototypes.map(prototype => {
			const referenceInstance = new prototype(VoidGame.get())
			const className = prototype.name.substr(0, 1).toLowerCase() + prototype.name.substr(1)
			referenceInstance.class = className
			referenceInstance.power = referenceInstance.basePower
			referenceInstance.attack = referenceInstance.baseAttack
			referenceInstance.name = `card.name.${className}`
			referenceInstance.title = `card.title.${className}`
			referenceInstance.description = `card.description.${className}`
			return referenceInstance
		})
	}

	public static get collectibleCards(): ServerCard[] {
		const cards = this.cards as ServerCard[]
		return cards.filter(card => card.isCollectible())
	}

	public static findPrototypeById(id: string): ServerCard | null {
		return this.cards.find(card => card.id === id)
	}

	public static instantiateByInstance(card: ServerCard): ServerCard {
		const cardClass = card.constructor.name.substr(0, 1).toLowerCase() + card.constructor.name.substr(1)
		return this.instantiateByClass(card.game, cardClass)
	}

	public static instantiateByConstructor(game: ServerGame, prototype: Function): ServerCard {
		const cardClass = prototype.name.substr(0, 1).toLowerCase() + prototype.name.substr(1)
		return this.instantiateByClass(game, cardClass)
	}

	public static instantiateByClass(game: ServerGame, cardClass: string): ServerCard {
		const reference = GameLibrary.cards.find(card => {
			return card.class === cardClass
		})
		if (!reference) {
			console.error(`No registered card with class '${cardClass}'!`)
			throw new Error(`No registered card with class '${cardClass}'!`)
		}

		// @ts-ignore
		const clone: ServerCard = new reference.constructor(game)
		clone.type = reference.type
		clone.class = cardClass

		clone.name = reference.name
		clone.title = reference.title
		clone.baseTribes = (reference.baseTribes || []).slice()
		clone.baseFeatures = (reference.baseFeatures || []).slice()
		clone.description = reference.description
		clone.game = game
		clone.power = clone.basePower
		clone.attack = clone.baseAttack
		clone.attackRange = clone.baseAttackRange
		clone.healthArmor = clone.baseHealthArmor
		return clone
	}
}
