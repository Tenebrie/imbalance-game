import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerUnit from '../../../models/ServerUnit'
import ServerDamageInstance from '../../../models/ServerDamageSource'
import CardColor from '@shared/enums/CardColor'
import TargetType from '@shared/enums/TargetType'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import BuffUpgradedStorms from '../../../buffs/BuffUpgradedStorms'
import GameEventType from '@shared/enums/GameEventType'
import ExpansionSet from '@shared/enums/ExpansionSet'

export default class SpellLightningStorm extends ServerCard {
	damage = 3
	baseTargets = 1
	targetsPerStorm = 1
	targetsHit: ServerCard[] = []

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.TOKEN,
			faction: CardFaction.WILD,
			tribes: [CardTribe.STORM],
			stats: {
				cost: 0,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			damage: this.damage,
			targetCount: () => this.targetCount,
			targetsPerStorm: this.targetsPerStorm,
			isUpgraded: () => this.isUpgraded(),
			targetsRemaining: () => this.targetCount - this.targetsHit.length
		}
		this.addRelatedCards().requireTribe(CardTribe.STORM)

		this.createDeployEffectTargets()
			.target(TargetType.UNIT, () => this.targetCount)
			.requireEnemyUnit()
			.require(TargetType.UNIT, args => this.isUpgraded() || !this.targetsHit.includes(args.targetCard))
			.label(TargetType.UNIT, 'card.spellLightningStorm.targetLabel')

		this.createEffect(GameEventType.CARD_TARGET_SELECTED_UNIT)
			.perform(({ targetUnit }) => this.onTargetSelected(targetUnit))

		this.createEffect(GameEventType.CARD_TARGETS_CONFIRMED)
			.perform(() => this.onTargetsConfirmed())
	}

	get targetCount(): number {
		let stormsPlayed = 0
		if (this.owner) {
			stormsPlayed = this.owner.cardGraveyard.findCardsByTribe(CardTribe.STORM).length
		}

		return this.baseTargets + this.targetsPerStorm * stormsPlayed
	}

	private onTargetSelected(target: ServerUnit): void {
		target.dealDamage(ServerDamageInstance.fromCard(this.damage, this))
		this.targetsHit.push(target.card)
	}

	private onTargetsConfirmed(): void {
		this.targetsHit = []
	}

	private isUpgraded(): boolean {
		return !!this.owner && this.owner.leader.buffs.has(BuffUpgradedStorms)
	}
}
