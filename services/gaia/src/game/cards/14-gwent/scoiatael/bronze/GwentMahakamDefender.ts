import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import BotCardEvaluation from '@src/game/AI/BotCardEvaluation'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class GwentMahakamDefender extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.SOLDIER, CardTribe.DWARF],
			stats: {
				power: 6,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createPlayTargets().evaluate(({ targetRow }) => (targetRow.hasBoon ? 1 : 0))

		this.createLocalization({
			en: {
				name: 'Mahakam Defender',
				description: ' ',
				flavor: "I'm telling ye, we're born fer battle - we slash straight at their knees!",
			},
		})

		this.makeResilient()
		this.botEvaluation = new CustomBotEvaluation(this)
	}
}

class CustomBotEvaluation extends BotCardEvaluation {
	get expectedValue(): number {
		const bonusPower = this.game.roundIndex < 2 ? this.card.stats.basePower : 0
		return this.card.stats.power + bonusPower
	}
}
