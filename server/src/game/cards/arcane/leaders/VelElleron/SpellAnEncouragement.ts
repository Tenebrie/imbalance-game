import CardType from '@shared/enums/CardType'
import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import ServerPlayerInGame from '../../../../players/ServerPlayerInGame'
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

export default class SpellAnEncouragement extends ServerCard {
	public static bonusPower = 7

	constructor(game: ServerGame) {
		super(game, CardType.SPELL, CardColor.GOLDEN, CardFaction.ARCANE)

		this.basePower = 3
		this.baseFeatures = [CardFeature.HERO_POWER]
		this.dynamicTextVariables = {
			bonusPower: SpellAnEncouragement.bonusPower
		}
	}

	definePostPlayRequiredTargets(): TargetDefinitionBuilder {
		return SimpleTargetDefinitionBuilder.base(this.game, TargetMode.POST_PLAY_REQUIRED_TARGET)
			.singleTarget()
			.allow(TargetType.UNIT)
			.alliedUnit()
	}

	onSpellPlayTargetUnitSelected(owner: ServerPlayerInGame, target: ServerUnit): void {
		target.buffs.add(new BuffVelElleronEncouragement(), this, BuffDuration.START_OF_NEXT_TURN)
	}
}
