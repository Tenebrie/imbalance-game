import ServerGame from '@src/game/models/ServerGame'
import CardTribe from '@shared/enums/CardTribe'
import { BaseLabyrinthActiveItem } from '@src/game/cards/12-labyrinth/items/ItemLabyrinthBase'
import { asDirectSpellDamage } from '@src/utils/LeaderStats'
import TargetType from '@shared/enums/TargetType'
import ServerDamageInstance from '@src/game/models/ServerDamageSource'

export class LabyrinthItemRustedSword extends BaseLabyrinthActiveItem {
	damage = asDirectSpellDamage(1)

	constructor(game: ServerGame) {
		super(game, {
			tier: 0,
			slot: CardTribe.LABYRINTH_WEAPON,
			stats: {
				cost: 1,
			},
		})
		this.dynamicTextVariables = {
			damage: this.damage,
		}

		this.createDeployTargets(TargetType.UNIT)
			.requireEnemy()
			.perform(({ targetUnit }) => targetUnit.dealDamage(ServerDamageInstance.fromCard(this.damage, this)))
	}
}
