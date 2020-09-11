import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardTribe from '@shared/enums/CardTribe'
import CardFaction from '@shared/enums/CardFaction'
import ServerDamageInstance from '../../../models/ServerDamageSource'
import CardLocation from '@shared/enums/CardLocation'
import GameEventType from '@shared/enums/GameEventType'
import {UnitDestroyedEventArgs} from '../../../models/GameEventCreators'
import ExpansionSet from '@shared/enums/ExpansionSet'

export default class UnitVolatileCrystal extends ServerCard {
	damage = 3

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.TOKEN,
			faction: CardFaction.ARCANE,
			tribes: [CardTribe.CRYSTAL],
			stats: {
				power: 1,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			damage: this.damage
		}

		this.createCallback<UnitDestroyedEventArgs>(GameEventType.UNIT_DESTROYED, [CardLocation.BOARD])
			.require(({ triggeringUnit }) => triggeringUnit.card === this)
			.perform(() => this.onDestroy())
	}

	private onDestroy(): void {
		const unit = this.unit
		const damageTargets = this.game.board.getAdjacentUnits(unit).filter(unit => unit.rowIndex === unit.rowIndex)

		damageTargets.forEach(unit => {
			unit.dealDamage(ServerDamageInstance.fromUnit(this.damage, unit))
		})
	}
}
