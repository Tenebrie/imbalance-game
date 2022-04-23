import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import { DamageInstance } from '@src/game/models/ServerDamageSource'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class GwentChironex extends ServerCard {
	public static readonly DAMAGE = 2

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.CURSED, CardTribe.DOOMED],
			stats: {
				power: 4,
			},
			expansionSet: ExpansionSet.GWENT,
			hiddenFromLibrary: true,
		})

		this.createLocalization({
			en: {
				name: 'Chironex',
				description: `Deal *${GwentChironex.DAMAGE}* damage to all other units.`,
				flavor: `Gods, that's no unicorn! That's…! - the last words of Vilemar, a famed collector of curiosities.`,
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => {
			const targets = game.board.getAllUnits().filter((unit) => unit.card !== this)
			targets.forEach((unit) => {
				unit.dealDamage(DamageInstance.fromCard(GwentChironex.DAMAGE, this), 'stagger')
			})
		})
	}
}
