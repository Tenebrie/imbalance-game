import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import { shuffle } from '@shared/Utils'
import { DamageInstance } from '@src/game/models/ServerDamageSource'

import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import GwentIfrit from './silver/GwentIfrit'

export default class GwentLesserIfrit extends ServerCard {
	public static readonly DAMAGE = 1

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.CONSTRUCT],
			features: [CardFeature.DOOMED],
			stats: {
				power: 1,
			},
			expansionSet: ExpansionSet.GWENT,
			relatedCards: [GwentIfrit],
		})

		this.createLocalization({
			en: {
				name: 'Lesser Ifrit',
				description: 'Deal {damage} damage to a random enemy.',
				flavor: "A certain mage thought them cute. It was his fate that gave rise to the saying 'Don't play with fire…'",
			},
		})

		this.createEffect(GameEventType.UNIT_CREATED).perform(() => {
			const enemies = game.board.getUnitsOwnedByOpponent(this)
			if (enemies.length === 0) {
				return
			}
			const targetEnemy = shuffle(enemies)[0]
			targetEnemy.dealDamage(DamageInstance.fromCard(GwentLesserIfrit.DAMAGE, this))
		})
	}
}
