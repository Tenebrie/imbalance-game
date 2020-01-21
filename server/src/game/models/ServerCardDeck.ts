import ServerCard from './ServerCard'
import CardDeck from '../shared/models/CardDeck'
import HeroSatia from '../cards/heroes/HeroSatia'
import UnitRavenMessenger from '../cards/units/UnitRavenMessenger'
import ServerGame from './ServerGame'
import UnitPossessedVulture from '../cards/units/UnitPossessedVulture'
import CardLibrary from '../libraries/CardLibrary'
import HeroNightMaiden from '../cards/heroes/HeroNightMaiden'
import UnitMadBerserker from '../cards/units/UnitMadBerserker'
import UnitForestScout from '../cards/units/UnitForestScout'
import UnitUnfeelingWarrior from '../cards/units/UnitUnfeelingWarrior'
import UnitTwinBowArcher from '../cards/units/UnitTwinBowArcher'
import UnitChargingKnight from '../cards/units/UnitChargingKnight'
import UnitSpinningBarbarian from '../cards/units/UnitSpinningBarbarian'
import SpellMagicalStarfall from '../cards/spells/SpellMagicalStarfall'
import SpellRainOfFire from '../cards/spells/SpellRainOfFire'

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
		for (let i = 0; i < 3; i++) {
			deck.addCard(CardLibrary.createCard(new UnitRavenMessenger(game)))
		}
		for (let i = 0; i < 3; i++) {
			deck.addCard(CardLibrary.createCard(new UnitPossessedVulture(game)))
		}
		for (let i = 0; i < 3; i++) {
			deck.addCard(CardLibrary.createCard(new UnitMadBerserker(game)))
		}
		for (let i = 0; i < 3; i++) {
			deck.addCard(CardLibrary.createCard(new UnitForestScout(game)))
		}
		for (let i = 0; i < 3; i++) {
			deck.addCard(CardLibrary.createCard(new UnitUnfeelingWarrior(game)))
		}
		for (let i = 0; i < 3; i++) {
			deck.addCard(CardLibrary.createCard(new UnitChargingKnight(game)))
		}
		for (let i = 0; i < 3; i++) {
			deck.addCard(CardLibrary.createCard(new UnitSpinningBarbarian(game)))
		}
		for (let i = 0; i < 3; i++) {
			deck.addCard(CardLibrary.createCard(new UnitTwinBowArcher(game)))
		}
		for (let i = 0; i < 3; i++) {
			deck.addCard(CardLibrary.createCard(new SpellMagicalStarfall(game)))
		}
		for (let i = 0; i < 3; i++) {
			deck.addCard(CardLibrary.createCard(new SpellRainOfFire(game)))
		}

		deck.shuffle()

		return deck
	}
}
