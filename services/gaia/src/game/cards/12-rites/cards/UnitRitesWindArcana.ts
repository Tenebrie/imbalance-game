import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import TargetType from '@shared/enums/TargetType'
import Keywords from '@src/utils/Keywords'
import { asDirectUnitDamage } from '@src/utils/LeaderStats'

import ServerCard from '../../../models/ServerCard'
import { DamageInstance } from '../../../models/ServerDamageSource'
import ServerGame from '../../../models/ServerGame'

export default class UnitRitesWindArcana extends ServerCard {
	damage = asDirectUnitDamage(5)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			stats: {
				power: 0,
				armor: 5,
			},
			expansionSet: ExpansionSet.RITES,
		})
		this.dynamicTextVariables = {
			damage: this.damage,
		}

		this.createLocalization({
			en: {
				name: 'Wind Arcana',
				description: '*Deploy:*\nDeal {damage} Damage to an enemy.\n*Play* a *Wind Arcana* from your deck.',
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.require(({ targetUnit }) => targetUnit.owner !== this.ownerGroup)
			.perform(({ targetUnit }) => {
				targetUnit.dealDamage(DamageInstance.fromCard(this.damage, this))

				const cardToSummon = this.ownerPlayer.cardDeck.findCard(UnitRitesWindArcana)
				if (cardToSummon) {
					Keywords.playCardFromDeck(cardToSummon)
				}
			})

		// No targets fallback
		this.createEffect(GameEventType.UNIT_DEPLOYED)
			.require(() => game.board.getAllUnits().every((unit) => unit.owner === this.ownerGroup))
			.perform(() => {
				const cardToSummon = this.ownerPlayer.cardDeck.findCard(UnitRitesWindArcana)
				if (cardToSummon) {
					Keywords.playCardFromDeck(cardToSummon)
				}
			})
	}
}
