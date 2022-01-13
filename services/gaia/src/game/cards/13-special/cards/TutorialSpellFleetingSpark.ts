import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import SpellFleetingSpark from '@src/game/cards/01-arcane/tokens/SpellFleetingSpark'
import { asDirectSparkDamage } from '@src/utils/LeaderStats'

import ServerCard from '../../../models/ServerCard'
import { DamageInstance } from '../../../models/ServerDamageSource'
import ServerGame from '../../../models/ServerGame'
import ServerUnit from '../../../models/ServerUnit'

export default class TutorialSpellFleetingSpark extends ServerCard {
	damage = asDirectSparkDamage(3)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.ARCANE,
			tribes: [CardTribe.SPARK],
			stats: {
				cost: 1,
			},
			sharedArtwork: SpellFleetingSpark,
			expansionSet: ExpansionSet.TUTORIAL,
		})
		this.dynamicTextVariables = {
			damage: this.damage,
		}

		this.createLocalization({
			en: {
				name: 'Fleeting Spark',
				description: 'Deal {damage} Damage to an enemy unit.',
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.requireEnemy()
			.perform(({ targetUnit }) => this.onTargetSelected(targetUnit))
	}

	private onTargetSelected(target: ServerUnit): void {
		target.dealDamage(DamageInstance.fromCard(this.damage, this))
	}
}
