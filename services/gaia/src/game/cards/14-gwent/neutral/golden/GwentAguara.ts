import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

import GwentAguaraBoostBoard from './GwentAguaraBoostBoard'
import GwentAguaraBoostHand from './GwentAguaraBoostHand'
import GwentAguaraCharm from './GwentAguaraCharm'
import GwentAguaraDamage from './GwentAguaraDamage'

export default class GwentAguara extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.CURSED, CardTribe.RELICT],
			stats: {
				power: 5,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
			relatedCards: [GwentAguaraBoostBoard, GwentAguaraBoostHand, GwentAguaraDamage, GwentAguaraCharm],
		})

		this.createLocalization({
			en: {
				name: `Aguara`,
				description: `Choose Two: Boost the *Lowest* ally by *${GwentAguaraBoostBoard.BOOST}*; Boost a random unit in your hand by *${GwentAguaraBoostHand.BOOST}*; Deal *${GwentAguaraDamage.DAMAGE}* damage to the *Highest* enemy; *Charm* a random enemy Elf with *${GwentAguaraCharm.MAX_POWER}* power or less.`,
				flavor: `Smarten up right now, or it's off to an aguara with you!`,
			},
		})

		this.createDeployTargets(TargetType.CARD_IN_LIBRARY)
			.require(
				({ targetCard }) =>
					targetCard instanceof GwentAguaraBoostBoard ||
					targetCard instanceof GwentAguaraBoostHand ||
					targetCard instanceof GwentAguaraDamage ||
					targetCard instanceof GwentAguaraCharm
			)
			.perform(({ targetCard }) => {
				Keywords.createCard.forOwnerOf(this).fromInstance(targetCard)
			})
	}
}
