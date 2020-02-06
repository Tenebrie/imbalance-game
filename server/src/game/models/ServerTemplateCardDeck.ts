import ServerCard from './ServerCard'
import CardDeck from '../shared/models/CardDeck'
import HeroSatia from '../cards/experimental/heroes/HeroSatia'
import UnitRavenMessenger from '../cards/experimental/units/UnitRavenMessenger'
import UnitPossessedVulture from '../cards/experimental/units/UnitPossessedVulture'
import CardLibrary from '../libraries/CardLibrary'
import UnitMadBerserker from '../cards/experimental/units/UnitMadBerserker'
import UnitForestScout from '../cards/experimental/units/UnitForestScout'
import UnitUnfeelingWarrior from '../cards/experimental/units/UnitUnfeelingWarrior'
import UnitTwinBowArcher from '../cards/experimental/units/UnitTwinBowArcher'
import UnitChargingKnight from '../cards/experimental/units/UnitChargingKnight'
import UnitSpinningBarbarian from '../cards/experimental/units/UnitSpinningBarbarian'
import SpellMagicalStarfall from '../cards/experimental/spells/SpellMagicalStarfall'
import SpellRainOfFire from '../cards/experimental/spells/SpellRainOfFire'
import HeroIgnea from '../cards/experimental/heroes/HeroIgnea'
import BuildingTreeOfLife from '../cards/experimental/buildings/BuildingTreeOfLife'
import UnitVampireFledgling from '../cards/experimental/units/UnitVampireFledgling'
import UnitPriestessOfAedine from '../cards/experimental/units/UnitPriestessOfAidine'
import ServerGame from './ServerGame'
import HeroRider1Famine from '../cards/experimental/heroes/HeroRider1Famine'
import HeroRider2Conquest from '../cards/experimental/heroes/HeroRider2Conquest'
import HeroRider3War from '../cards/experimental/heroes/HeroRider3War'
import HeroRider4Death from '../cards/experimental/heroes/HeroRider4Death'

export default class ServerTemplateCardDeck extends CardDeck {
	cards: ServerCard[]

	constructor(cards: ServerCard[]) {
		super(cards)
		this.cards = cards
	}

	public addCard(card: ServerCard): void {
		this.cards.push(card)
	}

	static emptyDeck(): ServerTemplateCardDeck {
		return new ServerTemplateCardDeck([])
	}

	static defaultDeck(game: ServerGame): ServerTemplateCardDeck {
		const deck = new ServerTemplateCardDeck([])

		deck.addCard(CardLibrary.instantiate(new HeroSatia(game)))
		deck.addCard(CardLibrary.instantiate(new HeroIgnea(game)))
		deck.addCard(CardLibrary.instantiate(new HeroRider1Famine(game)))
		deck.addCard(CardLibrary.instantiate(new HeroRider2Conquest(game)))
		deck.addCard(CardLibrary.instantiate(new HeroRider3War(game)))
		deck.addCard(CardLibrary.instantiate(new HeroRider4Death(game)))
		for (let i = 0; i < 3; i++) {
			deck.addCard(CardLibrary.instantiate(new BuildingTreeOfLife(game)))
			deck.addCard(CardLibrary.instantiate(new UnitVampireFledgling(game)))
			deck.addCard(CardLibrary.instantiate(new UnitSpinningBarbarian(game)))
			deck.addCard(CardLibrary.instantiate(new UnitPriestessOfAedine(game)))
			deck.addCard(CardLibrary.instantiate(new SpellRainOfFire(game)))
		}
		for (let i = 0; i < 1; i++) {
			deck.addCard(CardLibrary.instantiate(new UnitRavenMessenger(game)))
			deck.addCard(CardLibrary.instantiate(new UnitPossessedVulture(game)))
			deck.addCard(CardLibrary.instantiate(new UnitMadBerserker(game)))
			deck.addCard(CardLibrary.instantiate(new UnitForestScout(game)))
			deck.addCard(CardLibrary.instantiate(new UnitUnfeelingWarrior(game)))
			deck.addCard(CardLibrary.instantiate(new UnitChargingKnight(game)))
			deck.addCard(CardLibrary.instantiate(new UnitTwinBowArcher(game)))
			deck.addCard(CardLibrary.instantiate(new SpellMagicalStarfall(game)))
		}

		return deck
	}

	static botDeck(game: ServerGame): ServerTemplateCardDeck {
		const deck = new ServerTemplateCardDeck([])

		deck.addCard(CardLibrary.instantiate(new HeroSatia(game)))
		deck.addCard(CardLibrary.instantiate(new HeroIgnea(game)))
		for (let i = 0; i < 3; i++) {
			deck.addCard(CardLibrary.instantiate(new UnitSpinningBarbarian(game)))
			deck.addCard(CardLibrary.instantiate(new SpellRainOfFire(game)))
			deck.addCard(CardLibrary.instantiate(new UnitRavenMessenger(game)))
			deck.addCard(CardLibrary.instantiate(new UnitPossessedVulture(game)))
			deck.addCard(CardLibrary.instantiate(new UnitMadBerserker(game)))
			deck.addCard(CardLibrary.instantiate(new UnitForestScout(game)))
			deck.addCard(CardLibrary.instantiate(new UnitUnfeelingWarrior(game)))
			deck.addCard(CardLibrary.instantiate(new UnitChargingKnight(game)))
			deck.addCard(CardLibrary.instantiate(new UnitTwinBowArcher(game)))
			deck.addCard(CardLibrary.instantiate(new SpellMagicalStarfall(game)))
		}

		return deck
	}
}
