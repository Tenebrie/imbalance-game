import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentCleaver extends ServerCard {
	public static readonly DAMAGE = 1

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.DWARF],
			stats: {
				power: 7,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Cleaver`,
				description: `Deal *${GwentCleaver.DAMAGE}* damage for each card in your hand.`,
				flavor: `Everyone wantin' to trade in Novigrad's got a clear choice - agree terms with Cleaver or kiss their knees farewell.`,
			},
		})

		this.createDeployTargets(TargetType.UNIT).perform(({ targetUnit, player }) => {
			const damage = player.cardHand.allCards.length * GwentCleaver.DAMAGE
			targetUnit.dealDamage(DamageInstance.fromCard(damage, this))
		})
	}
}
