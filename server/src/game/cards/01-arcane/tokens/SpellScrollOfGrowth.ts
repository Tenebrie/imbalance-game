import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerUnit from '../../../models/ServerUnit'
import CardColor from '@shared/enums/CardColor'
import TargetType from '@shared/enums/TargetType'
import CardFaction from '@shared/enums/CardFaction'
import GameEventType from '@shared/enums/GameEventType'
import CardTribe from '@shared/enums/CardTribe'
import BuffGrowth from '../../../buffs/BuffGrowth'
import BuffDuration from '@shared/enums/BuffDuration'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'

export default class SpellScrollOfGrowth extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.TOKEN,
			faction: CardFaction.ARCANE,
			tribes: [CardTribe.SCROLL],
			features: [CardFeature.KEYWORD_BUFF_GROWTH],
			stats: {
				cost: 2,
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.createDeployEffectTargets().target(TargetType.UNIT).requireAlliedUnit()

		this.createEffect(GameEventType.CARD_TARGET_SELECTED_UNIT).perform(({ targetUnit }) => this.onTargetSelected(targetUnit))
	}

	private onTargetSelected(target: ServerUnit): void {
		target.buffs.add(BuffGrowth, this, BuffDuration.INFINITY)
	}
}
