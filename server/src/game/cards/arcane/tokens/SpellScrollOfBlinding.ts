import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import TargetDefinitionBuilder from '../../../models/targetDefinitions/TargetDefinitionBuilder'
import ServerUnit from '../../../models/ServerUnit'
import CardColor from '@shared/enums/CardColor'
import TargetType from '@shared/enums/TargetType'
import CardFaction from '@shared/enums/CardFaction'
import PostPlayTargetDefinitionBuilder from '../../../models/targetDefinitions/PostPlayTargetDefinitionBuilder'
import {CardTargetSelectedEventArgs} from '../../../models/GameEventCreators'
import GameEventType from '@shared/enums/GameEventType'
import CardTribe from '@shared/enums/CardTribe'
import BuffStun from '../../../buffs/BuffStun'
import BuffDuration from '@shared/enums/BuffDuration'
import CardFeature from '@shared/enums/CardFeature'

export default class SpellScrollOfBlinding extends ServerCard {
	buffDuration = 3

	constructor(game: ServerGame) {
		super(game, CardType.SPELL, CardColor.TOKEN, CardFaction.ARCANE)

		this.basePower = 4
		this.baseTribes = [CardTribe.SCROLL]
		this.baseFeatures = [CardFeature.KEYWORD_BUFF_STUN]
		this.dynamicTextVariables = {
			buffDuration: this.buffDuration
		}

		this.createEffect<CardTargetSelectedEventArgs>(GameEventType.CARD_TARGET_SELECTED)
			.perform(({ targetUnit }) => this.onTargetSelected(targetUnit))
	}

	definePostPlayRequiredTargets(): TargetDefinitionBuilder {
		return PostPlayTargetDefinitionBuilder.base(this.game)
			.singleTarget()
			.allow(TargetType.UNIT)
			.enemyUnit()
	}

	private onTargetSelected(selectedTarget: ServerUnit): void {
		const targets = [selectedTarget].concat(this.game.board.getAdjacentUnits(selectedTarget))
		targets.forEach(target => {
			target.buffs.add(BuffStun, this, this.buffDuration * BuffDuration.FULL_TURN - 1)
		})
	}
}
