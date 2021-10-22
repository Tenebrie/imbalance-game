import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardLocation from '@shared/enums/CardLocation'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'

import ServerCard from '../../../models/ServerCard'
import { DamageInstance } from '../../../models/ServerDamageSource'
import ServerGame from '../../../models/ServerGame'

export default class UnitStrayCat extends ServerCard {
	public static readonly DAMAGE = 1

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			features: [CardFeature.KEYWORD_DEPLOY, CardFeature.SPY],
			stats: {
				power: 2,
			},
			expansionSet: ExpansionSet.BASE,
			hiddenFromLibrary: true,
		})
		this.dynamicTextVariables = {
			damage: UnitStrayCat.DAMAGE,
		}
		this.createLocalization({
			en: {
				name: 'Stray Cat',
				description: '*Turn end:*<br>Deal {damage} Damage to adjacent units.',
			},
		})

		this.createCallback(GameEventType.TURN_ENDED, [CardLocation.BOARD])
			.require(({ group }) => group.owns(this))
			.perform(() => {
				const adjacentUnits = this.game.board.getAdjacentUnits(this.unit!)
				adjacentUnits.forEach((unit) => {
					this.game.animation.createInstantAnimationThread()
					unit.dealDamage(DamageInstance.fromCard(UnitStrayCat.DAMAGE, this))
					this.game.animation.commitAnimationThread()
				})
			})
	}
}
