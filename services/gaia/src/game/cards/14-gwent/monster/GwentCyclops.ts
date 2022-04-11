import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import TargetType from '@shared/enums/TargetType'
import ServerAnimation from '@src/game/models/ServerAnimation'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

interface SacrificedUnit {
	power: number
}

export default class GwentCyclops extends ServerCard {
	sacrificedUnit: SacrificedUnit | null = null

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.OGROID],
			stats: {
				power: 11,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: 'Cyclops',
				description: 'Destroy an ally and deal damage equal to its power to an enemy.',
				flavor: "Don't stare at his eye, he hates that…",
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.require(() => !this.sacrificedUnit)
			.requireAllied()
			.requireNotSelf()
			.perform(({ targetUnit }) => {
				this.sacrificedUnit = {
					power: targetUnit.card.stats.power,
				}
				Keywords.destroyUnit({
					unit: targetUnit,
					source: this,
					affectedCards: [this],
				})
				game.animation.play(ServerAnimation.cardInfuse(this))
			})

		this.createDeployTargets(TargetType.UNIT)
			.require(() => !!this.sacrificedUnit)
			.requireEnemy()
			.perform(({ targetUnit }) => {
				targetUnit.dealDamage(DamageInstance.fromCard(this.sacrificedUnit!.power, this))
			})

		this.createEffect(GameEventType.CARD_RESOLVED).perform(() => (this.sacrificedUnit = null))
	}
}
