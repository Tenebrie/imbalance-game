import ServerCard from './ServerCard'
import CardDeck from '@shared/models/CardDeck'
import CardLibrary from '../libraries/CardLibrary'
import UnitForestScout from '../cards/00-human/common/UnitForestScout'
import ServerGame from './ServerGame'
import HeroZamarath from '../cards/00-human/legendary/HeroZamarath'
import HeroSparklingSpirit from '../cards/01-arcane/epic/HeroSparklingSpirit'
import HeroRagingElemental from '../cards/01-arcane/epic/HeroRagingElemental'
import HeroKroLah from '../cards/01-arcane/legendary/HeroKroLah'
import HeroGarellion from '../cards/01-arcane/legendary/HeroGarellion'
import UnitPriestessOfAedine from '../cards/00-human/common/UnitPriestessOfAedine'
import ServerEditorDeck from './ServerEditorDeck'
import CardColor from '@shared/enums/CardColor'
import LeaderVelElleron from '../cards/01-arcane/leaders/VelElleron/LeaderVelElleron'
import UnitStoneElemental from '../cards/01-arcane/common/UnitStoneElemental'
import UnitWingedShieldmaiden from '../cards/00-human/common/UnitWingedShieldmaiden'
import HeroForksmanshipInstructor from '../cards/00-human/epic/HeroForksmanshipInstructor'
import HeroAntoria from '../cards/00-human/legendary/HeroAntoria'
import HeroFlameDancer from '../cards/01-arcane/epic/HeroFlameDancer'
import UnitArcaneElemental from '../cards/01-arcane/common/UnitArcaneElemental'
import HeroLightOracle from '../cards/09-neutral/epic/HeroLightOracle'
import CardType from '@shared/enums/CardType'

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
			const inflatedUnitCards = card.deckAddedCards.filter(card => CardLibrary.findPrototypeByConstructor(card).type === CardType.UNIT)
			const inflatedSpellCards = card.deckAddedCards.filter(card => CardLibrary.findPrototypeByConstructor(card).type === CardType.SPELL)
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

		cards.push(CardLibrary.instantiateByConstructor(game, HeroAntoria))
		cards.push(CardLibrary.instantiateByConstructor(game, HeroKroLah))
		cards.push(CardLibrary.instantiateByConstructor(game, HeroZamarath))
		cards.push(CardLibrary.instantiateByConstructor(game, HeroGarellion))

		cards.push(CardLibrary.instantiateByConstructor(game, HeroRagingElemental))
		cards.push(CardLibrary.instantiateByConstructor(game, HeroSparklingSpirit))
		cards.push(CardLibrary.instantiateByConstructor(game, HeroFlameDancer))
		cards.push(CardLibrary.instantiateByConstructor(game, HeroForksmanshipInstructor))
		cards.push(CardLibrary.instantiateByConstructor(game, HeroLightOracle))

		for (let i = 0; i < 3; i++) {
			cards.push(CardLibrary.instantiateByConstructor(game, UnitStoneElemental))
			cards.push(CardLibrary.instantiateByConstructor(game, UnitForestScout))
			cards.push(CardLibrary.instantiateByConstructor(game, UnitWingedShieldmaiden))
			cards.push(CardLibrary.instantiateByConstructor(game, UnitPriestessOfAedine))
			cards.push(CardLibrary.instantiateByConstructor(game, UnitArcaneElemental))
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
