import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

import CardLibrary from '../../../libraries/CardLibrary'

export default class UnitMagiciansAssistant extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.NOBLE],
			stats: {
				power: 14,
			},
			expansionSet: ExpansionSet.BASE,
			sortPriority: 2,
		})

		this.createDeployTargets(TargetType.UNIT)
			.require(({ targetUnit }) => {
				return !this.ownerPlayer.cardDeck.hasDuplicates || targetUnit.owner === this.ownerPlayer.opponentNullable
			})
			.perform(({ targetUnit }) => {
				const copy = CardLibrary.instantiateFromInstance(this.game, targetUnit.card)
				this.ownerPlayer.cardDeck.addUnitToTop(copy)
			})
	}
}
