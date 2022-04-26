import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import BotCardEvaluation from '@src/game/AI/BotCardEvaluation'
import BuffStrength from '@src/game/buffs/BuffStrength'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class GwentMahakamGuard extends ServerCard {
	public static readonly BOOST = 7

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.SOLDIER, CardTribe.DWARF],
			stats: {
				power: 4,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			boost: GwentMahakamGuard.BOOST,
		}

		this.createPlayTargets().evaluate(({ targetRow }) => (targetRow.hasBoon ? 1 : 0))

		this.createLocalization({
			en: {
				name: 'Mahakam Guard',
				description: 'Boost an ally by {boost}.',
				flavor: "Only one punishment for disturbin' the peace in Mahakam: a hammer to the heid.",
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.requireNotSelf()
			.requireAllied()
			.perform(({ targetUnit }) => {
				targetUnit.buffs.addMultiple(BuffStrength, GwentMahakamGuard.BOOST, this)
			})

		this.botEvaluation = new CustomBotEvaluation(this)
	}
}

class CustomBotEvaluation extends BotCardEvaluation {
	get expectedValue(): number {
		const bonusPower = this.game.board.getSplashableUnitsFor(this.card).length > 0 ? GwentMahakamGuard.BOOST : 0
		return this.card.stats.power + bonusPower
	}
}
