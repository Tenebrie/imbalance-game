import CardType from '@shared/enums/CardType'
import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFeature from '@shared/enums/CardFeature'
import CardFaction from '@shared/enums/CardFaction'
import GameEventType from '@shared/enums/GameEventType'
import BotCardEvaluation from '../../../../AI/BotCardEvaluation'
import ExpansionSet from '@shared/enums/ExpansionSet'

export default class SpellFieryEntrance extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.GOLDEN,
			faction: CardFaction.ARCANE,
			features: [CardFeature.HERO_POWER, CardFeature.KEYWORD_SUMMON],
			stats: {
				cost: 8
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.botEvaluation = new CustomBotEvaluation(this)

		this.createEffect(GameEventType.SPELL_DEPLOYED)
			.require(() => this.owner!.cardDeck.unitCards.length > 0)
			.perform(() => {
				const owner = this.owner!
				owner.summonCardFromUnitDeck(owner.cardDeck.unitCards[0])
			})
	}
}

class CustomBotEvaluation extends BotCardEvaluation {
	get expectedValue(): number {
		return this.card.stats.basePower * 2
	}
}
