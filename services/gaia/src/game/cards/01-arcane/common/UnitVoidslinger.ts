import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import TargetType from '@shared/enums/TargetType'
import ServerAnimation from '@src/game/models/ServerAnimation'
import ServerDamageInstance from '@src/game/models/ServerDamageSource'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

interface SacrificedUnit {
	power: number
}

export default class UnitVoidslinger extends ServerCard {
	sacrificedUnit: SacrificedUnit | null = null

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			tribes: CardTribe.CULTIST,
			faction: CardFaction.ARCANE,
			stats: {
				power: 13,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.addRelatedCards().requireTribe(CardTribe.VOIDSPAWN)

		this.createLocalization({
			en: {
				name: 'Voidslinger',
				description: '*Deploy:*<br>*Destroy* an allied Voidspawn to deal its Power as Damage to an enemy unit.',
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.require(() => !this.sacrificedUnit)
			.requireAllied()
			.requireNotSelf()
			.require(({ targetUnit }) => targetUnit.card.tribes.includes(CardTribe.VOIDSPAWN))
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
				targetUnit.dealDamage(ServerDamageInstance.fromCard(this.sacrificedUnit!.power, this))
			})

		this.createEffect(GameEventType.CARD_RESOLVED).perform(() => (this.sacrificedUnit = null))
	}
}
