import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import TargetType from '@shared/enums/TargetType'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import { getRandomArrayValue } from '@src/utils/Utils'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class GwentDolBlathannaBowman extends ServerCard {
	public static readonly DAMAGE = 2

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.SOLDIER, CardTribe.ELF],
			stats: {
				power: 7,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			damage: GwentDolBlathannaBowman.DAMAGE,
		}

		this.createLocalization({
			en: {
				name: 'Dol Blathanna Bowman',
				description:
					'Deal {damage} damage to an enemy.<p>Whenever an enemy moves, deal {damage} damage to it.<p>Whenever this unit moves, deal {damage} damage to a random enemy.',
				flavor: "You might manage to hide from them, but once spotted, don't bother trying to run.",
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.requireEnemy()
			.perform(({ targetUnit }) => {
				targetUnit.dealDamage(DamageInstance.fromCard(GwentDolBlathannaBowman.DAMAGE, this))
			})

		this.createEffect(GameEventType.UNIT_MOVED).perform(() => {
			const triggeringUnit = this.unit!
			const enemyUnits = this.game.board.getAllUnits().filter((unit) => unit.owner !== triggeringUnit.owner)
			const target = getRandomArrayValue(enemyUnits)
			if (!target) {
				return
			}
			target.dealDamage(DamageInstance.fromUnit(GwentDolBlathannaBowman.DAMAGE, triggeringUnit))
		})

		this.createCallback(GameEventType.UNIT_MOVED, [CardLocation.BOARD])
			.require(({ triggeringUnit }) => triggeringUnit.owner !== this.ownerGroup)
			.perform(({ triggeringUnit }) => {
				const originUnit = this.unit!
				triggeringUnit.dealDamage(DamageInstance.fromUnit(GwentDolBlathannaBowman.DAMAGE, originUnit))
			})
	}
}
