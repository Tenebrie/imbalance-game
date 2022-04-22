import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import { getRandomArrayValue } from '@src/utils/Utils'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class GwentPyrotechnician extends ServerCard {
	public static readonly DAMAGE = 3

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.SOLDIER, CardTribe.DWARF],
			stats: {
				power: 3,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			damage: GwentPyrotechnician.DAMAGE,
		}

		this.createLocalization({
			en: {
				name: 'Pyrotechnician',
				description: 'Deal {damage} damage to a random enemy on each row.',
				flavor:
					'An extraordinarily risky, and thus much revered, Mahakam trade. Its best-known practitioner was a dwarf by the name of Mikkel Bay.',
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(({ owner }) => {
			game.board.getControlledRows(owner.opponent).forEach((row) => {
				getRandomArrayValue(row.splashableCards)?.dealDamage(DamageInstance.fromCard(GwentPyrotechnician.DAMAGE, this))
			})
		})
	}
}
