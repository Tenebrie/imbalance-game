import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class GwentMorvudd extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.RELICT],
			stats: {
				power: 6,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: 'Morvudd',
				description: "Toggle a unit's *Lock* status. If it was an enemy, halve its power.",
				flavor: 'An unusual fiend specimen found on Ard Skellig. Unusually picky in terms of food.',
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.requireNotSelf()
			.perform(({ targetUnit }) => {
				game.animation.thread(() => {
					Keywords.toggleLock({
						card: targetUnit.card,
						source: this,
					})
				})

				if (targetUnit.owner === this.ownerGroup.opponent) {
					game.animation.thread(() => {
						const damageToDeal = Math.floor(targetUnit.card.stats.power / 2)
						targetUnit.dealDamage(DamageInstance.fromCard(damageToDeal, this))
					})
				}
				game.animation.syncAnimationThreads()
			})
	}
}
