import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import BotCardEvaluation from '@src/game/AI/BotCardEvaluation'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentGeraltOfRivia extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.WITCHER],
			stats: {
				power: 15,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createPlayTargets().evaluate(({ targetRow }) => (targetRow.hasBoon ? 1 : 0))

		this.createLocalization({
			en: {
				name: `Geralt of Rivia`,
				description: `No ability.`,
				flavor: `If that's what it takes to save the world, it's better to let that world die.`,
			},
		})

		this.botEvaluation = new CustomBotEvaluation(this)
	}
}

class CustomBotEvaluation extends BotCardEvaluation {
	get expectedValue(): number {
		return this.card.stats.power - 1
	}
}
