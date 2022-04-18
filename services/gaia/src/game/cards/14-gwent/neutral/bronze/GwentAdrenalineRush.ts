import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import BuffGwentResilience from '@src/game/buffs/14-gwent/BuffGwentResilience'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentAdrenalineRush extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.ORGANIC],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: 'Adrenaline Rush',
				description: "Toggle a unit's *Resilience* status.",
				flavor:
					'The beast rushed at them wildly, with fury in its eyes, immune to pain and any strikes the defenders could land. Nothing stood to stop it…',
			},
		})

		this.createDeployTargets(TargetType.UNIT).perform(({ targetUnit }) => {
			if (targetUnit.buffs.has(BuffGwentResilience)) {
				targetUnit.buffs.removeAll(BuffGwentResilience, this)
			} else {
				targetUnit.buffs.add(BuffGwentResilience, this)
			}
		})
	}
}
