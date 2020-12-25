import ServerCard from './ServerCard'
import CardDeck from '@shared/models/CardDeck'
import CardLibrary from '../libraries/CardLibrary'
import UnitForestScout from '../cards/02-wild/common/UnitForestScout'
import ServerGame from './ServerGame'
import HeroZamarath from '../cards/01-arcane/legendary/HeroZamarath'
import HeroSparklingSpirit from '../cards/01-arcane/epic/HeroSparklingSpirit'
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
import LeaderChallengeDummy from '../cards/10-challenge/ai-00-dummy/LeaderChallengeDummy'
import HeroChallengeDummyWarrior0 from '../cards/10-challenge/ai-00-dummy/HeroChallengeDummyWarrior0'
import HeroChallengeDummyWarrior1 from '../cards/10-challenge/ai-00-dummy/HeroChallengeDummyWarrior1'
import HeroChallengeDummyWarrior2 from '../cards/10-challenge/ai-00-dummy/HeroChallengeDummyWarrior2'
import HeroChallengeDummyWarrior3 from '../cards/10-challenge/ai-00-dummy/HeroChallengeDummyWarrior3'
import Constants from '@shared/Constants'
import UnitChallengeDummyRoyalWarrior from '../cards/10-challenge/ai-00-dummy/UnitChallengeDummyRoyalWarrior'
import UnitChallengeDummyVanillaWarrior from '../cards/10-challenge/ai-00-dummy/UnitChallengeDummyVanillaWarrior'
import HeroChallengeLegendaryExplorer0 from '../cards/10-challenge/challenge-discovery/HeroChallengeLegendaryExplorer0'
import HeroChallengeLegendaryExplorer1 from '../cards/10-challenge/challenge-discovery/HeroChallengeLegendaryExplorer1'
import HeroChallengeLegendaryExplorer2 from '../cards/10-challenge/challenge-discovery/HeroChallengeLegendaryExplorer2'
import HeroChallengeLegendaryExplorer3 from '../cards/10-challenge/challenge-discovery/HeroChallengeLegendaryExplorer3'
import UnitChallengeScarredExplorer from '../cards/10-challenge/challenge-discovery/UnitChallengeScarredExplorer'
import UnitChallengeEagerExplorer from '../cards/10-challenge/challenge-discovery/UnitChallengeEagerExplorer'

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
		let leader: ServerCard | undefined = undefined
		const inflatedUnitDeck: ServerCard[] = []
		const inflatedSpellDeck: ServerCard[] = []
		cards.forEach((card) => {
			const inflatedCards = card.deckAddedCards.map((cardPrototype) => CardLibrary.instantiateByConstructor(game, cardPrototype))
			const inflatedUnitCards = inflatedCards.filter((card) => card.type === CardType.UNIT)
			const inflatedSpellCards = inflatedCards.filter((card) => card.type === CardType.SPELL)
			inflatedUnitCards.forEach((cardPrototype) => inflatedUnitDeck.push(cardPrototype))
			inflatedSpellCards.forEach((cardPrototype) => inflatedSpellDeck.push(cardPrototype))
			if (card.color === CardColor.LEADER) {
				leader = card
			} else {
				inflatedUnitDeck.push(card)
			}
		})
		if (!leader) {
			throw new Error('Inflating a deck without a leader card!')
		}
		return new ServerTemplateCardDeck(leader, inflatedUnitDeck, inflatedSpellDeck)
	}

	public static challengeAI00(game: ServerGame): ServerTemplateCardDeck {
		const cards = []

		cards.push(CardLibrary.instantiateByConstructor(game, LeaderChallengeDummy))

		cards.push(CardLibrary.instantiateByConstructor(game, HeroChallengeDummyWarrior0))
		cards.push(CardLibrary.instantiateByConstructor(game, HeroChallengeDummyWarrior1))
		cards.push(CardLibrary.instantiateByConstructor(game, HeroChallengeDummyWarrior2))
		cards.push(CardLibrary.instantiateByConstructor(game, HeroChallengeDummyWarrior3))

		for (let i = 0; i < Constants.CARD_LIMIT_SILVER; i++) {
			cards.push(CardLibrary.instantiateByConstructor(game, UnitChallengeDummyRoyalWarrior))
		}
		for (let i = 0; i < Constants.CARD_LIMIT_BRONZE; i++) {
			cards.push(CardLibrary.instantiateByConstructor(game, UnitChallengeDummyVanillaWarrior))
		}

		return ServerTemplateCardDeck.inflate(game, cards)
	}

	public static challengeAI01(game: ServerGame): ServerTemplateCardDeck {
		const cards = []

		cards.push(CardLibrary.instantiateByConstructor(game, LeaderVelElleron))

		cards.push(CardLibrary.instantiateByConstructor(game, HeroAntoria))
		cards.push(CardLibrary.instantiateByConstructor(game, HeroKroLah))
		cards.push(CardLibrary.instantiateByConstructor(game, HeroZamarath))
		cards.push(CardLibrary.instantiateByConstructor(game, HeroGarellion))

		for (let i = 0; i < 2; i++) {
			cards.push(CardLibrary.instantiateByConstructor(game, HeroSparklingSpirit))
			cards.push(CardLibrary.instantiateByConstructor(game, HeroFlameDancer))
			cards.push(CardLibrary.instantiateByConstructor(game, HeroForksmanshipInstructor))
			cards.push(CardLibrary.instantiateByConstructor(game, HeroLightOracle))
		}

		for (let i = 0; i < 3; i++) {
			cards.push(CardLibrary.instantiateByConstructor(game, UnitStoneElemental))
			cards.push(CardLibrary.instantiateByConstructor(game, UnitForestScout))
			cards.push(CardLibrary.instantiateByConstructor(game, UnitWingedShieldmaiden))
			cards.push(CardLibrary.instantiateByConstructor(game, UnitPriestessOfAedine))
			cards.push(CardLibrary.instantiateByConstructor(game, UnitArcaneElemental))
		}

		return ServerTemplateCardDeck.inflate(game, cards)
	}

	public static challengeDiscovery(game: ServerGame, leader: ServerCard): ServerTemplateCardDeck {
		const cards = []

		cards.push(CardLibrary.instantiateByInstance(game, leader))

		cards.push(CardLibrary.instantiateByConstructor(game, HeroChallengeLegendaryExplorer0))
		cards.push(CardLibrary.instantiateByConstructor(game, HeroChallengeLegendaryExplorer1))
		cards.push(CardLibrary.instantiateByConstructor(game, HeroChallengeLegendaryExplorer2))
		cards.push(CardLibrary.instantiateByConstructor(game, HeroChallengeLegendaryExplorer3))

		for (let i = 0; i < Constants.CARD_LIMIT_SILVER; i++) {
			cards.push(CardLibrary.instantiateByConstructor(game, UnitChallengeScarredExplorer))
		}
		for (let i = 0; i < Constants.CARD_LIMIT_BRONZE; i++) {
			cards.push(CardLibrary.instantiateByConstructor(game, UnitChallengeEagerExplorer))
		}

		return ServerTemplateCardDeck.inflate(game, cards)
	}

	public static fromEditorDeck(game: ServerGame, editorDeck: ServerEditorDeck): ServerTemplateCardDeck {
		const temporaryDeck: ServerCard[] = []
		editorDeck.cards.forEach((card) => {
			for (let i = 0; i < card.count; i++) {
				temporaryDeck.push(CardLibrary.instantiateByClass(game, card.class))
			}
		})

		return ServerTemplateCardDeck.inflate(game, temporaryDeck)
	}
}
