import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import ServerGame from '@src/game/models/ServerGame'

import GwentGloriousHunt from './GwentGloriousHunt'

export default class GwentManticoreVenom extends ServerCard {
	public static readonly DAMAGE = 13

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.SILVER,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.ORGANIC],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
			relatedCards: [GwentGloriousHunt],
		})

		this.createLocalization({
			en: {
				name: `Manticore Venom`,
				description: `Deal *${GwentManticoreVenom.DAMAGE}* damage.`,
				flavor: `Kills quicker than you can recite the Emperor of Nilfgaard's title in full.`,
			},
		})

		this.createDeployTargets(TargetType.UNIT).perform(({ targetUnit }) => {
			targetUnit.dealDamage(DamageInstance.fromCard(GwentManticoreVenom.DAMAGE, this))
		})
	}
}
