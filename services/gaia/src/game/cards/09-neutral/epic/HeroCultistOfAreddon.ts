import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerUnit from '../../../models/ServerUnit'

export default class HeroCultistOfAreddon extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			tribes: CardTribe.CULTIST,
			faction: CardFaction.NEUTRAL,
			stats: {
				power: 4,
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.createDeployTargets(TargetType.UNIT)
			.requireAllied()
			.requireNotSelf()
			.require(({ targetCard }) => !targetCard.tribes.includes(CardTribe.CULTIST))
			.perform(({ targetUnit }) => this.onTargetSelected(targetUnit))
	}

	private onTargetSelected(target: ServerUnit): void {
		const cardClass = target.card.class
		Keywords.destroy.unit(target).withSource(this)
		Keywords.createCard.forOwnerOf(this).fromClass(cardClass)
	}
}
