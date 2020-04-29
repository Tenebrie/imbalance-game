import ServerCard from './ServerCard'
import CardDeck from '@shared/models/CardDeck'
import CardLibrary from '../libraries/CardLibrary'
import UnitForestScout from '../cards/neutral/UnitForestScout'
import UnitChargingKnight from '../cards/neutral/UnitChargingKnight'
import ServerGame from './ServerGame'
import SpellSpark from '../cards/arcane/SpellSpark'
import UnitSupplyWagon from '../cards/neutral/UnitSupplyWagon'
import SpellSpeedPotion from '../cards/arcane/SpellSpeedPotion'
import HeroZamarath from '../cards/arcane/HeroZamarath'
import HeroSparklingSpirit from '../cards/arcane/HeroSparklingSpirit'
import UnitFlameTouchCrystal from '../cards/arcane/UnitFlameTouchCrystal'
import UnitStoneElemental from '../cards/arcane/UnitStoneElemental'
import UnitIceSkinCrystal from '../cards/arcane/UnitIceSkinCrystal'
import SpellPermafrost from '../cards/arcane/SpellPermafrost'
import HeroRagingElemental from '../cards/arcane/HeroRagingElemental'
import HeroKroLah from '../cards/arcane/HeroKroLah'
import HeroGarellion from '../cards/arcane/HeroGarellion'
import UnitRavenMessenger from '../cards/neutral/UnitRavenMessenger'
import UnitPriestessOfAedine from '../cards/neutral/UnitPriestessOfAedine'
import UnitArcaneCrystal from '../cards/arcane/UnitArcaneCrystal'
import ServerEditorDeck from './ServerEditorDeck'
import CardColor from '@shared/enums/CardColor'

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

	public static emptyDeck(): ServerTemplateCardDeck {
		return new ServerTemplateCardDeck([], [])
	}

	public static editorDeck(game: ServerGame, editorDeck: ServerEditorDeck): ServerTemplateCardDeck {
		const temporaryDeck: ServerCard[] = []
		editorDeck.cards.forEach(card => {
			for (let i = 0; i < card.count; i++) {
				temporaryDeck.push(CardLibrary.instantiateByClass(game, card.class))
			}
		})

		const inflatedUnitDeck = []
		const inflatedSpellDeck = []
		temporaryDeck.forEach(card => {
			const inflatedUnitCards = card.getDeckAddedUnitCards()
			const inflatedSpellCards = card.getDeckAddedSpellCards()
			inflatedUnitCards.forEach(cardPrototype => inflatedUnitDeck.push(CardLibrary.instantiateByConstructor(game, cardPrototype)))
			inflatedSpellCards.forEach(cardPrototype => inflatedSpellDeck.push(CardLibrary.instantiateByConstructor(game, cardPrototype)))
			if (card.color === CardColor.LEADER) {
				return
			}
			inflatedUnitDeck.push(card)
		})

		return new ServerTemplateCardDeck(inflatedUnitDeck, inflatedSpellDeck)
	}

	public static defaultDeck(game: ServerGame): ServerTemplateCardDeck {
		const deck = new ServerTemplateCardDeck([], [])

		for (let i = 0; i < 9; i++) {
			deck.addUnit(CardLibrary.instantiateByInstance(new UnitRavenMessenger(game)))
		}
		deck.addUnit(CardLibrary.instantiateByInstance(new HeroKroLah(game)))
		deck.addUnit(CardLibrary.instantiateByInstance(new HeroZamarath(game)))
		deck.addUnit(CardLibrary.instantiateByInstance(new HeroRagingElemental(game)))
		deck.addUnit(CardLibrary.instantiateByInstance(new HeroSparklingSpirit(game)))
		deck.addUnit(CardLibrary.instantiateByInstance(new HeroGarellion(game)))

		for (let i = 0; i < 3; i++) {
			deck.addUnit(CardLibrary.instantiateByInstance(new UnitChargingKnight(game)))
			deck.addUnit(CardLibrary.instantiateByInstance(new UnitSupplyWagon(game)))
			deck.addUnit(CardLibrary.instantiateByInstance(new UnitForestScout(game)))
			deck.addUnit(CardLibrary.instantiateByInstance(new UnitStoneElemental(game)))
		}
		deck.addUnit(CardLibrary.instantiateByInstance(new UnitPriestessOfAedine(game)))
		deck.addUnit(CardLibrary.instantiateByInstance(new UnitArcaneCrystal(game)))
		deck.addUnit(CardLibrary.instantiateByInstance(new UnitFlameTouchCrystal(game)))
		deck.addUnit(CardLibrary.instantiateByInstance(new UnitIceSkinCrystal(game)))

		deck.addSpell(CardLibrary.instantiateByInstance(new SpellSpark(game)))
		deck.addSpell(CardLibrary.instantiateByInstance(new SpellSpeedPotion(game)))
		deck.addSpell(CardLibrary.instantiateByInstance(new SpellPermafrost(game)))

		return deck
	}

	public static botDeck(game: ServerGame): ServerTemplateCardDeck {
		return ServerTemplateCardDeck.defaultDeck(game)
	}
}
