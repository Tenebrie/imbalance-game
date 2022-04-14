import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import GwentDolBlathannaBomber from './GwentDolBlathannaBomber'

export default class GwentIncineratingTrap extends ServerCard {
	public static readonly DAMAGE = 2

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.MACHINE, CardTribe.DOOMED],
			features: [CardFeature.SPY],
			stats: {
				power: 1,
			},
			expansionSet: ExpansionSet.GWENT,
			relatedCards: [GwentDolBlathannaBomber],
			hiddenFromLibrary: true,
		})
		this.dynamicTextVariables = {
			damage: GwentIncineratingTrap.DAMAGE,
		}

		this.createLocalization({
			en: {
				name: 'Incinerating Trap',
				description: `*Spying*.<p>Damage all other units on its row by *{damage}* and *Banish* self on turn end.`,
				flavor: "Careful…! One more step and you'll be turned into molten glass.",
			},
		})

		this.createCallback(GameEventType.TURN_ENDED, [CardLocation.BOARD])
			.require(({ group }) => !group.owns(this))
			.perform(() => {
				const triggeringUnit = this.unit!

				this.game.board.rows[triggeringUnit.rowIndex].cards.forEach((unit) => {
					if (unit === triggeringUnit) {
						return
					}
					game.animation.thread(() => {
						unit.dealDamage(DamageInstance.fromUnit(GwentIncineratingTrap.DAMAGE, triggeringUnit))
					})
				})

				game.animation.syncAnimationThreads()

				Keywords.destroyUnit({ unit: triggeringUnit, source: triggeringUnit.card })
			})
	}
}
