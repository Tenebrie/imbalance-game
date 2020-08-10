import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardTribe from '@shared/enums/CardTribe'
import TargetDefinitionBuilder from '../../../models/targetDefinitions/TargetDefinitionBuilder'
import TargetType from '@shared/enums/TargetType'
import CardFaction from '@shared/enums/CardFaction'
import TargetMode from '@shared/enums/TargetMode'
import TargetDefinition from '../../../models/targetDefinitions/TargetDefinition'
import ServerUnit from '../../../models/ServerUnit'
import BuffStun from '../../../buffs/BuffStun'
import BuffDuration from '@shared/enums/BuffDuration'
import GameEventType from '@shared/enums/GameEventType'
import {TurnEndedEventArgs} from '../../../models/GameEventCreators'
import CardLocation from '@shared/enums/CardLocation'
import ServerAnimation from '../../../models/ServerAnimation'
import BuffAlignment from '@shared/enums/BuffAlignment'
import CardFeature from '@shared/enums/CardFeature'

export default class UnitStoneElemental extends ServerCard {
	canAttack = false

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE, CardFaction.ARCANE)
		this.basePower = 7
		this.baseAttack = 3
		this.baseAttackRange = 2
		this.baseTribes = [CardTribe.ELEMENTAL]
		this.baseFeatures = [CardFeature.KEYWORD_DEPLOY, CardFeature.KEYWORD_BUFF_STUN]

		this.createEffect(GameEventType.UNIT_DEPLOYED)
			.perform(() => {
				this.canAttack = true
			})

		this.createCallback<TurnEndedEventArgs>(GameEventType.TURN_ENDED, [CardLocation.BOARD])
			.require(({ player }) => player === this.owner)
			.perform(() => this.onTurnEnded())
	}

	defineValidOrderTargets(): TargetDefinitionBuilder {
		return TargetDefinition.defaultUnitOrder(this.game)
			.actions(this.canAttack ? 1 : 0)
			.allow(TargetMode.ORDER_ATTACK, TargetType.UNIT, this.canAttack ? 1 : 0)
	}

	onPerformingUnitAttack(thisUnit: ServerUnit, target: ServerUnit, targetMode: TargetMode): void {
		this.canAttack = false
		target.buffs.add(BuffStun, this, BuffDuration.END_OF_NEXT_TURN)
		this.game.animation.play(ServerAnimation.cardsReceivedBuff([target.card], BuffAlignment.NEGATIVE))
	}

	private onTurnEnded(): void {
		this.canAttack = false
	}
}
