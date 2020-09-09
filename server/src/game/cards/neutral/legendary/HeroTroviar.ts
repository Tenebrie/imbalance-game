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
import GameEventType from '@shared/enums/GameEventType'
import {CardTakesDamageEventArgs, CardTargetSelectedEventArgs} from '../../../models/GameEventCreators'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'

export default class HeroTroviar extends ServerCard {
	deployDamage = 1
	targetCount = 3
	powerGained = 1
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
			powerGained: this.powerGained
		}

		this.createDeployEffectTargets()
			.target(TargetType.UNIT, this.targetCount)
			.requireEnemyUnit()
			.validate(TargetType.UNIT, args => !this.targetsHit.includes(args.targetCard))

		this.createEffect<CardTargetSelectedEventArgs>(GameEventType.CARD_TARGET_SELECTED)
			.perform(({ targetUnit }) => this.onTargetSelected(targetUnit))

		this.createCallback<CardTakesDamageEventArgs>(GameEventType.CARD_TAKES_DAMAGE, [CardLocation.BOARD, CardLocation.STACK])
			.require(({ triggeringCard }) => triggeringCard !== this)
			.perform(() => this.onCardTakesDamage())

		this.createEffect(GameEventType.CARD_TARGETS_CONFIRMED)
			.perform(() => this.onTargetsConfirmed())
	}

	private onTargetSelected(target: ServerUnit): void {
		target.dealDamage(ServerDamageInstance.fromCard(this.deployDamage, this))
		this.targetsHit.push(target.card)
	}

	private onCardTakesDamage(): void {
		for (let i = 0; i < this.powerGained; i++) {
			this.buffs.add(BuffStrength, this, BuffDuration.INFINITY)
		}
	}

	private onTargetsConfirmed(): void {
		this.targetsHit = []
	}
}
