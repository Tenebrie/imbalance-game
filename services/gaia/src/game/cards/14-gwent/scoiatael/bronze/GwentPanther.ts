import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentPanther extends ServerCard {
	public static readonly DAMAGE = 7
	public static readonly UNIT_COUNT = 4

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.BEAST],
			stats: {
				power: 4,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Panther`,
				description: `Deal *${GwentPanther.DAMAGE}* damage to an enemy on a row with less than *${GwentPanther.UNIT_COUNT}* units.`,
				flavor: `An Oxenfurt scholar once examined a panther and declared it was nothing more than a leopard of a different color. The panther seemed indifferent to this pronouncement and gobbled him up before he could complete his research.`,
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.requireEnemy()
			.require(({ targetUnit }) => targetUnit.boardRow.cards.length < GwentPanther.UNIT_COUNT)
			.perform(({ targetUnit }) => {
				targetUnit.dealDamage(DamageInstance.fromCard(GwentPanther.DAMAGE, this))
			})
	}
}
