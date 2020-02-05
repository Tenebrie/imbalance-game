import ServerCard from './ServerCard'
import CardDeck from '../shared/models/CardDeck'
import HeroSatia from '../cards/experimental/heroes/HeroSatia'
import UnitRavenMessenger from '../cards/experimental/units/UnitRavenMessenger'
import ServerGame from './ServerGame'
import UnitPossessedVulture from '../cards/experimental/units/UnitPossessedVulture'
import CardLibrary from '../libraries/CardLibrary'
import HeroNightMaiden from '../cards/experimental/heroes/HeroNightMaiden'
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

export default class ServerCardDeck extends CardDeck {
	game: ServerGame
	cards: ServerCard[]

	constructor(game: ServerGame, cards: ServerCard[]) {
		super(cards)
		this.game = game
		this.cards = cards
	}

	public addCard(card: ServerCard): void {
		this.cards.push(card)
	}

	public drawCard(): ServerCard {
		return this.cards.pop()
	}

	public findCardById(cardId: string): ServerCard | null {
		return this.cards.find(card => card.id === cardId) || null
	}

	public shuffle(): void {
		let counter = this.cards.length

		while (counter > 0) {
			const index = Math.floor(Math.random() * counter)
			counter--
			const temp = this.cards[counter]
			this.cards[counter] = this.cards[index]
			this.cards[index] = temp
		}
	}

	static emptyDeck(game: ServerGame): ServerCardDeck {
		return new ServerCardDeck(game, [])
	}

	static defaultDeck(game: ServerGame): ServerCardDeck {
		const deck = new ServerCardDeck(game, [])

		deck.addCard(CardLibrary.createCard(new HeroSatia(game)))
		deck.addCard(CardLibrary.createCard(new HeroIgnea(game)))
		for (let i = 0; i < 3; i++) {
			deck.addCard(CardLibrary.createCard(new BuildingTreeOfLife(game)))
			deck.addCard(CardLibrary.createCard(new UnitVampireFledgling(game)))
			deck.addCard(CardLibrary.createCard(new UnitSpinningBarbarian(game)))
			deck.addCard(CardLibrary.createCard(new UnitPriestessOfAedine(game)))
			deck.addCard(CardLibrary.createCard(new SpellRainOfFire(game)))
		}
		for (let i = 0; i < 1; i++) {
			deck.addCard(CardLibrary.createCard(new UnitRavenMessenger(game)))
			deck.addCard(CardLibrary.createCard(new UnitPossessedVulture(game)))
			deck.addCard(CardLibrary.createCard(new UnitMadBerserker(game)))
			deck.addCard(CardLibrary.createCard(new UnitForestScout(game)))
			deck.addCard(CardLibrary.createCard(new UnitUnfeelingWarrior(game)))
			deck.addCard(CardLibrary.createCard(new UnitChargingKnight(game)))
			deck.addCard(CardLibrary.createCard(new UnitTwinBowArcher(game)))
			deck.addCard(CardLibrary.createCard(new SpellMagicalStarfall(game)))
		}

		deck.shuffle()

		return deck
	}
}
