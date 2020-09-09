import CardType from '@shared/enums/CardType'
import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import SimpleTargetDefinitionBuilder from '../../../../models/targetDefinitions/SimpleTargetDefinitionBuilder'
import TargetDefinitionBuilder from '../../../../models/targetDefinitions/TargetDefinitionBuilder'
import ServerUnit from '../../../../models/ServerUnit'
import ServerDamageInstance from '../../../../models/ServerDamageSource'
import CardColor from '@shared/enums/CardColor'
import TargetMode from '@shared/enums/TargetMode'
import TargetType from '@shared/enums/TargetType'
import CardFeature from '@shared/enums/CardFeature'
import CardFaction from '@shared/enums/CardFaction'
import ServerAnimation from '../../../../models/ServerAnimation'
import BuffVelRamineaWeave from '../../../../buffs/BuffVelRamineaWeave'
import CardLocation from '@shared/enums/CardLocation'
import {CardTargetSelectedEventArgs} from '../../../../models/GameEventCreators'
import GameEventType from '@shared/enums/GameEventType'
import CardTribe from '@shared/enums/CardTribe'
import ExpansionSet from '@shared/enums/ExpansionSet'

export default class SpellFlamingSpark extends ServerCard {
	baseDamage = 2
	damagePerWeave = 1

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.GOLDEN,
			faction: CardFaction.ARCANE,
			tribes: [CardTribe.SPARK],
			features: [CardFeature.HERO_POWER],
			stats: {
				cost: 2
			},
			expansionSet: ExpansionSet.BASE,
			isExperimental: true,
		})
		this.dynamicTextVariables = {
			damage: () => this.damage,
			damagePerWeave: this.damagePerWeave
		}

		this.createDeployEffectTargets()
			.target(TargetType.UNIT)
			.requireEnemyUnit()

		this.createEffect<CardTargetSelectedEventArgs>(GameEventType.CARD_TARGET_SELECTED)
			.perform(({ targetUnit }) => this.onTargetSelected(targetUnit))
	}

	get damage(): number {
		return this.baseDamage
			+ this.game.getTotalBuffIntensityForPlayer(BuffVelRamineaWeave, this.owner, [CardLocation.LEADER])
	}

	private onTargetSelected(target: ServerUnit): void {
		this.game.animation.play(ServerAnimation.universeAttacksUnits([target]))
		target.dealDamage(ServerDamageInstance.fromCard(this.damage, this))
	}
}
