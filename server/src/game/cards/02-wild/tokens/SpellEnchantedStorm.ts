import BuffDuration from '@shared/enums/BuffDuration'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import TargetType from '@shared/enums/TargetType'
import { asSplashBuffPotency, asTargetCount } from '@src/utils/LeaderStats'

import BuffStrength from '../../../buffs/BuffStrength'
import BuffUpgradedStorms from '../../../buffs/BuffUpgradedStorms'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerUnit from '../../../models/ServerUnit'

export default class SpellEnchantedStorm extends ServerCard {
	baseBuffPower = asSplashBuffPotency(3)
	targetCount = asTargetCount(3)
	powerPerStorm = asSplashBuffPotency(1)
	targetsHit: ServerCard[] = []

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.WILD,
			tribes: [CardTribe.STORM],
			stats: {
				cost: 0,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			buffPower: () => this.buffPower,
			targetCount: this.targetCount,
			powerPerStorm: this.powerPerStorm,
			isUpgraded: () => this.isUpgraded(),
			targetsRemaining: () => this.targetCount(this) - this.targetsHit.length,
		}
		this.addRelatedCards().requireTribe(CardTribe.STORM)

		this.createDeployTargets(TargetType.UNIT)
			.targetCount(this.targetCount)
			.requireAllied()
			.require((args) => this.isUpgraded() || !this.targetsHit.includes(args.targetCard))
			.label('card.spellEnchantedStorm.target')

		this.createEffect(GameEventType.CARD_TARGET_SELECTED_UNIT).perform(({ targetUnit }) => this.onTargetSelected(targetUnit))

		this.createEffect(GameEventType.CARD_TARGETS_CONFIRMED).perform(() => this.onTargetsConfirmed())
	}

	get buffPower(): number {
		let stormsPlayed = 0
		const owner = this.ownerPlayerNullable
		if (owner) {
			stormsPlayed = owner.cardGraveyard.findCardsByTribe(CardTribe.STORM).length
		}
		return this.baseBuffPower(this) + this.powerPerStorm(this) * stormsPlayed
	}

	private onTargetSelected(target: ServerUnit): void {
		target.buffs.addMultiple(BuffStrength, this.buffPower, this, BuffDuration.INFINITY)
		this.targetsHit.push(target.card)
	}

	private onTargetsConfirmed(): void {
		this.targetsHit = []
	}

	private isUpgraded(): boolean {
		const owner = this.ownerPlayerNullable
		return !!owner && owner.leader.buffs.has(BuffUpgradedStorms)
	}
}
