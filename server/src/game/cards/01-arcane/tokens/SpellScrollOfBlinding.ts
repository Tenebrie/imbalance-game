import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerUnit from '../../../models/ServerUnit'
import CardColor from '@shared/enums/CardColor'
import TargetType from '@shared/enums/TargetType'
import CardFaction from '@shared/enums/CardFaction'
import GameEventType from '@shared/enums/GameEventType'
import CardTribe from '@shared/enums/CardTribe'
import BuffStun from '../../../buffs/BuffStun'
import BuffDuration from '@shared/enums/BuffDuration'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'
import { asDirectEffectDuration } from '../../../../utils/LeaderStats'

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
				cost: 4,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			buffDuration: this.buffDuration,
		}

		this.createDeployEffectTargets().target(TargetType.UNIT).requireEnemyUnit()

		this.createEffect(GameEventType.CARD_TARGET_SELECTED_UNIT).perform(({ targetUnit }) => this.onTargetSelected(targetUnit))
	}

	private onTargetSelected(selectedTarget: ServerUnit): void {
		const targets = [selectedTarget].concat(this.game.board.getAdjacentUnits(selectedTarget))
		targets.forEach((target) => {
			target.buffs.add(BuffStun, this, this.buffDuration(this) * BuffDuration.FULL_TURN - 1)
		})
	}
}
