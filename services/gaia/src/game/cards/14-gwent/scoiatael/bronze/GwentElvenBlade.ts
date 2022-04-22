import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentElvenBlade extends ServerCard {
	public static readonly DAMAGE = 10

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.ITEM],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Elven Blade`,
				description: `Deal *${GwentElvenBlade.DAMAGE}* damage to a non-Elf unit.`,
				flavor: `Elven blades are light, yet deal heavy wounds.`,
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.require(({ targetUnit }) => !targetUnit.card.tribes.includes(CardTribe.ELF))
			.perform(({ targetUnit }) => {
				targetUnit.dealDamage(DamageInstance.fromCard(GwentElvenBlade.DAMAGE, this))
			})
	}
}
