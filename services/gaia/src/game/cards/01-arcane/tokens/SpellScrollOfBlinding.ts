import BuffDuration from '@shared/enums/BuffDuration'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import { asDirectEffectDuration } from '@src/utils/LeaderStats'

import BuffStun from '../../../buffs/BuffStun'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerUnit from '../../../models/ServerUnit'

export default class SpellScrollOfBlinding extends ServerCard {
	buffDuration = asDirectEffectDuration(3)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.ARCANE,
			tribes: [CardTribe.SCROLL],
			features: [CardFeature.KEYWORD_BUFF_STUN],
			stats: {
				cost: 2,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			buffDuration: this.buffDuration,
		}

		this.createDeployTargets(TargetType.UNIT)
			.requireEnemy()
			.perform(({ targetUnit }) => this.onTargetSelected(targetUnit))
	}

	private onTargetSelected(selectedTarget: ServerUnit): void {
		const targets = [selectedTarget].concat(this.game.board.getAdjacentUnits(selectedTarget))
		targets.forEach((target) => {
			target.buffs.add(BuffStun, this, this.buffDuration(this) * BuffDuration.FULL_TURN - 1)
		})
	}
}
