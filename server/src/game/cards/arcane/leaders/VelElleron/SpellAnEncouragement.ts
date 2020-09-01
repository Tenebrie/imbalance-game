import CardType from '@shared/enums/CardType'
import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import SimpleTargetDefinitionBuilder from '../../../../models/targetDefinitions/SimpleTargetDefinitionBuilder'
import TargetDefinitionBuilder from '../../../../models/targetDefinitions/TargetDefinitionBuilder'
import ServerUnit from '../../../../models/ServerUnit'
import CardColor from '@shared/enums/CardColor'
import TargetMode from '@shared/enums/TargetMode'
import TargetType from '@shared/enums/TargetType'
import CardFeature from '@shared/enums/CardFeature'
import CardFaction from '@shared/enums/CardFaction'
import BuffVelElleronEncouragement from '../../../../buffs/BuffVelElleronEncouragement'
import BuffDuration from '@shared/enums/BuffDuration'
import {CardTargetSelectedEventArgs} from '../../../../models/GameEventCreators'
import GameEventType from '@shared/enums/GameEventType'

export default class SpellAnEncouragement extends ServerCard {
	public static bonusPower = 7

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.GOLDEN,
			faction: CardFaction.ARCANE,
			features: [CardFeature.HERO_POWER],
			stats: {
				cost: 3
			}
		})
		this.dynamicTextVariables = {
			bonusPower: SpellAnEncouragement.bonusPower
		}

		this.createEffect<CardTargetSelectedEventArgs>(GameEventType.CARD_TARGET_SELECTED)
			.perform(({ targetUnit }) => this.onTargetSelected(targetUnit))
	}

	definePostPlayRequiredTargets(): TargetDefinitionBuilder {
		return SimpleTargetDefinitionBuilder.base(this.game, TargetMode.POST_PLAY_REQUIRED_TARGET)
			.singleTarget()
			.allow(TargetType.UNIT)
			.alliedUnit()
			.evaluate(TargetType.UNIT, (args => this.stats.basePower))
	}

	private onTargetSelected(target: ServerUnit): void {
		target.buffs.add(BuffVelElleronEncouragement, this, BuffDuration.INFINITY)
	}
}
