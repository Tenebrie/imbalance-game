import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerPlayerInGame from '@src/game/players/ServerPlayerInGame'
import { asDirectSparkDamage } from '@src/utils/LeaderStats'

import CardLibrary from '../../../../libraries/CardLibrary'
import ServerCard from '../../../../models/ServerCard'
import ServerDamageInstance from '../../../../models/ServerDamageSource'
import ServerGame from '../../../../models/ServerGame'
import ServerUnit from '../../../../models/ServerUnit'
import UnitShadowspawn from '../../tokens/UnitShadowspawn'

export default class SpellShadowSpark extends ServerCard {
	baseDamage = asDirectSparkDamage(3)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.GOLDEN,
			faction: CardFaction.ARCANE,
			tribes: [CardTribe.SPARK],
			features: [CardFeature.HERO_POWER],
			relatedCards: [UnitShadowspawn],
			stats: {
				cost: 2,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			damage: this.baseDamage,
		}

		this.createDeployTargets(TargetType.UNIT)
			.requireEnemy()
			.perform(({ player, targetUnit }) => this.onTargetSelected(player, targetUnit))
	}

	private onTargetSelected(player: ServerPlayerInGame, target: ServerUnit): void {
		target.dealDamage(ServerDamageInstance.fromCard(this.baseDamage, this))

		const shadowspawn = CardLibrary.instantiate(this.game, UnitShadowspawn)
		const targetRow = this.game.board.getRowWithDistanceToFront(this.ownerPlayer, 0)
		this.game.board.createUnit(shadowspawn, player, targetRow.index, targetRow.cards.length)
	}
}
