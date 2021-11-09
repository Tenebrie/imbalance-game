import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import TargetType from '@shared/enums/TargetType'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import Keywords from '@src/utils/Keywords'
import { asDirectUnitDamage } from '@src/utils/LeaderStats'

import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class UnitWolfpack extends ServerCard {
	private static readonly baseDamage = asDirectUnitDamage(6)
	private static readonly damagePenaltyPerWolf = 2

	private chainIndex = 0

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.WILD,
			tribes: [CardTribe.BEAST],
			stats: {
				power: 6,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			damage: () => this.damage,
			damagePenaltyPerWolf: UnitWolfpack.damagePenaltyPerWolf,
		}

		this.createDeployTargets(TargetType.UNIT)
			.require(() => this.damage > 0)
			.requireEnemy()
			.perform(({ targetUnit }) => {
				targetUnit.dealDamage(DamageInstance.fromCard(this.damage, this))
				if (targetUnit.card.stats.power <= 0) {
					Keywords.createCard
						.forOwnerOf(this)
						.with((card) => {
							;(card as UnitWolfpack).wolfChainIndex = this.chainIndex + 1
						})
						.fromConstructor(UnitWolfpack)
				}
			})

		this.createCallback(GameEventType.TURN_ENDED, [CardLocation.BOARD])
			.require(({ group }) => group.owns(this))
			.perform(() => (this.chainIndex = 0))
	}

	private get damage(): number {
		return UnitWolfpack.baseDamage(this) - this.chainIndex * UnitWolfpack.damagePenaltyPerWolf
	}

	public set wolfChainIndex(value: number) {
		this.chainIndex = value
	}
}
