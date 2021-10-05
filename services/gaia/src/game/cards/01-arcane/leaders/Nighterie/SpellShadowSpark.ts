import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import TargetType from '@shared/enums/TargetType'
import { asDirectSparkDamage } from '@src/utils/LeaderStats'

import CardLibrary from '../../../../libraries/CardLibrary'
import ServerCard from '../../../../models/ServerCard'
import ServerDamageInstance from '../../../../models/ServerDamageSource'
import ServerGame from '../../../../models/ServerGame'
import UnitFierceShadow from '../../tokens/UnitFierceShadow'

export default class SpellShadowSpark extends ServerCard {
	public static readonly BASE_DAMAGE = 3
	baseDamage = asDirectSparkDamage(SpellShadowSpark.BASE_DAMAGE)
	unitSummoned = false

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.GOLDEN,
			faction: CardFaction.ARCANE,
			tribes: [CardTribe.SPARK],
			features: [CardFeature.HERO_POWER, CardFeature.KEYWORD_SUMMON],
			relatedCards: [UnitFierceShadow],
			stats: {
				cost: 2,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			damage: this.baseDamage,
		}

		this.createLocalization({
			en: {
				name: 'Shadow Spark',
				description: 'Deal {damage} Damage to an enemy unit.<p>*Summon* a *Fierce Shadow* on your front row.',
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.requireEnemy()
			.perform(({ targetUnit }) => {
				targetUnit.dealDamage(ServerDamageInstance.fromCard(this.baseDamage, this))
				summonUnit()
			})

		this.createEffect(GameEventType.CARD_RESOLVED)
			.require(() => !this.unitSummoned)
			.perform(() => summonUnit())

		this.createEffect(GameEventType.CARD_RESOLVED).perform(() => (this.unitSummoned = false))

		const summonUnit = () => {
			const player = this.ownerPlayer
			const shadowspawn = CardLibrary.instantiate(this.game, UnitFierceShadow)
			const targetRow = this.game.board.getRowWithDistanceToFront(player, 0)
			this.game.board.createUnit(shadowspawn, player, targetRow.index, targetRow.cards.length)
			this.unitSummoned = true
		}
	}
}
