import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import { BuffMorningApathy } from '@src/game/buffs/BuffMorningApathy'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

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
			.require(({ targetCard }) => targetCard.color === CardColor.BRONZE)
			.perform(({ targetUnit }) => this.onTargetSelected(targetUnit))
	}

	private onTargetSelected(target: ServerUnit): void {
		const cardClass = target.card.class
		Keywords.destroy.unit(target).withSource(this)
		Keywords.createCard
			.forOwnerOf(this)
			.with((card) => card.buffs.add(BuffMorningApathy, this))
			.fromClass(cardClass)
	}
}
