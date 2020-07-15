import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import BuffStrength from '../../../buffs/BuffStrength'
import BuffDuration from '@shared/enums/BuffDuration'
import CardLocation from '@shared/enums/CardLocation'
import GameEvent, {CardTakesDamageEventArgs} from '../../../models/GameEvent'
import TargetDefinitionBuilder from '../../../models/targetDefinitions/TargetDefinitionBuilder'
import PostPlayTargetDefinitionBuilder from '../../../models/targetDefinitions/PostPlayTargetDefinitionBuilder'
import TargetType from '@shared/enums/TargetType'
import ServerUnit from '../../../models/ServerUnit'
import ServerDamageInstance from '../../../models/ServerDamageSource'
import ServerAnimation from '../../../models/ServerAnimation'

export default class HeroTroviar extends ServerCard {
	deployDamage = 1
	targetCount = 3
	powerGained = 1
	targetsHit = []

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.GOLDEN, CardFaction.NEUTRAL)
		this.basePower = 5
		this.dynamicTextVariables = {
			deployDamage: this.deployDamage,
			targetCount: this.targetCount,
			powerGained: this.powerGained
		}

		this.createCallback<CardTakesDamageEventArgs>(GameEvent.CARD_TAKES_DAMAGE)
			.requireLocations([CardLocation.BOARD, CardLocation.STACK])
			.perform(({ triggeringCard }) => this.onCardTakesDamage(triggeringCard))
	}

	private onCardTakesDamage(targetCard: ServerCard): void {
		this.game.animation.play(ServerAnimation.cardAttacksCards(targetCard, [this]))
		for (let i = 0; i < this.powerGained; i++) {
			this.buffs.add(BuffStrength, this, BuffDuration.INFINITY)
		}
	}

	definePostPlayRequiredTargets(): TargetDefinitionBuilder {
		return PostPlayTargetDefinitionBuilder.base(this.game)
			.multipleTargets(this.targetCount)
			.allow(TargetType.UNIT, this.targetCount)
			.enemyUnit()
			.validate(TargetType.UNIT, args => !this.targetsHit.includes(args.targetUnit))
	}

	onUnitPlayTargetUnitSelected(thisUnit: ServerUnit, target: ServerUnit): void {
		this.game.animation.play(ServerAnimation.cardAttacksUnits(this, [target]))
		target.dealDamage(ServerDamageInstance.fromCard(this.deployDamage, this))
		this.targetsHit.push(target)
	}

	onUnitPlayTargetsConfirmed(): void {
		this.targetsHit = []
	}
}
