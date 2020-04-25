import CardType from '@shared/enums/CardType'
import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'
import ServerPlayerInGame from '../../players/ServerPlayerInGame'
import SimpleTargetDefinitionBuilder from '../../models/targetDefinitions/SimpleTargetDefinitionBuilder'
import TargetDefinitionBuilder from '../../models/targetDefinitions/TargetDefinitionBuilder'
import ServerUnit from '../../models/ServerUnit'
import CardColor from '@shared/enums/CardColor'
import TargetMode from '@shared/enums/TargetMode'
import TargetType from '@shared/enums/TargetType'
import BuffExtraMove from '../../buffs/BuffExtraMove'
import CardFeature from '@shared/enums/CardFeature'

export default class SpellSpeedPotion extends ServerCard {
	moves = 3

	constructor(game: ServerGame) {
		super(game, CardType.SPELL, CardColor.GOLDEN)
		this.basePower = 2
		this.features = [CardFeature.HERO_POWER]
		this.dynamicTextVariables = {
			moves: this.moves
		}
	}

	definePostPlayRequiredTargets(): TargetDefinitionBuilder {
		return SimpleTargetDefinitionBuilder.base(this.game, TargetMode.POST_PLAY_REQUIRED_TARGET)
			.singleTarget()
			.allow(TargetType.UNIT)
			.alliedUnit()
	}

	onSpellPlayTargetUnitSelected(owner: ServerPlayerInGame, target: ServerUnit): void {
		for (let i = 0; i < this.moves; i++) {
			target.card.buffs.add(new BuffExtraMove(), this)
		}
	}
}
