import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import BuffStrength from '../../../buffs/BuffStrength'
import BuffDuration from '@shared/enums/BuffDuration'
import CardLocation from '@shared/enums/CardLocation'
import TargetType from '@shared/enums/TargetType'
import ServerUnit from '../../../models/ServerUnit'
import ServerDamageInstance from '../../../models/ServerDamageSource'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'
import { asSplashUnitDamage, asDirectBuffPotency, asTargetCount } from '../../../../utils/LeaderStats'

export default class HeroTroviar extends ServerCard {
	deployDamage = asSplashUnitDamage(1)
	targetCount = asTargetCount(3)
	powerGained = asDirectBuffPotency(1)
	targetsHit: ServerCard[] = []

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			features: [CardFeature.KEYWORD_DEPLOY],
			stats: {
				power: 5,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			deployDamage: this.deployDamage,
			targetCount: this.targetCount,
			powerGained: this.powerGained,
		}

		this.createDeployTargets(TargetType.UNIT)
			.targetCount(this.targetCount)
			.requireEnemy()
			.require((args) => !this.targetsHit.includes(args.targetCard))

		this.createEffect(GameEventType.CARD_TARGET_SELECTED_UNIT).perform(({ targetUnit }) => this.onTargetSelected(targetUnit))

		this.createCallback(GameEventType.CARD_TAKES_DAMAGE, [CardLocation.BOARD, CardLocation.STACK])
			.require(({ triggeringCard }) => triggeringCard !== this)
			.perform(() => this.onCardTakesDamage())

		this.createEffect(GameEventType.CARD_TARGETS_CONFIRMED).perform(() => this.onTargetsConfirmed())
	}

	private onTargetSelected(target: ServerUnit): void {
		target.dealDamage(ServerDamageInstance.fromCard(this.deployDamage, this))
		this.targetsHit.push(target.card)
	}

	private onCardTakesDamage(): void {
		this.buffs.addMultiple(BuffStrength, this.powerGained, this, BuffDuration.INFINITY)
	}

	private onTargetsConfirmed(): void {
		this.targetsHit = []
	}
}
