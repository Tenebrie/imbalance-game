import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerDamageInstance from '@src/game/models/ServerDamageSource'
import ServerGame from '@src/game/models/ServerGame'
import ServerUnit from '@src/game/models/ServerUnit'
import { asDirectSparkDamage, asSplashSparkDamage } from '@src/utils/LeaderStats'

export default class TutorialSpellSteelSpark extends ServerCard {
	baseDamage = asDirectSparkDamage(4)
	baseSideDamage = asSplashSparkDamage(1)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.GOLDEN,
			faction: CardFaction.ARCANE,
			tribes: [CardTribe.SPARK],
			features: [CardFeature.HERO_POWER],
			stats: {
				cost: 2,
			},
			expansionSet: ExpansionSet.TUTORIAL,
		})
		this.dynamicTextVariables = {
			damage: this.baseDamage,
			sideDamage: this.baseSideDamage,
		}

		this.createLocalization({
			en: {
				name: 'Steel Spark',
				description: 'Deal {damage} Damage to an enemy unit.<p>Deal {sideDamage} Damage to adjacent units.',
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.requireEnemy()
			.perform(({ targetUnit }) => this.onTargetSelected(targetUnit))
	}

	private onTargetSelected(target: ServerUnit): void {
		const sideTargets = this.game.board.getAdjacentUnits(target).filter((unit) => unit.rowIndex === target.rowIndex)

		target.dealDamage(ServerDamageInstance.fromCard(this.baseDamage, this))

		const survivingSideTargets = sideTargets.filter((target) => target.isAlive())
		survivingSideTargets.forEach((sideTarget) => {
			this.game.animation.createInstantAnimationThread()
			sideTarget.dealDamage(ServerDamageInstance.fromCard(this.baseSideDamage, this))
			this.game.animation.commitAnimationThread()
		})
	}
}
