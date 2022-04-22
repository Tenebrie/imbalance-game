import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import BuffGwentDoomed from '@src/game/buffs/14-gwent/BuffGwentDoomed'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

export default class GwentAglais extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.DRYAD],
			stats: {
				power: 8,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Aglaïs`,
				description: `*Resurrect* a Bronze or Silver special card from your opponent's graveyard, then *Banish* it.`,
				flavor: `Resurrect: Play from your graveyard.`,
			},
		})

		this.createDeployTargets(TargetType.CARD_IN_UNIT_GRAVEYARD)
			.requireEnemy()
			.require(({ targetCard }) => targetCard.isBronzeOrSilver)
			.require(({ targetCard }) => targetCard.tribes.includes(CardTribe.ALCHEMY) || targetCard.tribes.includes(CardTribe.SPELL))
			.perform(({ targetCard, player }) => {
				targetCard.buffs.add(BuffGwentDoomed, this)
				Keywords.playCardFromGraveyard(targetCard, player)
			})
	}
}
