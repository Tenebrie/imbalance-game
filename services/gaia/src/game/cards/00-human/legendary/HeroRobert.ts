import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

import Keywords from '../../../../utils/Keywords'
import BuffNoArmor from '../../../buffs/BuffNoArmor'

export default class HeroRobert extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.COMMONER],
			stats: {
				power: 4,
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.createDeployTargets(TargetType.CARD_IN_UNIT_DECK)
			.requireSamePlayer()
			.require(({ targetCard }) => targetCard.tribes.includes(CardTribe.BUILDING))
			.perform(({ targetCard }) => this.onTargetSelected(targetCard))
	}

	private onTargetSelected(target: ServerCard): void {
		target.buffs.add(BuffNoArmor, this)
		Keywords.playCardFromDeckOrGraveyard(target)
		Keywords.createCard
			.forOwnerOf(this)
			.with((card) => card.buffs.add(BuffNoArmor, this))
			.fromInstance(target)
	}
}
