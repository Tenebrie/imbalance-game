import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import TargetType from '@shared/enums/TargetType'
import CardFaction from '@shared/enums/CardFaction'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerUnit from '../../../models/ServerUnit'
import ServerDamageInstance from '../../../models/ServerDamageSource'
import ExpansionSet from '@shared/enums/ExpansionSet'
import { asDirectSpellDamage } from '@src/utils/LeaderStats'

export default class SpellLabyrinthMagicArrow extends ServerCard {
	damage = asDirectSpellDamage(4)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.ARCANE,
			stats: {
				cost: 1,
			},
			expansionSet: ExpansionSet.LABYRINTH,
		})
		this.dynamicTextVariables = {
			damage: this.damage,
		}

		this.createDeployTargets(TargetType.UNIT)
			.requireEnemy()
			.perform(({ targetUnit }) => this.onTargetSelected(targetUnit))
	}

	private onTargetSelected(target: ServerUnit): void {
		target.dealDamage(ServerDamageInstance.fromCard(this.damage, this))
	}
}
