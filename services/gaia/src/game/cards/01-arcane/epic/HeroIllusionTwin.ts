import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import { sortCards } from '@shared/Utils'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

import BuffStrength from '../../../buffs/BuffStrength'
import { DamageInstance } from '../../../models/ServerDamageSource'

/* Original design and implementation by Nenl */
export default class HeroIllusionTwin extends ServerCard {
	powerGiven = 3
	powerLost = 1

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.ARCANE,
			stats: {
				power: 17,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			powerGiven: this.powerGiven,
			powerLost: this.powerLost,
		}

		this.createCallback(GameEventType.TURN_ENDED, [CardLocation.BOARD])
			.require(({ group }) => group.owns(this))
			.perform(() => {
				const unitCards = sortCards(this.ownerPlayer.cardHand.unitCards) as ServerCard[]
				const copyInHand = unitCards.find((u) => u.class === this.class)
				if (copyInHand) {
					this.dealDamage(DamageInstance.fromCard(this.powerLost, this))
					copyInHand.buffs.addMultiple(BuffStrength, this.powerGiven, this)
				}
			})
	}
}
