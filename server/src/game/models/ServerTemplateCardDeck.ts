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

		for (let i = 0; i < 3; i++) {
			deck.addUnit(CardLibrary.instantiateByConstructor(game, UnitRavenMessenger))
		}
		deck.addUnit(CardLibrary.instantiateByConstructor(game, HeroKroLah))
		deck.addUnit(CardLibrary.instantiateByConstructor(game, HeroZamarath))
		deck.addUnit(CardLibrary.instantiateByConstructor(game, HeroRagingElemental))
		deck.addUnit(CardLibrary.instantiateByConstructor(game, HeroSparklingSpirit))
		deck.addUnit(CardLibrary.instantiateByConstructor(game, HeroGarellion))

		for (let i = 0; i < 3; i++) {
			deck.addUnit(CardLibrary.instantiateByConstructor(game, UnitChargingKnight))
			deck.addUnit(CardLibrary.instantiateByConstructor(game, UnitSupplyWagon))
			deck.addUnit(CardLibrary.instantiateByConstructor(game, UnitForestScout))
			deck.addUnit(CardLibrary.instantiateByConstructor(game, UnitStoneElemental))
		}
		deck.addUnit(CardLibrary.instantiateByConstructor(game, UnitPriestessOfAedine))
		deck.addUnit(CardLibrary.instantiateByConstructor(game, UnitArcaneCrystal))
		deck.addUnit(CardLibrary.instantiateByConstructor(game, UnitFlameTouchCrystal))
		deck.addUnit(CardLibrary.instantiateByConstructor(game, UnitIceSkinCrystal))

		deck.addSpell(CardLibrary.instantiateByConstructor(game, SpellSpark))
		deck.addSpell(CardLibrary.instantiateByConstructor(game, SpellSpeedPotion))
		deck.addSpell(CardLibrary.instantiateByConstructor(game, SpellPermafrost))

		return deck
	}

	public static botDeck(game: ServerGame): ServerTemplateCardDeck {
		return ServerTemplateCardDeck.defaultDeck(game)
	}
}
