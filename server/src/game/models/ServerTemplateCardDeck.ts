import ServerCard from './ServerCard'
import CardDeck from '@shared/models/CardDeck'
import CardLibrary from '../libraries/CardLibrary'
import UnitForestScout from '../cards/neutral/common/UnitForestScout'
import UnitChargingKnight from '../cards/neutral/common/UnitChargingKnight'
import ServerGame from './ServerGame'
import UnitSupplyWagon from '../cards/neutral/common/UnitSupplyWagon'
import HeroZamarath from '../cards/arcane/legendary/HeroZamarath'
import HeroSparklingSpirit from '../cards/arcane/epic/HeroSparklingSpirit'
import HeroRagingElemental from '../cards/arcane/epic/HeroRagingElemental'
import HeroKroLah from '../cards/arcane/legendary/HeroKroLah'
import HeroGarellion from '../cards/arcane/legendary/HeroGarellion'
import UnitPriestessOfAedine from '../cards/neutral/common/UnitPriestessOfAedine'
import ServerEditorDeck from './ServerEditorDeck'
import CardColor from '@shared/enums/CardColor'
import UnitVampireFledgling from '../cards/neutral/common/UnitVampireFledgling'
import LeaderVelElleron from '../cards/arcane/leaders/VelElleron/LeaderVelElleron'

export default class ServerTemplateCardDeck implements CardDeck {
	leader: ServerCard
	unitCards: ServerCard[]
	spellCards: ServerCard[]

	constructor(leader: ServerCard, unitCards: ServerCard[], spellCards: ServerCard[]) {
		this.leader = leader
		this.unitCards = unitCards
		this.spellCards = spellCards
	}

	public addUnit(card: ServerCard): void {
		this.unitCards.push(card)
	}

	public addSpell(card: ServerCard): void {
		this.spellCards.push(card)
	}

	public static inflate(game: ServerGame, cards: ServerCard[]): ServerTemplateCardDeck {
		let leader: ServerCard = undefined
		const inflatedUnitDeck: ServerCard[] = []
		const inflatedSpellDeck: ServerCard[] = []
		cards.forEach(card => {
			const inflatedUnitCards = card.getDeckAddedUnitCards()
			const inflatedSpellCards = card.getDeckAddedSpellCards()
			inflatedUnitCards.forEach(cardPrototype => inflatedUnitDeck.push(CardLibrary.instantiateByConstructor(game, cardPrototype)))
			inflatedSpellCards.forEach(cardPrototype => inflatedSpellDeck.push(CardLibrary.instantiateByConstructor(game, cardPrototype)))
			if (card.color === CardColor.LEADER) {
				leader = card
			} else {
				inflatedUnitDeck.push(card)
			}
		})
		if (!leader) {
			console.warn('Inflating a deck without a leader card!')
		}
		return new ServerTemplateCardDeck(leader, inflatedUnitDeck, inflatedSpellDeck)
	}

	public static botDeck(game: ServerGame): ServerTemplateCardDeck {
		const cards = []

		cards.push(CardLibrary.instantiateByConstructor(game, LeaderVelElleron))
		cards.push(CardLibrary.instantiateByConstructor(game, HeroKroLah))
		cards.push(CardLibrary.instantiateByConstructor(game, HeroZamarath))
		cards.push(CardLibrary.instantiateByConstructor(game, HeroRagingElemental))
		cards.push(CardLibrary.instantiateByConstructor(game, HeroSparklingSpirit))
		cards.push(CardLibrary.instantiateByConstructor(game, HeroGarellion))

		for (let i = 0; i < 3; i++) {
			cards.push(CardLibrary.instantiateByConstructor(game, UnitChargingKnight))
			cards.push(CardLibrary.instantiateByConstructor(game, UnitSupplyWagon))
			cards.push(CardLibrary.instantiateByConstructor(game, UnitForestScout))
			cards.push(CardLibrary.instantiateByConstructor(game, UnitPriestessOfAedine))
			cards.push(CardLibrary.instantiateByConstructor(game, UnitVampireFledgling))
		}

		return ServerTemplateCardDeck.inflate(game, cards)
	}

	public static fromEditorDeck(game: ServerGame, editorDeck: ServerEditorDeck): ServerTemplateCardDeck {
		const temporaryDeck: ServerCard[] = []
		editorDeck.cards.forEach(card => {
			for (let i = 0; i < card.count; i++) {
				temporaryDeck.push(CardLibrary.instantiateByClass(game, card.class))
			}
		})

		return ServerTemplateCardDeck.inflate(game, temporaryDeck)
	}
}
