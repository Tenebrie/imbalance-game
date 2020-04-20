import ServerCard from './ServerCard'
import CardDeck from '@shared/models/CardDeck'
import HeroSatia from '../cards/experimental/heroes/HeroSatia'
import UnitRavenMessenger from '../cards/experimental/units/UnitRavenMessenger'
import UnitPossessedVulture from '../cards/experimental/units/UnitPossessedVulture'
import CardLibrary from '../libraries/CardLibrary'
import UnitMadBerserker from '../cards/experimental/units/UnitMadBerserker'
import UnitForestScout from '../cards/experimental/units/UnitForestScout'
import UnitUnfeelingWarrior from '../cards/experimental/units/UnitUnfeelingWarrior'
import UnitTwinBowArcher from '../cards/experimental/units/UnitTwinBowArcher'
import UnitChargingKnight from '../cards/neutral/UnitChargingKnight'
import UnitSpinningBarbarian from '../cards/experimental/units/UnitSpinningBarbarian'
import SpellMagicalStarfall from '../cards/experimental/spells/SpellMagicalStarfall'
import SpellRainOfFire from '../cards/experimental/spells/SpellRainOfFire'
import HeroIgnea from '../cards/experimental/heroes/HeroIgnea'
import UnitTreeOfLife from '../cards/experimental/units/UnitTreeOfLife'
import UnitVampireFledgling from '../cards/neutral/UnitVampireFledgling'
import UnitPriestessOfAedine from '../cards/neutral/UnitPriestessOfAedine'
import ServerGame from './ServerGame'
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
import UnitArcaneCrystal from '../cards/arcane/UnitArcaneCrystal'
import UnitIceSkinCrystal from '../cards/arcane/UnitIceSkinCrystal'
import SpellPermafrost from '../cards/arcane/SpellPermafrost'
import HeroRagingElemental from '../cards/arcane/HeroRagingElemental'

export default class ServerTemplateCardDeck implements CardDeck {
	unitCards: ServerCard[]
	spellCards: ServerCard[]

	constructor(unitCards: ServerCard[], spellCards: ServerCard[]) {
		this.unitCards = unitCards
		this.spellCards = spellCards
	}

	public addUnit(card: ServerCard): void {
		this.unitCards.push(card)
	}

	public addSpell(card: ServerCard): void {
		this.spellCards.push(card)
	}

	static emptyDeck(): ServerTemplateCardDeck {
		return new ServerTemplateCardDeck([], [])
	}

	static defaultDeck(game: ServerGame): ServerTemplateCardDeck {
		const deck = new ServerTemplateCardDeck([], [])

		deck.addUnit(CardLibrary.instantiate(new HeroZamarath(game)))
		deck.addUnit(CardLibrary.instantiate(new HeroRagingElemental(game)))
		deck.addUnit(CardLibrary.instantiate(new HeroSparklingSpirit(game)))
		// deck.addUnit(CardLibrary.instantiate(new HeroSatia(game)))
		// deck.addUnit(CardLibrary.instantiate(new HeroIgnea(game)))
		// deck.addUnit(CardLibrary.instantiate(new HeroRider1Famine(game)))
		// deck.addUnit(CardLibrary.instantiate(new HeroRider2Conquest(game)))
		// deck.addUnit(CardLibrary.instantiate(new HeroRider3War(game)))
		// deck.addUnit(CardLibrary.instantiate(new HeroRider4Death(game)))
		for (let i = 0; i < 3; i++) {
			deck.addUnit(CardLibrary.instantiate(new HeroRagingElemental(game)))
			deck.addUnit(CardLibrary.instantiate(new UnitChargingKnight(game)))
			deck.addUnit(CardLibrary.instantiate(new UnitSupplyWagon(game)))
			deck.addUnit(CardLibrary.instantiate(new UnitVampireFledgling(game)))
			// deck.addUnit(CardLibrary.instantiate(new UnitPriestessOfAedine(game)))
			// deck.addUnit(CardLibrary.instantiate(new UnitArcaneElemental(game)))
			// deck.addUnit(CardLibrary.instantiate(new UnitArcaneCrystal(game)))
			deck.addUnit(CardLibrary.instantiate(new UnitFlameTouchCrystal(game)))
			deck.addUnit(CardLibrary.instantiate(new UnitIceSkinCrystal(game)))
			deck.addUnit(CardLibrary.instantiate(new UnitStoneElemental(game)))

		}
		// for (let i = 0; i < 1; i++) {
		// 	deck.addUnit(CardLibrary.instantiate(new UnitTreeOfLife(game)))
		// 	deck.addUnit(CardLibrary.instantiate(new UnitSpinningBarbarian(game)))
		// 	deck.addUnit(CardLibrary.instantiate(new UnitRavenMessenger(game)))
		// 	deck.addUnit(CardLibrary.instantiate(new UnitPossessedVulture(game)))
		// 	deck.addUnit(CardLibrary.instantiate(new UnitMadBerserker(game)))
		// 	deck.addUnit(CardLibrary.instantiate(new UnitForestScout(game)))
		// 	deck.addUnit(CardLibrary.instantiate(new UnitUnfeelingWarrior(game)))
		// 	deck.addUnit(CardLibrary.instantiate(new UnitTwinBowArcher(game)))
		// }

		deck.addSpell(CardLibrary.instantiate(new SpellSpark(game)))
		deck.addSpell(CardLibrary.instantiate(new SpellSpeedPotion(game)))
		deck.addSpell(CardLibrary.instantiate(new SpellPermafrost(game)))

		return deck
	}

	static botDeck(game: ServerGame): ServerTemplateCardDeck {
		return ServerTemplateCardDeck.defaultDeck(game)
	}
}
