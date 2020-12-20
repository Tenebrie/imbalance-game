import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import ServerUnit from '../../../models/ServerUnit'
import TargetType from '@shared/enums/TargetType'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'
import BuffStrength from '../../../buffs/BuffStrength'
import {asSoloBuffPotency} from '../../../../utils/LeaderStats'

export default class UnitTravelingEnchantress extends ServerCard {
	baseStrengthGiven = asSoloBuffPotency(1)
	extraStrengthGiven = asSoloBuffPotency(7)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.NEUTRAL,
			features: [CardFeature.KEYWORD_DEPLOY],
			stats: {
				power: 4,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			baseStrengthGiven: this.baseStrengthGiven,
			extraStrengthGiven: this.extraStrengthGiven
		}

		this.createDeployEffectTargets()
			.target(TargetType.UNIT)
			.requireAlliedUnit()
			.requireNotSelf()

		this.createEffect(GameEventType.CARD_TARGET_SELECTED_UNIT)
			.perform(({ targetUnit }) => this.onTargetSelected(targetUnit))
	}

	private onTargetSelected(target: ServerUnit): void {
		target.buffs.addMultiple(BuffStrength, this.baseStrengthGiven, this)
		this.game.animation.syncAnimationThreads()
		if (target.card.stats.power >= target.card.stats.basePower * 2) {
			target.buffs.addMultiple(BuffStrength, this.extraStrengthGiven, this)
		}
	}
}
