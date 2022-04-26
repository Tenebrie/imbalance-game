import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import BotCardEvaluation from '@src/game/AI/BotCardEvaluation'
import BuffGwentRowFroth from '@src/game/buffs/14-gwent/BuffGwentRowFroth'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentAleOfTheAncestors extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			stats: {
				power: 10,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			boost: BuffGwentRowFroth.BOOST,
			targets: BuffGwentRowFroth.TARGETS,
		}

		this.createPlayTargets().evaluate(({ targetRow }) => (targetRow.hasHazard ? 1 : 0))

		this.createLocalization({
			en: {
				name: `Ale of the Ancestors`,
				description: `Apply a Boon that boosts {targets} random units by {boost} on turn start to the row.`,
				flavor: `Boros, the legendary founder of Clan Fuchs, died after overindulging in this beverage - he passed out while reaching for his golden ring, which had fallen into a brook.`,
			},
		})

		this.botEvaluation = new CustomBotEvaluation(this)

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(({ triggeringUnit }) => {
			triggeringUnit.boardRow.buffs.add(BuffGwentRowFroth, this)
		})
	}
}

class CustomBotEvaluation extends BotCardEvaluation {
	get expectedValue(): number {
		return 10001
	}
}
