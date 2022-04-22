import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

import GwentIsengrimOutlawElf from './GwentIsengrimOutlawElf'
import GwentIsengrimOutlawSpecial from './GwentIsengrimOutlawSpecial'

export default class GwentIsengrimOutlaw extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.ELF, CardTribe.OFFICER],
			stats: {
				power: 2,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Isengrim: Outlaw`,
				description: `Play *Isengrim: Special* or *Isengrim: Elf*`,
				flavor: `Before us lies Elskerdeg Pass, and beyond that, Zerrikania and Hakland. Before us lies a long and dangerous road. If we are to walk it together… let us put aside our mistrust.`,
			},
		})

		this.createDeployTargets(TargetType.CARD_IN_LIBRARY)
			.require(({ targetCard }) => targetCard instanceof GwentIsengrimOutlawSpecial || targetCard instanceof GwentIsengrimOutlawElf)
			.perform(({ targetCard }) => {
				Keywords.createCard.forOwnerOf(this).fromInstance(targetCard)
			})
	}
}
