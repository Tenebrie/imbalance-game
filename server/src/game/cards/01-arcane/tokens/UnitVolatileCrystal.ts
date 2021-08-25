import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardTribe from '@shared/enums/CardTribe'
import CardFaction from '@shared/enums/CardFaction'
import ServerDamageInstance from '../../../models/ServerDamageSource'
import CardLocation from '@shared/enums/CardLocation'
import GameEventType from '@shared/enums/GameEventType'
import ExpansionSet from '@shared/enums/ExpansionSet'

export default class UnitVolatileCrystal extends ServerCard {
	damage = 5

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.ARCANE,
			tribes: [CardTribe.CRYSTAL],
			stats: {
				power: 1,
			},
			expansionSet: ExpansionSet.BASE,
			hiddenFromLibrary: true,
		})
		this.dynamicTextVariables = {
			damage: this.damage,
		}

		this.createCallback(GameEventType.UNIT_DESTROYED, [CardLocation.BOARD])
			.require(({ triggeringUnit }) => triggeringUnit.card === this)
			.perform(({ triggeringUnit }) => {
				const damageTargets = this.game.board.getAdjacentUnits(triggeringUnit)

				damageTargets.forEach((unit) => {
					this.game.animation.thread(() => {
						unit.dealDamage(ServerDamageInstance.fromUnit(this.damage, triggeringUnit))
					})
				})
			})
	}
}
