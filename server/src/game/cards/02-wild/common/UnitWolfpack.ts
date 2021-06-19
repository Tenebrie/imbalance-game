import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardTribe from '@shared/enums/CardTribe'
import TargetType from '@shared/enums/TargetType'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'
import { asDirectUnitDamage } from '@src/utils/LeaderStats'
import ServerDamageInstance from '@src/game/models/ServerDamageSource'
import Keywords from '@src/utils/Keywords'
import GameEventType from '@shared/enums/GameEventType'
import CardLocation from '@shared/enums/CardLocation'

export default class UnitWolfpack extends ServerCard {
	private static readonly baseDamage = asDirectUnitDamage(3)
	private static readonly damagePenaltyPerWolf = 1

	private chainIndex = 0

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.WILD,
			tribes: [CardTribe.BEAST],
			features: [CardFeature.KEYWORD_DEPLOY],
			stats: {
				power: 3,
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
				targetUnit.dealDamage(ServerDamageInstance.fromCard(this.damage, this))
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
			.require(({ player }) => player === this.owner)
			.perform(() => (this.chainIndex = 0))
	}

	private get damage(): number {
		return UnitWolfpack.baseDamage(this) - this.chainIndex * UnitWolfpack.damagePenaltyPerWolf
	}

	public set wolfChainIndex(value: number) {
		this.chainIndex = value
	}
}
