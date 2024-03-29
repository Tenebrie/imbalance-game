import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import UnitShatteredSpace from '@src/game/cards/01-arcane/tokens/UnitShatteredSpace'
import ServerAnimation from '@src/game/models/ServerAnimation'

import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class UnitNullMender extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.ARCANE,
			tribes: [CardTribe.ELEMENTAL],
			relatedCards: [UnitShatteredSpace],
			stats: {
				power: 17,
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.createDeployTargets(TargetType.BOARD_ROW)
			.require(({ targetRow }) => targetRow.cards.some((unit) => unit.card instanceof UnitShatteredSpace))
			.perform(({ targetRow }) => {
				const shatteredSpace = targetRow.cards.find((unit) => unit.card instanceof UnitShatteredSpace)
				if (!shatteredSpace) {
					return
				}
				this.game.animation.play(ServerAnimation.cardAffectsCards(this, [shatteredSpace.card]))
				shatteredSpace.card.destroy()
			})
	}
}
