import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

export default class GwentEibhearHattori extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.ELF, CardTribe.SUPPORT, CardTribe.DOOMED],
			stats: {
				power: 3,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Éibhear Hattori`,
				description: `*Resurrect* a lower or equal Bronze or Silver Scoia'tael unit.`,
				flavor: `Only thing that can rival his swords? His dumplings.`,
			},
		})

		this.createDeployTargets(TargetType.CARD_IN_UNIT_GRAVEYARD)
			.require(({ targetCard }) => targetCard.isBronzeOrSilver)
			.require(({ targetCard }) => targetCard.stats.power <= this.stats.power)
			.require(({ targetCard }) => targetCard.faction === CardFaction.SCOIATAEL)
			.perform(({ targetCard, player }) => {
				Keywords.playCardFromGraveyard(targetCard, player)
			})
	}
}
