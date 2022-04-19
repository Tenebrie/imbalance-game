import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

export default class GwentDecoy extends ServerCard {
	public static readonly BOOST = 3

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.SILVER,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.TACTIC],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Decoy`,
				description: `Replay a Bronze or Silver ally and boost it by *${GwentDecoy.BOOST}*.`,
				flavor: `When you run out of peasants, decoys also make decent arrow fodder.`,
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.requireAllied()
			.require(({ targetCard }) => [CardColor.BRONZE, CardColor.SILVER].includes(targetCard.color))
			.perform(({ targetCard, targetUnit }) => {
				Keywords.returnCardFromBoardToHand(targetUnit)
				targetCard.boost(GwentDecoy.BOOST, this)
				Keywords.playCardFromHand(targetCard)
			})
	}
}
