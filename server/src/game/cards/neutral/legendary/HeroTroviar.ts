import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import BuffStrength from '../../../buffs/BuffStrength'
import BuffDuration from '@shared/enums/BuffDuration'
import CardLocation from '@shared/enums/CardLocation'
import TargetDefinitionBuilder from '../../../models/targetDefinitions/TargetDefinitionBuilder'
import PostPlayTargetDefinitionBuilder from '../../../models/targetDefinitions/PostPlayTargetDefinitionBuilder'
import TargetType from '@shared/enums/TargetType'
import ServerUnit from '../../../models/ServerUnit'
import ServerDamageInstance from '../../../models/ServerDamageSource'
import ServerAnimation from '../../../models/ServerAnimation'
import GameEventType from '@shared/enums/GameEventType'
import {CardTakesDamageEventArgs, CardTargetSelectedEventArgs} from '../../../models/GameEventCreators'
import BuffAlignment from '@shared/enums/BuffAlignment'
import CardFeature from '@shared/enums/CardFeature'

export default class HeroTroviar extends ServerCard {
	deployDamage = 1
	targetCount = 3
	powerGained = 1
	targetsHit = []

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.GOLDEN, CardFaction.NEUTRAL)
		this.basePower = 5
		this.baseFeatures = [CardFeature.KEYWORD_DEPLOY]
		this.dynamicTextVariables = {
			deployDamage: this.deployDamage,
			targetCount: this.targetCount,
			powerGained: this.powerGained
		}

		this.createEffect<CardTargetSelectedEventArgs>(GameEventType.CARD_TARGET_SELECTED)
			.perform(({ targetUnit }) => this.onTargetSelected(targetUnit))

		this.createCallback<CardTakesDamageEventArgs>(GameEventType.CARD_TAKES_DAMAGE, [CardLocation.BOARD, CardLocation.STACK])
			.require(({ triggeringCard }) => triggeringCard !== this)
			.perform(() => this.onCardTakesDamage())

		this.createEffect(GameEventType.CARD_TARGETS_CONFIRMED)
			.perform(() => this.onTargetsConfirmed())
	}

	definePostPlayRequiredTargets(): TargetDefinitionBuilder {
		return PostPlayTargetDefinitionBuilder.base(this.game)
			.multipleTargets(this.targetCount)
			.allow(TargetType.UNIT, this.targetCount)
			.enemyUnit()
			.validate(TargetType.UNIT, args => !this.targetsHit.includes(args.targetUnit))
	}

	private onTargetSelected(target: ServerUnit): void {
		this.game.animation.play(ServerAnimation.cardAttacksUnits(this, [target]))
		target.dealDamage(ServerDamageInstance.fromCard(this.deployDamage, this))
		this.targetsHit.push(target)
	}

	private onCardTakesDamage(): void {
		for (let i = 0; i < this.powerGained; i++) {
			this.buffs.add(BuffStrength, this, BuffDuration.INFINITY)
		}
		this.game.animation.play(ServerAnimation.cardsReceivedBuff([this], BuffAlignment.POSITIVE))
	}

	private onTargetsConfirmed(): void {
		this.targetsHit = []
	}
}
