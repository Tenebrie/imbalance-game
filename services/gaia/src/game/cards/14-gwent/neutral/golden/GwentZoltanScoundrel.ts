import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

import GwentDudaAgitator from '../silver/GwentDudaAgitator'
import GwentDudaCompanion from '../silver/GwentDudaCompanion'

export default class GwentZoltanScoundrel extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.DWARF],
			stats: {
				power: 8,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Zoltan: Scoundrel`,
				description: `Choose One: *Spawn* a *Duda: Companion*; or *Spawn* a *Duda: Agitator*.`,
				flavor: `Apologies. My exotic pet's a clever birdie, but a wee bit lewd. Paid ten thalers for the beaute.`,
			},
		})

		this.createDeployTargets(TargetType.CARD_IN_LIBRARY)
			.require(({ targetCard }) => targetCard instanceof GwentDudaCompanion || targetCard instanceof GwentDudaAgitator)
			.perform(({ targetCard }) => {
				Keywords.createCard.forOwnerOf(this).fromInstance(targetCard)
			})
	}
}
